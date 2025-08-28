import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

app.use(express.json());

connectDB()

app.use("/api/v1/user", userRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));