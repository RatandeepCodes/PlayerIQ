import axios from "axios";

import { env } from "../config/env.js";

const aiClient = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 5000,
});

export const fetchPlayerProfile = async (playerId) => {
  const [rating, playstyle, pressure, report] = await Promise.all([
    aiClient.get(`/rating/${playerId}`),
    aiClient.get(`/playstyle/${playerId}`),
    aiClient.get(`/pressure/${playerId}`),
    aiClient.get(`/report/${playerId}`),
  ]);

  return {
    player: {
      playerId,
      name: rating.data.playerName,
      team: rating.data.team,
      position: rating.data.position,
    },
    analytics: {
      overallRating: rating.data.overallRating,
      attributes: rating.data.attributes,
      playstyle: playstyle.data.playstyle,
      ppi: rating.data.ppi,
      pressureIndex: pressure.data.pressureIndex,
      summary: report.data.summary,
    },
  };
};

export const fetchPlayerComparison = async (player1, player2) => {
  const response = await aiClient.get(`/compare/${player1}/${player2}`);
  return response.data;
};

