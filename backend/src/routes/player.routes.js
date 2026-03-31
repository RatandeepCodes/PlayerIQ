import express from "express";
import { param, query } from "express-validator";

import { comparePlayers, getPlayer, getPlayerHistory, getPlayerProfile, listPlayers } from "../controllers/player.controller.js";
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
router.get(
  "/",
  requireAuth,
  [
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
    query("team").optional().trim(),
    query("nationality").optional().trim(),
    validateRequest,
  ],
  listPlayers,
);
router.get("/:id/history", requireAuth, [param("id").trim().notEmpty(), validateRequest], getPlayerHistory);
router.get("/:id", requireAuth, [param("id").trim().notEmpty(), validateRequest], getPlayer);
router.get("/:id/profile", requireAuth, [param("id").trim().notEmpty(), validateRequest], getPlayerProfile);

export default router;
