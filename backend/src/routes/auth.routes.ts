import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/auth.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too Many Requests', message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));
router.post('/register', authMiddleware, requireRole('MANAGER'), (req, res, next) => authController.register(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next));

export default router;
