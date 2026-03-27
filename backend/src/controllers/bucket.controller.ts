import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { bucketService } from '../services/bucket.service';
import { createBucketSchema, updateBucketSchema } from '../schemas/bucket.schema';

export class BucketController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const buckets = await bucketService.findAll();
      res.json({ buckets });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bucket = await bucketService.findById(req.params.id);
      res.json({ bucket });
    } catch (error: any) {
      if (error.message === 'BUCKET_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Bucket não encontrado' });
        return;
      }
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createBucketSchema.parse(req.body);
      const bucket = await bucketService.create(data);
      res.status(201).json({ bucket });
    } catch (error: any) {
      if (error.message === 'BUCKET_NAME_EXISTS') {
        res.status(409).json({ error: 'Conflict', message: 'Já existe um bucket com este nome' });
        return;
      }
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateBucketSchema.parse(req.body);
      const bucket = await bucketService.update(req.params.id, data);
      res.json({ bucket });
    } catch (error: any) {
      if (error.message === 'BUCKET_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Bucket não encontrado' });
        return;
      }
      if (error.message === 'BUCKET_NAME_EXISTS') {
        res.status(409).json({ error: 'Conflict', message: 'Já existe um bucket com este nome' });
        return;
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await bucketService.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'BUCKET_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Bucket não encontrado' });
        return;
      }
      if (error.message === 'BUCKET_HAS_TASKS') {
        res.status(409).json({ error: 'Conflict', message: 'Não é possível excluir bucket com tarefas associadas' });
        return;
      }
      next(error);
    }
  }
}

export const bucketController = new BucketController();
