import { createClient } from "../../backend/build/client";
import io from "socket.io-client";
import socketio from "@feathersjs/socketio-client";

const socket = io(process.env.API_URL || "");
const transportConnection = socketio(socket);

// socket.on("connect", () => {
//   // Send a custom event with additional data
//   socket.emit("additionalData", { userId: "USER_ID", browser: "BROWSER_INFO" });
// });

export const client = createClient(transportConnection);
