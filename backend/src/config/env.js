import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/playeriq",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  footballDataApiToken: process.env.FOOTBALL_DATA_API_TOKEN || "",
};

export const isDefaultJwtSecret = () => env.jwtSecret === "change-me";

export const getRuntimeWarnings = () => {
  const warnings = [];

  if (isDefaultJwtSecret()) {
    warnings.push({
      code: "default-jwt-secret",
      message: "JWT secret is using the development fallback value.",
    });
  }

  return warnings;
};
