import { isDatabaseConnected } from "../config/db.js";
import AnalyticsResult from "../models/AnalyticsResult.js";

const PLAYER_PROFILE_RECORD = "player-profile";
const COMPARISON_RECORD = "comparison";
const MATCH_ANALYSIS_RECORD = "match-analysis";

export const buildComparisonCacheKey = (player1, player2) => [player1, player2].sort().join("::");
export const buildMatchSnapshotCacheKey = (matchId, snapshotType) => `${snapshotType}::${matchId}`;

export const buildProfileHistoryEntry = (profile) => ({
  capturedAt: new Date().toISOString(),
  overallRating: profile?.analytics?.overallRating ?? null,
  ppi: profile?.analytics?.ppi ?? null,
  pressureIndex: profile?.analytics?.pressureIndex ?? null,
  playstyle: profile?.analytics?.playstyle ?? null,
});

export const findPlayerProfileRecord = async (playerId) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  return AnalyticsResult.findOne({
    recordType: PLAYER_PROFILE_RECORD,
    playerId,
  }).lean();
};

export const savePlayerProfileRecord = async (profile) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  return AnalyticsResult.findOneAndUpdate(
    {
      recordType: PLAYER_PROFILE_RECORD,
      playerId: profile.player.playerId,
    },
    {
      $set: {
        cacheKey: profile.player.playerId,
        playerId: profile.player.playerId,
        playerSnapshot: profile.player,
        overview: profile.overview,
        analytics: profile.analytics,
        metadata: profile.metadata,
        payload: profile,
        overallRating: profile.analytics.overallRating,
        attributes: profile.analytics.attributes,
        playstyle: profile.analytics.playstyle,
        ppi: profile.analytics.ppi,
        pressureIndex: profile.analytics.pressureIndex,
        report: profile.analytics.summary,
      },
      $push: {
        timeSeries: {
          $each: [buildProfileHistoryEntry(profile)],
          $slice: -25,
        },
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();
};

export const findPlayerHistory = async (playerId) => {
  const record = await findPlayerProfileRecord(playerId);
  return record?.timeSeries || [];
};

export const findComparisonRecord = async (player1, player2) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  return AnalyticsResult.findOne({
    recordType: COMPARISON_RECORD,
    cacheKey: buildComparisonCacheKey(player1, player2),
  }).lean();
};

export const saveComparisonRecord = async (player1, player2, comparison) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  return AnalyticsResult.findOneAndUpdate(
    {
      recordType: COMPARISON_RECORD,
      cacheKey: buildComparisonCacheKey(player1, player2),
    },
    {
      $set: {
        cacheKey: buildComparisonCacheKey(player1, player2),
        players: [player1, player2],
        payload: comparison,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();
};

export const findMatchSnapshotRecord = async (matchId, snapshotType) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  return AnalyticsResult.findOne({
    recordType: MATCH_ANALYSIS_RECORD,
    cacheKey: buildMatchSnapshotCacheKey(matchId, snapshotType),
  }).lean();
};

export const saveMatchSnapshotRecord = async (matchId, snapshotType, payload, teams = []) => {
  if (!isDatabaseConnected()) {
    return null;
  }

  return AnalyticsResult.findOneAndUpdate(
    {
      recordType: MATCH_ANALYSIS_RECORD,
      cacheKey: buildMatchSnapshotCacheKey(matchId, snapshotType),
    },
    {
      $set: {
        cacheKey: buildMatchSnapshotCacheKey(matchId, snapshotType),
        recordType: MATCH_ANALYSIS_RECORD,
        snapshotType,
        matchId,
        players: teams,
        payload,
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();
};
