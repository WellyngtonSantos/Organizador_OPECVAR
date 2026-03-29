import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { dashboardService } from '../services/dashboard.service';

export class DashboardController {
  async getWeeklyDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { weekStart, analystId } = req.query;
      const weekStartStr = (weekStart as string) || new Date().toISOString();
      let analystIdStr = analystId as string | undefined;

      // ANALYST can only view their own dashboard data
      if (req.user!.role === 'ANALYST') {
        analystIdStr = req.user!.id;
      }

      const dashboard = await dashboardService.getWeeklyDashboard(weekStartStr, analystIdStr);
      res.json({ dashboard });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
