import { z } from 'zod';

export const createPublicTaskSchema = z.object({
  name: z.string().min(1, 'Nome da tarefa é obrigatório'),
  description: z.string().optional().nullable(),
  bucketId: z.string().uuid('ID do tipo de tarefa inválido').optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  labelIds: z.array(z.string().uuid()).optional(),
  requesterName: z.string().min(1, 'Nome do solicitante é obrigatório'),
  requesterEmail: z.string().email('Email do solicitante inválido').optional().nullable(),
});

export type CreatePublicTaskInput = z.infer<typeof createPublicTaskSchema>;
