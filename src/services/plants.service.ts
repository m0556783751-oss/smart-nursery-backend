import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

interface PlantFilters {
  search?: string;
  category?: string;
  difficulty?: string;
}

export const plantsService = {
  async findAll(filters: PlantFilters) {
    const where: any = {};

    if (filters.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters.category) {
      where.category = { name: { equals: filters.category, mode: 'insensitive' } };
    }
    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }

    return prisma.plant.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: number) {
    const plant = await prisma.plant.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!plant) throw new AppError(404, 'Plant not found');
    return plant;
  },

  async create(data: any) {
    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) throw new AppError(400, 'Category not found');

    return prisma.plant.create({
      data,
      include: { category: true },
    });
  },

  async update(id: number, data: any) {
    const plant = await prisma.plant.findUnique({ where: { id } });
    if (!plant) throw new AppError(404, 'Plant not found');

    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) throw new AppError(400, 'Category not found');
    }

    return prisma.plant.update({
      where: { id },
      data,
      include: { category: true },
    });
  },

  async delete(id: number) {
    const plant = await prisma.plant.findUnique({ where: { id } });
    if (!plant) throw new AppError(404, 'Plant not found');

    await prisma.plant.delete({ where: { id } });
    return { message: 'Plant deleted successfully' };
  },
};
