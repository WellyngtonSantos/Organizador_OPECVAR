import { z } from 'zod';

export const createLabelSchema = z.object({
  name: z.string().min(1, 'Nome da label é obrigatório'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)').optional().nullable(),
});

export const updateLabelSchema = z.object({
  name: z.string().min(1, 'Nome da label é obrigatório').optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)').optional().nullable(),
});

export type CreateLabelInput = z.infer<typeof createLabelSchema>;
export type UpdateLabelInput = z.infer<typeof updateLabelSchema>;
