import { fetchMatchMomentum, fetchMatchSimulation, fetchMatchTurningPoints } from "./ai.service.js";

export const buildMatchAnalysisEnvelope = (matchId, momentum, turningPoints) => ({
  matchId,
  teams: momentum.teams,
  momentum: momentum.buckets,
  turningPoints: turningPoints.turningPoints,
  liveStatus: "ready",
  summary: {
    totalMomentumWindows: momentum.buckets.length,
    totalTurningPoints: turningPoints.turningPoints.length,
  },
});

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
