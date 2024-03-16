import { create, } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { AppState, Repositories } from '@/types/Model';
import { ChatSession, Messages } from 'backend/build/client';

const createAppStore = (initialState: Partial<AppState> = {}) => {
  const createState = create<AppState>()(
    persist(
      (set, get) => ({
        userId: undefined,
        repositories: {},
        selectedRepository: '',
        showAddRepo: false,
        isLoggedIn: false,
        showSignUp: false,
        showSignIn: false,
        selectedChatSessionId: undefined,
        messages: [],
        chatSessions: [],
        setUserId: (userId: string) => set(() => ({ userId })),
        setIsLoggedIn: (isLoggedIn: boolean) => set(() => ({ isLoggedIn })),
        setSelectedChatSessionId: (selectedChatSessionId: string) => set(() => ({ selectedChatSessionId })),
        setRepositories: (repositories: Repositories) => set(() => ({ repositories })),
        setSelectedRepository: (selectedRepository: string) => set(() => ({ selectedRepository })),
        setShowAddRepo: (showAddRepo: boolean) => set(() => ({ showAddRepo })),
        setShowSignUp: (showSignUp: boolean) => set(() => ({ showSignUp })),
        setShowSignIn: (showSignIn: boolean) => set(() => ({ showSignIn })),

        setMessages: (messages: Messages[]) => {
          const sortedMessages = messages.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
          set(() => ({ messages: sortedMessages }));
        },
        setChatSessions: (chatSessions: ChatSession[]) => {
          const sortedChatSessions = chatSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          set(() => ({ chatSessions: sortedChatSessions }));
        },
        pushChatSession: (chatSession: ChatSession) => {
          set((state) => ({
            chatSessions: [...state.chatSessions, chatSession]
          }));
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
        updateChatSessionById: (id: string, updatedFields: Partial<ChatSession>) => {
          set((state) => ({
            chatSessions: state.chatSessions.map((chat) =>
              chat.id === id ? { ...chat, ...updatedFields } : chat
            )
          }));
        },
        getSelectedChatSession: () => {
          const { chatSessions, selectedChatSessionId } = get();
          const chatSession = chatSessions.find(session => session.id === selectedChatSessionId);
          return chatSession;
        },
      }),
      {
        name: "app-store",
        partialize: (state) => {
          const { selectedChatSessionId, chatSessions, messages, ...persistedState } = state;
          return persistedState;
        },
      }
    )
  );

  return createState;
}
const store = createAppStore();
export default store;

export const useAppState = store;