import mongoose from "mongoose";

import { env } from "./env.js";
import { logger } from "../utils/logger.js";

mongoose.set("bufferCommands", false);

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;

export const connectDatabase = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info("MongoDB connected", { mongoUri: env.mongoUri });
  } catch (error) {
    logger.error("MongoDB connection failed", { message: error.message, mongoUri: env.mongoUri });
    if (env.nodeEnv !== "production") {
      logger.warn("Continuing without database connection in development mode");
      return;
    }
    throw error;
  }
};
