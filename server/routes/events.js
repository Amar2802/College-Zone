import express from "express";
import Event from "../models/Event.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Create event
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, date, location } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    const college = req.user.profile?.college || "";
    if (!college) {
      return res.status(400).json({ message: "You must complete your profile (setup college) to create events" });
    }

    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: req.user._id,
      college,
      attendees: [req.user._id],
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all events for user's college
router.get("/", protect, async (req, res) => {
  try {
    const college = req.user.profile?.college || "";
    if (!college) {
      return res.json([]);
    }

    const events = await Event.find({ college })
      .populate("organizer", "name")
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// RSVP toggle
router.put("/:eventId/rsvp", protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const isAttending = event.attendees.includes(req.user._id);

    if (isAttending) {
      event.attendees = event.attendees.filter(
        (id) => id.toString() !== req.user._id.toString()
      );
    } else {
      event.attendees.push(req.user._id);
    }

    await event.save();
    
    const updatedEvent = await Event.findById(event._id).populate("organizer", "name");
    
    res.json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
