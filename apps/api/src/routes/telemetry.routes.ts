import { Router } from 'express';
import { TelemetryController } from '../controllers/telemetry.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Retrieve telemetry (Authenticated students & admins)
router.get('/:missionId', requireAuth, TelemetryController.getLatest);
router.get('/:missionId/history', requireAuth, TelemetryController.getHistory);

export default router;
