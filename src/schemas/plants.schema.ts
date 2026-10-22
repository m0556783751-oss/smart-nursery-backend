import { z } from 'zod';

export const createPlantSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.number().int().positive(),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url().optional().nullable(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  sunlight: z.enum(['FULL_SUN', 'PARTIAL_SHADE', 'SHADE']),
  wateringFrequencyDays: z.number().int().min(1).max(90),
  season: z.string().optional().nullable(),
  inStock: z.boolean().optional(),
});

export const updatePlantSchema = createPlantSchema.partial();
