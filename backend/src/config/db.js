import mongoose from "mongoose";

import { env } from "./env.js";

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error.message);
    if (env.nodeEnv !== "production") {
      console.warn("Continuing without database connection in development mode");
      return;
    }
    throw error;
  }
};

