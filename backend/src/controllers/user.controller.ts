import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/user.service';

export class UserController {
  async listAnalysts(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const analysts = await userService.findAnalysts();
      res.json({ analysts });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
