import "./utils/config.js";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./utils/db.js";
import logger from "./utils/logger.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import messageRoutes from "./routes/messages.js";
import eventRoutes from "./routes/events.js";
import profileRoutes from "./routes/profile.js";


// Connect to MongoDB database
connectDB();

const app = express();
const server = http.createServer(app);

// Security Headers middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:5173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Socket.io integration
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const userSockets = {};

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on("setup", (userId) => {
    socket.join(userId);
    userSockets[userId] = socket.id;
    logger.info(`User ${userId} joined room and mapped to socket ${socket.id}`);
    socket.emit("connected");
  });

  socket.on("typing", (data) => {
    const { senderId, receiverId } = data;
    io.to(receiverId).emit("typing", { senderId });
  });

  socket.on("stop_typing", (data) => {
    const { senderId, receiverId } = data;
    io.to(receiverId).emit("stop_typing", { senderId });
  });

  socket.on("disconnect", () => {
    logger.info(`Socket disconnected: ${socket.id}`);
    Object.keys(userSockets).forEach((userId) => {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        logger.info(`Removed socket mapping for user ${userId}`);
      }
    });
  });
});

app.set("io", io);
app.set("userSockets", userSockets);

// Root default route
app.get("/", (req, res) => {
  res.send("College Zone API is running...");
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes with rate limiters
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/messages", apiLimiter, messageRoutes);
app.use("/api/events", apiLimiter, eventRoutes);
app.use("/api/profile", apiLimiter, profileRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
}

// Export server for integration testing
export { app, server };
export default server;
