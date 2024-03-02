
import { createClient } from "../../backend/build/client";
import io from "socket.io-client";
import socketio from "@feathersjs/socketio-client";
import { useMemo } from "react";
import { feathers } from '@feathersjs/feathers'

const socket = io("http://localhost:3030/");
// const client = feathers().configure(socketio(socket))
const client = createClient(socketio(socket));

function useServices() {

    const usersService = useMemo(() => client.service('users'), [])
    const messagesService = useMemo(() => client.service('messages'), [])

    return {
        usersService,
        messagesService
    };
}

export default useServices;
