import express from "express";
import { signup, login, googleLogin } from "../controllers/auth.js";
import validate from "../middleware/validate.js";
import { signupSchema, loginSchema } from "../validators/auth.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/google", googleLogin); // Google verification does validation internally, but let's keep it safe.

export default router;
