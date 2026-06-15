import { io } from "socket.io-client";
const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
let socket = null;
export const initiateSocketConnection = userId => {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    transports: ["websocket"]
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