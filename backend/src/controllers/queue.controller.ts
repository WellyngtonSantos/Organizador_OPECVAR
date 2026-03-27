import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { queueService } from '../services/queue.service';
import { reorderQueueSchema } from '../schemas/queue.schema';

export class QueueController {
  async getByAnalyst(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await queueService.getByAnalyst(req.params.analystId);
      res.json({ tasks });
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = reorderQueueSchema.parse(req.body);
      const tasks = await queueService.reorder(data.analystId, data.taskIds);
      res.json({ tasks });
    } catch (error: any) {
      if (error.message === 'INVALID_TASK_IDS') {
        res.status(400).json({ error: 'Bad Request', message: 'IDs de tarefas inválidos ou não pertencem ao analista' });
        return;
      }
      next(error);
    }
  }
}

export const queueController = new QueueController();
