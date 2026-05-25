// src/config/db.js
import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      // mongoose 8+ no longer needs useNewUrlParser etc.
    });
    console.log("🗄️  MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
