import { StateCreator } from 'zustand';
import { DailyLog, RecommendedAction } from '../../types';
import { SustainlyStore } from '../useSustainlyStore';
import { calculateStreak } from '../../utils/streak';

export interface LogSlice {
  dailyLogs: Record<string, DailyLog>;
  todaysActions: RecommendedAction[];
  streak: number;
  lastLoggedDate: string | null;
  addLog: (log: DailyLog) => void;
  setSuggestedAction: (action: RecommendedAction) => void;
  completeAction: (actionId: string) => void;
  clearActivityLogs: () => void;
}

const pruneOldLogs = (logs: Record<string, DailyLog>): Record<string, DailyLog> => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0];
  
  const pruned: Record<string, DailyLog> = {};
  for (const [date, log] of Object.entries(logs)) {
    if (date >= cutoffDate) {
      pruned[date] = log;
    }
  }
  return pruned;
};

export const createLogSlice: StateCreator<
  SustainlyStore,
  [],
  [],
  LogSlice
> = (set, get) => ({
  dailyLogs: {},
  todaysActions: [],
  streak: 0,
  lastLoggedDate: null,

  addLog: (log) => {
    set((state) => {
      const existingLog = state.dailyLogs[log.date];
      const newActivities = existingLog ? [...existingLog.activities, ...log.activities] : log.activities;
      const totalPoints = existingLog ? existingLog.totalPoints + log.totalPoints : log.totalPoints;

      let streak = state.streak;
      let lastLoggedDate = state.lastLoggedDate;

      if (!existingLog) {
        const streakResult = calculateStreak(streak, lastLoggedDate, log.date);
        streak = streakResult.streak;
        lastLoggedDate = streakResult.lastLoggedDate;
      }

      const updatedLogs = {
        ...state.dailyLogs,
        [log.date]: {
          date: log.date,
          activities: newActivities,
          totalPoints
        }
      };

      const allTotalPoints = Object.values(updatedLogs).reduce((sum, l) => sum + l.totalPoints, 0);

      return {
        dailyLogs: pruneOldLogs(updatedLogs),
        garden: {
          ...state.garden,
          trees: Math.floor(allTotalPoints / 50),
        },
        streak,
        lastLoggedDate
      };
    });
    get().sync();
  },

  setSuggestedAction: (action) => set((_state) => ({
    todaysActions: [action]
  })),

  completeAction: (actionId) => set((state) => ({
    todaysActions: state.todaysActions.map(a => 
      a.id === actionId ? { ...a, completed: true } : a
    )
  })),

  clearActivityLogs: () => set({
    dailyLogs: {},
    todaysActions: [],
    streak: 0,
    lastLoggedDate: null,
  })
});
