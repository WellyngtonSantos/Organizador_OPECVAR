import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/analysts', (req, res, next) => userController.listAnalysts(req, res, next));

export default router;
