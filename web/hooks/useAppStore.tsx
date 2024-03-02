import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { AppState, Repositories } from '@/types/Model';
import { Messages } from '../../backend/build/client';

interface MyState extends AppState {
  messages: Messages[];
  setMessages: (messages: Messages[]) => void;
  pushMessage: (message: Messages) => void;
  updateMessageById: (id: string, updatedFields: Partial<Messages>) => void;
}

const useAuthStore = create<MyState>()(
  persist(
    (set, get) => ({
      userId: uuid(),
      repositories: {},
      selectedRepository: '',
      showAddRepo: false,
      messages: [],
      setUserId: (userId: string) => set(() => ({ userId })),
      setRepositories: (repositories: Repositories) => set(() => ({ repositories })),
      setSelectedRepository: (selectedRepository: string) => set(() => ({ selectedRepository })),
      setShowAddRepo: (showAddRepo: boolean) => set(() => ({ showAddRepo })),
      setMessages: (messages: Messages[]) => {
        const sortedMessages = messages.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
        set(() => ({ messages: sortedMessages }));
      },
      pushMessage: (message: Messages) => {
        set((state) => ({
          messages: [...state.messages, message]
        }));
      },
      updateMessageById: (id: string, updatedFields: Partial<Messages>) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updatedFields } : msg
          )
        }));
      },
    }),
    {
      name: "app-store",
      partialize: (state) => {
        const { messages, ...persistedState } = state;
        return persistedState; // Persist everything except messages
      },
    }
  )
);

export default useAuthStore;
