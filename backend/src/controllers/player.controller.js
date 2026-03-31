import { getPlayerComparisonData } from "../services/player-comparison.service.js";
import { getPlayerData, getPlayerProfileData } from "../services/player-profile.service.js";
import { getPlayerAnalyticsHistory, getStoredPlayerDirectory } from "../services/player-storage.service.js";

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
    const comparison = await getPlayerComparisonData(player1, player2);
    res.json(comparison);
  } catch (error) {
    next(error);
  }
};

export const listPlayers = async (req, res, next) => {
  try {
    const directory = await getStoredPlayerDirectory(req.query);
    res.json(directory);
  } catch (error) {
    next(error);
  }
};

export const getPlayerHistory = async (req, res, next) => {
  try {
    const history = await getPlayerAnalyticsHistory(req.params.id);
    res.json(history);
  } catch (error) {
    next(error);
  }
};
