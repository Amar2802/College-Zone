import logger from "../utils/logger.js";

// Not Found handler
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Central Error Handler
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  // Log error using Winston
  logger.error(`${statusCode} - ${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip} \nStack: ${err.stack}`);

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
