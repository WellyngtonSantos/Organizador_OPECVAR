import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/:analystId', (req, res, next) => queueController.getByAnalyst(req, res, next));
router.put('/reorder', (req, res, next) => queueController.reorder(req, res, next));

export default router;
