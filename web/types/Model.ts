import { ChatSession, Messages, UserData } from "backend/build/client";

export type Repository = {
  url: string;
  dir: string;
  repo: string;
  owner: string;
  provider: "github";
  selfHosted: boolean;
};

export type Repositories = {
  [key: string]: Repository;
};

export type AppState = {
  userId: string | undefined;
  userInfo: UserData | undefined;
  selectedChatSessionId: string | undefined;
  repositories: Repositories;
  chatSessions: ChatSession[];
  selectedRepository: string;
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
  setRepositories: (repositories: Repositories) => void;
  setSelectedRepository: (selectedRepository: string) => void;
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
  updateChatSessionById: (
    id: string,
    updatedFields: Partial<ChatSession>
  ) => void;
};
