import { ChatSession, Messages } from "backend/build/client";

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
  selectedChatSessionId: string | undefined;
  repositories: Repositories;
  chatSessions: ChatSession[];
  selectedRepository: string;
  showAddRepo: boolean;
  messages: Messages[];
  setSelectedChatSessionId: (selectedChatSessionId: string) => void;
  setUserId: (userId: string) => void;
  setRepositories: (repositories: Repositories) => void;
  setSelectedRepository: (selectedRepository: string) => void;
  setShowAddRepo: (showAddRepo: boolean) => void;
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
