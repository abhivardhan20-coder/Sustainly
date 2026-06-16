import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { generateInsights, generateActivityLog } from '../server/services/geminiService';

// Mock the Gemini service functions
vi.mock('../server/services/geminiService', () => ({
  generateInsights: vi.fn().mockResolvedValue(['Mock tip 1', 'Mock tip 2']),
  generateActivityLog: vi.fn().mockResolvedValue({
    activities: [{ id: '1', type: 'transport', description: 'Mock', points: 10, icon: 'bike' }],
    message: 'Great job!',
    suggestedAction: { title: 'Mock Action', description: 'Mock', btnText: 'Do it' }
  })
}));

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn().mockReturnValue([]),
  initializeApp: vi.fn(),
  cert: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn().mockReturnValue({
    verifyIdToken: vi.fn().mockResolvedValue({ uid: 'user123' })
  })
}));

vi.mock('firebase-admin/firestore', () => {
  const mockDoc = {
    get: vi.fn().mockResolvedValue({ exists: false, data: () => ({}) }),
    set: vi.fn().mockResolvedValue(undefined)
  };
  const mockCollection = {
    doc: vi.fn().mockReturnValue(mockDoc)
  };
  return {
    getFirestore: vi.fn().mockReturnValue({
      collection: vi.fn().mockReturnValue(mockCollection),
      runTransaction: vi.fn().mockImplementation(async (fn: any) => {
        const t = {
          get: vi.fn().mockResolvedValue({ exists: true, data: () => ({ streak: 1, lastLoggedDate: null }) }),
          set: vi.fn()
        };
        return fn(t);
      })
    })
  };
});

describe('AI API Endpoints (Integration Style)', () => {
  beforeAll(async () => {
    // We don't actually start the HTTP server, just use the app
    // startServer is only for when running the real server
  });

  it('POST /api/insights - should return insights', async () => {
    (generateInsights as any).mockResolvedValue([
      "🚴 Biking saves CO2",
      "🥦 Plant-based meals help"
    ]);

    const response = await request(app)
      .post('/api/insights')
      .set('Authorization', 'Bearer valid-token')
      .send({
        profile: { diet: 'vegan' },
        history: []
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('POST /api/log - should return structured activity log', async () => {
    (generateActivityLog as any).mockResolvedValue({
      activities: [
        {
          id: 'act1',
          type: 'transport',
          description: 'Took the metro to work',
          points: 15,
          icon: 'train'
        }
      ],
      message: "Great job taking public transport today!",
      suggestedAction: {
        title: "Offset your commute",
        description: "Try walking for short trips this week.",
        btnText: "Commit to Walk"
      }
    });

    const response = await request(app)
      .post('/api/log')
      .set('Authorization', 'Bearer valid-token')
      .send({
        userMessage: "I took the metro to office today",
        profile: { diet: 'vegetarian' },
        history: []
      });

    expect(response.status).toBe(200);
    expect(response.body.activities).toBeDefined();
    expect(response.body.activities[0].points).toBe(15);
    expect(response.body.suggestedAction).toBeDefined();
  });

  it('POST /api/log - should validate input', async () => {
    const response = await request(app)
      .post('/api/log')
      .set('Authorization', 'Bearer valid-token')
      .send({ userMessage: '' });

    expect(response.status).toBe(400);
  });
});
