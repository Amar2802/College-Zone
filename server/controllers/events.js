import Event from "../models/Event.js";
import logger from "../utils/logger.js";

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location } = req.body;

    const college = req.user.profile?.college || "";
    if (!college) {
      res.status(400);
      throw new Error("You must complete your profile (setup college) to create events");
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

    logger.info(`Event created: "${title}" by organizer ${req.user.email}`);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events for user's college
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res, next) => {
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
    next(error);
  }
};

// @desc    Toggle RSVP for an event
// @route   PUT /api/events/:eventId/rsvp
// @access  Private
export const rsvpEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      res.status(404);
      throw new Error("Event not found");
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
    logger.info(`RSVP toggled for event: ${event.title} by user ${req.user.email}`);

    const updatedEvent = await Event.findById(event._id).populate("organizer", "name");
    
    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};
