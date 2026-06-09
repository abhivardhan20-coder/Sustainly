import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../server';

vi.mock('../server/services/geminiService', () => ({
  generateInsights: vi.fn().mockResolvedValue(['Mock tip']),
  generateActivityLog: vi.fn().mockResolvedValue({ activities: [], message: 'Mock message', suggestedAction: {} })
}));

vi.mock('firebase-admin', () => {
  return {
    default: {
      apps: [],
      initializeApp: vi.fn(),
      auth: () => ({
        verifyIdToken: vi.fn().mockResolvedValue({ uid: 'user123' })
      })
    }
  };
});

describe('Rate Limiter', () => {
  it('should allow requests under the limit and block once AI limit (5) is exceeded', async () => {
    // Send 5 valid requests
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/insights')
        .set('Authorization', 'Bearer valid-token')
        .send({ profile: {}, history: [] });
      expect(res.status).toBe(200);
    }

    // The 6th request should hit the AI rate limit (max 5)
    const resOverLimit = await request(app)
      .post('/api/insights')
      .set('Authorization', 'Bearer valid-token')
      .send({ profile: {}, history: [] });
    
    expect(resOverLimit.status).toBe(429);
    expect(resOverLimit.body.error).toContain('Too many AI generation requests');
  });
});
