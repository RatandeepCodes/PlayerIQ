import { isDatabaseConnected } from "../config/db.js";
import {
  buildComparisonCacheKey,
  findComparisonRecord,
  findMatchSnapshotRecord,
  findPlayerProfileRecord,
  saveComparisonRecord,
  saveMatchSnapshotRecord,
  savePlayerProfileRecord,
} from "../repositories/analytics.repository.js";

const buildCachedMetadata = (record) => ({
  ...(record?.metadata || {}),
  cache: {
    status: "cached",
    storedAt: record?.updatedAt?.toISOString?.() || record?.updatedAt || null,
  },
});

export const getCachedPlayerProfile = async (playerId) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  const record = await findPlayerProfileRecord(playerId);
  if (!record?.playerSnapshot || !record?.analytics) {
    return null;
  }

  return {
    player: record.playerSnapshot,
    overview: record.overview || {},
    analytics: {
      ...(record.analytics || {}),
      availability: {
        ...(record.analytics?.availability || {}),
        sourceMode: "cache",
      },
    },
    metadata: buildCachedMetadata(record),
  };
};

export const savePlayerProfileCache = async (profile) => {
  if (!isDatabaseConnected()) {
    return;
  }

  await savePlayerProfileRecord({
    ...profile,
    metadata: {
      ...(profile.metadata || {}),
      cache: {
        status: "fresh",
        storedAt: new Date().toISOString(),
      },
    },
  });
};

export const getCachedComparison = async (player1, player2) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  const record = await findComparisonRecord(player1, player2);
  return record?.payload || null;
};

export const saveComparisonCache = async (player1, player2, comparison) => {
  if (!isDatabaseConnected()) {
    return;
  }

  const key = buildComparisonCacheKey(player1, player2);
  const cachedPayload = {
    ...comparison,
    cache: {
      status: "fresh",
      storedAt: new Date().toISOString(),
    },
  };

  await saveComparisonRecord(player1, player2, cachedPayload);
};

const getCachedMatchSnapshot = async (matchId, snapshotType) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  const record = await findMatchSnapshotRecord(matchId, snapshotType);
  return record?.payload || null;
};

const saveCachedMatchSnapshot = async (matchId, snapshotType, payload, teams = []) => {
  if (!isDatabaseConnected()) {
    return;
  }

  await saveMatchSnapshotRecord(matchId, snapshotType, payload, teams);
};

export const getCachedMatchAnalysis = async (matchId) => getCachedMatchSnapshot(matchId, "analysis");
export const saveMatchAnalysisCache = async (matchId, payload, teams = []) =>
  saveCachedMatchSnapshot(matchId, "analysis", payload, teams);

export const getCachedMatchMomentum = async (matchId) => getCachedMatchSnapshot(matchId, "momentum");
export const saveMatchMomentumCache = async (matchId, payload, teams = []) =>
  saveCachedMatchSnapshot(matchId, "momentum", payload, teams);

export const getCachedTurningPoints = async (matchId) => getCachedMatchSnapshot(matchId, "turning-points");
export const saveTurningPointsCache = async (matchId, payload, teams = []) =>
  saveCachedMatchSnapshot(matchId, "turning-points", payload, teams);
