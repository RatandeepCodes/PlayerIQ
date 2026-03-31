import { logger } from "../utils/logger.js";

export const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (error, req, res, _next) => {
  if (!error?.isOperational) {
    logger.error("Unhandled backend error", {
      requestId: req.requestId,
      message: error?.message,
      stack: error?.stack,
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({
      message: "Resource already exists",
      requestId: req.requestId,
    });
  }

  if (error?.name === "ValidationError") {
    return res.status(400).json({
      message: error.message || "Validation failed",
      requestId: req.requestId,
    });
  }

  res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error",
    requestId: req.requestId,
  });
};
