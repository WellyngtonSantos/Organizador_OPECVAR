import prisma from '../config/database';
import type { CreateSuggestionInput, UpdateSuggestionInput } from '../schemas/suggestion.schema';

class SuggestionService {
  async findAll() {
    return prisma.suggestion.findMany({
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateSuggestionInput, authorId: string) {
    return prisma.suggestion.create({
      data: {
        title: data.title,
        description: data.description,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, data: UpdateSuggestionInput) {
    const existing = await prisma.suggestion.findUnique({ where: { id } });
    if (!existing) throw new Error('SUGGESTION_NOT_FOUND');

    return prisma.suggestion.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id: string) {
    const existing = await prisma.suggestion.findUnique({ where: { id } });
    if (!existing) throw new Error('SUGGESTION_NOT_FOUND');

    await prisma.suggestion.delete({ where: { id } });
  }
}

export const suggestionService = new SuggestionService();
