import express from "express";
import Message from "../models/Message.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get chat logs
router.get("/:otherUserId", protect, async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Send message
router.post("/", protect, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!content || !receiverId) {
      return res.status(400).json({ message: "Receiver and content are required" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    const io = req.app.get("io");
    if (io) {
      const userSockets = req.app.get("userSockets") || {};
      const receiverSocketId = userSockets[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }
    }

    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
