/** @vitest-environment jsdom */
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from './Profile';
import { useSustainlyStore } from '../store/useSustainlyStore';

vi.mock('../store/useSustainlyStore', async () => {
  const actual = await vi.importActual<any>('../store/useSustainlyStore');
  const mockState = {
    profile: {
      id: 'user-1',
      name: 'TestUser',
      city: 'urban',
      diet: 'vegan',
      primaryCommute: ['bike', 'walk'],
      homeACUsage: 'track',
      createdAt: '2024-06-01T00:00:00.000Z'
    },
    streak: 7,
    dailyLogs: {
      '2024-06-01': {
        activities: [{ id: '1', type: 'transport', description: 'Bike', points: 10, icon: 'bike' }],
        totalPoints: 10
      }
    },
    resetAllData: vi.fn(),
    clearActivityLogs: vi.fn(),
    theme: 'light',
    setTheme: vi.fn()
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
      {
        getState: vi.fn().mockReturnValue(mockState),
        setState: vi.fn()
      }
    ),
  };
});

vi.mock('../lib/firebase', () => ({
  auth: { currentUser: null },
  db: {}
}));

vi.mock('firebase/auth', () => ({
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return vi.fn(); }),
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  onSnapshot: vi.fn(),
  getFirestore: vi.fn(),
}));

describe('Profile Component', () => {
  it('renders the profile heading', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByText('Your Profile')).toBeInTheDocument();
  });

  it('displays the user name', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('displays diet information', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByText('vegan')).toBeInTheDocument();
  });

  it('displays commute information', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByText('bike, walk')).toBeInTheDocument();
  });

  it('has edit and logout buttons', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByLabelText('Edit profile preferences')).toBeInTheDocument();
    expect(screen.getByLabelText('Log out of Sustainly')).toBeInTheDocument();
  });

  it('has data management buttons', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByLabelText('Export all your data as JSON file')).toBeInTheDocument();
    expect(screen.getByLabelText('Clear all activity data and logs')).toBeInTheDocument();
  });

  it('renders dark mode toggle', () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByLabelText('Toggle dark mode')).toBeInTheDocument();
  });

  it('returns null when no profile', () => {
    const mockStore = useSustainlyStore as unknown as ReturnType<typeof vi.fn>;
    mockStore.mockImplementation((selector: any) => {
      const state = {
        profile: null,
        streak: 0,
        dailyLogs: {},
        resetAllData: vi.fn(),
        clearActivityLogs: vi.fn(),
        theme: 'light',
        setTheme: vi.fn()
      };
      if (typeof selector === 'function') return selector(state);
      return state;
    });

    const { container } = render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(container.innerHTML).toBe('');
  });
});
