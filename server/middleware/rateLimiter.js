import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

// Handler for when rate limit is exceeded
const limitHandler = (req, res, next, options) => {
  logger.warn(`Rate limit exceeded by IP: ${req.ip} on route ${req.originalUrl}`);
  res.status(options.statusCode).json({
    message: options.message,
  });
};

// Strict limiter for authentication routes (login/signup)
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many login/signup attempts, please try again after a minute",
  statusCode: 429,
  handler: limitHandler,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// General limiter for application API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  statusCode: 429,
  handler: limitHandler,
  standardHeaders: true,
  legacyHeaders: false,
});
