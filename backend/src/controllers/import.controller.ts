import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { importService } from '../services/import.service';

export class ImportController {
  async importXlsx(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'Bad Request', message: 'Nenhum arquivo enviado' });
        return;
      }

      const result = await importService.importFromXlsx(req.file.buffer, req.user!.id);
      res.json({ result });
    } catch (error: any) {
      if (error.message === 'SHEET_NOT_FOUND') {
        res.status(400).json({ error: 'Bad Request', message: 'Aba "Tarefas" nao encontrada no arquivo' });
        return;
      }
      if (error.message === 'NO_DATA_FOUND') {
        res.status(400).json({ error: 'Bad Request', message: 'Nenhum dado encontrado na planilha' });
        return;
      }
      next(error);
    }
  }
}

export const importController = new ImportController();
