import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { taskService } from '../services/task.service';
import { noteService } from '../services/note.service';
import { historyService } from '../services/history.service';
import { createTaskSchema, updateTaskSchema, bulkStatusSchema } from '../schemas/task.schema';
import { createNoteSchema } from '../schemas/note.schema';

export class TaskController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, bucketId, analystId, search, page, limit, sortBy, sortOrder } = req.query;
      const result = await taskService.findAll({
        status: status as string,
        priority: priority as string,
        bucketId: bucketId as string,
        analystId: analystId as string,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
      });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await taskService.findById(req.params.id);
      res.json({ task });
    } catch (error: any) {
      if (error.message === 'TASK_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Tarefa não encontrada' });
        return;
      }
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createTaskSchema.parse(req.body);
      const task = await taskService.create(data, req.user!.id);
      res.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateTaskSchema.parse(req.body);
      const task = await taskService.update(req.params.id, data, req.user!.id);
      res.json({ task });
    } catch (error: any) {
      if (error.message === 'TASK_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Tarefa não encontrada' });
        return;
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await taskService.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'TASK_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Tarefa não encontrada' });
        return;
      }
      next(error);
    }
  }

  async bulkUpdateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = bulkStatusSchema.parse(req.body);
      const result = await taskService.bulkUpdateStatus(data.taskIds, data.status, req.user!.id);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'NO_TASKS_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Nenhuma tarefa encontrada' });
        return;
      }
      next(error);
    }
  }

  async getNotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notes = await noteService.getByTaskId(req.params.id);
      res.json({ notes });
    } catch (error) {
      next(error);
    }
  }

  async createNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createNoteSchema.parse(req.body);
      const note = await noteService.create(req.params.id, req.user!.id, data.content);
      res.status(201).json({ note });
    } catch (error) {
      next(error);
    }
  }

  async deleteNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await noteService.delete(req.params.noteId);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'NOTE_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Nota não encontrada' });
        return;
      }
      next(error);
    }
  }

  async getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const history = await historyService.getByTaskId(req.params.id);
      res.json({ history });
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
