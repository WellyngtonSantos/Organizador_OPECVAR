import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt';
import { auditService } from '../services/audit.service';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized', message: 'Token not provided' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    const action = err instanceof TokenExpiredError ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
    auditService.logFromRequest(req, action, {
      details: `${req.method} ${req.originalUrl}`,
    });
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      auditService.logFromRequest(req, 'ACCESS_DENIED', {
        userId: req.user?.id,
        email: req.user?.email,
        details: `Role ${req.user?.role} denied for ${req.method} ${req.originalUrl} (requires ${roles.join('|')})`,
      });
      res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
      return;
    }
    next();
  };
}
