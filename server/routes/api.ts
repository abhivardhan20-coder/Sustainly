import express from 'express';
import { requireAuth } from '../middleware/auth';
import { logRequestSchema, insightsRequestSchema } from '../validators/apiValidators';
import { insightsCache, generateCacheKey } from '../cache/lruCache';
import { aiService } from '../services/geminiService';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '../utils/logger';
import { fallbackInsights } from '../utils/fallbackInsights';
import { calculateStreak } from '../../src/utils/streak';
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: 60000,
  max: 5,
  keyGenerator: (req, res) => {
    // If we have a user UID, use that (so that the same user gets the same limit across IPs)
    if (req.user?.uid) {
      return req.user.uid;
    }
    // Otherwise, use IP address
    return req.ip || 'unknown';
  },
  handler: (req, res, next, options) => {
    const safeIp = req.ip ? req.ip.replace(/\.\d+$/, '.xxx') : 'unknown';
    logger.warn(`[Abuse Protection] AI rate limit exceeded! UID: ${req.user?.uid || 'none'} IP: ${safeIp} path: ${req.originalUrl}`);
    res.status(429).json({ error: "Too many AI generation requests. Please try again later." });
  }
});

// Apply auth middleware to all AI routes
router.use(requireAuth);

router.post('/insights', aiLimiter, async (req, res) => {
  try {
    const parseResult = insightsRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid request format", ...(process.env.NODE_ENV !== 'production' && { details: parseResult.error.format() }) });
    }

    const { profile, history } = parseResult.data;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = `insights_${req.user?.uid || 'anon'}_${todayStr}`;
    const cachedInsights = await insightsCache.get(cacheKey);

    if (cachedInsights) {
      res.set('Cache-Control', 'private, max-age=3600');
      return res.json(cachedInsights);
    }

    // Fetch daily insights from Firestore
    const uid = req.user?.uid;
    if (uid) {
      try {
        const db = getFirestore();
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();
        if (doc.exists) {
          const data = doc.data()!;
          const today = new Date().toISOString().split('T')[0];
          
          if (data.dailyInsights && data.dailyInsights.date === today) {
            await insightsCache.set(cacheKey, data.dailyInsights.tips);
            res.set('Cache-Control', 'private, max-age=3600');
            return res.json(data.dailyInsights.tips);
          }
          
          // Generate new insights
          const result = await aiService.generateInsights(profile || null, history || []);
          
          // Save back to Firestore
          await userRef.set({
            dailyInsights: {
              date: today,
              tips: result
            }
          }, { merge: true });
          
          await insightsCache.set(cacheKey, result);
          res.set('Cache-Control', 'private, max-age=3600');
          return res.json(result);
        }
      } catch (dbError) {
        logger.error(`[Firestore Error] Failed to fetch/save insights: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
      }
    }

    // Fallback if no uid or db error
    const result = await aiService.generateInsights(profile || null, history || []);
    await insightsCache.set(cacheKey, result);
    res.set('Cache-Control', 'private, max-age=3600');
    res.json(result);

  } catch (error: unknown) {
    logger.error(`[API Error] Gemini insights generation failed: ${error instanceof Error ? error.message : String(error)}`);
    const todayStr = new Date().toISOString().split('T')[0];
    const cacheKey = `insights_${req.user?.uid || 'anon'}_${todayStr}`;
    await insightsCache.set(cacheKey, fallbackInsights, 300000); // 5 minutes TTL
    res.json(fallbackInsights);
  }
});

router.post('/log', aiLimiter, async (req, res) => {
  try {
    const parseResult = logRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid request format", ...(process.env.NODE_ENV !== 'production' && { details: parseResult.error.format() }) });
    }

    const { userMessage, profile, history, imageBase64 } = parseResult.data;

    const result = await aiService.generateActivityLog({ userMessage, profile, history, imageBase64 });

    if (result.activities) {
      result.activities = result.activities.map(act => ({
        ...act,
        points: Math.min(Math.max(act.points || 0, -10), 50)
      }));
    }

    // Secure Server-Side Database Update
    const uid = req.user?.uid;
    if (uid && result.activities && result.activities.length > 0) {
      try {
        const db = getFirestore();
        const userRef = db.collection('users').doc(uid);
        
        const today = new Date().toISOString().split('T')[0];
        const logRef = db.collection('users').doc(uid).collection('logs').doc(today);

        await db.runTransaction(async (t) => {
          const userSnap = await t.get(userRef);
          const logSnap = await t.get(logRef);
          
          if (userSnap.exists) {
            const userData = userSnap.data()!;
            let streak = userData.streak || 0;
            let lastLoggedDate = userData.lastLoggedDate || null;
            const totalPoints = result.activities.reduce((sum: number, act: { points?: number }) => sum + (act.points || 0), 0);
            
            let currentActivities = [];
            let currentDailyPoints = 0;

            if (logSnap.exists) {
              currentActivities = logSnap.data()!.activities || [];
              currentDailyPoints = logSnap.data()!.totalPoints || 0;
            } else {
              // Logic for new day streak calculation
              const streakResult = calculateStreak(streak, lastLoggedDate, today);
              streak = streakResult.streak;
              lastLoggedDate = streakResult.lastLoggedDate;
            }
            
            // Write to Subcollection
            t.set(logRef, {
              activities: [...currentActivities, ...result.activities],
              totalPoints: currentDailyPoints + totalPoints
            }, { merge: true });

            // Update Root User Doc
            t.set(userRef, { streak, lastLoggedDate }, { merge: true });
          }
        });
      } catch (dbError) {
        logger.error(`[Firestore Error] Failed to update user log: ${dbError instanceof Error ? dbError.message : String(dbError)}`);
        // Continue and return the AI result even if DB fails for MVP
      }
    }

    res.json(result);

  } catch (error: unknown) {
    if (error instanceof Error && (error.message === "Invalid image format" || error.message === "Invalid image data")) {
      return res.status(400).json({ error: error.message });
    }
    logger.error(`[API Error] Gemini log generation failed: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({ error: "Failed to parse activity due to high demand. Please try again." });
  }
});

export default router;
