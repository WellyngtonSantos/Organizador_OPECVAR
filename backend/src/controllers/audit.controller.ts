import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { auditService } from '../services/audit.service';
import { AuditAction } from '@prisma/client';

export class AuditController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { action, userId, ipAddress, startDate, endDate, page, limit } = req.query;

      const result = await auditService.findAll({
        action: action as AuditAction | undefined,
        userId: userId as string | undefined,
        ipAddress: ipAddress as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
