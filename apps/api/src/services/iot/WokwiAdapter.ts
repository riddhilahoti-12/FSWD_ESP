import { IoTAdapter } from './IoTAdapter';
import {
  IoTTelemetry,
  IoTCommand,
  IoTDeviceStatus,
  SensorReading,
  ActuatorState,
  SimulationMode,
} from '@missionx/shared';

/**
 * WokwiAdapter handles communication with Wokwi ESP32 simulations.
 *
 * Supported Transports:
 * 1. HTTP POST Ingestion from Wokwi ESP32 running with Wokwi-GUEST WiFi
 * 2. WebSocket Serial Bridge from local serial/WebSocket gateway
 * 3. Fallback stub mode when unconfigured (verifiable by automated test suite)
 */
export class WokwiAdapter implements IoTAdapter {
  public readonly name = 'WokwiAdapter';
  private connected: boolean = false;
  private bridgeUrl?: string;
  private lastTelemetryAt: number = 0;
  private telemetryCallbacks: Array<(telemetry: IoTTelemetry) => void> = [];
  private pendingCommands: IoTCommand[] = [];

  // Current live state of the simulated Wokwi ESP32 node
  private currentSensors: SensorReading = {
    temperatureC: 31.8,
    humidityPct: 68.0,
    waterDetected: false,
    voltage: 0.0,
  };

  private currentActuators: ActuatorState = {
    fan: true,
    warningLed: true,
    buzzer: false,
    breakerTripped: false,
  };

  private currentMode: SimulationMode = 'OVERHEATING';

  constructor(bridgeUrl?: string) {
    this.bridgeUrl = bridgeUrl || process.env.WOKWI_BRIDGE_URL;
  }

  public async connect(): Promise<boolean> {
    if (!this.bridgeUrl && this.lastTelemetryAt === 0) {
      console.warn(
        '[WokwiAdapter] Wokwi bridge URL not configured (WOKWI_BRIDGE_URL). Operating in stub mode.'
      );
      this.connected = false;
      return false;
    }
    this.connected = true;
    return true;
  }

