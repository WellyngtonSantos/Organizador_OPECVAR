import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getWeeklyDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { weekStart } = req.query;
      const weekStartStr = (weekStart as string) || new Date().toISOString();
      const dashboard = await dashboardService.getWeeklyDashboard(weekStartStr);
      res.json({ dashboard });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
