import { Request, Response, NextFunction } from 'express';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { logger } from '../utils/logger';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({ credential: cert(serviceAccount) });
    } catch (e) {
      logger.error("[FATAL] FIREBASE_SERVICE_ACCOUNT is not valid JSON.");
      process.exit(1);
    }
  } else {
    initializeApp(); // Fallback for local ADC
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    logger.error(`[Auth Error] Token verification failed: ${error instanceof Error ? error.message : String(error)}`);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
