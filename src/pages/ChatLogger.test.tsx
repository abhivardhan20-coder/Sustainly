/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ChatLogger from './ChatLogger';
import { useSustainlyStore } from '../store/useSustainlyStore';

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
});

// Mock store
vi.mock('../store/useSustainlyStore', async () => {
  const actual = await vi.importActual<any>('../store/useSustainlyStore');
  const mockState = {
    profile: { name: 'Test', diet: 'vegan', primaryCommute: ['bike'] },
    addLog: vi.fn(),
    setSuggestedAction: vi.fn(),
    completeAction: vi.fn(),
    todaysActions: [],
    messages: [],
    setMessages: vi.fn(),
    loadFromFirestore: vi.fn().mockResolvedValue(undefined)
  };
  const mockStore = vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector(mockState);
    }
    return mockState;
  });
  return {
    ...actual,
    useSustainlyStore: Object.assign(
      mockStore,
      { getState: vi.fn().mockReturnValue(mockState) }
    ),
  };
});

vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return vi.fn(); }),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn(),
  getFirestore: vi.fn(),
}));

describe('ChatLogger Component', () => {
  it('renders the chat header', () => {
    render(
      <BrowserRouter>
        <ChatLogger />
      </BrowserRouter>
    );
    expect(screen.getByText(/Understanding your day/i)).toBeInTheDocument();
  });

  it('renders the chat log area with aria attributes', () => {
    render(
      <BrowserRouter>
        <ChatLogger />
      </BrowserRouter>
    );
    const chatArea = screen.getAllByRole('log');
    expect(chatArea.length).toBeGreaterThan(0);
    expect(chatArea[0]).toHaveAttribute('aria-live', 'polite');
  });

  it('renders without crashing when messages are empty', () => {
    render(
      <BrowserRouter>
        <ChatLogger />
      </BrowserRouter>
    );
    expect(screen.getByText(/Understanding your day/i)).toBeInTheDocument();
  });
});
