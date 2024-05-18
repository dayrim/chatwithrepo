import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { AppState } from '@/types/Model';
import { ChatSession, Messages, UserData, Repository } from 'backend/build/client';

const createAppStore = (initialState: Partial<AppState> = {}) => {
  const createState = create<AppState>()(
    devtools(
      persist(
        (set, get) => ({
          userId: undefined,
          userInfo: undefined,
          repositories: [],
          selectedRepositoryId: '',
          showAddRepo: false,
          isLoggedIn: false,
          showSignUp: false,
          showSignIn: false,
          showSubscription: false,
          selectedChatSessionId: undefined,
          messages: [],
          chatSessions: [],
          setUserInfo: (userInfo: UserData | undefined) => set({ userInfo }, false, 'setUserInfo'),
          setUserId: (userId: string | undefined) => set({ userId }, false, 'setUserId'),
          setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }, false, 'setIsLoggedIn'),
          setSelectedChatSessionId: (selectedChatSessionId: string) => set({ selectedChatSessionId }, false, 'setSelectedChatSessionId'),
          pushRepository: (repository: Repository) => set((state) => ({ repositories: [...state.repositories, repository] }), false, 'pushRepository'),

          setSelectedRepositoryId: (selectedRepositoryId: string) => set({ selectedRepositoryId }, false, 'selectedRepositoryId'),
          setShowAddRepo: (showAddRepo: boolean) => set({ showAddRepo }, false, 'setShowAddRepo'),
          setShowSignUp: (showSignUp: boolean) => set({ showSignUp }, false, 'setShowSignUp'),
          setShowSignIn: (showSignIn: boolean) => set({ showSignIn }, false, 'setShowSignIn'),
          setShowSubscription: (showSubscription: boolean) => set({ showSubscription }, false, 'setShowSubscription'),
          setMessages: (messages: Messages[]) => {
            const sortedMessages = messages.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
            set({ messages: sortedMessages }, false, 'setMessages');
          },
          setChatSessions: (chatSessions: ChatSession[]) => {
            const sortedChatSessions = chatSessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            set({ chatSessions: sortedChatSessions }, false, 'setChatSessions');
          },
          pushChatSession: (chatSession: ChatSession) => set((state) => ({ chatSessions: [...state.chatSessions, chatSession] }), false, 'pushChatSession'),
          pushMessage: (message: Messages) => set((state) => ({ messages: [...state.messages, message] }), false, 'pushMessage'),
          updateMessageById: (id: string, updatedFields: Partial<Messages>) => set((state) => ({
            messages: state.messages.map((msg) => msg.id === id ? { ...msg, ...updatedFields } : msg)
          }), false, 'updateMessageById'),
          updateChatSessionById: (id: string, updatedFields: Partial<ChatSession>) => set((state) => ({
            chatSessions: state.chatSessions.map((chat) => chat.id === id ? { ...chat, ...updatedFields } : chat)
          }), false, 'updateChatSessionById'),
          getSelectedChatSession: () => {
            const { chatSessions, selectedChatSessionId } = get();
            return chatSessions.find(session => session.id === selectedChatSessionId);
          },
          getSelectedRepository: () => {
            const { repositories, selectedRepositoryId } = get();
            // Find and return the repository that matches the selectedRepository ID
            return repositories.find(repo => repo.id === selectedRepositoryId);
          },
        }),
        {
          name: "app-store",
          partialize: (state) => ({ ...state, chatSessions: undefined, messages: undefined }),
        }
      )
    )
  );

  return createState;
}
const store = createAppStore();
export default store;

export const useAppState = store;
