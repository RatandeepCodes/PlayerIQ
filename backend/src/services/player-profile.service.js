import Player from "../models/Player.js";
import { fetchPlayerProfile } from "./ai.service.js";
import { createHttpError } from "../utils/http-error.js";

const buildStoredPlayerProfile = (player) => ({
  player: {
    playerId: player.playerId,
    name: player.name,
    team: player.team || "Unknown Team",
    position: player.position || "Unknown",
    nationality: player.nationality || "Unknown",
  },
  analytics: null,
});

const mergeStoredPlayer = (storedPlayer, aiProfile) => {
  if (!storedPlayer) {
    return aiProfile;
  }

  return {
    player: {
      playerId: aiProfile.player.playerId,
      name: storedPlayer.name || aiProfile.player.name,
      team: storedPlayer.team || aiProfile.player.team,
      position: storedPlayer.position || aiProfile.player.position,
      nationality: storedPlayer.nationality || aiProfile.player.nationality || "Unknown",
    },
    analytics: aiProfile.analytics,
  };
};

export const getPlayerProfileData = async (playerId) => {
  const [storedPlayerResult, aiProfileResult] = await Promise.allSettled([
    Player.findOne({ playerId }).lean(),
    fetchPlayerProfile(playerId),
  ]);

  const storedPlayer = storedPlayerResult.status === "fulfilled" ? storedPlayerResult.value : null;

  if (aiProfileResult.status === "fulfilled") {
    return mergeStoredPlayer(storedPlayer, aiProfileResult.value);
  }

  const upstreamError = aiProfileResult.reason;
  if (upstreamError?.statusCode === 404 && storedPlayer) {
    return buildStoredPlayerProfile(storedPlayer);
  }

  if (storedPlayer) {
    return buildStoredPlayerProfile(storedPlayer);
  }

  if (upstreamError?.statusCode === 404) {
    throw createHttpError(404, `Player '${playerId}' not found`);
  }

  throw createHttpError(502, "Player analytics service unavailable");
};

export const getPlayerData = async (playerId) => {
  const profile = await getPlayerProfileData(playerId);
  return profile.player;
};
