import { Router } from 'express';
import { IoTController } from '../controllers/iot.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// Commands (authenticated students & admins; role permission enforced in CommandService)
router.post('/commands', requireAuth, IoTController.executeCommand);

// Device Registry
router.get('/devices', requireAuth, IoTController.listDevices);
router.get('/devices/:deviceId', requireAuth, IoTController.getDevice);

// Simulation Controls (ADMIN only)
router.post('/simulation/mode', requireAuth, requireAdmin, IoTController.setSimulationMode);

export default router;
