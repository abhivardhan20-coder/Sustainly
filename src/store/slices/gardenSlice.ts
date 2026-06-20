import { StateCreator } from 'zustand';
import { GardenState } from '../../types';
import { SustainlyStore } from '../useSustainlyStore';

export interface GardenSlice {
  garden: GardenState;
  updateGarden: (updates: Partial<GardenState>) => void;
}

export const createGardenSlice: StateCreator<
  SustainlyStore,
  [],
  [],
  GardenSlice
> = (set, _get) => ({
  garden: {
    trees: 0,
    flowers: 0,
    lastGrown: new Date().toISOString(),
  },
  updateGarden: (updates) => set((state) => ({
    garden: { ...state.garden, ...updates }
  })),
});
