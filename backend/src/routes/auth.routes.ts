import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/register', authMiddleware, requireRole('MANAGER'), (req, res, next) => authController.register(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next));

export default router;
