import express from "express";
import { param } from "express-validator";

import { comparePlayers, getPlayer, getPlayerProfile } from "../controllers/player.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validateRequest } from "../utils/validate-request.js";

const router = express.Router();

router.get("/compare", requireAuth, comparePlayers);
router.get("/:id", requireAuth, [param("id").trim().notEmpty(), validateRequest], getPlayer);
router.get("/:id/profile", requireAuth, [param("id").trim().notEmpty(), validateRequest], getPlayerProfile);

export default router;
