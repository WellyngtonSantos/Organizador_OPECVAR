import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { userController } from '../controllers/user.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const router = Router();

// Rate limit for sensitive user operations (create, password reset, delete)
const sensitiveOpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too Many Requests', message: 'Limite de operacoes atingido. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authMiddleware);

// Public for authenticated users
router.get('/analysts', (req, res, next) => userController.listAnalysts(req, res, next));

// Manager-only routes
router.get('/', requireRole('MANAGER'), (req, res, next) => userController.listAll(req, res, next));
router.get('/:id', requireRole('MANAGER'), (req, res, next) => userController.getById(req, res, next));
router.post('/', requireRole('MANAGER'), sensitiveOpLimiter, (req, res, next) => userController.create(req, res, next));
router.put('/:id', requireRole('MANAGER'), (req, res, next) => userController.update(req, res, next));
router.patch('/:id/password', requireRole('MANAGER'), sensitiveOpLimiter, (req, res, next) => userController.resetPassword(req, res, next));
router.delete('/:id', requireRole('MANAGER'), sensitiveOpLimiter, (req, res, next) => userController.delete(req, res, next));

export default router;
