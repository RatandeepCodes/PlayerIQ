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

const fetchAiResource = async (method, path, fallbackMessage) => {
  try {
    const response = await aiClient.request({
      method,
      url: path,
    });
    return response.data;
  } catch (error) {
    normalizeAiError(error, fallbackMessage);
  }
};

const mapPlayerProfile = (playerId, rating, playstyle, pressure, report) => ({
  player: {
    playerId,
    name: rating.playerName,
    team: rating.team,
    position: rating.position,
    nationality: rating.nationality || "Unknown",
  },
  analytics: {
    overallRating: rating.overallRating,
    attributes: rating.attributes,
    playstyle: playstyle.playstyle,
    ppi: rating.ppi,
    pressureIndex: pressure.pressureIndex,
    summary: report.summary,
  },
});

export const fetchPlayerRating = async (playerId) =>
  fetchAiResource("get", `/rating/${playerId}`, "Player rating unavailable from AI service");

export const fetchPlayerPlaystyle = async (playerId) =>
  fetchAiResource("get", `/playstyle/${playerId}`, "Player playstyle unavailable from AI service");

export const fetchPlayerPressure = async (playerId) =>
  fetchAiResource("get", `/pressure/${playerId}`, "Player pressure analytics unavailable from AI service");

export const fetchPlayerReport = async (playerId) =>
  fetchAiResource("get", `/report/${playerId}`, "Player report unavailable from AI service");

export const fetchPlayerProfile = async (playerId) => {
  try {
    const [rating, playstyle, pressure, report] = await Promise.all([
      fetchAiResource("get", `/rating/${playerId}`, "Player profile unavailable from AI service"),
      fetchAiResource("get", `/playstyle/${playerId}`, "Player profile unavailable from AI service"),
      fetchAiResource("get", `/pressure/${playerId}`, "Player profile unavailable from AI service"),
      fetchAiResource("get", `/report/${playerId}`, "Player profile unavailable from AI service"),
    ]);

    return mapPlayerProfile(playerId, rating, playstyle, pressure, report);
  } catch (error) {
    normalizeAiError(error, "Player profile unavailable from AI service");
  }
};

export const fetchPlayerComparison = async (player1, player2) =>
  fetchAiResource("get", `/compare/${player1}/${player2}`, "Player comparison unavailable from AI service");

export const fetchMatchMomentum = async (matchId) =>
  fetchAiResource("get", `/match/${matchId}/momentum`, "Match momentum unavailable from AI service");

export const fetchMatchTurningPoints = async (matchId) =>
  fetchAiResource("get", `/match/${matchId}/turning-points`, "Turning points unavailable from AI service");

export const fetchMatchSimulation = async (matchId) =>
  fetchAiResource("post", `/simulate/match/${matchId}`, "Match simulation unavailable from AI service");
