import prisma from '../config/database';

export class NoteService {
  async getByTaskId(taskId: string) {
    return prisma.taskNote.findMany({
      where: { taskId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(taskId: string, authorId: string, content: string) {
    return prisma.taskNote.create({
      data: {
        taskId,
        authorId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    const note = await prisma.taskNote.findUnique({ where: { id } });
    if (!note) {
      throw new Error('NOTE_NOT_FOUND');
    }
    return prisma.taskNote.delete({ where: { id } });
  }
}

export const noteService = new NoteService();
