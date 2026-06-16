import { z } from 'zod';

export const carbonEstimateSchema = z.object({
  activities: z.array(z.object({
    category: z.enum(['transport', 'food', 'home', 'goods', 'other']),
    subcategory: z.string().max(50),
    quantity: z.number().min(0).max(10000),
  })).min(1).max(20),
});

export const challengeRequestSchema = z.object({
  categoryBreakdown: z.record(
    z.enum(['transport', 'food', 'home', 'goods', 'other']),
    z.number().min(0)
  ).optional(),
});
