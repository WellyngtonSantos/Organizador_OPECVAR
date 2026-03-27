import prisma from '../config/database';

export class UserService {
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
}

export const userService = new UserService();
