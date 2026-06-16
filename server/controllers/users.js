import User from "../models/User.js";
import logger from "../utils/logger.js";

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users except current user
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// Helper to escape special characters for regex
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// @desc    Get study buddies (users at the same college)
// @route   GET /api/users/study-buddies
// @access  Private
export const getStudyBuddies = async (req, res, next) => {
  try {
    const college = req.user.profile?.college;
    if (!college) {
      res.status(400);
      throw new Error("Please complete your profile college details first");
    }
    const escapedCollege = escapeRegExp(college.trim());
    const users = await User.find({
      _id: { $ne: req.user._id },
      "profile.college": { $regex: new RegExp("^" + escapedCollege + "$", "i") }
    }).select("-password");
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get specific user profile by ID
// @route   GET /api/users/:userId
// @access  Private
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (user) {
      res.json(user);
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};
