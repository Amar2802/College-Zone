import jwt from "jsonwebtoken";
import User from "../models/User.js";
import logger from "../utils/logger.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        return next(new Error("Not authorized, user not found"));
      }

      return next();
    } catch (error) {
      logger.error(`Token verification failed: ${error.message}`);
      res.status(401);
      return next(new Error("Not authorized, token verification failed"));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error("Not authorized, no token provided"));
  }
};
