import { z } from 'zod';

export const createMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  plantId: z.number().int().positive().optional().nullable(),
});

export const replyMessageSchema = z.object({
  reply: z.string().min(1, 'Reply content is required'),
});
