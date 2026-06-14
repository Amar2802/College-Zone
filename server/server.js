import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import messageRoutes from "./routes/messages.js";

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const userSockets = {};

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setup", (userId) => {
    socket.join(userId);
    userSockets[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
    socket.emit("connected");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    Object.keys(userSockets).forEach((userId) => {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        console.log(`Removed mapping for User ${userId}`);
      }
    });
  });
});

app.set("io", io);
app.set("userSockets", userSockets);

app.get("/", (req, res) => {
  res.send("College Zone API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
