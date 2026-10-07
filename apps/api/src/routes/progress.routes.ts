import { Router } from 'express';
import { getProgress, getMyProgressList } from '../controllers/progress.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/my', requireAuth, getMyProgressList);
router.get('/:missionId', requireAuth, getProgress);

export default router;
