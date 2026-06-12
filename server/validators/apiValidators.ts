import { z } from 'zod';

// Define a strict schema for the profile
const profileSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  city: z.string().optional(),
  diet: z.enum(['everything', 'pescatarian', 'vegetarian', 'vegan']).optional(),
  primaryCommute: z.array(z.string()).optional(),
  homeACUsage: z.enum(['track', 'could-better', 'not-really']).optional(),
  createdAt: z.string().optional()
}).strict(); // Reject any unknown fields

// Define a strict schema for history items
const historySchema = z.object({
  id: z.string().optional(),
  role: z.enum(['user', 'ai']).optional(),
  content: z.string().optional()
}).strict(); // Reject any unknown fields

export const logRequestSchema = z.object({
  userMessage: z.string().max(1000).optional(),
  profile: profileSchema.optional(),
  history: z.array(historySchema).max(30, "History cannot exceed 30 items").optional(),
  imageBase64: z.string()
    .max(2_097_152, 'Image too large (max 1.5MB base64)')
    .refine(s => {
      const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const mimeMatch = s.match(/^data:(image\/[^;]+);/);
      return mimeMatch && ALLOWED_MIME.includes(mimeMatch[1]);
    }, 'Must be a base64 data URI with allowed image type (jpeg, png, webp, gif)')
    .optional()
}).refine(data => data.userMessage || data.imageBase64, {
  message: "Either userMessage or imageBase64 must be provided"
});

export const insightsRequestSchema = z.object({
  profile: profileSchema.optional(),
  history: z.array(historySchema).max(50).optional()
});
