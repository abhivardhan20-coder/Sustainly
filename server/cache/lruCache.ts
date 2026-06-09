import { LRUCache } from 'lru-cache';
import crypto from 'crypto';

// Cache configuration
const options = {
  max: 500, // Maximum number of items in the cache
  ttl: 1000 * 60 * 30, // 30 minutes
};

export const insightsCache = new LRUCache<string, string[]>(options);

export const generateCacheKey = (profile: any, history: any[]): string => {
  // Safe stringification for hashing
  const profileStr = profile ? JSON.stringify(profile) : '';
  const historyStr = history ? JSON.stringify(history) : '';
  
  return crypto.createHash('sha256').update(profileStr + historyStr).digest('hex');
};
