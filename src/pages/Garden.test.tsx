/** @vitest-environment jsdom */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Garden from './Garden';
import { useSustainlyStore } from '../store/useSustainlyStore';

vi.mock('../store/useSustainlyStore', async () => {
  const actual = await vi.importActual<any>('../store/useSustainlyStore');
  return {
    ...actual,
    useSustainlyStore: vi.fn(),
  };
});

describe('Garden Component', () => {
  it('renders garden stats', () => {
    (useSustainlyStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      garden: { trees: 3, flowers: 10 },
      streak: 5,
      dailyLogs: {},
    });

    render(
      <BrowserRouter>
        <Garden />
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Impact Garden/i)).toBeInTheDocument();
  });
});
