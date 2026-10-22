import { prisma } from '../lib/prisma';

export const categoriesService = {
  async findAll() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } });
  },
};
