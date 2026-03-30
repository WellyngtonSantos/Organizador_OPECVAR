import { AuditAction } from '@prisma/client';
import { Request } from 'express';
import prisma from '../config/database';

interface AuditEntry {
  action: AuditAction;
  userId?: string | null;
  email?: string | null;
  ipAddress: string;
  userAgent?: string | null;
  details?: string | null;
}

function extractIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

class AuditService {
  async log(entry: AuditEntry): Promise<void> {
    try {
      await prisma.auditLog.create({ data: entry });
    } catch (err) {
      // Never let audit logging break the request flow
      console.error('[AuditLog] Failed to write:', err);
    }
  }

  /** Convenience: build entry from Express request */
  async logFromRequest(
    req: Request,
    action: AuditAction,
    opts: { userId?: string | null; email?: string | null; details?: string | null } = {},
  ): Promise<void> {
    await this.log({
      action,
      userId: opts.userId ?? null,
      email: opts.email ?? null,
      ipAddress: extractIp(req),
      userAgent: (req.headers['user-agent'] as string) ?? null,
      details: opts.details ?? null,
    });
  }

  /** Paginated query for the manager audit log viewer */
  async findAll(filters: {
    action?: AuditAction;
    userId?: string;
    ipAddress?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(Math.max(1, filters.limit || 50), 200);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.action) where.action = filters.action;
    if (filters.userId) where.userId = filters.userId;
    if (filters.ipAddress) where.ipAddress = { contains: filters.ipAddress };
    if (filters.startDate || filters.endDate) {
      where.createdAt = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

export const auditService = new AuditService();
