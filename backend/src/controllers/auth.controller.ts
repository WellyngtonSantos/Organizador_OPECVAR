import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { authService } from '../services/auth.service';
import { loginSchema, registerSchema } from '../schemas/auth.schema';
import { auditService } from '../services/audit.service';

export class AuthController {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data);

      auditService.logFromRequest(req, 'LOGIN_SUCCESS', {
        userId: result.user.id,
        email: result.user.email,
      });

      res.json(result);
    } catch (error: any) {
      if (error.message === 'INVALID_CREDENTIALS') {
        auditService.logFromRequest(req, 'LOGIN_FAILED', {
          email: req.body?.email || null,
          details: 'Invalid email or password',
        });
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

      auditService.logFromRequest(req, 'REGISTER', {
        userId: user.id,
        email: user.email,
        details: `New user registered by manager ${req.user?.email}`,
      });

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
