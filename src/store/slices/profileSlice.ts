import { StateCreator } from 'zustand';
import { z } from 'zod';
import { UserProfile } from '../../types';
import { SustainlyStore } from '../useSustainlyStore';

export const ProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  city: z.string(),
  diet: z.enum(['everything', 'pescatarian', 'vegetarian', 'vegan']),
  primaryCommute: z.array(z.string()),
  homeACUsage: z.enum(['track', 'could-better', 'not-really']),
  createdAt: z.string(),
});

export interface ProfileSlice {
  profile: UserProfile | null;
  theme: 'light' | 'dark';
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const createProfileSlice: StateCreator<
  SustainlyStore,
  [],
  [],
  ProfileSlice
> = (set, get) => ({
  profile: null,
  theme: 'light',
  setProfile: (profile) => {
    try {
      const validated = ProfileSchema.parse(profile);
      set({ profile: validated });
      get().sync();
    } catch (e) {
      console.error("Invalid profile data", e);
    }
  },
  updateProfile: (updates) => {
    set((state) => {
      if (!state.profile) return state;
      try {
        const merged = { ...state.profile, ...updates };
        const validated = ProfileSchema.parse(merged);
        return { profile: validated };
      } catch (e) {
        console.error("Invalid profile updates", e);
        return state;
      }
    });
    get().sync();
  },
  clearProfile: () => {
    set({ profile: null });
    get().sync();
  },
  setTheme: (theme) => set({ theme }),
});
