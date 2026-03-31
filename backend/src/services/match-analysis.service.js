import { fetchMatchMomentum, fetchMatchTurningPoints } from "./ai.service.js";

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
    overview: {
      teams: momentumEnvelope.teams,
      liveStatus: "ready",
      totalTurningPoints: turningPointEnvelope.totalTurningPoints,
      totalMomentumWindows: momentumEnvelope.summary.totalBuckets,
      swingMoments: momentumEnvelope.summary.swingCount,
    },
    momentum: momentumEnvelope,
    turningPoints: turningPointEnvelope,
  };
};

export const getMatchMomentumData = async (matchId) => {
  const momentum = await fetchMatchMomentum(matchId);
  return buildMomentumEnvelope(matchId, momentum);
};

export const getMatchTurningPointsData = async (matchId) => {
  const turningPoints = await fetchMatchTurningPoints(matchId);
  return buildTurningPointsEnvelope(matchId, turningPoints);
};

export const getMatchAnalysisData = async (matchId) => {
  const [momentum, turningPoints] = await Promise.all([
    fetchMatchMomentum(matchId),
    fetchMatchTurningPoints(matchId),
  ]);

  return buildMatchAnalysisEnvelope(matchId, momentum, turningPoints);
};
