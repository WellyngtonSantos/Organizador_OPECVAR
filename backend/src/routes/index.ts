import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import bucketRoutes from './bucket.routes';
import labelRoutes from './label.routes';
import userRoutes from './user.routes';
import timerRoutes from './timer.routes';
import queueRoutes from './queue.routes';
import dashboardRoutes from './dashboard.routes';
import exportRoutes from './export.routes';
import importRoutes from './import.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/buckets', bucketRoutes);
router.use('/labels', labelRoutes);
router.use('/users', userRoutes);
router.use('/timers', timerRoutes);
router.use('/queues', queueRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/export', exportRoutes);
router.use('/import', importRoutes);

export default router;
