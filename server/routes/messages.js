import express from "express";
import { getChatLogs, sendMessage, markRead, uploadImage } from "../controllers/messages.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { sendMessageSchema } from "../validators/messages.js";

const router = express.Router();

router.use(protect); // All message routes are protected

router.get("/:otherUserId", getChatLogs);
router.post("/", validate(sendMessageSchema), sendMessage);
router.put("/read/:senderId", markRead);
router.post("/upload", uploadImage);

export default router;
