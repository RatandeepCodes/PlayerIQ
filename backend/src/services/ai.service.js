import axios from "axios";

import { env } from "../config/env.js";
import { createHttpError } from "../utils/http-error.js";

const aiClient = axios.create({
  baseURL: env.aiServiceUrl,
  timeout: 5000,
});

const normalizeAiError = (error, fallbackMessage) => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status;
    const message = error.response?.data?.detail || error.response?.data?.message || fallbackMessage;

    if (statusCode) {
      throw createHttpError(statusCode, message);
    }
  }

  throw createHttpError(502, fallbackMessage);
};

export const fetchPlayerProfile = async (playerId) => {
  try {
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
        nationality: rating.data.nationality || "Unknown",
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
  } catch (error) {
    normalizeAiError(error, "Player profile unavailable from AI service");
  }
};

export const fetchPlayerComparison = async (player1, player2) => {
  try {
    const response = await aiClient.get(`/compare/${player1}/${player2}`);
    return response.data;
  } catch (error) {
    normalizeAiError(error, "Player comparison unavailable from AI service");
  }
};
