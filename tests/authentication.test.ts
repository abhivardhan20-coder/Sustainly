import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../server';

// Mock the gemini module so we don't call the real API
vi.mock('../server/services/geminiService', () => ({
  generateInsights: vi.fn().mockResolvedValue(['Mock tip']),
  generateActivityLog: vi.fn().mockResolvedValue({ activities: [], message: 'Mock message', suggestedAction: {} })
}));

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn().mockReturnValue([]),
  initializeApp: vi.fn(),
  cert: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn().mockReturnValue({
    verifyIdToken: vi.fn(async (token: string) => {
      if (token === 'valid-token') return { uid: 'user123' };
      throw new Error('Invalid token');
    })
  })
}));

describe('Authentication Middleware', () => {
  it('should return 401 if no Authorization header is provided', async () => {
    const res = await request(app)
      .post('/api/insights')
      .send({ profile: {}, history: [] });
    
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Missing or invalid');
  });

  it('should return 401 if token is invalid', async () => {
    const res = await request(app)
      .post('/api/insights')
      .set('Authorization', 'Bearer invalid-token')
      .send({ profile: {}, history: [] });
    
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Invalid token');
  });

  it('should pass if token is valid', async () => {
    const res = await request(app)
      .post('/api/insights')
      .set('Authorization', 'Bearer valid-token')
      .send({ profile: {}, history: [] });
    
    // We expect 200 OK because the mock gemini service resolves and zod validation passes
    expect(res.status).toBe(200);
  });
});
