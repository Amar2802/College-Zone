import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Get current user profile
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.profile.college = req.body.college !== undefined ? req.body.college : user.profile.college;
      user.profile.course = req.body.course !== undefined ? req.body.course : user.profile.course;
      user.profile.year = req.body.year !== undefined ? req.body.year : user.profile.year;
      user.profile.sleep_schedule = req.body.sleep_schedule !== undefined ? req.body.sleep_schedule : user.profile.sleep_schedule;
      user.profile.cleanliness = req.body.cleanliness !== undefined ? req.body.cleanliness : user.profile.cleanliness;
      user.profile.study_habits = req.body.study_habits !== undefined ? req.body.study_habits : user.profile.study_habits;
      user.profile.smoking_drinking = req.body.smoking_drinking !== undefined ? req.body.smoking_drinking : user.profile.smoking_drinking;

      if (req.body.name) user.name = req.body.name;
      if (req.body.phone) user.phone = req.body.phone;

      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get all users except me
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get study buddies (same college)
router.get("/study-buddies", protect, async (req, res) => {
  try {
    const college = req.user.profile?.college;
    if (!college) {
      return res.status(400).json({ message: "Please complete your profile college details first" });
    }
    const users = await User.find({
      _id: { $ne: req.user._id },
      "profile.college": { $regex: new RegExp("^" + college.trim() + "$", "i") }
    }).select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

// Get specific user by ID
router.get("/:userId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
