import { LRUCache } from 'lru-cache';
import crypto from 'crypto';
import type { LogAnalysisResult } from '../services/geminiService';

const TTL = 1000 * 60 * 30; // 30 minutes

const memoryCache = new LRUCache<string, string[] | LogAnalysisResult>({
  max: 500,
  ttl: TTL,
});

export const insightsCache = {
  get: async (key: string): Promise<string[] | LogAnalysisResult | null> => {
    return memoryCache.get(key) || null;
  },
  
  set: async (key: string, value: string[] | LogAnalysisResult, customTtl?: number): Promise<void> => {
    if (customTtl) {
      memoryCache.set(key, value, { ttl: customTtl });
    } else {
      memoryCache.set(key, value);
    }
  },
  
  clear: () => {
    memoryCache.clear();
  }
};

export const generateCacheKey = (profile: Record<string, unknown> | null, history: Record<string, unknown>[]): string => {
  const deterministicStringify = (obj: unknown): string => {
    if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj)) return `[${obj.map(deterministicStringify).join(',')}]`;
    const keys = Object.keys(obj as Record<string, unknown>).sort();
    return `{${keys.map(k => `"${k}":${deterministicStringify((obj as Record<string, unknown>)[k])}`).join(',')}}`;
  };

  const profileStr = profile ? deterministicStringify(profile) : '';
  const historyStr = history ? deterministicStringify(history) : '';

  return crypto.createHash('sha256').update(profileStr + historyStr).digest('hex');
};
