import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../schemas/auth.schema';

export class AuthController {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);
      res.json(result);
    } catch (error: any) {
      if (error.message === 'INVALID_CREDENTIALS') {
        res.status(401).json({ error: 'Unauthorized', message: 'Email ou senha inválidos' });
        return;
      }
      next(error);
    }
  }

  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = registerSchema.parse(req.body);
      const user = await authService.register(data);
      res.status(201).json({ user });
    } catch (error: any) {
      if (error.message === 'EMAIL_EXISTS') {
        res.status(409).json({ error: 'Conflict', message: 'Email já cadastrado' });
        return;
      }
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.id);
      res.json({ user });
    } catch (error: any) {
      if (error.message === 'USER_NOT_FOUND') {
        res.status(404).json({ error: 'Not Found', message: 'Usuário não encontrado' });
        return;
      }
      next(error);
    }
  }
}

export const authController = new AuthController();
