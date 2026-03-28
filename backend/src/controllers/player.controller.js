import { fetchPlayerComparison, fetchPlayerProfile } from "../services/ai.service.js";
import Player from "../models/Player.js";

const buildFallbackProfile = async (playerId) => {
  const player = await Player.findOne({ playerId }).lean();

  return {
    player: player || {
      playerId,
      name: "Unknown Player",
      team: "Unknown Team",
      position: "Unknown",
    },
    analytics: {
      overallRating: 74,
      attributes: {
        shooting: 71,
        passing: 78,
        dribbling: 76,
        defending: 64,
        creativity: 80,
        physical: 72,
      },
      playstyle: "Playmaker",
      ppi: 77,
      pressureIndex: 0.96,
      summary:
        "This player shows strong on-ball involvement, above-average passing value, and stable performance in balanced game states.",
    },
  };
};

export const getPlayer = async (req, res, next) => {
  try {
    const profile = await buildFallbackProfile(req.params.id);
    res.json(profile.player);
  } catch (error) {
    next(error);
  }
};

export const getPlayerProfile = async (req, res, next) => {
  try {
    const profile = await fetchPlayerProfile(req.params.id);
    res.json(profile);
  } catch (_error) {
    const fallbackProfile = await buildFallbackProfile(req.params.id);
    res.json(fallbackProfile);
  }
};

export const comparePlayers = async (req, res, next) => {
  try {
    const { player1, player2 } = req.query;
    const comparison = await fetchPlayerComparison(player1, player2);
    res.json(comparison);
  } catch (error) {
    next(error);
  }
};

