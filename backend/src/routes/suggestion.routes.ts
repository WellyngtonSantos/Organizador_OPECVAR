import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { suggestionController } from '../controllers/suggestion.controller';

const router = Router();

router.use(authMiddleware);

// All authenticated users can list and create suggestions
router.get('/', suggestionController.list);
router.post('/', suggestionController.create);

// Only managers can update status/notes and delete
router.put('/:id', requireRole('MANAGER'), suggestionController.update);
router.delete('/:id', requireRole('MANAGER'), suggestionController.delete);

export default router;
