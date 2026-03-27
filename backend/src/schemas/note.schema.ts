import { z } from 'zod';

export const createNoteSchema = z.object({
  content: z.string().min(1, 'Conteúdo da nota é obrigatório'),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
