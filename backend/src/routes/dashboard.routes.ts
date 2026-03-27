import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/weekly', (req, res, next) => dashboardController.getWeeklyDashboard(req, res, next));

export default router;
