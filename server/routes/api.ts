import express from 'express';
import { requireAuth } from '../middleware/auth';
import { logRequestSchema, insightsRequestSchema } from '../validators/apiValidators';
import { generateInsights, generateActivityLog } from '../services/geminiService';
import { insightsCache, generateCacheKey } from '../cache/lruCache';

const router = express.Router();

// Apply auth middleware to all AI routes
router.use(requireAuth);

router.post('/insights', async (req, res) => {
  try {
    const parseResult = insightsRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid request format", details: parseResult.error.format() });
    }

    const { profile, history } = parseResult.data;
    
    // Fallback: If no profile/history, still need a string to hash
    const cacheKey = generateCacheKey(profile || {}, history || []);
    const cached = insightsCache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const result = await generateInsights(profile || null, history || []);
    insightsCache.set(cacheKey, result);
    res.json(result);

  } catch (error: any) {
    console.log("Gemini API Error (Insights):", error?.message || error);
    res.json([
      "🚴 Biking 3 days/week saves 1k lbs CO2",
      "💡 LED bulbs use 75% less energy",
      "🥦 1 plant-based meal saves 2k gal water",
      "🔌 Unplug to prevent phantom drain",
      "👕 Wash cold to save 90% energy",
      "🛍️ Reusable bags save plastic"
    ]);
  }
});

router.post('/log', async (req, res) => {
  try {
    const parseResult = logRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid request format", details: parseResult.error.format() });
    }

    const { userMessage, profile, history, imageBase64 } = parseResult.data;

    const result = await generateActivityLog({ userMessage, profile, history, imageBase64 });
    res.json(result);

  } catch (error: any) {
    if (error.message === "Invalid image format" || error.message === "Invalid image data") {
      return res.status(400).json({ error: error.message });
    }
    console.log("Gemini API Error (Log):", error?.message || error);
    res.status(500).json({ error: "Failed to parse activity due to high demand. Please try again." });
  }
});

export default router;
