import express from "express";
import { param } from "express-validator";

import { getMatchAnalysis, simulateMatch } from "../controllers/match.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../utils/validate-request.js";

const router = express.Router();

router.get("/:id/analysis", requireAuth, [param("id").trim().notEmpty(), validateRequest], getMatchAnalysis);
router.post("/:id/simulate", requireAuth, [param("id").trim().notEmpty(), validateRequest], simulateMatch);

export default router;
