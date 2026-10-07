import {
  IoTTelemetry,
  IoTCommand,
  IoTDeviceStatus,
} from '@missionx/shared';

export interface IoTAdapter {
  readonly name: string;
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  isConnected(): boolean;
  getTelemetry(deviceId: string): Promise<IoTTelemetry | null>;
  sendCommand(
    deviceId: string,
    command: IoTCommand
  ): Promise<{ success: boolean; message: string }>;
  getStatus(deviceId: string): Promise<IoTDeviceStatus>;
  onTelemetry(callback: (telemetry: IoTTelemetry) => void): void;
}
