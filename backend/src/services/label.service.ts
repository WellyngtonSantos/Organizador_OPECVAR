import prisma from '../config/database';
import { CreateLabelInput, UpdateLabelInput } from '../schemas/label.schema';

export class LabelService {
  async findAll() {
    return prisma.label.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const label = await prisma.label.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!label) {
      throw new Error('LABEL_NOT_FOUND');
    }

    return label;
  }

  async create(data: CreateLabelInput) {
    const existing = await prisma.label.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('LABEL_NAME_EXISTS');
    }

    return prisma.label.create({
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  async update(id: string, data: UpdateLabelInput) {
    const label = await prisma.label.findUnique({ where: { id } });
    if (!label) {
      throw new Error('LABEL_NOT_FOUND');
    }

    if (data.name && data.name !== label.name) {
      const existing = await prisma.label.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new Error('LABEL_NAME_EXISTS');
      }
    }

    return prisma.label.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const label = await prisma.label.findUnique({ where: { id } });
    if (!label) {
      throw new Error('LABEL_NOT_FOUND');
    }

    const taskCount = await prisma.taskLabel.count({ where: { labelId: id } });
    if (taskCount > 0) {
      throw new Error('LABEL_HAS_TASKS');
    }

    return prisma.label.delete({ where: { id } });
  }
}

export const labelService = new LabelService();
