import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import bucketRoutes from './bucket.routes';
import labelRoutes from './label.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/buckets', bucketRoutes);
router.use('/labels', labelRoutes);

export default router;
