import { StateCreator } from 'zustand';
import { UserProfile } from '../../types';
import { SustainlyStore } from '../useSustainlyStore';

export interface ProfileSlice {
  profile: UserProfile | null;
  theme: 'light' | 'dark';
  setProfile: (profile: UserProfile) => void;
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
    set({ profile });
    get().sync();
  },
  setTheme: (theme) => set({ theme }),
});
