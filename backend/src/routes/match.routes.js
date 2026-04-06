import express from "express";
import { body, param, query } from "express-validator";

import {
  controlMatchSimulation,
  getHomeMatchFeed,
  getMatchAnalysis,
  getLiveMatchStatuses,
  listMatches,
  listUpcomingFixtures,
  getMatchMomentum,
  getMatchSimulation,
  getMatchTurningPoints,
  startMatchSimulation,
} from "../controllers/match.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../utils/validate-request.js";

const router = express.Router();
const matchIdValidation = [param("id").trim().notEmpty(), validateRequest];
const simulationControlValidation = [
  param("id").trim().notEmpty(),
  body("action")
    .trim()
    .isIn(["start", "pause", "resume", "step", "reset", "speed"])
    .withMessage("Unsupported simulation action"),
  body("speed")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Simulation speed must be a number greater than zero"),
  validateRequest,
];

router.get(
  "/",
  requireAuth,
  [
    query("limit").optional().isInt({ min: 1, max: 500 }).withMessage("limit must be between 1 and 500"),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be at least 1"),
    query("status").optional().isIn(["completed", "upcoming", "all"]).withMessage("status must be completed, upcoming, or all"),
    query("search").optional().trim(),
    query("competition").optional().trim(),
    validateRequest,
  ],
  listMatches,
);
router.get(
  "/live/fixtures",
  requireAuth,
  [
    query("limit").optional().isInt({ min: 1, max: 500 }).withMessage("limit must be between 1 and 500"),
    query("competition").optional().trim().isLength({ min: 2, max: 10 }).withMessage("competition must be a short code"),
    validateRequest,
  ],
  listUpcomingFixtures,
);
router.get(
  "/live/results",
  requireAuth,
  [
    query("limit").optional().isInt({ min: 1, max: 500 }).withMessage("limit must be between 1 and 500"),
    query("competition").optional().trim().isLength({ min: 2, max: 10 }).withMessage("competition must be a short code"),
    validateRequest,
  ],
  getLiveMatchStatuses,
);
router.get("/live-feed/home", requireAuth, getHomeMatchFeed);
router.get("/:id/analysis", requireAuth, matchIdValidation, getMatchAnalysis);
router.get("/:id/momentum", requireAuth, matchIdValidation, getMatchMomentum);
router.get("/:id/turning-points", requireAuth, matchIdValidation, getMatchTurningPoints);
router.post("/:id/simulate", requireAuth, matchIdValidation, startMatchSimulation);
router.get("/:id/simulation", requireAuth, matchIdValidation, getMatchSimulation);
router.post("/:id/simulation/control", requireAuth, simulationControlValidation, controlMatchSimulation);

export default router;
