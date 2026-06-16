import express from "express";
import { getMe, getUsers, getStudyBuddies, getUserById } from "../controllers/users.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All user routes are protected

router.get("/me", getMe);
router.get("/", getUsers);
router.get("/study-buddies", getStudyBuddies);
router.get("/:userId", getUserById);

export default router;
