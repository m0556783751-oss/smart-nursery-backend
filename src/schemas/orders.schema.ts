import { z } from 'zod';

export const createOrderSchema = z.object({
  plantId: z.number().int().positive(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['COMPLETED', 'CANCELLED']),
});
