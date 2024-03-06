import { createClient as createFeathersClient } from "backend/build/client";
import io from "socket.io-client";
import socketio from "@feathersjs/socketio-client";

export const createClient = (userId: string) => {
  const options = {
    ...(userId ? { extraHeaders: { userId } } : {}), // Conditionally add extraHeaders
  };

  const socket = io(process.env.API_URL || "", options);
  const transportConnection = socketio(socket);

  return createFeathersClient(transportConnection);
};

// const socket = io(process.env.API_URL || "");
// const transportConnection = socketio(socket);

// export const client = createFeathersClient(transportConnection);
