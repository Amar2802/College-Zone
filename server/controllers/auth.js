import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { OAuth2Client } from "google-auth-library";
import logger from "../utils/logger.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
    });

    if (user) {
      logger.info(`User registered: ${user.email}`);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      logger.info(`User logged in: ${user.email}`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.profile || {},
        profileCompleted: user.profileCompleted,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate with Google OAuth
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    res.status(400);
    return next(new Error("Google token is required"));
  }

  try {
    let email, name, googleId;

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    
    if (googleClientId && !googleClientId.startsWith("mock_")) {
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      
      if (!payload) {
        res.status(400);
        throw new Error("Google verification failed - empty payload");
      }

      email = payload.email;
      name = payload.name;
      googleId = payload.sub;
    } else {
      // Development mock decode
      const decoded = jwt.decode(token);
      if (decoded) {
        email = decoded.email;
        name = decoded.name || decoded.given_name;
        googleId = decoded.sub;
        logger.info(`Google Mock Login: Decoded token directly for ${email}`);
      } else {
        email = "google_mock_user@college.edu";
        name = "Google Mock Student";
        googleId = "mockgoogle12345";
        logger.warn("Google Mock Login: Used hardcoded fallback user");
      }
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        profile: {
          college: "",
          course: "",
          year: "",
        }
      });
    }

    logger.info(`Google Authentication success for: ${user.email}`);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      profile: user.profile || {},
      profileCompleted: user.profileCompleted,
      token: generateToken(user._id),
    });
  } catch (error) {
    logger.error(`Google authentication error: ${error.message}`);
    res.status(400);
    next(new Error(`Google authentication failed: ${error.message}`));
  }
};
