
import useAppState from '@/hooks/useAppStore';
import { Dropdown } from 'flowbite-react';
import React, { useMemo } from 'react';
import { BsChevronDown } from 'react-icons/bs';


const RepositoryDropdown: React.FC = () => {
    const { repositories, setSelectedRepositoryId, selectedRepositoryId, showAddRepo, setShowAddRepo } = useAppState();
    const selectedRepository = useAppState(state => state.getSelectedRepository());
    const label = useMemo(() => !!selectedRepository ? selectedRepository.repoName : "Select a repository...", [selectedRepository])



    const showDropdown = useMemo(() => !!Object.keys(repositories || []).length, [repositories])
    return (
        <>
            {showDropdown && (
                <Dropdown
                    label={label}
                    dismissOnClick={true}
                    renderTrigger={() => (
                        <button
                            className="relative flex w-full cursor-default flex-col rounded-md border border-black/10 bg-white py-2 pl-3 pr-10 text-left focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:border-white/20 dark:bg-white-800 sm:text-sm align-center"
                            type="button"
                        >
                            <label className="block text-xs text-gray-700 dark:text-gray-500 text-center">
                                Repository
                            </label>
                            <span className="inline-flex w-full truncate">
                                <span className="flex h-6 items-center gap-1 truncate text-gray">
                                    {label}
                                </span>
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                <BsChevronDown className="h-4 w-4 text-gray-400" />
                            </span>
                        </button>
                    )}
                >
                    {Object.values(repositories).map((repo) => (
                        <Dropdown.Item
                            onClick={() => setSelectedRepositoryId(repo.id)}
                            key={repo.id}
                        >
                            {repo.repoName}
                        </Dropdown.Item>
                    ))}
                    <Dropdown.Item
                        onClick={() => setShowAddRepo(true)}
                        key={"AddNewRepo"}
                    >
                        Add new repository...
                    </Dropdown.Item>
                </Dropdown>
            )}

        </>
    );
};

export default RepositoryDropdown;
