import { Request, Response, NextFunction } from 'express';
import { CommandService } from '../services/iot/CommandService';
import { IoTService } from '../services/iot/IoTService';
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
}
