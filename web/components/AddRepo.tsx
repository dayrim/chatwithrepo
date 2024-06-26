'use client'
import React, { useMemo, useState } from 'react';
import { Button, Modal, TextInput, Progress } from 'flowbite-react';
import git, { AuthCallback, AuthFailureCallback, AuthSuccessCallback, CallbackFsClient, HttpClient, MessageCallback, ProgressCallback, PromiseFsClient } from 'isomorphic-git';
import LightningFS from '@isomorphic-git/lightning-fs';
import http from 'isomorphic-git/http/web';
import useAppState from '@/hooks/useAppStore';
import useBackendClient from '@/hooks/useBackendClient';
import { UploadResponse, uploadToGenAI } from '@/pages/api/gemini-upload-file';

interface AddRepoProps {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
}

const AddRepo: React.FC<AddRepoProps> = ({ openModal, setOpenModal }) => {
    const { pushRepository, repositories, setSelectedRepositoryId, userId } = useAppState();
    const { repositoriesService, chatSessionsService, repositoryFilesService } = useBackendClient();
    const [repoLink, setRepoLink] = useState('');
    const [username, setUsername] = useState('');
    const [accessToken, setAccessToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('Chilling');

    // Initialize the in-memory file system
    const fs = useMemo(() => new LightningFS('git-storage'), []);

    const fetchRepoContents = async (repoUrl: string) => {
        if (!userId || !repositoriesService || !chatSessionsService || !repositoryFilesService) return;
        console.log('Attempting to fetch repository contents for:', repoUrl);
        setLoading(true);
        setProgress(0);

        const [, owner, repo] = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/) || [];
        console.log('Parsed owner:', owner, 'Parsed repo:', repo);

        if (!owner || !repo) {
            console.error('Invalid GitHub repository URL:', repoUrl);
            return;
        }

        const dir = `/github/${owner}/${repo}`;
        const url = `https://github.com/${owner}/${repo}.git`;

        const cloneOptions: {
            fs: CallbackFsClient | PromiseFsClient;
            http: HttpClient;
            onProgress?: ProgressCallback;
            onMessage?: MessageCallback;
            onAuth?: AuthCallback;
            onAuthFailure?: AuthFailureCallback;
            onAuthSuccess?: AuthSuccessCallback;
            dir: string;
            gitdir?: string;
            url: string;
            corsProxy?: string;
            ref?: string;
            singleBranch?: boolean;
            noCheckout?: boolean;
            noTags?: boolean;
            remote?: string;
            depth?: number;
            since?: Date;
            exclude?: string[];
            relative?: boolean;
            headers?: {
                [x: string]: string;
            };
            cache?: any;
        } = {
            fs,
            http,
            dir,
            corsProxy: 'https://cors.isomorphic-git.org',
            url,
            singleBranch: true,
            depth: 1,
            onProgress: event => {
                setPhase(event.phase);
                if (event.total) {
                    setProgress((event.loaded / event.total) * 100);
                } else {
                    setProgress(event.loaded);
                }
            },

        };

        if (username && accessToken) {
            cloneOptions['onAuth'] = () => ({
                username,
                password: accessToken,
            });
        }

        try {
            console.log('Cloning repository:', dir);
            await git.clone(cloneOptions);
            const createdRepo = await repositoriesService.create({ provider: 'github', domain: owner, repoName: repo, userId });
            console.log('Repository cloned successfully.');

            const filesInRepo = await git.listFiles({ fs, dir });
            const totalFiles = filesInRepo.length;
            let uploadedFiles = 0;

            console.log('Files in repository:', filesInRepo);
            setPhase("Uploading to GenAI");
            setProgress(0);
            let filesArray: any = []
            await Promise.all(
                filesInRepo.map(async (filePath: string) => {
                    console.log(`Reading file: ${filePath}`);
                    let content = await fs.promises.readFile(`${dir}/${filePath}`, { encoding: 'utf8' });
                    filesArray.push({ filePath, content });
                    if (content instanceof Uint8Array) {
                        console.log('Converting content from Uint8Array to string for file:', filePath);
                        content = new TextDecoder('utf-8').decode(content);
                    }
                    try {
                        const response = await fetch('/api/gemini-upload-file', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                displayName: filePath,
                                fileContent: content,
                            }),
                        });
                        if (!response.ok) {
                            console.error('File upload response was not ok for file: ' + filePath);
                        }
                        const result = await response.json() as UploadResponse;

                        if (!result?.file) {
                            console.error('Data missing for file: ' + filePath)
                            console.error(result)
                            return;
                        }
                        const { file } = result;
                        try {
                            await repositoryFilesService.create({
                                repositoryId: createdRepo.id, filePath: file.displayName, googleFileName: file.name,
                                googleFileUrl: file.uri, sha256Hash: file.sha256Hash, expirationTime: file.expirationTime
                            });
                        } catch (err) {
                            console.error('Error creating repository file:', err);
                        }
                        uploadedFiles += 1;
                        const uploadProgress = (uploadedFiles / totalFiles) * 100;
                        setProgress(uploadProgress);

                    } catch (err) {
                        console.error('Error uploading file:', err);
                    }

                    return { name: filePath, path: filePath, content };
                }),
            );
            await chatSessionsService.create({ title: "New Conversation", userId, repositoryId: createdRepo.id });

            pushRepository(createdRepo);
            setSelectedRepositoryId(createdRepo.id);
            setOpenModal(false);
            setLoading(false);

        } catch (error) {
            setLoading(false);
            console.error('Error cloning repository:', error);
        }
    };

    const handleSubmit = () => {
        console.log('Submit button  clicked with repository link:', repoLink);
        fetchRepoContents(repoLink);
    };

    return (
        <>
            <Modal show={openModal} onClose={() => setOpenModal(false)}>
                <Modal.Header>Add New Repository</Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <>
                            <div className="space-y-2">
                                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {phase || "Chilling..."}
                                </span>
                                <Progress progress={progress} />
                            </div>
                        </>
                    ) : (
                        <>
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
                                <TextInput
                                    id="username"
                                    type="text"
                                    placeholder="GitHub Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <TextInput
                                    id="accessToken"
                                    type="password"
                                    placeholder="GitHub Access Token"
                                    value={accessToken}
                                    onChange={(e) => setAccessToken(e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button color="dark" disabled={loading} onClick={handleSubmit}>Add Repository</Button>
                    <Button color="gray" onClick={() => setOpenModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default AddRepo;
