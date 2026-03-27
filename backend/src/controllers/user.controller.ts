import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/user.service';
import { createUserSchema, updateUserSchema, resetPasswordSchema } from '../schemas/user.schema';

export class UserController {
  async listAnalysts(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analysts = await userService.findAnalysts();
      res.json({ analysts });
    } catch (error) {
      next(error);
    }
  }

  async listAll(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.findAll();
      res.json({ users });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.findById(req.params.id);
      res.json({ user });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Usuario nao encontrado' });
        return;
      }
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.parse(req.body);
      const user = await userService.create(data);
      res.status(201).json({ user });
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(409).json({ error: 'Conflict', message: 'Email ja cadastrado' });
        return;
      }
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await userService.update(req.params.id, data);
      res.json({ user });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Usuario nao encontrado' });
        return;
      }
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        res.status(409).json({ error: 'Conflict', message: 'Email ja cadastrado' });
        return;
      }
      next(error);
    }
  }

  async resetPassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = resetPasswordSchema.parse(req.body);
      await userService.resetPassword(req.params.id, data.password);
      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Usuario nao encontrado' });
        return;
      }
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await userService.delete(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Usuario nao encontrado' });
        return;
      }
      if (error.message === 'USER_HAS_TASKS') {
        res.status(409).json({ error: 'Conflict', message: 'Usuario possui tarefas atribuidas. Desative-o ao inves de excluir.' });
        return;
      }
      next(error);
    }
  }
}

export const userController = new UserController();
