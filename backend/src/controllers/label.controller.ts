import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { labelService } from '../services/label.service';
import { createLabelSchema, updateLabelSchema } from '../schemas/label.schema';

export class LabelController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const labels = await labelService.findAll();
      res.json({ labels });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const label = await labelService.findById(req.params.id);
      res.json({ label });
    } catch (error: any) {
      if (error.message === 'LABEL_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Label não encontrada' });
        return;
      }
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createLabelSchema.parse(req.body);
      const label = await labelService.create(data);
      res.status(201).json({ label });
    } catch (error: any) {
      if (error.message === 'LABEL_NAME_EXISTS') {
        res.status(409).json({ error: 'Conflict', message: 'Já existe uma label com este nome' });
        return;
      }
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateLabelSchema.parse(req.body);
      const label = await labelService.update(req.params.id, data);
      res.json({ label });
    } catch (error: any) {
      if (error.message === 'LABEL_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Label não encontrada' });
        return;
      }
      if (error.message === 'LABEL_NAME_EXISTS') {
        res.status(409).json({ error: 'Conflict', message: 'Já existe uma label com este nome' });
        return;
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await labelService.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'LABEL_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Label não encontrada' });
        return;
      }
      if (error.message === 'LABEL_HAS_TASKS') {
        res.status(409).json({ error: 'Conflict', message: 'Não é possível excluir label com tarefas associadas' });
        return;
      }
      next(error);
    }
  }
}

export const labelController = new LabelController();
