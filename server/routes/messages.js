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
    const { receiverId, content, imageUrl } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver is required" });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content || "",
      imageUrl: imageUrl || undefined,
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

// Mark messages as read
router.put("/read/:senderId", protect, async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      { sender: senderId, receiver: receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    const io = req.app.get("io");
    if (io) {
      const userSockets = req.app.get("userSockets") || {};
      const senderSocketId = userSockets[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages_read", { readerId: receiverId });
      }
    }

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Mock image uploader
router.post("/upload", protect, async (req, res) => {
  try {
    const images = [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    res.json({ imageUrl: randomImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
