import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import { CreateUserInput, UpdateUserInput } from '../schemas/user.schema';

export class UserService {
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
    });
  }

  async findAnalysts() {
    return prisma.user.findMany({
      where: {
        role: 'ANALYST',
        active: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  }

  async create(data: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(data.password);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, data: UpdateUserInput) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('USER_NOT_FOUND');
    }

    if (data.email && data.email !== existing.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async resetPassword(id: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('USER_NOT_FOUND');
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async delete(id: string) {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('USER_NOT_FOUND');
    }

    // Check if user has assigned tasks
    const taskCount = await prisma.task.count({ where: { analystId: id } });
    if (taskCount > 0) {
      throw new Error('USER_HAS_TASKS');
    }

    return prisma.user.delete({ where: { id } });
  }
}

export const userService = new UserService();
