import { IoTAdapter } from './IoTAdapter';
import { MockIoTAdapter } from './MockIoTAdapter';
import { WokwiAdapter } from './WokwiAdapter';
import { PhysicalESP32Adapter } from './PhysicalESP32Adapter';

export class IoTRegistry {
  private static adapters: Map<string, IoTAdapter> = new Map();
  private static defaultMockAdapter: MockIoTAdapter = new MockIoTAdapter();
  private static wokwiAdapter: WokwiAdapter = new WokwiAdapter();
  private static physicalAdapter: PhysicalESP32Adapter = new PhysicalESP32Adapter();

  static {
    // Register default flagship device
    this.adapters.set('server-room-esp32', this.defaultMockAdapter);
  }

  public static hasDevice(deviceId: string): boolean {
    return this.adapters.has(deviceId);
  }

  public static getAdapter(deviceId: string): IoTAdapter | null {
    return this.adapters.get(deviceId) || null;
  }

  public static getMockAdapter(): MockIoTAdapter {
    return this.defaultMockAdapter;
  }

  public static getWokwiAdapter(): WokwiAdapter {
    return this.wokwiAdapter;
  }

  public static getPhysicalAdapter(): PhysicalESP32Adapter {
    return this.physicalAdapter;
  }

  public static registerAdapter(deviceId: string, adapter: IoTAdapter): void {
    this.adapters.set(deviceId, adapter);
  }

  public static registerDeviceAdapter(deviceId: string, adapter: IoTAdapter): void {
    this.adapters.set(deviceId, adapter);
  }

  public static setActiveAdapter(deviceId: string, adapterType: 'WokwiAdapter' | 'MockIoTAdapter' | 'PhysicalESP32Adapter'): IoTAdapter {
    let adapter: IoTAdapter;
    if (adapterType === 'WokwiAdapter') {
      adapter = this.wokwiAdapter;
    } else if (adapterType === 'PhysicalESP32Adapter') {
      adapter = this.physicalAdapter;
    } else {
      adapter = this.defaultMockAdapter;
    }
    this.adapters.set(deviceId, adapter);
    return adapter;
  }

  public static getActiveAdapterName(deviceId: string): string {
    const adapter = this.adapters.get(deviceId);
    return adapter ? adapter.name : 'Unknown';
  }
}
