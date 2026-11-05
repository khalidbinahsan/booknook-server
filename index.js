import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";

const app = express();
const port = process.env.PORT || 5000;

// ---------- Middleware ----------
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

// ---------- Routes ----------
app.get("/", (req, res) => {
  res.send({ message: "BookNook server is running" });
});

// ---------- Start ----------
async function start() {
  try {
    await connectDB();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }

  app.listen(port, () => {
    console.log(`BookNook server listening on port ${port}`);
  });
}

start();
