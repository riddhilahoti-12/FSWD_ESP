import { Request, Response, NextFunction } from 'express';
import { TelemetryService } from '../services/iot/TelemetryService';
import { IoTService } from '../services/iot/IoTService';

export class TelemetryController {
  /**
   * GET /api/telemetry/:missionId
   * Retrieves latest authoritative telemetry sample for a mission
   */
  public static async getLatest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { missionId } = req.params;
      let telemetry = TelemetryService.getLatestTelemetry(missionId);

      // If not yet in cache, check default device
      if (!telemetry && (missionId === 'rescue-the-server-room' || missionId === 'mission-server-room-01')) {
        telemetry = await IoTService.getTelemetry('server-room-esp32');
      }

      if (!telemetry) {
        res.status(404).json({
          success: false,
          error: {
            code: 'TELEMETRY_NOT_FOUND',
            message: `No telemetry found for mission '${missionId}'`,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: telemetry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/telemetry/:missionId/history
   * Retrieves historical telemetry samples
   */
  public static async getHistory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { missionId } = req.params;
      const limit = parseInt(req.query.limit as string) || 30;

      const history = await TelemetryService.getTelemetryHistory(missionId, limit);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}
