import { IoTRegistry } from './IoTRegistry';
import { TelemetryService } from './TelemetryService';
import { IoTTelemetry, IoTCommand, IoTDeviceStatus } from '@missionx/shared';
import { IoTDevice } from '../../models/IoTDevice';

export class IoTService {
  private static isInitialized = false;

  /**
   * Initializes IoT subsystems, connects active adapters, and registers default devices
   */
  public static async init(): Promise<void> {
    if (this.isInitialized) return;

    // 1. Ensure default device exists in database
    try {
      await IoTDevice.findOneAndUpdate(
        { deviceId: 'server-room-esp32' },
        {
          $setOnInsert: {
            deviceId: 'server-room-esp32',
            missionId: 'rescue-the-server-room',
            name: 'Datacenter Cluster ESP32 Node',
            type: 'ESP32',
            status: 'SIMULATED',
            metadata: {
              room: 'Server Room Alpha',
              firmwareVersion: '1.4.0-wokwi-sim',
            },
          },
        },
        { upsert: true, new: true }
      );
    } catch (err: any) {
      console.warn('[IoTService] Device registration notice:', err.message);
    }

    // 2. Connect MockIoTAdapter
    const mockAdapter = IoTRegistry.getMockAdapter();

    // Hook adapter's telemetry emission directly into TelemetryService
    mockAdapter.onTelemetry((telemetry) => {
      TelemetryService.ingestTelemetry(telemetry);
    });

    await mockAdapter.connect();
    this.isInitialized = true;
    console.log('✅ IoTService initialized with active MockIoTAdapter');
  }

  public static async shutdown(): Promise<void> {
    const mockAdapter = IoTRegistry.getMockAdapter();
    await mockAdapter.disconnect();
    this.isInitialized = false;
  }

  public static async getTelemetry(deviceId: string): Promise<IoTTelemetry | null> {
    // Check TelemetryService cache first
    const cached = TelemetryService.getLatestTelemetry(deviceId);
    if (cached) return cached;

    // Fallback to adapter
    const adapter = IoTRegistry.getAdapter(deviceId);
    if (!adapter) return null;
    return await adapter.getTelemetry(deviceId);
  }

  public static async sendCommand(
    deviceId: string,
    command: IoTCommand
  ): Promise<{ success: boolean; message: string }> {
    const adapter = IoTRegistry.getAdapter(deviceId);
    if (!adapter) {
      return { success: false, message: `Unknown IoT device: ${deviceId}` };
    }
    return await adapter.sendCommand(deviceId, command);
  }

  public static async getStatus(deviceId: string): Promise<IoTDeviceStatus> {
    const adapter = IoTRegistry.getAdapter(deviceId);
    if (!adapter) return 'OFFLINE';
    return await adapter.getStatus(deviceId);
  }
}
