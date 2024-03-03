
import { createClient } from "../../backend/build/client";
import io from "socket.io-client";
import socketio from "@feathersjs/socketio-client";
import { useMemo } from "react";
import { client } from "@/shared/BackendClient";

function useServices() {

    const usersService = useMemo(() => client.service('users'), [])
    const messagesService = useMemo(() => client.service('messages'), [])

    return {
        client,
        usersService,
        messagesService
    };
}

export default useServices;
