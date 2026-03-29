import { z } from 'zod';

export const createPublicTaskSchema = z.object({
  name: z.string().min(1, 'Nome da tarefa é obrigatório').max(255, 'Nome máximo 255 caracteres'),
  description: z.string().max(5000, 'Descrição máximo 5000 caracteres').optional().nullable(),
  bucketId: z.string().uuid('ID do tipo de tarefa inválido').optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  labelIds: z.array(z.string().uuid()).max(20, 'Máximo 20 setores').optional(),
  requesterName: z.string().min(1, 'Nome do solicitante é obrigatório').max(100, 'Nome máximo 100 caracteres'),
  requesterEmail: z.string().email('Email do solicitante inválido').max(255, 'Email máximo 255 caracteres').optional().nullable(),
});

export type CreatePublicTaskInput = z.infer<typeof createPublicTaskSchema>;
