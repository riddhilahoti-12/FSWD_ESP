import {
  IoTAdapter
} from './IoTAdapter';
import {
  IoTTelemetry,
  IoTCommand,
  IoTDeviceStatus,
  SimulationMode,
  SensorReading,
  ActuatorState,
} from '@missionx/shared';

interface DeviceSimulationState {
  deviceId: string;
  missionId: string;
  sensors: SensorReading;
  actuators: ActuatorState;
  simulationMode: SimulationMode;
  status: IoTDeviceStatus;
}

export class MockIoTAdapter implements IoTAdapter {
  public readonly name = 'MockIoTAdapter';
  private connected: boolean = false;
  private intervalTimer: NodeJS.Timeout | null = null;
  private telemetryCallbacks: Array<(telemetry: IoTTelemetry) => void> = [];

  // In-memory simulation states per device
  private devices: Map<string, DeviceSimulationState> = new Map();

  constructor() {
    // Initialize default flagship device: server-room-esp32
    this.devices.set('server-room-esp32', {
      deviceId: 'server-room-esp32',
      missionId: 'rescue-the-server-room',
      sensors: {
        temperatureC: 31.8,
        humidityPct: 68.0,
        waterDetected: false,
        voltage: 0.0,
      },
      actuators: {
        fan: true,
        warningLed: true,
        buzzer: false,
        breakerTripped: false,
      },
      simulationMode: 'OVERHEATING',
      status: 'SIMULATED',
    });
  }

  public async connect(): Promise<boolean> {
    if (this.connected) return true;
    this.connected = true;

    // Start live simulation loop running every 1.5 seconds
    this.startSimulationLoop();
    return true;
  }

  public async disconnect(): Promise<boolean> {
    this.connected = false;
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    return true;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async getTelemetry(deviceId: string): Promise<IoTTelemetry | null> {
    const dev = this.devices.get(deviceId);
    if (!dev) return null;

    return {
      deviceId: dev.deviceId,
      missionId: dev.missionId,
      timestamp: new Date().toISOString(),
      sensors: { ...dev.sensors },
      actuators: { ...dev.actuators },
      simulationMode: dev.simulationMode,
      metadata: { adapter: this.name },
    };
  }

  public async getStatus(deviceId: string): Promise<IoTDeviceStatus> {
    const dev = this.devices.get(deviceId);
    if (!dev) return 'OFFLINE';
    return this.connected ? dev.status : 'OFFLINE';
  }

  public onTelemetry(callback: (telemetry: IoTTelemetry) => void): void {
    this.telemetryCallbacks.push(callback);
  }

  public async sendCommand(
    deviceId: string,
    command: IoTCommand
  ): Promise<{ success: boolean; message: string }> {
    const dev = this.devices.get(deviceId);
    if (!dev) {
      return { success: false, message: `Unknown IoT device: ${deviceId}` };
    }

    switch (command.command) {
      case 'SET_FAN':
        dev.actuators.fan = Boolean(command.value);
        break;

      case 'SET_WARNING_LED':
        dev.actuators.warningLed = Boolean(command.value);
        break;

      case 'SET_BUZZER':
        dev.actuators.buzzer = Boolean(command.value);
        break;

      case 'RESET_ALARM':
        dev.actuators.warningLed = false;
        dev.actuators.buzzer = false;
        break;

      case 'SET_SIMULATION_MODE':
        dev.simulationMode = String(command.value) as SimulationMode;
        if (dev.simulationMode === 'WATER_ALERT') {
          dev.sensors.waterDetected = true;
          dev.actuators.buzzer = true;
        } else if (dev.simulationMode === 'NORMAL' || dev.simulationMode === 'RECOVERY') {
          dev.sensors.waterDetected = false;
        }
        break;

      case 'SET_TEMPERATURE':
        dev.sensors.temperatureC = parseFloat(Number(command.value).toFixed(1));
        break;

      case 'SET_HUMIDITY':
        dev.sensors.humidityPct = parseFloat(Number(command.value).toFixed(1));
        break;

      case 'SET_WATER':
        dev.sensors.waterDetected = Boolean(command.value);
        break;

      default:
        return { success: false, message: `Unsupported command: ${(command as any).command}` };
    }

    // Immediately dispatch telemetry after state mutation
    this.emitTelemetryForDevice(dev);

    return {
      success: true,
      message: `Command ${command.command} executed successfully on ${deviceId}`,
    };
  }

  public toTelemetry(dev: DeviceSimulationState): IoTTelemetry {
    return {
      deviceId: dev.deviceId,
      missionId: dev.missionId,
      timestamp: new Date().toISOString(),
      sensors: { ...dev.sensors },
      actuators: { ...dev.actuators },
      simulationMode: dev.simulationMode,
      metadata: { adapter: this.name },
    };
  }

  public setSimulationMode(mode: SimulationMode, deviceId: string = 'server-room-esp32'): void {
    const dev = this.devices.get(deviceId);
    if (!dev) return;
    dev.simulationMode = mode;
    if (mode === 'WATER_ALERT') {
      dev.sensors.waterDetected = true;
      dev.actuators.buzzer = true;
    } else if (mode === 'NORMAL' || mode === 'RECOVERY') {
      dev.sensors.waterDetected = false;
    }
    this.emitTelemetryForDevice(dev);
  }

  public tick(deviceId: string = 'server-room-esp32'): IoTTelemetry {
    const dev = this.devices.get(deviceId);
    if (!dev) throw new Error(`Unknown device: ${deviceId}`);
    this.stepSimulation(dev);
    const telemetry = this.toTelemetry(dev);
    this.emitTelemetryForDevice(dev);
    return telemetry;
  }

  /**
   * Periodic simulation loop applying realistic bounded telemetry changes
   */
  private startSimulationLoop() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);

