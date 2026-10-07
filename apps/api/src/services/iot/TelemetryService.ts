import { IoTTelemetry } from '@missionx/shared';
import { Telemetry } from '../../models/Telemetry';
import { IoTDevice } from '../../models/IoTDevice';
import { Server as SocketIOServer } from 'socket.io';

export class TelemetryService {
  private static io: SocketIOServer | null = null;
  private static latestByMission: Map<string, IoTTelemetry> = new Map();
  private static latestByDevice: Map<string, IoTTelemetry> = new Map();
  private static historyCache: Map<string, IoTTelemetry[]> = new Map();
  private static lastDbSaveTimes: Map<string, number> = new Map();
  private static telemetryListeners: Array<(telemetry: IoTTelemetry) => void> = [];

  public static setSocketServer(io: SocketIOServer): void {
    this.io = io;
  }

  public static onTelemetry(callback: (telemetry: IoTTelemetry) => void): void {
    this.telemetryListeners.push(callback);
  }

  /**
   * Ingest incoming telemetry packet from an IoT adapter
   */
  public static async ingestTelemetry(telemetry: IoTTelemetry): Promise<void> {
    const { missionId, deviceId, timestamp } = telemetry;

    // 1. Update in-memory instant caches
    this.latestByMission.set(missionId, telemetry);
    this.latestByDevice.set(deviceId, telemetry);

    let history = this.historyCache.get(missionId);
    if (!history) {
      history = [];
      this.historyCache.set(missionId, history);
    }
    history.push(telemetry);
    if (history.length > 60) {
      history.shift(); // Keep latest 60 samples in ring buffer
    }

    // 2. Broadcast real-time Socket.IO events to authenticated mission and device rooms
    if (this.io) {
      this.io.to(`mission:${missionId}`).emit('iot:telemetry', {
        type: 'iot:telemetry',
        telemetry,
      });

      this.io.to(`device:${deviceId}`).emit('iot:telemetry', {
        type: 'iot:telemetry',
        telemetry,
      });
    }

    // 3. Notify internal services (e.g. Mission Engine)
    for (const listener of this.telemetryListeners) {
      try {
        listener(telemetry);
      } catch (err) {
        console.error('[TelemetryService] Listener error:', err);
      }
    }

    // 4. Persist to MongoDB (Throttled to once every 4 seconds per device to prevent DB bloat)
    const now = Date.now();
    const lastSave = this.lastDbSaveTimes.get(deviceId) || 0;
    if (now - lastSave > 4000) {
      this.lastDbSaveTimes.set(deviceId, now);
      this.persistToDb(telemetry).catch((err) => {
        console.error('[TelemetryService] DB persist error:', err.message);
      });
    }
  }

  public static getLatestTelemetry(missionIdOrDevice: string): IoTTelemetry | null {
    return (
      this.latestByMission.get(missionIdOrDevice) ||
      this.latestByDevice.get(missionIdOrDevice) ||
      null
    );
  }

  public static async getTelemetryHistory(
    missionId: string,
    limit: number = 30
  ): Promise<IoTTelemetry[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    // Prefer fast memory buffer if available
    const cached = this.historyCache.get(missionId);
    if (cached && cached.length > 0) {
      return cached.slice(-safeLimit);
    }

    // Fallback to database
    try {
      const records = await Telemetry.find({ missionId })
        .sort({ timestamp: -1 })
        .limit(safeLimit)
        .lean();

      return records.reverse().map((r) => ({
        deviceId: r.deviceId,
        missionId: r.missionId,
        timestamp: (r.timestamp as Date).toISOString(),
        sensors: r.sensors,
        actuators: r.actuators,
        simulationMode: r.simulationMode as any,
        metadata: r.metadata,
      }));
    } catch {
      return [];
    }
  }

  private static async persistToDb(telemetry: IoTTelemetry): Promise<void> {
    try {
      await Telemetry.create({
        deviceId: telemetry.deviceId,
        missionId: telemetry.missionId,
        timestamp: new Date(telemetry.timestamp),
        sensors: telemetry.sensors,
        actuators: telemetry.actuators,
        simulationMode: telemetry.simulationMode,
        metadata: telemetry.metadata,
      });

      await IoTDevice.updateOne(
        { deviceId: telemetry.deviceId },
        {
          $set: {
            lastTelemetryAt: new Date(),
            status: 'ONLINE',
          },
        },
        { upsert: false }
      );
    } catch (err: any) {
      // Don't throw to caller; logging is sufficient
    }
  }
}
