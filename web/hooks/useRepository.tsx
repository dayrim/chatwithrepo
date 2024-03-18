import { useCallback, useMemo, useRef } from 'react';
import git from 'isomorphic-git';
import LightningFS from '@isomorphic-git/lightning-fs';
import useAppStore from './useAppStore';
import { binaryExtensions } from '@/shared/Constants';

export type FileJson = {
    path: string;
    content: string | null; // content can be null for binary files
}

const useRepository = () => {
    const { repositories, selectedRepository } = useAppStore();
    const filesRef = useRef<FileJson[]>([]);
    const fs = useMemo(() => new LightningFS('git-storage'), []);

    const getRepositoryData = useCallback(async () => {
        const repoDetails = repositories[selectedRepository];
        if (!repoDetails) {
            console.error("No selected repository details available.");
            return [];
        }

        const { dir } = repoDetails;
        try {
            const filesInRepo = await git.listFiles({ fs, dir });
            const fileContents: FileJson[] = await Promise.all(filesInRepo.map(async (filePath) => {
                // Skip binary files based on their extension
                if (binaryExtensions.some(ext => filePath.endsWith(ext))) {
                    return { path: filePath, content: null }; // Indicate binary files without content
                }

                try {
                    const content = await fs.promises.readFile(`${dir}/${filePath}`, { encoding: 'utf8' });
                    return {
                        path: filePath,
                        content: typeof content === 'string' ? content : new TextDecoder('utf-8').decode(content),
                    };
                } catch (error) {
                    console.warn(`Error reading file ${filePath}:`, error);
                    return { path: filePath, content: null }; // Handle as binary if reading fails
                }
            }));

            // Updating the ref with the new files list
            filesRef.current = fileContents.filter(file => file.content !== null);
            return filesRef.current; // Return the file contents directly for immediate use
        } catch (error) {
            console.error('Error reading repository files:', error);
            return [];
        }
    }, [repositories, selectedRepository, fs]);

    return {
        fs,
        getRepositoryData,
        filesJson: filesRef.current, // Provide a direct way to access current files
    };
};

export default useRepository;
