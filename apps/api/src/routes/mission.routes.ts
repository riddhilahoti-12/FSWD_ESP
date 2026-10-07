import { Router } from 'express';
import { getMissions, getMissionBySlug, startMission } from '../controllers/mission.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', getMissions);
router.get('/:slug', getMissionBySlug);
router.post('/:id/start', requireAuth, startMission);

export default router;
