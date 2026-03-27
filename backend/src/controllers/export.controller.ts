import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { exportService } from '../services/export.service';

export class ExportController {
  async exportXlsx(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, bucketId, analystId } = req.query;
      const buffer = await exportService.exportXlsx({
        status: status as string,
        priority: priority as string,
        bucketId: bucketId as string,
        analystId: analystId as string,
      });

      const filename = `tarefas_${new Date().toISOString().slice(0, 10)}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, priority, bucketId, analystId } = req.query;
      const csv = await exportService.exportCsv({
        status: status as string,
        priority: priority as string,
        bucketId: bucketId as string,
        analystId: analystId as string,
      });

      const filename = `tarefas_${new Date().toISOString().slice(0, 10)}.csv`;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export const exportController = new ExportController();
