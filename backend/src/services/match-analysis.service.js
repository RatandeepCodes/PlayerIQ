import { fetchMatchDirectory, fetchMatchMomentum, fetchMatchSimulation, fetchMatchTurningPoints } from "./ai.service.js";
import {
  getCachedMatchAnalysis,
  getCachedMatchMomentum,
  getCachedTurningPoints,
  saveMatchAnalysisCache,
  saveMatchMomentumCache,
  saveTurningPointsCache,
} from "./analytics-cache.service.js";

const normalizeBucketScores = (scores = []) => {
  if (Array.isArray(scores)) {
    return Object.fromEntries(scores.map((entry) => [entry.team, Number(entry.score || 0)]));
  }

  return Object.fromEntries(
    Object.entries(scores || {}).map(([team, score]) => [team, Number(score || 0)]),
  );
};

const toMinuteRangeLabel = (bucket) =>
  `${bucket.bucketStart ?? bucket.startMinute ?? 0}'-${bucket.bucketEnd ?? bucket.endMinute ?? 0}'`;

export const buildMomentumEnvelope = (matchId, momentum) => {
  const buckets = (momentum.buckets || []).map((bucket) => ({
    bucketStart: bucket.bucketStart ?? bucket.startMinute ?? 0,
    bucketEnd: bucket.bucketEnd ?? bucket.endMinute ?? 0,
    label: bucket.label || toMinuteRangeLabel(bucket),
    minuteMark: bucket.minuteMark ?? bucket.minute_mark ?? bucket.bucketStart ?? 0,
    scores: normalizeBucketScores(bucket.scores),
    leadingTeam: bucket.leadingTeam ?? bucket.leading_team ?? null,
    isSwing: Boolean(bucket.isSwing ?? bucket.swing),
    swingMagnitude: Number(bucket.swingMagnitude ?? bucket.swing_magnitude ?? 0),
    note: bucket.note ?? null,
  }));

  const swings = buckets.filter((bucket) => bucket.isSwing);
  const peakBucket = buckets.reduce((peak, bucket) => {
    const peakScore = peak ? Math.max(...Object.values(peak.scores || { default: -1 })) : -1;
    const bucketScore = Math.max(...Object.values(bucket.scores || { default: -1 }));
    return bucketScore > peakScore ? bucket : peak;
  }, null);

  return {
    matchId,
    teams: momentum.teams,
    bucketSizeMinutes: momentum.bucketSizeMinutes,
    buckets,
    summary: {
      totalBuckets: buckets.length,
      swingCount: swings.length,
      peakWindow: peakBucket
        ? {
            label: peakBucket.label,
            leader: peakBucket.leadingTeam,
            score: Math.max(...Object.values(peakBucket.scores || {})),
          }
        : null,
    },
  };
};

export const buildTurningPointsEnvelope = (matchId, turningPoints) => ({
  matchId,
  totalTurningPoints: (turningPoints.turningPoints || []).length,
  turningPoints: turningPoints.turningPoints || [],
});

export const buildMatchAnalysisEnvelope = (matchId, momentum, turningPoints) => {
  const momentumEnvelope = buildMomentumEnvelope(matchId, momentum);
  const turningPointEnvelope = buildTurningPointsEnvelope(matchId, turningPoints);

  return {
    matchId,
    teams: momentumEnvelope.teams,
    momentum: momentumEnvelope,
    momentumBuckets: momentumEnvelope.buckets,
    turningPoints: turningPointEnvelope,
    turningPointList: turningPointEnvelope.turningPoints,
    liveStatus: "ready",
    summary: {
      totalMomentumWindows: momentumEnvelope.summary.totalBuckets,
      totalTurningPoints: turningPointEnvelope.totalTurningPoints,
      swingMoments: momentumEnvelope.summary.swingCount,
    },
    overview: {
      teams: momentumEnvelope.teams,
      liveStatus: "ready",
      totalTurningPoints: turningPointEnvelope.totalTurningPoints,
      totalMomentumWindows: momentumEnvelope.summary.totalBuckets,
      swingMoments: momentumEnvelope.summary.swingCount,
    },
  };
};

export const buildMatchSimulationEnvelope = (matchId, simulation) => {
  const timeline = [...(simulation.timeline || [])].sort((left, right) => {
    const leftMinute = Number(left.minute || 0);
    const rightMinute = Number(right.minute || 0);
    if (leftMinute !== rightMinute) {
      return leftMinute - rightMinute;
    }

    const leftSecond = Number(left.second || 0);
    const rightSecond = Number(right.second || 0);
    return leftSecond - rightSecond;
  });

  return {
    ...simulation,
    matchId,
    timeline,
    controls: ["start", "pause", "resume", "reset", "speed", "stop"],
    summary: {
      totalEvents: timeline.length,
      firstMinute: timeline[0]?.minute ?? null,
      lastMinute: timeline.at(-1)?.minute ?? null,
    },
  };
};

export const getMatchMomentumData = async (matchId) => {
  try {
    const momentum = await fetchMatchMomentum(matchId);
    const envelope = buildMomentumEnvelope(matchId, momentum);
    await saveMatchMomentumCache(matchId, envelope, envelope.teams).catch(() => undefined);
    return envelope;
  } catch (error) {
    const cached = await getCachedMatchMomentum(matchId).catch(() => null);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const getMatchTurningPointsData = async (matchId) => {
  try {
    const turningPoints = await fetchMatchTurningPoints(matchId);
    const envelope = buildTurningPointsEnvelope(matchId, turningPoints);
    await saveTurningPointsCache(matchId, envelope).catch(() => undefined);
    return envelope;
  } catch (error) {
    const cached = await getCachedTurningPoints(matchId).catch(() => null);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const getMatchAnalysisData = async (matchId) => {
  try {
    const [momentum, turningPoints] = await Promise.all([
      fetchMatchMomentum(matchId),
      fetchMatchTurningPoints(matchId),
    ]);

    const envelope = buildMatchAnalysisEnvelope(matchId, momentum, turningPoints);
    await saveMatchAnalysisCache(matchId, envelope, envelope.teams).catch(() => undefined);
    return envelope;
  } catch (error) {
    const cached = await getCachedMatchAnalysis(matchId).catch(() => null);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const getMatchSimulationData = async (matchId) => {
  const simulation = await fetchMatchSimulation(matchId);
  return buildMatchSimulationEnvelope(matchId, simulation);
};

export const getMatchDirectoryData = async () => {
  const directory = await fetchMatchDirectory();
  return {
    matches: (directory.matches || []).map((match) => ({
      matchId: match.matchId,
      title: match.title,
      teams: match.teams || [],
      competition: match.competition,
      season: match.season,
      sources: match.sources || [],
    })),
  };
};
