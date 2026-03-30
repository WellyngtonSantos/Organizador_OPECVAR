import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Senha deve ter ao menos 8 caracteres')
  .max(128, 'Senha maximo 128 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiuscula')
  .regex(/[0-9]/, 'Senha deve conter ao menos um numero');

export const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: passwordSchema,
  role: z.enum(['ANALYST', 'MANAGER']).default('ANALYST'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').optional(),
  email: z.string().email('Email invalido').optional(),
  role: z.enum(['ANALYST', 'MANAGER']).optional(),
  active: z.boolean().optional(),
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
