import { z } from 'zod';

export const createSuggestionSchema = z.object({
  title: z.string().min(3, 'Titulo deve ter ao menos 3 caracteres').max(255),
  description: z.string().min(5, 'Descricao deve ter ao menos 5 caracteres').max(5000),
});

export const updateSuggestionSchema = z.object({
  status: z.enum(['OPEN', 'IN_REVIEW', 'ACCEPTED', 'DONE', 'REJECTED']).optional(),
  adminNote: z.string().max(2000).optional().nullable(),
});

export type CreateSuggestionInput = z.infer<typeof createSuggestionSchema>;
export type UpdateSuggestionInput = z.infer<typeof updateSuggestionSchema>;
