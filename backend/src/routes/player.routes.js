import express from "express";
import { param, query } from "express-validator";

import { comparePlayers, getPlayer, getPlayerProfile } from "../controllers/player.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../utils/validate-request.js";

const router = express.Router();

router.get(
  "/compare",
  requireAuth,
  [
    query("player1").trim().notEmpty().withMessage("player1 query parameter is required"),
    query("player2").trim().notEmpty().withMessage("player2 query parameter is required"),
    query("player2").custom((value, { req }) => {
      if (value === req.query.player1) {
        throw new Error("player1 and player2 must be different");
      }
      return true;
    }),
    validateRequest,
  ],
  comparePlayers,
);
router.get("/:id", requireAuth, [param("id").trim().notEmpty(), validateRequest], getPlayer);
router.get("/:id/profile", requireAuth, [param("id").trim().notEmpty(), validateRequest], getPlayerProfile);

export default router;
