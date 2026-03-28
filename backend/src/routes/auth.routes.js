import express from "express";
import { body } from "express-validator";

import { login, register } from "../controllers/auth.controller.js";
import { validateRequest } from "../utils/validate-request.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    validateRequest,
  ],
  register,
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty(), validateRequest],
  login,
);

export default router;

