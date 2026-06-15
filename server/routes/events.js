import express from "express";
import { createEvent, getEvents, rsvpEvent } from "../controllers/events.js";
import { protect } from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import { createEventSchema } from "../validators/events.js";

const router = express.Router();

router.use(protect); // All event routes are protected

router.post("/", validate(createEventSchema), createEvent);
router.get("/", getEvents);
router.put("/:eventId/rsvp", rsvpEvent);

export default router;
