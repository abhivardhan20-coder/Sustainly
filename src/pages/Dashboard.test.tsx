/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useSustainlyStore } from '../store/useSustainlyStore';

// Mock the store
vi.mock('../store/useSustainlyStore', async () => {
  const actual = await vi.importActual<unknown>('../store/useSustainlyStore');
  return {
    ...actual,
    useSustainlyStore: vi.fn(),
  };
});

describe('Dashboard Component', () => {
  it('renders welcome message with user name', () => {
    (useSustainlyStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: { name: 'TestUser' },
      streak: 5,
      dailyLogs: {},
      garden: { trees: 0, flowers: 0 },
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    expect(screen.getAllByText(/Welcome back, TestUser/i).length).toBeGreaterThan(0);
  });
});
