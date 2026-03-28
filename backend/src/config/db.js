import mongoose from "mongoose";

import { env } from "./env.js";

mongoose.set("bufferCommands", false);

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
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
