import express from "express";
import { getMe, updateProfile, getUsers, getStudyBuddies, getUserById } from "../controllers/users.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { updateProfileSchema } from "../validators/users.js";

const router = express.Router();

router.use(protect); // All user routes are protected

router.get("/me", getMe);
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.get("/", getUsers);
router.get("/study-buddies", getStudyBuddies);
router.get("/:userId", getUserById);

export default router;
