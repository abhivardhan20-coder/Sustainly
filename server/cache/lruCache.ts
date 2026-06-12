import { LRUCache } from 'lru-cache';
import type { LogAnalysisResult } from '../services/geminiService';
import crypto from 'crypto';

// Cache configuration
const options = {
  max: 500, // Maximum number of items in the cache
  ttl: 1000 * 60 * 30, // 30 minutes
};

export const insightsCache = new LRUCache<string, string[] | LogAnalysisResult>(options);

export const generateCacheKey = (profile: any, history: any[]): string => {
  // Sort object keys for deterministic caching
  const deterministicStringify = (obj: any): string => {
    if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj)) return `[${obj.map(deterministicStringify).join(',')}]`;
    const keys = Object.keys(obj).sort();
    return `{${keys.map(k => `"${k}":${deterministicStringify(obj[k])}`).join(',')}}`;
  };

  const profileStr = profile ? deterministicStringify(profile) : '';
  const historyStr = history ? deterministicStringify(history) : '';

  return crypto.createHash('sha256').update(profileStr + historyStr).digest('hex');
};
