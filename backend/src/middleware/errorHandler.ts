import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err.message);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({
        error: 'Conflict',
        message: 'A record with this value already exists',
      });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({
        error: 'Not Found',
        message: 'Record not found',
      });
      return;
    }
  }

  // Never leak internal error details to the client
  console.error('Internal error details:', err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Ocorreu um erro inesperado. Tente novamente.',
  });
}
