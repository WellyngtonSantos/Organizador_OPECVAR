import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { suggestionService } from '../services/suggestion.service';
import { createSuggestionSchema, updateSuggestionSchema } from '../schemas/suggestion.schema';

export class SuggestionController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const suggestions = await suggestionService.findAll();
      res.json({ suggestions });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = createSuggestionSchema.parse(req.body);
      const suggestion = await suggestionService.create(data, req.user!.id);
      res.status(201).json({ suggestion });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = updateSuggestionSchema.parse(req.body);
      const suggestion = await suggestionService.update(req.params.id, data);
      res.json({ suggestion });
    } catch (err) {
      if (err instanceof Error && err.message === 'SUGGESTION_NOT_FOUND') {
        return res.status(404).json({ message: 'Sugestao nao encontrada' });
      }
      next(err);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await suggestionService.delete(req.params.id);
      res.status(204).send();
    } catch (err) {
      if (err instanceof Error && err.message === 'SUGGESTION_NOT_FOUND') {
        return res.status(404).json({ message: 'Sugestao nao encontrada' });
      }
      next(err);
    }
  }
}

export const suggestionController = new SuggestionController();
