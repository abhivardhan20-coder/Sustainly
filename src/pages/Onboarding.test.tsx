/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Onboarding from './Onboarding';

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

vi.mock('../store/useSustainlyStore', async () => {
  const actual = await vi.importActual<any>('../store/useSustainlyStore');
  const mockState = {
    profile: null,
    setProfile: vi.fn(),
  };
  const mockStore = vi.fn((selector) => {
    if (typeof selector === 'function') {
      return selector(mockState);
    }
    return mockState;
  });
  return {
    ...actual,
    useSustainlyStore: Object.assign(mockStore, {
      getState: vi.fn().mockReturnValue(mockState),
      setState: vi.fn()
    })
  };
});

describe('Onboarding Component', () => {
  it('renders the welcome title', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
    expect(screen.getByText(/Welcome to Sustainly/i)).toBeInTheDocument();
  });

  it('renders the name input', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText(/Your name/i)).toBeInTheDocument();
  });

  it('renders environment options', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
    expect(screen.getByText(/Urban City/i)).toBeInTheDocument();
    expect(screen.getByText(/Suburbs/i)).toBeInTheDocument();
    expect(screen.getByText(/Rural Area/i)).toBeInTheDocument();
  });

  it('renders diet options', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
    expect(screen.getByText(/Everything/i)).toBeInTheDocument();
    expect(screen.getByText(/Pescatarian/i)).toBeInTheDocument();
    expect(screen.getByText(/Vegetarian/i)).toBeInTheDocument();
    expect(screen.getByText(/Vegan/i)).toBeInTheDocument();
  });

  it('renders commute options', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
    expect(screen.getByText('Car')).toBeInTheDocument();
    expect(screen.getByText('Transit')).toBeInTheDocument();
    expect(screen.getByText('Bike')).toBeInTheDocument();
    expect(screen.getByText('Walk')).toBeInTheDocument();
  });

  it('disables submit button when name is empty', () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );
    const submitBtn = screen.getByRole('button', { name: /Complete onboarding/i });
    expect(submitBtn).toBeDisabled();
  });
});
