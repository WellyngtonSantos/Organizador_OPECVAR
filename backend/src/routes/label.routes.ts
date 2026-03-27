import { Router } from 'express';
import { labelController } from '../controllers/label.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => labelController.list(req, res, next));
router.get('/:id', (req, res, next) => labelController.getById(req, res, next));
router.post('/', requireRole('MANAGER'), (req, res, next) => labelController.create(req, res, next));
router.put('/:id', requireRole('MANAGER'), (req, res, next) => labelController.update(req, res, next));
router.delete('/:id', requireRole('MANAGER'), (req, res, next) => labelController.delete(req, res, next));

export default router;
