import { isDatabaseConnected } from "../config/db.js";

export const requireDatabase = (_req, res, next) => {
  if (isDatabaseConnected()) {
    return next();
  }

  return res.status(503).json({
    message: "Database unavailable",
  });
};

