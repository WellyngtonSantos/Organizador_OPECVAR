import { z } from 'zod';

export const startTimerSchema = z.object({
  taskId: z.string().uuid('ID da tarefa inválido'),
});

export const stopTimerSchema = z.object({});

export type StartTimerInput = z.infer<typeof startTimerSchema>;
