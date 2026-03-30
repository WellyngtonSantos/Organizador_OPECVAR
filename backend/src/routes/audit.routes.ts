import { Router } from 'express';
import { auditController } from '../controllers/audit.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('MANAGER'));

router.get('/', (req, res, next) => auditController.list(req, res, next));

export default router;
