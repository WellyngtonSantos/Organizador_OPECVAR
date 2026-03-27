import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', (req, res, next) => taskController.list(req, res, next));
router.get('/:id', (req, res, next) => taskController.getById(req, res, next));
router.post('/', (req, res, next) => taskController.create(req, res, next));
router.put('/:id', (req, res, next) => taskController.update(req, res, next));
router.delete('/:id', (req, res, next) => taskController.delete(req, res, next));

router.get('/:id/notes', (req, res, next) => taskController.getNotes(req, res, next));
router.post('/:id/notes', (req, res, next) => taskController.createNote(req, res, next));
router.delete('/:id/notes/:noteId', (req, res, next) => taskController.deleteNote(req, res, next));

router.get('/:id/history', (req, res, next) => taskController.getHistory(req, res, next));

export default router;
