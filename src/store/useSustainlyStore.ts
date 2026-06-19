import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { debouncedSync } from '../utils/syncQueue';

import { createProfileSlice, ProfileSlice } from './slices/profileSlice';
import { createGardenSlice, GardenSlice } from './slices/gardenSlice';
import { createLogSlice, LogSlice } from './slices/logSlice';
import { createChatSlice, ChatSlice } from './slices/chatSlice';

export type SustainlyStore = ProfileSlice & GardenSlice & LogSlice & ChatSlice & {
  sync: () => void;
  resetAllData: () => void;
  loadFromFirestore: () => Promise<void>;
};

export const useSustainlyStore = create<SustainlyStore>()(
  persist(
    (set, get, api) => ({
      ...createProfileSlice(set, get, api),
      ...createGardenSlice(set, get, api),
      ...createLogSlice(set, get, api),
      ...createChatSlice(set, get, api),

      sync: () => {
        debouncedSync({
          profile: get().profile,
          dailyLogs: get().dailyLogs,
          garden: get().garden,
          streak: get().streak,
          lastLoggedDate: get().lastLoggedDate,
        });
      },

      resetAllData: () => set({
        profile: null,
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
