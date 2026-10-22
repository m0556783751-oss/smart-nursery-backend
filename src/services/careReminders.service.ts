import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

function getSunlightMessage(plantName: string, sunlight: string): string {
  switch (sunlight) {
    case 'FULL_SUN':
      return `Place your ${plantName} in direct sunlight today`;
    case 'PARTIAL_SHADE':
      return `Make sure your ${plantName} gets partial sunlight today`;
    case 'SHADE':
      return `Keep your ${plantName} away from direct sunlight`;
    default:
      return `Check sunlight needs for your ${plantName}`;
  }
}

export const careRemindersService = {
  async createInitialReminders(userPlantId: number, plant: { name: string; sunlight: string; wateringFrequencyDays: number }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.careReminder.createMany({
      data: [
        {
          userPlantId,
          type: 'WATERING',
          message: `Time to water your ${plant.name}!`,
          dueDate: today,
        },
        {
          userPlantId,
          type: 'SUNLIGHT',
          message: getSunlightMessage(plant.name, plant.sunlight),
          dueDate: today,
        },
      ],
    });
  },

  async getMyReminders(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return prisma.careReminder.findMany({
      where: {
        userPlant: { userId },
        dueDate: { lt: tomorrow },
        isDone: false,
      },
      include: {
        userPlant: { include: { plant: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  },

  async markDone(id: number, userId: number) {
    const reminder = await prisma.careReminder.findUnique({
      where: { id },
      include: { userPlant: { include: { plant: true } } },
    });
    if (!reminder) throw new AppError(404, 'Reminder not found');
    if (reminder.userPlant.userId !== userId) throw new AppError(403, 'Not authorized');
    if (reminder.isDone) throw new AppError(400, 'Reminder already marked as done');

    const updated = await prisma.careReminder.update({
      where: { id },
      data: { isDone: true },
      include: { userPlant: { include: { plant: true } } },
    });

    const plant = reminder.userPlant.plant;
    const nextDate = new Date(reminder.dueDate);

    if (reminder.type === 'WATERING') {
      nextDate.setDate(nextDate.getDate() + plant.wateringFrequencyDays);
      await prisma.careReminder.create({
        data: {
          userPlantId: reminder.userPlantId,
          type: 'WATERING',
          message: `Time to water your ${plant.name}!`,
          dueDate: nextDate,
        },
      });
    } else if (reminder.type === 'SUNLIGHT') {
      nextDate.setDate(nextDate.getDate() + 1);
      await prisma.careReminder.create({
        data: {
          userPlantId: reminder.userPlantId,
          type: 'SUNLIGHT',
          message: getSunlightMessage(plant.name, plant.sunlight),
          dueDate: nextDate,
        },
      });
    }

    return updated;
  },
};
