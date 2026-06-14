import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const initiateSocketConnection = (userId: string) => {
  if (socket) return socket;
  
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
  });
  
  console.log("Connecting socket...");
  
  socket.emit("setup", userId);
  
  socket.on("connected", () => {
    console.log("Socket connected successfully");
  });

  return socket;
};

export const disconnectSocket = () => {
  console.log("Disconnecting socket...");
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
