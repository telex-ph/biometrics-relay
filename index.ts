import express from "express";
import type { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.text({ type: "*/*" }));

app.post("/biometric/events", async (req: Request, res: Response) => {
  const TRACKIO_URL = process.env.TRACKIO_URL;
  if (!TRACKIO_URL)
    throw new Error("TRACKIO_URL environment variable is not defined");

  try {
    await axios.post(TRACKIO_URL, req.body, {
      headers: { "Content-Type": "text/plain" },
    });
    console.log("Event forwarded:", new Date().toISOString());
    res.send("OK");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Forward error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    res.send("OK");
  }
});

// Start server on port 80
app.listen(80, () => console.log("Relay running on port 80"));
