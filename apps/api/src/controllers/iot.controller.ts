import { Request, Response, NextFunction } from 'express';
import { CommandService } from '../services/iot/CommandService';
import { IoTService } from '../services/iot/IoTService';
import { IoTRegistry } from '../services/iot/IoTRegistry';
import { IoTDevice } from '../models/IoTDevice';
import { SimulationMode } from '@missionx/shared';

export class IoTController {
  /**
   * POST /api/iot/commands
   * Executes a validated IoT command
   */
  public static async executeCommand(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = (req as any).user;
      const userRole = user?.role || 'STUDENT';
      const userId = user?.userId || 'anonymous';

      const result = await CommandService.executeCommand(
        req.body,
        userRole,
        userId
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'COMMAND_REJECTED',
            message: result.message,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      if (error?.code === 'DEVICE_NOT_FOUND') {
        res.status(404).json({
          success: false,
          error: {
            code: 'DEVICE_NOT_FOUND',
            message: error.message,
          },
        });
        return;
      }
      if (error?.code === 'FORBIDDEN') {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }

  /**
   * GET /api/iot/devices
   * Lists registered devices
   */
  public static async listDevices(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const devices = await IoTDevice.find().lean();
      res.status(200).json({
        success: true,
        data: devices,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/iot/devices/:deviceId
   * Retrieves single device status & telemetry
   */
  public static async getDevice(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { deviceId } = req.params;
      const device = await IoTDevice.findOne({ deviceId }).lean();

      if (!device) {
        res.status(404).json({
          success: false,
          error: {
            code: 'DEVICE_NOT_FOUND',
            message: `Device '${deviceId}' not found`,
          },
        });
        return;
      }

      const telemetry = await IoTService.getTelemetry(deviceId);
      const status = await IoTService.getStatus(deviceId);

      res.status(200).json({
        success: true,
        data: {
          ...device,
          status,
          telemetry,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/iot/simulation/mode
   * Set simulation mode (ADMIN or dev environment)
   */
  public static async setSimulationMode(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { deviceId, mode } = req.body;
      const user = (req as any).user;
      const userRole = user?.role || 'STUDENT';

      const result = await CommandService.executeCommand(
        {
          deviceId: deviceId || 'server-room-esp32',
          command: 'SET_SIMULATION_MODE',
          value: mode as SimulationMode,
        },
        userRole,
        user?.userId || 'admin'
      );

      if (!result.success) {
        res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED_SIMULATION_CONTROL',
            message: result.message,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/iot/wokwi/telemetry
   * Direct HTTP ingestion endpoint called by Wokwi ESP32 firmware
   */
  public static async wokwiTelemetryIngest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload = req.body || {};
      const wokwiAdapter = IoTRegistry.getWokwiAdapter();

      // Ingest telemetry packet and dispatch to TelemetryService -> Socket.IO
      const telemetry = wokwiAdapter.ingestTelemetry(payload);

      // Register WokwiAdapter as the active adapter for server-room-esp32
      IoTRegistry.registerDeviceAdapter('server-room-esp32', wokwiAdapter);

      // Pop any queued pending commands to return to the ESP32 in HTTP response
      const commands = wokwiAdapter.popPendingCommands();

      res.status(200).json({
        success: true,
        message: 'Wokwi telemetry ingested successfully',
        data: telemetry,
        commands,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/iot/wokwi/status
   * Health and connectivity status for Wokwi simulation integration
   */
  public static async getWokwiStatus(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const wokwiAdapter = IoTRegistry.getWokwiAdapter();
      const rawState = wokwiAdapter.getRawState();
      const activeAdapter = IoTRegistry.getActiveAdapterName('server-room-esp32');

      res.status(200).json({
        success: true,
        data: {
          ...rawState,
          activeAdapter,
          bridgeEndpoint: '/api/iot/wokwi/telemetry',
          supportedCommands: ['SET_FAN', 'SET_WARNING_LED', 'SET_BUZZER', 'RESET_ALARM', 'SET_WATER', 'SET_TEMPERATURE', 'SET_SIMULATION_MODE'],
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/iot/wokwi/command
   * Execute or queue a direct hardware actuator command to Wokwi ESP32
   */
  public static async executeWokwiCommand(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { command, value, deviceId = 'server-room-esp32' } = req.body;
      const user = (req as any).user;
      const wokwiAdapter = IoTRegistry.getWokwiAdapter();

      const result = await wokwiAdapter.sendCommand(deviceId, {
        deviceId,
        command,
        value,
        issuedBy: user?.userId || 'wokwi-bridge',
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: result.success,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/iot/adapter
   * Switch active IoT adapter (MockIoTAdapter <-> WokwiAdapter)
   */
  public static async switchAdapter(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { adapterType, deviceId = 'server-room-esp32' } = req.body;
      const targetType = adapterType === 'WokwiAdapter' ? 'WokwiAdapter' : 'MockIoTAdapter';

      const adapter = IoTRegistry.setActiveAdapter(deviceId, targetType);

      res.status(200).json({
        success: true,
        data: {
          deviceId,
          activeAdapter: adapter.name,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

