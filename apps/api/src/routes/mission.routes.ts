import { Router } from 'express';
import {
  getMissions,
  getMissionBySlug,
  startMission,
  getMissionState,
  processInteraction,
  useHint,
} from '../controllers/mission.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { interactionInputSchema } from '@missionx/shared';

const router = Router();

// Mission Catalog
router.get('/', getMissions);
router.get('/:slug', getMissionBySlug);
router.post('/:id/start', requireAuth, startMission);

// Gameplay Engine Endpoints
router.get('/:missionId/state', requireAuth, getMissionState);
router.post(
  '/:missionId/interactions/:interactionId',
  requireAuth,
  validate(interactionInputSchema),
  processInteraction
);
router.post('/:missionId/hints/:hintId/use', requireAuth, useHint);

export default router;