  public async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }

  public isConnected(): boolean {
    return this.connected || (Date.now() - this.lastTelemetryAt < 15000);
  }

  /**
   * Ingests a validated telemetry packet from Wokwi ESP32 (HTTP POST or WebSocket)
   */
  public ingestTelemetry(telemetry: Partial<IoTTelemetry>): IoTTelemetry {
    this.connected = true;
    this.lastTelemetryAt = Date.now();

    if (telemetry.sensors) {
      this.currentSensors = {
        ...this.currentSensors,
        ...telemetry.sensors,
      };
    }

    if (telemetry.actuators) {
      this.currentActuators = {
        ...this.currentActuators,
        ...telemetry.actuators,
      };
    }

    if (telemetry.simulationMode) {
      this.currentMode = telemetry.simulationMode;
    }

    const normalizedTelemetry: IoTTelemetry = {
      deviceId: telemetry.deviceId || 'server-room-esp32',
      missionId: telemetry.missionId || 'rescue-the-server-room',
      timestamp: telemetry.timestamp || new Date().toISOString(),
      sensors: { ...this.currentSensors },
      actuators: { ...this.currentActuators },
      simulationMode: this.currentMode,
      metadata: {
        adapter: this.name,
        transport: 'WOKWI_ESP32_BRIDGE',
        lastSeenMs: 0,
      },
    };

    // Broadcast to listeners (TelemetryService)
    for (const cb of this.telemetryCallbacks) {
      try {
        cb(normalizedTelemetry);
      } catch (err) {
        console.error('[WokwiAdapter] Error in telemetry callback:', err);
      }
    }

    return normalizedTelemetry;
  }

  public async getTelemetry(deviceId: string): Promise<IoTTelemetry | null> {
    if (this.lastTelemetryAt === 0 && !this.bridgeUrl) {
      return null;
    }

    return {
      deviceId,
      missionId: 'rescue-the-server-room',
      timestamp: new Date().toISOString(),
      sensors: { ...this.currentSensors },
      actuators: { ...this.currentActuators },
      simulationMode: this.currentMode,
      metadata: {
        adapter: this.name,
        transport: 'WOKWI_ESP32_BRIDGE',
      },
    };
  }

  public async sendCommand(
    deviceId: string,
    command: IoTCommand
  ): Promise<{ success: boolean; message: string }> {
    if (!this.bridgeUrl && this.lastTelemetryAt === 0) {
      return {
        success: false,
        message: 'Wokwi runtime integration is not configured.',
      };
    }

    // Apply command state changes optimistically to currentActuators
    switch (command.command) {
      case 'SET_FAN':
        this.currentActuators.fan = Boolean(command.value);
        break;
      case 'SET_WARNING_LED':
        this.currentActuators.warningLed = Boolean(command.value);
        break;
      case 'SET_BUZZER':
        this.currentActuators.buzzer = Boolean(command.value);
        break;
      case 'RESET_ALARM':
        this.currentActuators.warningLed = false;
        this.currentActuators.buzzer = false;
        break;
      case 'SET_TEMPERATURE':
        this.currentSensors.temperatureC = parseFloat(Number(command.value).toFixed(1));
        break;
      case 'SET_HUMIDITY':
        this.currentSensors.humidityPct = parseFloat(Number(command.value).toFixed(1));
        break;
      case 'SET_WATER':
        this.currentSensors.waterDetected = Boolean(command.value);
        this.currentSensors.voltage = this.currentSensors.waterDetected ? 3.3 : 0.0;
        break;
      case 'SET_SIMULATION_MODE':
        this.currentMode = String(command.value) as SimulationMode;
        if (this.currentMode === 'NORMAL') {
          this.currentSensors.temperatureC = 23.5;
          this.currentSensors.waterDetected = false;
          this.currentActuators.fan = true;
          this.currentActuators.warningLed = false;
          this.currentActuators.buzzer = false;
        } else if (this.currentMode === 'OVERHEATING') {
          this.currentSensors.temperatureC = 31.8;
          this.currentActuators.warningLed = true;
        } else if (this.currentMode === 'COOLING') {
          this.currentActuators.fan = true;
          this.currentSensors.temperatureC = 24.0;
          this.currentActuators.warningLed = false;
          this.currentActuators.buzzer = false;
        } else if (this.currentMode === 'WATER_ALERT') {
          this.currentSensors.waterDetected = true;
          this.currentSensors.voltage = 3.3;
          this.currentActuators.buzzer = true;
          this.currentActuators.warningLed = true;
        } else if (this.currentMode === 'RECOVERY') {
          this.currentSensors.waterDetected = false;
          this.currentSensors.voltage = 0.0;
          this.currentSensors.temperatureC = 23.0;
          this.currentActuators.fan = true;
          this.currentActuators.warningLed = false;
          this.currentActuators.buzzer = false;
        }
        break;
    }

    // Queue command for delivery to Wokwi ESP32
    this.pendingCommands.push(command);

    // Immediately trigger updated telemetry to sync 3D scene & HUD
    this.ingestTelemetry({
      deviceId,
      sensors: this.currentSensors,
      actuators: this.currentActuators,
      simulationMode: this.currentMode,
    });

    return {
      success: true,
      message: `Command ${command.command} queued and executed on Wokwi ESP32 node.`,
    };
  }

  /**
   * Returns and clears any pending commands for the Wokwi ESP32 poll loop
   */
  public popPendingCommands(): IoTCommand[] {
    const commands = [...this.pendingCommands];
    this.pendingCommands = [];
    return commands;
  }

  public async getStatus(deviceId: string): Promise<IoTDeviceStatus> {
    if (this.lastTelemetryAt === 0 && !this.bridgeUrl) {
      return 'OFFLINE';
    }
    const isRecent = Date.now() - this.lastTelemetryAt < 15000;
    return isRecent ? 'ONLINE' : 'OFFLINE';
  }

  public onTelemetry(callback: (telemetry: IoTTelemetry) => void): void {
    this.telemetryCallbacks.push(callback);
  }

  public getRawState() {
    return {
      connected: this.isConnected(),
      lastTelemetryAt: this.lastTelemetryAt,
      sensors: this.currentSensors,
      actuators: this.currentActuators,
      mode: this.currentMode,
      pendingCommandsCount: this.pendingCommands.length,
    };
  }
}
