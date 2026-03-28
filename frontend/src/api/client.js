const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export async function getHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

export async function getPlayerProfile(playerId) {
  return {
    player: {
      playerId,
      name: "Alex Mercer",
      team: "Northbridge FC",
      position: "CAM",
    },
    analytics: {
      overallRating: 84,
      attributes: {
        shooting: 78,
        passing: 88,
        dribbling: 83,
        defending: 65,
        creativity: 90,
        physical: 74,
      },
      playstyle: "Playmaker",
      ppi: 86,
      pressureIndex: 1.04,
      summary:
        "Alex Mercer is a high-involvement creator who sustains passing value, chance creation, and stable output late in close matches.",
    },
  };
}

