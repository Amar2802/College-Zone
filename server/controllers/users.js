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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
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
      logger.info(`Profile updated for user: ${user.email}`);
      res.json(updatedUser);
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
    const users = await User.find({
      _id: { $ne: req.user._id },
      "profile.college": { $regex: new RegExp("^" + college.trim() + "$", "i") }
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
