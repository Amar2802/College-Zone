import Message from "../models/Message.js";
import logger from "../utils/logger.js";

// @desc    Get chat logs between current user and other user
// @route   GET /api/messages/:otherUserId
// @access  Private
export const getChatLogs = async (req, res, next) => {
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
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content, imageUrl } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      res.status(400);
      throw new Error("Receiver is required");
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content || "",
      imageUrl: imageUrl || undefined,
    });

    const io = req.app.get("io");
    const messageJSON = message.toJSON();
    if (io) {
      // Emit to receiver's room and sender's room for multi-device sync
      io.to(receiverId.toString()).emit("receive_message", messageJSON);
      io.to(senderId.toString()).emit("receive_message", messageJSON);
      logger.info(`Message emitted via sockets from ${senderId} to ${receiverId}`);
    }

    res.status(201).json(messageJSON);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/read/:senderId
// @access  Private
export const markRead = async (req, res, next) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      { sender: senderId, receiver: receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    const io = req.app.get("io");
    if (io) {
      // Notify sender that their messages to receiver are read
      io.to(senderId.toString()).emit("messages_read", { readerId: receiverId });
    }

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Mock image uploader
// @route   POST /api/messages/upload
// @access  Private
export const uploadImage = async (req, res, next) => {
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
    next(error);
  }
};
