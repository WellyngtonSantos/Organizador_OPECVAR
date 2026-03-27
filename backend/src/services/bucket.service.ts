import prisma from '../config/database';
import { CreateBucketInput, UpdateBucketInput } from '../schemas/bucket.schema';

export class BucketService {
  async findAll() {
    return prisma.bucket.findMany({
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const bucket = await prisma.bucket.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    if (!bucket) {
      throw new Error('BUCKET_NOT_FOUND');
    }

    return bucket;
  }

  async create(data: CreateBucketInput) {
    const existing = await prisma.bucket.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('BUCKET_NAME_EXISTS');
    }

    return prisma.bucket.create({
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  async update(id: string, data: UpdateBucketInput) {
    const bucket = await prisma.bucket.findUnique({ where: { id } });
    if (!bucket) {
      throw new Error('BUCKET_NOT_FOUND');
    }

    if (data.name && data.name !== bucket.name) {
      const existing = await prisma.bucket.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new Error('BUCKET_NAME_EXISTS');
      }
    }

    return prisma.bucket.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const bucket = await prisma.bucket.findUnique({ where: { id } });
    if (!bucket) {
      throw new Error('BUCKET_NOT_FOUND');
    }

    const taskCount = await prisma.task.count({ where: { bucketId: id } });
    if (taskCount > 0) {
      throw new Error('BUCKET_HAS_TASKS');
    }

    return prisma.bucket.delete({ where: { id } });
  }
}

export const bucketService = new BucketService();
