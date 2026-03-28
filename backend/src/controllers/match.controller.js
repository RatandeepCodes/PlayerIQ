const sampleTimeline = [
  { minute: 12, team: "Home", intensity: 48, note: "Pressing sequence" },
  { minute: 38, team: "Away", intensity: 67, note: "xG spike from transition" },
  { minute: 73, team: "Home", intensity: 84, note: "Momentum swing after turnovers" },
];

export const getMatchAnalysis = async (req, res) => {
  res.json({
    matchId: req.params.id,
    turningPoints: sampleTimeline,
    liveStatus: "ready",
  });
};

export const simulateMatch = async (req, res) => {
  res.json({
    matchId: req.params.id,
    status: "simulation-started",
    controls: ["start", "pause", "resume", "reset", "speed"],
  });
};

