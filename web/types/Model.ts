import {
  ChatSession,
  Messages,
  UserData,
  Repository,
} from "backend/build/client";

export type AppState = {
  userId: string | undefined;
  userInfo: UserData | undefined;
  selectedChatSessionId: string | undefined;
  repositories: Repository[];
  chatSessions: ChatSession[];
  selectedRepositoryId: string;
  showAddRepo: boolean;
  showSignIn: boolean;
  isLoggedIn: boolean;
  showSignUp: boolean;
  showSubscription: boolean;
  messages: Messages[];
  setUserInfo: (userInfo: UserData | undefined) => void;
  setSelectedChatSessionId: (selectedChatSessionId: string) => void;
  setUserId: (userId: string | undefined) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  pushRepository: (repository: Repository) => void;
  setSelectedRepositoryId: (selectedRepository: string) => void;
  setShowAddRepo: (showAddRepo: boolean) => void;
  setShowSignUp: (showSignUp: boolean) => void;
  setShowSubscription: (showSubscription: boolean) => void;
  setShowSignIn: (showSignIn: boolean) => void;
  setMessages: (messages: Messages[]) => void;
  setChatSessions: (chatSessions: ChatSession[]) => void;
  pushMessage: (message: Messages) => void;
  pushChatSession: (chatSession: ChatSession) => void;
  updateMessageById: (id: string, updatedFields: Partial<Messages>) => void;
  getSelectedChatSession: () => ChatSession | undefined;
  getSelectedRepository: () => Repository | undefined;
  updateChatSessionById: (
    id: string,
    updatedFields: Partial<ChatSession>
  ) => void;
};
