import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100, 'Nome máximo 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Email máximo 255 caracteres'),
  password: z.string()
    .min(8, 'Senha deve ter ao menos 8 caracteres')
    .max(128, 'Senha máximo 128 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter ao menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter ao menos um número'),
  role: z.enum(['ANALYST', 'MANAGER']).default('ANALYST'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
