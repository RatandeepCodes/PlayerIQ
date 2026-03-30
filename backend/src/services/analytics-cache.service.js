import { isDatabaseConnected } from "../config/db.js";
import AnalyticsResult from "../models/AnalyticsResult.js";

const buildComparisonCacheKey = (player1, player2) => [player1, player2].sort().join("::");

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

  const record = await AnalyticsResult.findOne({ playerId }).lean();
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

  await AnalyticsResult.findOneAndUpdate(
    { playerId: profile.player.playerId },
    {
      $set: {
        playerSnapshot: profile.player,
        overview: profile.overview,
        analytics: profile.analytics,
        metadata: {
          ...(profile.metadata || {}),
          cache: {
            status: "fresh",
            storedAt: new Date().toISOString(),
          },
        },
        overallRating: profile.analytics.overallRating,
        attributes: profile.analytics.attributes,
        playstyle: profile.analytics.playstyle,
        ppi: profile.analytics.ppi,
        pressureIndex: profile.analytics.pressureIndex,
        report: profile.analytics.summary,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
};

export const getCachedComparison = async (player1, player2) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  const record = await AnalyticsResult.findOne({ playerId: player1 }).lean();
  const key = buildComparisonCacheKey(player1, player2);
  return record?.comparisonCache?.[key] || null;
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

  const update = {
    $set: {
      [`comparisonCache.${key}`]: cachedPayload,
    },
  };

  await Promise.all(
    [player1, player2].map((playerId) =>
      AnalyticsResult.findOneAndUpdate(
        { playerId },
        update,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        },
      ),
    ),
  );
};
