import express from "express";
import { body, param } from "express-validator";

import {
  controlMatchSimulation,
  getHomeMatchFeed,
  getMatchAnalysis,
  listMatches,
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

router.get("/", requireAuth, listMatches);
router.get("/live-feed/home", requireAuth, getHomeMatchFeed);
router.get("/:id/analysis", requireAuth, matchIdValidation, getMatchAnalysis);
router.get("/:id/momentum", requireAuth, matchIdValidation, getMatchMomentum);
router.get("/:id/turning-points", requireAuth, matchIdValidation, getMatchTurningPoints);
router.post("/:id/simulate", requireAuth, matchIdValidation, startMatchSimulation);
router.get("/:id/simulation", requireAuth, matchIdValidation, getMatchSimulation);
router.post("/:id/simulation/control", requireAuth, simulationControlValidation, controlMatchSimulation);

export default router;
