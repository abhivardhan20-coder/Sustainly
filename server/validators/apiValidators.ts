import { z } from 'zod';

export const logRequestSchema = z.object({
  userMessage: z.string().max(1000).optional(),
  profile: z.record(z.any()).optional(),
  history: z.array(z.any()).optional(),
  imageBase64: z.string().optional()
}).refine(data => data.userMessage || data.imageBase64, {
  message: "Either userMessage or imageBase64 must be provided"
});

export const insightsRequestSchema = z.object({
  profile: z.record(z.any()).optional(),
  history: z.array(z.any()).optional()
});
