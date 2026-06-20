/** @vitest-environment jsdom */
// tests/integration/userJourney.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import App from '../../src/App';
import React from 'react';
import { vi } from 'vitest';
import { useSustainlyStore } from '../../src/store/useSustainlyStore';

// Mock firebase auth
vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn().mockResolvedValue({ user: { displayName: 'Test User' } }),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return vi.fn(); }),
}));

vi.mock('../../src/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));

// MSW server for API mocking
const server = setupServer(
  http.post('/api/log', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Great job on the bike ride!',
      activities: [
        {
          id: 'mock-id',
          type: 'transport',
          description: 'Bike ride',
          points: 25,
          co2eSaved: 0.5,
          icon: '🚲'
        }
      ]
    });
  }),
  http.post('/api/insights', async () => {
    return HttpResponse.json({
      insights: [
        'Switching to LED bulbs can save up to 75% on lighting energy.'
      ]
    });
  })
);

describe('User Journey Integration Tests', () => {
  beforeAll(async () => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    useSustainlyStore.getState().resetAllData();
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('should complete full user journey: login → log action → view impact', async () => {
    const user = userEvent.setup();
    render(React.createElement(App));

    // Wait for the auth loading screen to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Loading your sustainability journey/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // 1. Login
    await user.click(screen.getByRole('button', { name: /Continue with Google/i }));
    
    // Simulate auth state change
    await waitFor(() => {
      useSustainlyStore.setState({
        profile: {
          id: 'test-user-id',
          name: 'Test User',
          city: 'urban',
          diet: 'vegetarian',
          primaryCommute: ['bike'],
          homeACUsage: 'track',
          createdAt: new Date().toISOString()
        }
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    // 2. Log an action
    await user.click(screen.getAllByRole('link', { name: /log/i })[0]);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/describe your daily activities/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    await user.type(screen.getByLabelText(/describe your daily activities/i), 'I rode my bike 5 miles');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/bike ride/i)[0]).toBeInTheDocument();
    }, { timeout: 5000 });

    // 3. Verify impact update
    await user.click(screen.getAllByRole('link', { name: /home/i })[0]);
    
    await waitFor(() => {
      // Check that points are displayed
      expect(screen.getByText('+25')).toBeInTheDocument();
    }, { timeout: 5000 });

    // 4. Check garden update
    await user.click(screen.getAllByRole('link', { name: /garden/i })[0]);
    
    await waitFor(() => {
      // Garden should show growth based on points
      expect(screen.getByRole('img', { name: /garden/i })).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 30000);

  // TODO: This test has a pre-existing architecture issue — jsdom cannot properly simulate
  // offline/online network transitions with MSW, causing the navigation chain
  // (Login → Onboarding → Dashboard) to not complete under simulated offline conditions.
  // The test needs to be rewritten to either use Playwright for real browser offline
  // simulation, or to test offline logic at the component/hook level instead.
  it.skip('should handle offline mode gracefully', async () => {
    const user = userEvent.setup();
    render(React.createElement(App));

    // Wait for the auth loading screen to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Loading your sustainability journey/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Simulate offline
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    window.dispatchEvent(new Event('offline'));

    // Log action while offline
    await user.click(screen.getByRole('button', { name: /Continue with Google/i }));
    
    // Simulate auth state change
    await waitFor(() => {
      useSustainlyStore.setState({
        profile: {
          id: 'test-user-id',
          name: 'Test User',
          city: 'urban',
          diet: 'vegetarian',
          primaryCommute: ['bike'],
          homeACUsage: 'track',
          createdAt: new Date().toISOString()
        }
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    }, { timeout: 5000 });

    await user.click(screen.getAllByRole('link', { name: /log/i })[0]);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/describe your daily activities/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    await user.type(screen.getByLabelText(/describe your daily activities/i), 'Walked 2 miles');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // Simulate back online
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      // Check that sync happened
      expect(screen.getAllByText(/bike ride/i)[0]).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 30000);
});
