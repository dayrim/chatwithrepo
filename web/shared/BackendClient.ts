import { createClient as createFeathersClient } from "backend/build/client";
import io from "socket.io-client";
import socketio from "@feathersjs/socketio-client";

export const createClient = (userId: string) => {
  const options = {
    ...(userId ? { extraHeaders: { userId } } : {}),
  };

  const socket = io(process.env.NEXT_PUBLIC_API_URL || "", options);
  const transportConnection = socketio(socket);

  return createFeathersClient(transportConnection);
};