    this.intervalTimer = setInterval(() => {
      for (const dev of this.devices.values()) {
        this.stepSimulation(dev);
        this.emitTelemetryForDevice(dev);
      }
    }, 1500);
  }

  private stepSimulation(dev: DeviceSimulationState) {
    const mode = dev.simulationMode;
    let temp = dev.sensors.temperatureC;
    let hum = dev.sensors.humidityPct;

    // Jitter component (-0.08 to +0.08)
    const jitter = (Math.random() - 0.5) * 0.16;
    const humJitter = (Math.random() - 0.5) * 0.3;

    switch (mode) {
      case 'NORMAL':
        // Gravitates smoothly toward safe operating center: 23.5°C
        if (temp > 24.5) temp -= 0.15;
        else if (temp < 22.5) temp += 0.15;
        temp += jitter;
        hum = Math.max(45, Math.min(55, hum + humJitter));
        break;

      case 'OVERHEATING':
        // Overheating server room: rises toward 33.5°C - 35.0°C if cooling is offline or overwhelmed
        if (dev.actuators.fan) {
          // Fan is on but cooling breaker tripped/overheated
          if (temp < 32.5) temp += 0.08;
          else if (temp > 34.0) temp -= 0.05;
        } else {
          // Fan stopped: thermal runaway accelerates
          if (temp < 37.0) temp += 0.18;
        }
        temp += jitter;
        hum = Math.max(62, Math.min(72, hum + humJitter));
        break;

      case 'COOLING':
        // Cooling restored: temperature decreases toward 23°C
        if (dev.actuators.fan) {
          temp -= 0.25;
          if (temp < 23.0) {
            dev.simulationMode = 'NORMAL';
            dev.actuators.warningLed = false;
            dev.actuators.buzzer = false;
          }
        }
        temp += jitter;
        hum = Math.max(48, Math.min(58, hum - 0.2));
        break;

      case 'WATER_ALERT':
        dev.sensors.waterDetected = true;
        dev.sensors.voltage = 3.3; // Logic HIGH
        dev.actuators.warningLed = true;
        dev.actuators.buzzer = true;
        break;

      case 'RECOVERY':
        dev.sensors.waterDetected = false;
        dev.sensors.voltage = 0.0;
        if (temp > 24.0) temp -= 0.2;
        temp += jitter;
        hum = Math.max(45, Math.min(52, hum - 0.1));
        if (temp <= 24.5) {
          dev.simulationMode = 'NORMAL';
          dev.actuators.warningLed = false;
          dev.actuators.buzzer = false;
        }
        break;
    }

    // Clamp limits
    dev.sensors.temperatureC = parseFloat(Math.max(18.0, Math.min(45.0, temp)).toFixed(1));
    dev.sensors.humidityPct = parseFloat(Math.max(20.0, Math.min(95.0, hum)).toFixed(1));
  }

  private emitTelemetryForDevice(dev: DeviceSimulationState) {
    const telemetry: IoTTelemetry = {
      deviceId: dev.deviceId,
      missionId: dev.missionId,
      timestamp: new Date().toISOString(),
      sensors: { ...dev.sensors },
      actuators: { ...dev.actuators },
      simulationMode: dev.simulationMode,
      metadata: { adapter: this.name },
    };

    for (const cb of this.telemetryCallbacks) {
      try {
        cb(telemetry);
      } catch (err) {
        console.error('[MockIoTAdapter] Callback error:', err);
      }
    }
  }
}
