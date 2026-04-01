import { fetchMatchMomentum, fetchMatchSimulation, fetchMatchTurningPoints } from "./ai.service.js";

const toMinuteRangeLabel = (bucket) => {
  if (bucket?.label) {
    return bucket.label;
  }

  const startMinute = bucket?.bucketStart ?? bucket?.startMinute ?? 0;
  const endMinute = bucket?.bucketEnd ?? bucket?.endMinute ?? startMinute + 4;
  return `${startMinute}-${endMinute}`;
};

const normalizeMomentumBucket = (bucket) => {
  const normalizedScores = Array.isArray(bucket?.scores)
    ? bucket.scores
    : Object.entries(bucket?.scores || {}).map(([team, score]) => ({ team, score }));

  return {
    ...bucket,
    bucketStart: bucket?.bucketStart ?? bucket?.startMinute ?? 0,
    bucketEnd: bucket?.bucketEnd ?? bucket?.endMinute ?? 0,
    label: toMinuteRangeLabel(bucket),
    scores: normalizedScores,
    isSwing: Boolean(bucket?.isSwing ?? bucket?.swing),
    swingMagnitude: Number(bucket?.swingMagnitude ?? 0),
  };
};

const countMomentumSwings = (buckets) => buckets.filter((bucket) => bucket.isSwing).length;

export const buildMatchAnalysisEnvelope = (matchId, momentum, turningPoints) => {
  const buckets = (momentum?.buckets || []).map(normalizeMomentumBucket);
  const turningPointList = turningPoints?.turningPoints || [];
  const teams = momentum?.teams || [];

  return {
    matchId,
    teams,
    momentum: buckets,
    momentumBuckets: buckets,
    turningPoints: turningPointList,
    turningPointList,
    liveStatus: "ready",
    summary: {
      totalMomentumWindows: buckets.length,
      totalTurningPoints: turningPointList.length,
      swingMoments: countMomentumSwings(buckets),
    },
    overview: {
      teams,
      liveStatus: "ready",
      totalMomentumWindows: buckets.length,
      totalTurningPoints: turningPointList.length,
      swingMoments: countMomentumSwings(buckets),
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

export const getMatchAnalysisData = async (matchId) => {
  const [momentum, turningPoints] = await Promise.all([
    fetchMatchMomentum(matchId),
    fetchMatchTurningPoints(matchId),
  ]);

  return buildMatchAnalysisEnvelope(matchId, momentum, turningPoints);
};

export const getMatchSimulationData = async (matchId) => {
  const simulation = await fetchMatchSimulation(matchId);
  return buildMatchSimulationEnvelope(matchId, simulation);
};
