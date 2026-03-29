import { fetchPlayerComparison } from "../services/ai.service.js";
import { getPlayerData, getPlayerProfileData } from "../services/player-profile.service.js";
import { createHttpError } from "../utils/http-error.js";

export const getPlayer = async (req, res, next) => {
  try {
    const player = await getPlayerData(req.params.id);
    res.json(player);
  } catch (error) {
    next(error);
  }
};

export const getPlayerProfile = async (req, res, next) => {
  try {
    const profile = await getPlayerProfileData(req.params.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const comparePlayers = async (req, res, next) => {
  try {
    const { player1, player2 } = req.query;
    if (!player1 || !player2) {
      throw createHttpError(400, "player1 and player2 query parameters are required");
    }
    const comparison = await fetchPlayerComparison(player1, player2);
    res.json(comparison);
  } catch (error) {
    next(error);
  }
};
