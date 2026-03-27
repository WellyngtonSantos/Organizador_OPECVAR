import { Router } from 'express';
import { bucketController } from '../controllers/bucket.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => bucketController.list(req, res, next));
router.get('/:id', (req, res, next) => bucketController.getById(req, res, next));
router.post('/', requireRole('MANAGER'), (req, res, next) => bucketController.create(req, res, next));
router.put('/:id', requireRole('MANAGER'), (req, res, next) => bucketController.update(req, res, next));
router.delete('/:id', requireRole('MANAGER'), (req, res, next) => bucketController.delete(req, res, next));

export default router;
