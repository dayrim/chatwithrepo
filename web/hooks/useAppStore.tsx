import { create, useStore } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { AppState, Repositories } from '@/types/Model';
import { Messages } from 'backend/build/client';
import React, { createContext, useContext, ReactNode, useRef } from 'react';

const createAppStore = (initialState: Partial<AppState> = {}) => {
  const createState = create<AppState>()(
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

  return createState;
}

// interface AppStoreProviderProps {
//   children: ReactNode;
//   initialState: Partial<AppState>;
// }

// type AppStore = ReturnType<typeof createAppStore>
// export const AppStoreContext = createContext<AppStore | undefined>(undefined);

// export const AppStoreProvider = ({ children, initialState }: AppStoreProviderProps) => {

//   const storeRef = useRef<AppStore>()
//   if (!storeRef.current) {
//     storeRef.current = createAppStore(initialState);
//   }
//   return <AppStoreContext.Provider value={storeRef.current}>{children}</AppStoreContext.Provider>;
// };


// export function useAppStoreContext(): AppState {
//   const store = useContext(AppStoreContext);

//   if (store === undefined) {
//     throw new Error('useAppStore must be used within an AppStoreProvider');
//   }

//   return store.getState();
// }


const store = createAppStore();
export default store;