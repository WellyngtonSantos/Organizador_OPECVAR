import { z } from 'zod';

export const reorderQueueSchema = z.object({
  analystId: z.string().uuid(),
  taskIds: z.array(z.string().uuid()).min(1),
});

export type ReorderQueueInput = z.infer<typeof reorderQueueSchema>;
