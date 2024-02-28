import React, { useMemo, useState } from 'react';
import { Button, Modal, TextInput } from 'flowbite-react';
import git from 'isomorphic-git';
import LightningFS from '@isomorphic-git/lightning-fs';
import http from 'isomorphic-git/http/web';

interface AddRepoProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
}

interface File {
    name: string;
    path: string;
    content: string;
}

const AddRepo: React.FC<AddRepoProps> = ({ openModal, setOpenModal }) => {
    const [repoLink, setRepoLink] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    // Initialize the in-memory file system
    const fs = useMemo(() => new LightningFS('git-storage'), []);

    const fetchRepoContents = async (repoUrl: string) => {
        console.log('Attempting to fetch repository contents for:', repoUrl);

        // Clear previous files
        setFiles([]);

        const [, owner, repo] = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) || [];
        console.log('Parsed owner:', owner, 'Parsed repo:', repo);

        if (!owner || !repo) {
            console.error('Invalid GitHub repository URL:', repoUrl);
            return;
        }

        const dir = `/${owner}/${repo}`;
        try {
            console.log('Cloning repository:', dir);
            await git.clone({
                fs,
                http,
                dir,
                corsProxy: 'https://cors.isomorphic-git.org',
                url: `https://github.com/${owner}/${repo}.git`,
                singleBranch: true,
                depth: 1,
            });

            console.log('Repository cloned successfully. Listing files...');
            const filesInRepo = await git.listFiles({ fs, dir });
            console.log('Files in repository:', filesInRepo);

            const fileContents = await Promise.all(
                filesInRepo.map(async (filePath: string) => {
                    console.log(`Reading file: ${filePath}`);
                    let content = await fs.promises.readFile(`${dir}/${filePath}`, { encoding: 'utf8' });
                    if (content instanceof Uint8Array) {
                        console.log('Converting content from Uint8Array to string for file:', filePath);
                        content = new TextDecoder('utf-8').decode(content);
                    }
                    return { name: filePath, path: filePath, content };
                }),
            );

            console.log('Setting files state with the contents of the cloned repository');
            setFiles(fileContents);
        } catch (error) {
            console.error('Error cloning repository:', error);
        }
    };

    const handleSubmit = () => {
        console.log('Submit button clicked with repository link:', repoLink);
        fetchRepoContents(repoLink);
        // setOpenModal(false); // Uncomment if modal should be closed on submit
    };

    return (
        <>
            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Add New Repository</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                            Enter the link to the GitHub repository you wish to add. Please ensure you have the necessary permissions to add this repository.
                        </p>
                        <TextInput
                            id="githubRepo"
                            type="text"
                            placeholder="https://github.com/username/repository"
                            value={repoLink}
                            onChange={(e) => setRepoLink(e.target.value)}
                        />
                        <div>
                            {files.map((file, index) => (
                                <div key={index}>
                                    <p>{file.path}</p>
                                    {/* Optionally display file content here */}
                                </div>
                            ))}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="dark" onClick={handleSubmit}>Add Repository</Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AddRepo;
