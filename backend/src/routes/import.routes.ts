import { Router } from 'express';
import multer from 'multer';
import { importController } from '../controllers/import.controller';
import { authMiddleware, requireRole } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (allowed.includes(file.mimetype) || file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .xlsx sao aceitos'));
    }
  },
});

const router = Router();

router.use(authMiddleware);

router.post(
  '/xlsx',
  requireRole('MANAGER'),
  upload.single('file'),
  (req, res, next) => importController.importXlsx(req, res, next),
);

export default router;
