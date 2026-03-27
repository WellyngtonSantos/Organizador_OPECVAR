import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { timerService } from '../services/timer.service';
import { startTimerSchema } from '../schemas/timer.schema';

export class TimerController {
  async getActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await timerService.getActiveTimer(req.user!.id);
      res.json({ session });
    } catch (error) {
      next(error);
    }
  }

  async start(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = startTimerSchema.parse(req.body);
      const session = await timerService.start(data.taskId, req.user!.id);
      res.status(201).json({ session });
    } catch (error: any) {
      if (error.message === 'TIMER_ALREADY_ACTIVE') {
        res.status(409).json({ error: 'Conflict', message: 'Já existe um timer ativo' });
        return;
      }
      if (error.message === 'TASK_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Tarefa não encontrada' });
        return;
      }
      next(error);
    }
  }

  async stop(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = await timerService.stop(req.params.id, req.user!.id);
      res.json({ session });
    } catch (error: any) {
      if (error.message === 'SESSION_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Sessão não encontrada' });
        return;
      }
      if (error.message === 'SESSION_NOT_OWNED') {
        res.status(403).json({ error: 'Forbidden', message: 'Sessão pertence a outro usuário' });
        return;
      }
      if (error.message === 'SESSION_ALREADY_STOPPED') {
        res.status(409).json({ error: 'Conflict', message: 'Sessão já foi encerrada' });
        return;
      }
      next(error);
    }
  }

  async getByTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await timerService.getByTaskId(req.params.taskId);
      res.json({ sessions });
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await timerService.delete(req.params.id, req.user!.id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'SESSION_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Sessão não encontrada' });
        return;
      }
      if (error.message === 'SESSION_NOT_OWNED') {
        res.status(403).json({ error: 'Forbidden', message: 'Sessão pertence a outro usuário' });
        return;
      }
      next(error);
    }
  }
}

export const timerController = new TimerController();
