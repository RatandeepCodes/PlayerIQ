import express from "express";

import { comparePlayers, getPlayer, getPlayerProfile } from "../controllers/player.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/compare", requireAuth, comparePlayers);
router.get("/:id", requireAuth, getPlayer);
router.get("/:id/profile", requireAuth, getPlayerProfile);

export default router;
