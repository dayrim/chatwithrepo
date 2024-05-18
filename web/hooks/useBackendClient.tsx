// ClientContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { createClient } from "@/shared/BackendClient";
import { ClientApplication } from 'backend/build/client'; // Assuming this path is correct
import useAppState from "@/hooks/useAppStore";
import { UserClientService } from 'backend/build/services/users/users.shared';
import { AuthenticationClient } from '@feathersjs/authentication-client/lib/core';
import { ChatSessionClientService } from 'backend/build/services/chat-sessions/chat-sessions.shared';
import { MessagesClientService } from 'backend/build/services/messages/messages.shared';
import { FeathersService } from '@feathersjs/feathers';
import { RepositoriesClientService } from 'backend/build/services/repositories/repositories.shared';
import { RespoitoryFilesClientService } from 'backend/build/services/respoitory-files/respoitory-files.shared';


interface ClientContextType {
    client?: ClientApplication;
    authService?: AuthenticationClient | undefined;
    usersService?: FeathersService<ClientApplication, UserClientService> | undefined;
    messagesService?: FeathersService<ClientApplication, MessagesClientService> | undefined;
    chatSessionsService?: FeathersService<ClientApplication, ChatSessionClientService> | undefined;
    repositoriesService?: FeathersService<ClientApplication, RepositoriesClientService> | undefined;
    repositoryFilesService?: FeathersService<ClientApplication, RespoitoryFilesClientService> | undefined;
}

const ClientContext = createContext<ClientContextType>({});

interface ClientProviderProps {
    children: ReactNode;
}

export const BackendClientProvider: React.FC<ClientProviderProps> = ({ children }) => {
    const { userId } = useAppState();
    const [client, setClient] = useState<ClientApplication | undefined>();

    useEffect(() => {
        if (userId) {
            // Initialize client only once when userId is set
            const newClient: ClientApplication = createClient(userId);
            setClient(newClient);
        }
    }, [userId]);

    const authService = useMemo(() => client?.authentication, [client]);
    const usersService = useMemo(() => client?.service('users'), [client]);
    const messagesService = useMemo(() => client?.service('messages'), [client]);
    const chatSessionsService = useMemo(() => client?.service('chatSessions'), [client]);
    const repositoriesService = useMemo(() => client?.service('repositories'), [client]);
    const repositoryFilesService = useMemo(() => client?.service('repositoryFiles'), [client]);

    return (
        <ClientContext.Provider value={{ client, authService, usersService, messagesService, chatSessionsService, repositoriesService, repositoryFilesService }}>
            {children}
        </ClientContext.Provider>
    );
};

export const useBackendClient = (): ClientContextType => useContext(ClientContext);

export default useBackendClient;
