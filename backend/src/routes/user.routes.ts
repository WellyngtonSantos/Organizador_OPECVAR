import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// Public for authenticated users
router.get('/analysts', (req, res, next) => userController.listAnalysts(req, res, next));

// Manager-only routes
router.get('/', requireRole('MANAGER'), (req, res, next) => userController.listAll(req, res, next));
router.get('/:id', requireRole('MANAGER'), (req, res, next) => userController.getById(req, res, next));
router.post('/', requireRole('MANAGER'), (req, res, next) => userController.create(req, res, next));
router.put('/:id', requireRole('MANAGER'), (req, res, next) => userController.update(req, res, next));
router.patch('/:id/password', requireRole('MANAGER'), (req, res, next) => userController.resetPassword(req, res, next));
router.delete('/:id', requireRole('MANAGER'), (req, res, next) => userController.delete(req, res, next));

export default router;
