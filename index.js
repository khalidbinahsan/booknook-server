import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import booksRouter from "./routes/books.js";
import borrowsRouter from "./routes/borrows.js";

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

app.use("/books", booksRouter);
app.use("/borrows", borrowsRouter);

// ---------- 404 + error handler ----------
app.use((req, res) => {
  res.status(404).send({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).send({ message: "Invalid JSON body" });
  }
  res.status(500).send({ message: "Something went wrong on the server" });
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
