import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, DailyLog, GardenState, RecommendedAction } from '../types';
import { format } from 'date-fns';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const syncToFirestore = async (state: any) => {
  try {
    const user = auth.currentUser;
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    await setDoc(ref, {
      profile: state.profile,
      dailyLogs: state.dailyLogs,
      garden: state.garden,
      streak: state.streak,
      lastLoggedDate: state.lastLoggedDate,
    }, { merge: true });
  } catch (error) {
    console.error("Failed to sync state to Firestore:", error);
  }
};

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
  loadFromFirestore: () => Promise<void>;
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

      setProfile: (profile) => {
        set({ profile });
        syncToFirestore(get());
      },
      
      addLog: (log) => {
        set((state) => {
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
            garden: {
              ...state.garden,
              trees: state.garden.trees + 1, // grows simple for MVP
            }
          };
        });
        syncToFirestore(get());
      },

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
      }),
      loadFromFirestore: async () => {
        const user = auth.currentUser;
        if (!user) return;
        
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          set({
            profile: data.profile || null,
            dailyLogs: data.dailyLogs || {},
            garden: data.garden || { trees: 0, flowers: 0, lastGrown: new Date().toISOString() },
            streak: data.streak || 0,
            lastLoggedDate: data.lastLoggedDate || null,
          });
        }
      }
    }),
    {
      name: 'sustainly-storage',
    }
  )
);
