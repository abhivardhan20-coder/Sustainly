/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock firebase
vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  signInWithPopup: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return vi.fn(); }),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn(),
  getFirestore: vi.fn(),
}));

describe('Login Component', () => {
  it('renders the Sustainly title', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByText('Sustainly')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByText(/Grow your personal impact garden/i)).toBeInTheDocument();
  });

  it('renders the Google login button', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
  });

  it('has a clickable login button', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    const button = screen.getByText(/Continue with Google/i);
    expect(button.closest('button')).toBeTruthy();
  });
});
