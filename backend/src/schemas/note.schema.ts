import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Conteúdo da nota é obrigatório').max(10000, 'Conteúdo máximo 10000 caracteres'),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
