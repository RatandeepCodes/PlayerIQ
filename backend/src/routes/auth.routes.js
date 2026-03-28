import express from "express";
import { body } from "express-validator";

import { getCurrentUser, login, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireDatabase } from "../middleware/db.middleware.js";
import { validateRequest } from "../utils/validate-request.js";

const router = express.Router();

router.post(
  "/register",
  requireDatabase,
  [
    body("name").trim().isLength({ min: 2, max: 80 }),
    body("email").trim().isEmail().normalizeEmail(),
    body("password").isLength({ min: 8, max: 128 }),
    validateRequest,
  ],
  register,
);

router.post(
  "/login",
  requireDatabase,
  [body("email").trim().isEmail().normalizeEmail(), body("password").notEmpty(), validateRequest],
  login,
);

router.get("/me", requireAuth, requireDatabase, getCurrentUser);

export default router;
