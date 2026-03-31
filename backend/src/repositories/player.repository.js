import { isDatabaseConnected } from "../config/db.js";
import Player from "../models/Player.js";

const DEFAULT_DIRECTORY_LIMIT = 50;
const MAX_DIRECTORY_LIMIT = 100;

export const buildPlayerUpsertPayload = (profile) => ({
  playerId: profile.player.playerId,
  name: profile.player.name,
  team: profile.player.team,
  position: profile.player.position,
  nationality: profile.player.nationality,
  metadata: {
    ...(profile.metadata || {}),
    overview: profile.overview || {},
  },
});

export const findStoredPlayerById = async (playerId) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  return Player.findOne({ playerId }).lean();
};

export const upsertStoredPlayer = async (profile) => {
  if (!isDatabaseConnected() || !profile?.player?.playerId) {
    return null;
  }

  return Player.findOneAndUpdate(
    { playerId: profile.player.playerId },
    {
      $set: buildPlayerUpsertPayload(profile),
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();
};

export const listStoredPlayers = async ({ team, nationality, limit = DEFAULT_DIRECTORY_LIMIT } = {}) => {
  if (!isDatabaseConnected()) {
    return [];
  }

  const normalizedLimit = Math.min(Math.max(Number(limit) || DEFAULT_DIRECTORY_LIMIT, 1), MAX_DIRECTORY_LIMIT);
  const query = {};

  if (team) {
    query.team = team;
  }

  if (nationality) {
    query.nationality = nationality;
  }

  return Player.find(query).sort({ name: 1 }).limit(normalizedLimit).lean();
};
