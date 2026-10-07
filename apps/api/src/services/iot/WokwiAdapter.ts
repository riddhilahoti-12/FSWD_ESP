import { IoTAdapter } from './IoTAdapter';
import {
  IoTTelemetry,
  IoTCommand,
  IoTDeviceStatus,
} from '@missionx/shared';

/**
 * WokwiAdapter defines the boundary for live Wokwi ESP32 simulations.
 *
 * Integration Requirements for Live Operation:
 * 1. A local or containerized Wokwi bridge service (e.g. Wokwi IoT Gateway or custom GDB/serial websocket proxy).
 * 2. Bi-directional WebSocket communication streaming serial JSON telemetry from sketch.ino.
 * 3. Environment configuration: WOKWI_BRIDGE_URL and WOKWI_PROJECT_ID.
 */
export class WokwiAdapter implements IoTAdapter {
  public readonly name = 'WokwiAdapter';
  private connected: boolean = false;
  private bridgeUrl?: string;

  constructor(bridgeUrl?: string) {
    this.bridgeUrl = bridgeUrl || process.env.WOKWI_BRIDGE_URL;
  }

  public async connect(): Promise<boolean> {
    if (!this.bridgeUrl) {
      console.warn(
        '[WokwiAdapter] Wokwi bridge URL not configured (WOKWI_BRIDGE_URL). Operating in stub mode.'
      );
      this.connected = false;
      return false;
    }
    // Future bridge connection logic
    this.connected = false;
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
      message: 'Wokwi runtime integration is not configured.',
    };
  }

  public async getStatus(deviceId: string): Promise<IoTDeviceStatus> {
    return 'OFFLINE';
  }

  public onTelemetry(callback: (telemetry: IoTTelemetry) => void): void {
    // Registered when live bridge connection is established
  }
}
