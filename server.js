import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";

import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import dotenv from 'dotenv';

dotenv.config()

const app = express();

// Basic security middleware
app.use(helmet());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// CORS — configure origins in production
app.use(cors({
  origin: process.env.CORS_ORIGIN || "*",
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || `${15 * 60 * 1000}`, 10),
  max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Routes
app.use("/api", userRoutes);

// Health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Start
const PORT = process.env.PORT || 4000;
(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
})();
