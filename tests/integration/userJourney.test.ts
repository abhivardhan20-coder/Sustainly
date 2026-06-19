// tests/integration/userJourney.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import App from '../../src/App';
import React from 'react';

// MSW server for API mocking
const server = setupServer(
  http.post('/api/log', async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      success: true,
      data: {
        id: 'mock-id',
        ...body,
        points: 25,
        co2eSaved: 0.5,
      },
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

  it('should complete full user journey: login → log action → view impact', async () => {
    const user = userEvent.setup();
    render(React.createElement(App));

    // 1. Login
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });

    // 2. Log an action
    await user.click(screen.getByRole('button', { name: /log action/i }));
    await user.type(screen.getByPlaceholderText(/describe your action/i), 'I rode my bike 5 miles');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/bike ride/i)).toBeInTheDocument();
    });

    // 3. Verify impact update
    await user.click(screen.getByRole('link', { name: /dashboard/i }));
    
    await waitFor(() => {
      // Check that CO₂e savings are displayed
      expect(screen.getByText(/kg co₂e saved/i)).toBeInTheDocument();
    });

    // 4. Check garden update
    await user.click(screen.getByRole('link', { name: /garden/i }));
    
    await waitFor(() => {
      // Garden should show growth based on points
      expect(screen.getByRole('img', { name: /garden/i })).toBeInTheDocument();
    });
  });

  it('should handle offline mode gracefully', async () => {
    // Test offline queuing logic
    const user = userEvent.setup();
    render(React.createElement(App));

    // Simulate offline
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    window.dispatchEvent(new Event('offline'));

    // Log action while offline
    await user.click(screen.getByRole('button', { name: /log action/i }));
    await user.type(screen.getByPlaceholderText(/describe your action/i), 'Walked 2 miles');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    // Should show queued status
    expect(screen.getByText(/queued/i)).toBeInTheDocument();

    // Simulate back online
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(screen.getByText(/synced/i)).toBeInTheDocument();
    });
  });
});
