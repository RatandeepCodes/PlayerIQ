import { fetchMatchMomentum, fetchMatchSimulation, fetchMatchTurningPoints } from "./ai.service.js";

export const getMatchAnalysisData = async (matchId) => {
  const [momentum, turningPoints] = await Promise.all([
    fetchMatchMomentum(matchId),
    fetchMatchTurningPoints(matchId),
  ]);

  return {
    matchId,
    teams: momentum.teams,
    momentum: momentum.buckets,
    turningPoints: turningPoints.turningPoints,
    liveStatus: "ready",
  };
};

export const getMatchSimulationData = async (matchId) => {
  const simulation = await fetchMatchSimulation(matchId);
  return {
    ...simulation,
    controls: ["start", "pause", "resume", "reset", "speed"],
  };
};
