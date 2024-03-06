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
        clientRef.current = createClient(userId);
    }, [userId]);

    const usersService = useMemo(() => clientRef.current && clientRef.current.service('users'), [clientRef.current]);
    const messagesService = useMemo(() => clientRef.current && clientRef.current.service('messages'), [clientRef.current]);
    const chatSessionService = useMemo(() => clientRef.current && clientRef.current.service('chat-session'), [clientRef.current]);

    return {
        client: clientRef.current,
        usersService,
        messagesService,
        chatSessionService
    };
}

export default useServices;
