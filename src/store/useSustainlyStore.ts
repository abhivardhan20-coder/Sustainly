import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, DailyLog, GardenState, RecommendedAction } from '../types';
import { format } from 'date-fns';

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export interface SustainlyStore {
  profile: UserProfile | null;
  dailyLogs: Record<string, DailyLog>; 
  garden: GardenState;
  todaysActions: RecommendedAction[];
  streak: number;
  lastLoggedDate: string | null;
  messages: ChatMessage[];
  theme: 'light' | 'dark';

  setProfile: (profile: UserProfile) => void;
  addLog: (log: DailyLog) => void;
  updateGarden: (updates: Partial<GardenState>) => void;
  setSuggestedAction: (action: RecommendedAction) => void;
  completeAction: (actionId: string) => void;
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  resetAllData: () => void;
  clearActivityLogs: () => void;
}

export const useSustainlyStore = create<SustainlyStore>()(
  persist(
    (set, get) => ({
      profile: null,
      dailyLogs: {},
      garden: {
        trees: 0,
        flowers: 0,
        lastGrown: new Date().toISOString(),
      },
      todaysActions: [],
      streak: 0,
      lastLoggedDate: null,
      messages: [],
      theme: 'light',

      setProfile: (profile) => set({ profile }),
      
      addLog: (log) => set((state) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        let newStreak = state.streak;
        if (state.lastLoggedDate) {
           const lastDate = new Date(state.lastLoggedDate);
           const diff = new Date().getTime() - lastDate.getTime();
           const days = Math.floor(diff / (1000 * 60 * 60 * 24));
           if (days === 1) {
             newStreak += 1;
           } else if (days > 1) {
             newStreak = 1; // reset streak if missed a day
           }
           // if days === 0, streak remains same
        } else {
           newStreak = 1;
        }

        const existingLog = state.dailyLogs[log.date];
        const newActivities = existingLog ? [...existingLog.activities, ...log.activities] : log.activities;
        const totalPoints = existingLog ? existingLog.totalPoints + log.totalPoints : log.totalPoints;

        return {
          dailyLogs: {
            ...state.dailyLogs,
            [log.date]: {
              date: log.date,
              activities: newActivities,
              totalPoints
            }
          },
          streak: newStreak,
          lastLoggedDate: today,
          garden: {
            ...state.garden,
            trees: state.garden.trees + 1, // grows simple for MVP
          }
        };
      }),

      updateGarden: (updates) => set((state) => ({
        garden: { ...state.garden, ...updates }
      })),

      setSuggestedAction: (action) => set((state) => ({
        todaysActions: [action]
      })),

      completeAction: (actionId) => set((state) => ({
        todaysActions: state.todaysActions.map(a => 
          a.id === actionId ? { ...a, completed: true } : a
        )
      })),

      setMessages: (updater) => set((state) => ({
        messages: updater(state.messages)
      })),

      setTheme: (theme) => set({ theme }),

      resetAllData: () => set({
        profile: null,
        dailyLogs: {},
        garden: { trees: 0, flowers: 0, lastGrown: new Date().toISOString() },
        todaysActions: [],
        streak: 0,
        lastLoggedDate: null,
        messages: []
      }),

      clearActivityLogs: () => set({
        dailyLogs: {},
        garden: { trees: 0, flowers: 0, lastGrown: new Date().toISOString() },
        todaysActions: [],
        streak: 0,
        lastLoggedDate: null,
        messages: []
      })
    }),
    {
      name: 'sustainly-storage',
    }
  )
);
