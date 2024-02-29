export type OpenAIModel = {
  name: string;
  id: string;
  available: boolean;
};

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
  userId: string;
  repositories: Repositories;
  selectedRepository: string;
  showAddRepo: boolean;
  setUserId: (userId: string) => void;
  setRepositories: (repositories: Repositories) => void;
  setSelectedRepository: (selectedRepository: string) => void;
  setShowAddRepo: (showAddRepo: boolean) => void;
};
