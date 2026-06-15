import express from "express";
import {
  getProfile,
  updateProfile,
  updatePreferences,
  updatePrivacy,
  verifyProfile,
  uploadImage,
  deleteAccount,
} from "../controllers/profile.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import {
  updateProfileSchema,
  updatePreferencesSchema,
  updatePrivacySchema,
} from "../validators/profile.js";

const router = express.Router();

// Protect all profile endpoints
router.use(protect);

router.get("/", getProfile);
router.put("/", validate(updateProfileSchema), updateProfile);
router.put("/preferences", validate(updatePreferencesSchema), updatePreferences);
router.put("/privacy", validate(updatePrivacySchema), updatePrivacy);
router.put("/verify", verifyProfile);
router.post("/image", uploadImage);
router.delete("/", deleteAccount);

export default router;
