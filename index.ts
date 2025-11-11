import express from "express";
import axios from "axios";
import winston from "winston";
import dotenv from "dotenv";

dotenv.config();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

const app = express();

app.use(express.text({ type: "*/*" }));

app.get("/", (_req, res) => {
  const ts = new Date().toISOString();
  res.json({
    status: "success",
    message: "Relay is running",
    timestamp: ts,
  });
  logger.info("Health check hit");
});

app.post("/relay/events", async (req, res) => {
  const TRACKIO_URL = process.env.TRACKIO_URL;

  if (!TRACKIO_URL) {
    logger.error("TRACKIO_URL is missing in .env");
    return res.status(500).send("Server configuration error");
  }

  try {
    await axios.post(TRACKIO_URL, req.body, {
      headers: { "Content-Type": "text/plain" },
      timeout: 8000,
    });

    logger.info("Event forwarded successfully");
  } catch (error) {
    logger.error(`Forwarding error: ${error.message}`);
  }

  res.send("OK");
});

const server = app.listen(1111, () => {
  logger.info("Relay running on port 1111");
});

process.on("SIGINT", () => {
  logger.warn("Shutting down relay...");

  server.close(() => {
    logger.info("Relay stopped cleanly");
    process.exit(0);
  });
});

process.on("uncaughtException", err => {
  logger.error(`Uncaught exception: ${err.message}`);
});

process.on("unhandledRejection", err => {
  logger.error(`Unhandled rejection: ${err}`);
});
