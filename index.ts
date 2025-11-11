import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(express.text({ type: "*/*" }));

app.use((req, res, next) => {
  res.setHeader("Connection", "close");
  next();
});

app.get("/", (_req, res) => {
  const timestamp = new Date().toISOString();
  res.json({
    status: "success",
    message: "Relay is running",
    timestamp,
  });
  console.log("Test endpoint hit:", timestamp);
});

app.post("/relay/events", async (req, res) => {
  const TRACKIO_URL = process.env.TRACKIO_URL;
  if (!TRACKIO_URL) {
    console.error("TRACKIO_URL missing");
    return res.status(500).send("Config error");
  }

  try {
    await axios.post(TRACKIO_URL, req.body, {
      headers: { "Content-Type": "text/plain" },
    });
    console.log("Event forwarded:", new Date().toISOString());
  } catch (err) {
    console.error("Forward error:", err);
  }

  res.send("OK");
});

// Start server
const server = app.listen(1111, () => {
  console.log("Relay running on port 1111");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down relay...");
  server.close(() => {
    console.log("Relay stopped cleanly");
    process.exit(0);
  });
});

// Global crash handlers
process.on("uncaughtException", err => console.error("Uncaught:", err));
process.on("unhandledRejection", err => console.error("Unhandled:", err));
