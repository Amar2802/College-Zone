import winston from "winston";
import path from "path";

// Define log level based on environment
const level = process.env.NODE_ENV === "production" ? "info" : "debug";

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [${info.level.toUpperCase()}]: ${info.message}`
  )
);

const transports = [
  // Console logging
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize({ all: true }),
      winston.format.printf(
        (info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
      )
    ),
  }),
  // Error log file
  new winston.transports.File({
    filename: path.join("logs", "error.log"),
    level: "error",
    format,
  }),
  // Combined log file
  new winston.transports.File({
    filename: path.join("logs", "combined.log"),
    format,
  }),
];

const logger = winston.createLogger({
  level,
  transports,
});

export default logger;
