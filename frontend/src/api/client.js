const API_BASE_URL = import.meta.env.VITE_AI_BASE_URL || "http://127.0.0.1:8000";

async function apiRequest(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.detail || payload?.message || "Request failed");
  }

  return payload;
}

export async function getHealth() {
  return apiRequest("/health");
}

export async function getPlayers() {
  return apiRequest("/players");
}

export async function getMatches() {
  return apiRequest("/matches");
}

export async function getPlayerProfile(playerId) {
  const [rating, playstyle, pressure, report] = await Promise.all([
    apiRequest(`/rating/${playerId}`),
    apiRequest(`/playstyle/${playerId}`),
    apiRequest(`/pressure/${playerId}`),
    apiRequest(`/report/${playerId}`),
  ]);

  return {
    player: {
      playerId: rating.playerId,
      name: rating.playerName,
      team: rating.team,
      nationality: rating.nationality,
      position: rating.position,
    },
    analytics: {
      overallRating: rating.overallRating,
      attributes: rating.attributes,
      playstyle: playstyle.playstyle,
      ppi: rating.ppi,
      pressureIndex: pressure.pressureIndex,
      pressure: {
        score: pressure.pressureScore,
        events: pressure.pressureEvents,
        note: pressure.interpretation,
      },
      summary: report.summary,
      strengths: report.strengths,
      developmentAreas: report.developmentAreas,
      matchesAnalyzed: rating.matchesAnalyzed,
    },
  };
}

export async function getPlayerComparison(player1, player2) {
  return apiRequest(`/compare/${player1}/${player2}`);
}

export async function getMatchAnalysis(matchId) {
  const [momentum, turningPoints] = await Promise.all([
    apiRequest(`/match/${matchId}/momentum`),
    apiRequest(`/match/${matchId}/turning-points`),
  ]);

  const title = momentum.teams?.length ? momentum.teams.join(" vs ") : `Match ${matchId}`;

  return {
    matchId,
    title,
    teams: momentum.teams || [],
    momentumBuckets: momentum.buckets || [],
    turningPoints: turningPoints.turningPoints || [],
    summary: {
      totalMomentumWindows: (momentum.buckets || []).length,
      totalTurningPoints: (turningPoints.turningPoints || []).length,
      swingMoments: (momentum.buckets || []).filter((bucket) => bucket.swing).length,
    },
  };
}
