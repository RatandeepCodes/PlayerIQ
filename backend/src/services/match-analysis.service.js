import { fetchMatchDirectory, fetchMatchMomentum, fetchMatchSimulation, fetchMatchTurningPoints } from "./ai.service.js";
import {
  getCachedMatchAnalysis,
  getCachedMatchMomentum,
  getCachedTurningPoints,
  saveMatchAnalysisCache,
  saveMatchMomentumCache,
  saveTurningPointsCache,
} from "./analytics-cache.service.js";

const SHOWCASE_MATCH_DIRECTORY = [
  {
    matchId: "ISL-2001",
    title: "Bengaluru FC vs Kerala Blasters",
    competition: "Indian Super League",
    season: "2025-26",
    teams: ["Bengaluru FC", "Kerala Blasters"],
    sources: ["kaggle_indian_players"],
  },
  {
    matchId: "SB-1001",
    title: "Barcelona vs Real Madrid",
    competition: "La Liga Showcase",
    season: "2025-26",
    teams: ["Barcelona", "Real Madrid"],
    sources: ["statsbomb_open_data"],
  },
];

const toMinuteRangeLabel = (bucket) => `${bucket.startMinute}'-${bucket.endMinute}'`;

export const buildMomentumEnvelope = (matchId, momentum) => {
  const buckets = (momentum.buckets || []).map((bucket) => ({
    ...bucket,
    label: toMinuteRangeLabel(bucket),
  }));

  const swings = buckets.filter((bucket) => bucket.isSwing);
  const peakBucket = buckets.reduce((peak, bucket) => {
    const peakScore = peak ? Math.max(...Object.values(peak.scores || {})) : -1;
    const bucketScore = Math.max(...Object.values(bucket.scores || {}));
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

export const getMatchDirectoryData = async () => {
  try {
    const directory = await fetchMatchDirectory();
    return {
      matches: directory.matches || [],
      metadata: {
        source: "ai-service",
        total: (directory.matches || []).length,
      },
    };
  } catch (_error) {
    return {
      matches: SHOWCASE_MATCH_DIRECTORY,
      metadata: {
        source: "showcase",
        total: SHOWCASE_MATCH_DIRECTORY.length,
      },
    };
  }
};

export const getMatchSimulationData = async (matchId) => {
  const simulation = await fetchMatchSimulation(matchId);
  return buildMatchSimulationEnvelope(matchId, simulation);
};
