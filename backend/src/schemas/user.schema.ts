import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  role: z.enum(['ANALYST', 'MANAGER']).default('ANALYST'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
  email: z.string().email('Email invalido').optional(),
  role: z.enum(['ANALYST', 'MANAGER']).optional(),
  active: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
