import { z } from 'zod';

export const createTaskSchema = z.object({
  name: z.string().min(1, 'Nome da tarefa é obrigatório'),
  description: z.string().optional().nullable(),
  analystId: z.string().uuid('ID do analista inválido').optional().nullable(),
  receivedDate: z.string().datetime({ message: 'Data de recebimento inválida' }).optional().nullable(),
  startDate: z.string().datetime({ message: 'Data de início inválida' }).optional().nullable(),
  estimatedCompletionDate: z.string().datetime({ message: 'Data estimada inválida' }).optional().nullable(),
  estimatedHours: z.number().positive('Horas estimadas devem ser positivas').optional().nullable(),
  bucketId: z.string().uuid('ID do bucket inválido').optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'STAND_BY', 'COMPLETED', 'CANCELED']).default('NOT_STARTED'),
  queueOrder: z.number().int().default(0),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const updateTaskSchema = z.object({
  name: z.string().min(1, 'Nome da tarefa é obrigatório').optional(),
  description: z.string().optional().nullable(),
  analystId: z.string().uuid('ID do analista inválido').optional(),
  receivedDate: z.string().datetime({ message: 'Data de recebimento inválida' }).optional(),
  startDate: z.string().datetime({ message: 'Data de início inválida' }).optional().nullable(),
  estimatedCompletionDate: z.string().datetime({ message: 'Data estimada inválida' }).optional().nullable(),
  actualCompletionDate: z.string().datetime({ message: 'Data de conclusão inválida' }).optional().nullable(),
  estimatedHours: z.number().positive('Horas estimadas devem ser positivas').optional().nullable(),
  actualHours: z.number().min(0, 'Horas realizadas não podem ser negativas').optional(),
  bucketId: z.string().uuid('ID do bucket inválido').optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'STAND_BY', 'COMPLETED', 'CANCELED']).optional(),
  queueOrder: z.number().int().optional(),
  labelIds: z.array(z.string().uuid()).optional(),
});

export const bulkStatusSchema = z.object({
  taskIds: z.array(z.string().uuid()).min(1, 'Selecione pelo menos uma tarefa'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'STAND_BY', 'COMPLETED', 'CANCELED']),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type BulkStatusInput = z.infer<typeof bulkStatusSchema>;
