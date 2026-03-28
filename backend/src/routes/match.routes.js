import express from "express";

import { getMatchAnalysis, simulateMatch } from "../controllers/match.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id/analysis", requireAuth, getMatchAnalysis);
router.post("/:id/simulate", requireAuth, simulateMatch);

export default router;

