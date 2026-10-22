import { prisma } from '../lib/prisma';

export const gardenService = {
  async getMyGarden(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.userPlant.findMany({
      where: { userId },
      include: {
        plant: { include: { category: true } },
        careReminders: {
          where: {
            dueDate: { lt: tomorrow },
            isDone: false,
          },
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { addedAt: 'desc' },
    });
  },
};
