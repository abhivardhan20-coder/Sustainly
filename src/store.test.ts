/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useSustainlyStore } from './store/useSustainlyStore';

describe('Sustainly Store', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default theme as light', () => {
    const theme = useSustainlyStore.getState().theme;
    expect(theme).toBe('light');
  });

  it('should allow setting the theme', () => {
    useSustainlyStore.getState().setTheme('dark');
    const theme = useSustainlyStore.getState().theme;
    expect(theme).toBe('dark');
  });

  it('should allow adding daily logs', () => {
    const log = {
      date: '2024-01-01',
      activities: [{ 
        id: '123',
        timestamp: '2024-01-01T12:00:00Z',
        type: 'transport',
        description: 'Bike ride',
        category: 'transport',
        impactScore: 10,
        activityType: 'Bike', 
        points: 10,
        confidenceScore: 0.9 
      }],
      totalPoints: 10
    } as any;
    useSustainlyStore.getState().addLog(log);
    const logs = useSustainlyStore.getState().dailyLogs;
    expect(logs['2024-01-01']).toBeDefined();
    expect(logs['2024-01-01'].totalPoints).toBe(10);
  });

  it('should calculate streak for consecutive days', () => {
    useSustainlyStore.setState({ streak: 1, lastLoggedDate: '2024-01-01' });
    
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-02T12:00:00Z'));

    const log = {
      date: '2024-01-02',
      activities: [],
      totalPoints: 5
    } as any;
    
    useSustainlyStore.getState().addLog(log);
    const streak = useSustainlyStore.getState().streak;
    expect(streak).toBe(2);
  });

  it('should reset streak for gaps in days', () => {
    useSustainlyStore.setState({ streak: 5, lastLoggedDate: '2024-01-01' });
    
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-03T12:00:00Z'));

    const log = {
      date: '2024-01-03',
      activities: [],
      totalPoints: 5
    } as any;
    
    useSustainlyStore.getState().addLog(log);
    const streak = useSustainlyStore.getState().streak;
    expect(streak).toBe(1);
  });

  it('should clear activity logs', () => {
    useSustainlyStore.setState({
      dailyLogs: { '2024-01-01': { date: '2024-01-01', activities: [], totalPoints: 10 } } as any,
      streak: 5,
      lastLoggedDate: '2024-01-01'
    });
    
    useSustainlyStore.getState().clearActivityLogs();
    const state = useSustainlyStore.getState();
    expect(Object.keys(state.dailyLogs).length).toBe(0);
    expect(state.streak).toBe(0);
    expect(state.lastLoggedDate).toBeNull();
  });
});
