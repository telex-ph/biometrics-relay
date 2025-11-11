import express from "express";
import axios from "axios";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const logStream = fs.createWriteStream("relay.log", { flags: "a" });
const log = (msg: string, color: string = colors.white) => {
  const timestamp = new Date().toISOString();
  const coloredMsg = `${color}[${timestamp}] ${msg}${colors.reset}\n`;
  logStream.write(coloredMsg);
};

process.on("unhandledRejection", (err) => log(`Unhandled rejection: ${err}`, colors.red));
process.on("uncaughtException", (err) => log(`Uncaught exception: ${err}`, colors.red));

const app = express();
app.use(express.text({ type: "*/*" }));

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "success", message: "Relay is running", timestamp: new Date().toISOString() });
  log("Health check hit", colors.cyan);
});

app.post("/relay/events", (req, res) => {
  res.send("OK");

  const TRACKIO_URL = process.env.TRACKIO_URL;
  if (!TRACKIO_URL) {
    log("TRACKIO_URL not defined", colors.red);
    return;
  }

  axios.post(TRACKIO_URL, req.body, { timeout: 5000 })
    .then(() => log("Event forwarded", colors.green))
    .catch((err) => {
      if (axios.isAxiosError(err)) {
        log(`Forward error: ${err.message}`, colors.red);
      } else {
        log(`Unknown forward error: ${err}`, colors.red);
      }
    });
});

const PORT = Number(process.env.PORT) || 1111;
app.listen(PORT, () => log(`Relay running on port ${PORT}`, colors.yellow));
