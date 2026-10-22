import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { careRemindersService } from './careReminders.service';

export const ordersService = {
  async create(userId: number, plantId: number) {
    const plant = await prisma.plant.findUnique({ where: { id: plantId } });
    if (!plant) throw new AppError(404, 'Plant not found');
    if (!plant.inStock) throw new AppError(400, 'Plant is out of stock');

    return prisma.order.create({
      data: { userId, plantId },
      include: { plant: { include: { category: true } } },
    });
  },

  async findAll(userId: number, role: string) {
    const where = role === 'STAFF' ? {} : { userId };
    return prisma.order.findMany({
      where,
      include: {
        plant: { include: { category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: number, userId: number, role: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        plant: { include: { category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!order) throw new AppError(404, 'Order not found');
    if (role !== 'STAFF' && order.userId !== userId) throw new AppError(403, 'Not authorized');
    return order;
  },

  async updateStatus(id: number, status: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { plant: true },
    });
    if (!order) throw new AppError(404, 'Order not found');
    if (order.status !== 'PENDING') throw new AppError(400, 'Only pending orders can be updated');

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        plant: { include: { category: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (status === 'COMPLETED') {
      const userPlant = await prisma.userPlant.create({
        data: {
          userId: order.userId,
          plantId: order.plantId,
          orderId: order.id,
        },
      });
      await careRemindersService.createInitialReminders(userPlant.id, order.plant);
    }

    return updated;
  },
};
