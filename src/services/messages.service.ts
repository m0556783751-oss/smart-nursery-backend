import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export const messagesService = {
  async create(userId: number, content: string, plantId?: number | null) {
    if (plantId) {
      const plant = await prisma.plant.findUnique({ where: { id: plantId } });
      if (!plant) throw new AppError(404, 'Plant not found');
    }

    return prisma.message.create({
      data: { userId, content, plantId: plantId || null },
      include: {
        plant: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async findAll(userId: number, role: string) {
    const where = role === 'STAFF' ? {} : { userId };
    return prisma.message.findMany({
      where,
      include: {
        plant: true,
        user: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: number, userId: number, role: string) {
    const message = await prisma.message.findUnique({
      where: { id },
      include: {
        plant: true,
        user: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true } },
      },
    });
    if (!message) throw new AppError(404, 'Message not found');
    if (role !== 'STAFF' && message.userId !== userId) throw new AppError(403, 'Not authorized');
    return message;
  },

  async reply(id: number, staffId: number, reply: string) {
    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) throw new AppError(404, 'Message not found');
    if (message.reply) throw new AppError(400, 'Message already has a reply');

    return prisma.message.update({
      where: { id },
      data: { reply, repliedBy: staffId, repliedAt: new Date() },
      include: {
        plant: true,
        user: { select: { id: true, name: true, email: true } },
        staff: { select: { id: true, name: true } },
      },
    });
  },
};
