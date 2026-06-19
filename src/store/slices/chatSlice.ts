import { StateCreator } from 'zustand';
import { ChatMessage } from '../../types';
import { SustainlyStore } from '../useSustainlyStore';

export interface ChatSlice {
  messages: ChatMessage[];
  setMessages: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
}

export const createChatSlice: StateCreator<
  SustainlyStore,
  [],
  [],
  ChatSlice
> = (set) => ({
  messages: [],
  setMessages: (updater) => set((state) => ({
    messages: updater(state.messages)
  })),
});
