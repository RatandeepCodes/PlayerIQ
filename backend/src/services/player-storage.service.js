import { isDatabaseConnected } from "../config/db.js";
import { findPlayerHistory, findPlayerProfileRecord } from "../repositories/analytics.repository.js";
import { listStoredPlayers } from "../repositories/player.repository.js";

export const getStoredPlayerDirectory = async ({ team, nationality, limit } = {}) => {
  const players = await listStoredPlayers({ team, nationality, limit });

  return {
    players,
    metadata: {
      database: isDatabaseConnected() ? "connected" : "disconnected",
      total: players.length,
      filters: {
        team: team || null,
        nationality: nationality || null,
        limit: Number(limit) || 50,
      },
    },
  };
};

export const getPlayerAnalyticsHistory = async (playerId) => {
  const record = await findPlayerProfileRecord(playerId);
  const snapshots = await findPlayerHistory(playerId);

  return {
    playerId,
    snapshots,
    metadata: {
      database: isDatabaseConnected() ? "connected" : "disconnected",
      hasSnapshotRecord: Boolean(record),
      totalSnapshots: snapshots.length,
      lastCapturedAt: snapshots.at(-1)?.capturedAt || null,
    },
  };
};
