import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { queueService } from '../services/queue.service';
import { reorderQueueSchema } from '../schemas/queue.schema';

export class QueueController {
  async getByAnalyst(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // ANALYST can only view their own queue
      if (req.user!.role === 'ANALYST' && req.params.analystId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden', message: 'Sem permissão para visualizar a fila de outro analista' });
        return;
      }
      const tasks = await queueService.getByAnalyst(req.params.analystId);
      res.json({ tasks });
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = reorderQueueSchema.parse(req.body);
      // Only MANAGER or the analyst themselves can reorder
      if (req.user!.role === 'ANALYST' && data.analystId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden', message: 'Sem permissão para reordenar a fila de outro analista' });
        return;
      }
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
