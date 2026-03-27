import { z } from 'zod';

export const createBucketSchema = z.object({
  name: z.string().min(1, 'Nome do bucket é obrigatório'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)').optional().nullable(),
});

export const updateBucketSchema = z.object({
  name: z.string().min(1, 'Nome do bucket é obrigatório').optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)').optional().nullable(),
});

export type CreateBucketInput = z.infer<typeof createBucketSchema>;
export type UpdateBucketInput = z.infer<typeof updateBucketSchema>;
