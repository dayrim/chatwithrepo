import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import { Repositories, AppState } from '@/types/Model';

const useAuthStore = create<AppState>()(
  persist(
    (set) => ({
      userId: uuid(),
      repositories: {},
      selectedRepository: '',
      showAddRepo: false,
      setUserId: (userId: string) => set(() => ({ userId })),
      setRepositories: (repositories: Repositories) => set(() => ({ repositories })),
      setSelectedRepository: (selectedRepository: string) => set(() => ({ selectedRepository })),
      setShowAddRepo: (showAddRepo: boolean) => set(() => ({ showAddRepo })),
    }),
    {
      name: "app-store",
    }
  )
);

export default useAuthStore;