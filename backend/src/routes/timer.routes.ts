import { Router } from 'express';
import { timerController } from '../controllers/timer.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/active', (req, res, next) => timerController.getActive(req, res, next));
router.post('/start', (req, res, next) => timerController.start(req, res, next));
router.post('/:id/stop', (req, res, next) => timerController.stop(req, res, next));
router.get('/task/:taskId', (req, res, next) => timerController.getByTask(req, res, next));
router.delete('/:id', (req, res, next) => timerController.deleteSession(req, res, next));

export default router;
