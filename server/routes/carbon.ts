import express from 'express';
import { requireAuth } from '../middleware/auth';
import { carbonEstimateSchema, challengeRequestSchema } from '../validators/carbonValidators';
import { estimateBatch, generateChallenges } from '../services/carbonEstimator';
import { logger } from '../utils/logger';

const router = express.Router();
router.use(requireAuth);

/** POST /api/carbon/estimate - Estimate CO₂e for activities */
router.post('/estimate', async (req, res) => {
  try {
    const parseResult = carbonEstimateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        ...(process.env.NODE_ENV !== 'production' && { details: parseResult.error.format() })
      });
    }

    const { activities } = parseResult.data;
    const result = estimateBatch(activities);
    
    res.json(result);
  } catch (error) {
    logger.error(`[Carbon API] Estimation failed: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: 'Failed to estimate carbon footprint' });
  }
});

/** POST /api/carbon/challenges - Get adaptive weekly challenges */
router.post('/challenges', async (req, res) => {
  try {
    const parseResult = challengeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        error: 'Invalid request format',
        ...(process.env.NODE_ENV !== 'production' && { details: parseResult.error.format() })
      });
    }

    const categoryBreakdown = parseResult.data.categoryBreakdown || { transport: 0, food: 0, home: 0, goods: 0 };
    const challenges = generateChallenges(categoryBreakdown);
    
    res.json({ challenges });
  } catch (error) {
    logger.error(`[Carbon API] Challenges generation failed: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: 'Failed to generate challenges' });
  }
});

export default router;
