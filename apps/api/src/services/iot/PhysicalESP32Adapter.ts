import { IoTAdapter } from './IoTAdapter';
import {
  IoTTelemetry,
  IoTCommand,
  IoTDeviceStatus,
} from '@missionx/shared';

/**
 * PhysicalESP32Adapter defines the boundary for hardware ESP32 microcontrollers.
 *
 * Integration Requirements:
 * 1. Physical ESP32 hardware flashed with MissionX firmware.
 * 2. MQTT broker or Serial WebUSB/WebSerial gateway connection (MQTT_BROKER_URL).
 * 3. Bidirectional MQTT topics: `missionx/{missionId}/telemetry` and `missionx/{missionId}/command`.
 */
export class PhysicalESP32Adapter implements IoTAdapter {
  public readonly name = 'PhysicalESP32Adapter';
  private connected: boolean = false;
  private brokerUrl?: string;

  constructor(brokerUrl?: string) {
    this.brokerUrl = brokerUrl || process.env.MQTT_BROKER_URL;
  }

  public async connect(): Promise<boolean> {
    if (!this.brokerUrl) {
      this.connected = false;
      return false;
    }
    return false;
  }

  public async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public async getTelemetry(deviceId: string): Promise<IoTTelemetry | null> {
    return null;
  }

  public async sendCommand(
    deviceId: string,
    command: IoTCommand
  ): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Physical ESP32 hardware is not configured (MQTT_BROKER_URL not set).',
    };
  }

  public async getStatus(deviceId: string): Promise<IoTDeviceStatus> {
    return 'OFFLINE';
  }

  public onTelemetry(callback: (telemetry: IoTTelemetry) => void): void {
    // Registered when physical broker is connected
  }
}
