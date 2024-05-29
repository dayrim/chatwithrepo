import { useEffect, useMemo, useRef } from "react";
import useAppState from "@/hooks/useAppStore";
import { createClient } from "@/shared/BackendClient";
import { ClientApplication } from "backend/build/client";

function useServices() {
    const clientRef = useRef<ClientApplication | undefined>(undefined);
    const lastUserIdRef = useRef<string | undefined>(undefined); // Ref to keep track of the last userId

    const { userId } = useAppState();

    useEffect(() => {
        // Check if userId is defined and different from the last userId
        if (userId && userId !== lastUserIdRef.current) {

            clientRef.current = createClient(userId);
            lastUserIdRef.current = userId; // Update the last userId ref
        }
    }, [userId]); // Dependency array includes only userId

    const usersService = useMemo(() => clientRef.current && clientRef.current.service('users'), [clientRef.current]);
    const messagesService = useMemo(() => clientRef.current && clientRef.current.service('messages'), [clientRef.current]);
    const chatSessionsService = useMemo(() => clientRef.current && clientRef.current.service('chatSessions'), [clientRef.current]);
    const authService = useMemo(() => clientRef.current && clientRef.current.authentication, [clientRef.current]);

    return {
        client: clientRef.current,
        authService,
        usersService,
        messagesService,
        chatSessionsService
    };
}

export default useServices;
