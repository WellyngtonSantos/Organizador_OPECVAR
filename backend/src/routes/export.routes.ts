import { Router } from 'express';
import { exportController } from '../controllers/export.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/xlsx', (req, res, next) => exportController.exportXlsx(req, res, next));
router.get('/csv', (req, res, next) => exportController.exportCsv(req, res, next));

export default router;
