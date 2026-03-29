import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { taskService } from '../services/task.service';
import { bucketService } from '../services/bucket.service';
import { labelService } from '../services/label.service';
import { createPublicTaskSchema } from '../schemas/publicTask.schema';
import { notificationService } from '../services/notification.service';

const router = Router();

const publicTaskLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 submissions per hour per IP
  message: { error: 'Too Many Requests', message: 'Limite de solicitações atingido. Tente novamente mais tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// List buckets (public - for the external form)
router.get('/buckets', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const buckets = await bucketService.findAll();
    res.json({ buckets });
  } catch (error) {
    next(error);
  }
});

// List labels (public - for the external form)
router.get('/labels', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const labels = await labelService.findAll();
    res.json({ labels });
  } catch (error) {
    next(error);
  }
});

// Create task (public - no auth required, rate limited)
router.post('/tasks', publicTaskLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createPublicTaskSchema.parse(req.body);

    const description = data.description
      ? `${data.description}\n\n---\nSolicitante: ${data.requesterName}${data.requesterEmail ? ` (${data.requesterEmail})` : ''}`
      : `Solicitante: ${data.requesterName}${data.requesterEmail ? ` (${data.requesterEmail})` : ''}`;

    const task = await taskService.create(
      {
        name: data.name,
        description,
        bucketId: data.bucketId,
        priority: data.priority,
        status: 'NOT_STARTED' as const,
        queueOrder: 0,
        labelIds: data.labelIds,
      },
    );

    // Notify managers asynchronously (don't block the response)
    notificationService.notifyNewExternalTask(task, data.requesterName, data.requesterEmail ?? null).catch((err) => {
      console.error('Failed to send notification email:', err);
    });

    res.status(201).json({ task, message: 'Tarefa criada com sucesso!' });
  } catch (error) {
    next(error);
  }
});

export default router;
