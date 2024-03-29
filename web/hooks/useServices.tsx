import io from "socket.io-client";
import socketio from "@feathersjs/socketio-client";
import { useEffect, useMemo, useRef } from "react";
import { createClient } from "@/shared/BackendClient";
import { ClientApplication } from "backend/build/client";
import useAppState from "@/hooks/useAppStore";

function useServices() {
    const clientRef = useRef<ClientApplication | undefined>(undefined);

    const { userId } = useAppState();
    useEffect(() => {
        if (userId)
            clientRef.current = createClient(userId);
    }, [userId]);

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
