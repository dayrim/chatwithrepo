import { createClient } from "../../backend/build/client";
import io from "socket.io-client";
import socketio from "@feathersjs/socketio-client";

const socket = io("http://localhost:3030/");
export const client = createClient(socketio(socket));
