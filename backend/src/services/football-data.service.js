import axios from "axios";

import { env, hasFootballDataToken } from "../config/env.js";
import { logger } from "../utils/logger.js";

const footballDataClient = axios.create({
  baseURL: env.footballDataApiBaseUrl,
  timeout: 8000,
  headers: hasFootballDataToken()
    ? {
        "X-Auth-Token": env.footballDataApiToken,
      }
    : {},
});

const normalizeFootballDataError = (error, fallbackMessage) => {
  if (axios.isAxiosError(error)) {
    return {
      status: "offline",
      message: error.response?.data?.message || error.message || fallbackMessage,
      statusCode: error.response?.status || 502,
    };
  }

  return {
    status: "offline",
    message: fallbackMessage,
    statusCode: 502,
  };
};

export const isFootballDataConfigured = () => hasFootballDataToken();

export const getFootballDataHealth = async () => {
  if (!hasFootballDataToken()) {
    return {
      status: "offline",
      detail: {
        message: "Football-data token is not configured",
      },
    };
  }

  try {
    const response = await footballDataClient.get("/competitions", {
      params: { limit: 1 },
    });

    return {
      status: "online",
      detail: {
        message: "football-data.org reachable",
        competitionsCount: Array.isArray(response.data?.competitions) ? response.data.competitions.length : 0,
      },
    };
  } catch (error) {
    const normalized = normalizeFootballDataError(error, "football-data.org unavailable");
    return {
      status: normalized.status,
      detail: {
        message: normalized.message,
        statusCode: normalized.statusCode,
      },
    };
  }
};

export const fetchFootballDataResource = async (path, params = {}, fallbackMessage = "football-data.org unavailable") => {
  if (!hasFootballDataToken()) {
    throw new Error("Football-data token is not configured");
  }

  try {
    const response = await footballDataClient.get(path, { params });
    return response.data;
  } catch (error) {
    const normalized = normalizeFootballDataError(error, fallbackMessage);
    logger.warn("Football-data request failed", {
      path,
      params,
      statusCode: normalized.statusCode,
      message: normalized.message,
    });
    const wrapped = new Error(normalized.message);
    wrapped.statusCode = normalized.statusCode;
    throw wrapped;
  }
};

const DEFAULT_COMPETITION_CODES = ["PL", "PD", "BL1", "SA", "FL1", "DED", "PPL", "ELC", "CL"];

const formatFixtureTitle = (homeTeam, awayTeam) => {
  const home = String(homeTeam || "").trim();
  const away = String(awayTeam || "").trim();
  if (home && away) {
    return `${home} vs ${away}`;
  }
  return home || away || "Fixture";
};

export const normalizeFootballDataFixture = (match = {}) => {
  const homeTeam = String(match.homeTeam?.name || "").trim();
  const awayTeam = String(match.awayTeam?.name || "").trim();
  const competition = String(match.competition?.name || "").trim() || "Unknown Competition";
  const seasonStart = match.season?.startDate ? new Date(match.season.startDate).getUTCFullYear() : null;
  const seasonEnd = match.season?.endDate ? new Date(match.season.endDate).getUTCFullYear() : null;
  const season =
    seasonStart && seasonEnd ? `${seasonStart}/${seasonEnd}` : String(match.season?.currentMatchday || "").trim() || "Unknown";

  return {
    matchId: `FD-${match.id}`,
    externalMatchId: String(match.id || ""),
    title: formatFixtureTitle(homeTeam, awayTeam),
    competition,
    competitionCode: String(match.competition?.code || "").trim() || null,
    season,
    utcDate: match.utcDate || null,
    status: String(match.status || "").toLowerCase() || "upcoming",
    matchday: match.matchday ?? null,
    stage: match.stage || null,
    venue: match.venue || null,
    homeTeam,
    awayTeam,
    homeScore: Number(match.score?.fullTime?.home ?? 0),
    awayScore: Number(match.score?.fullTime?.away ?? 0),
    teams: [homeTeam, awayTeam].filter(Boolean),
    sources: ["football-data"],
    hasEvents: false,
  };
};

export const fetchUpcomingFootballFixtures = async ({
  competitionCodes = DEFAULT_COMPETITION_CODES,
  dateFrom,
  dateTo,
  limit = 100,
} = {}) => {
  const today = new Date();
  const defaultDateFrom = today.toISOString().slice(0, 10);
  const future = new Date(today);
  future.setUTCDate(future.getUTCDate() + 30);
  const defaultDateTo = future.toISOString().slice(0, 10);

  const data = await fetchFootballDataResource(
    "/matches",
    {
      status: "SCHEDULED",
      dateFrom: dateFrom || defaultDateFrom,
      dateTo: dateTo || defaultDateTo,
      competitions: competitionCodes.join(","),
      limit,
    },
    "Upcoming fixtures unavailable from football-data.org",
  );

  const matches = Array.isArray(data?.matches) ? data.matches.map(normalizeFootballDataFixture) : [];
  return {
    matches,
    metadata: {
      source: "football-data",
      configured: hasFootballDataToken(),
      total: matches.length,
      dateFrom: dateFrom || defaultDateFrom,
      dateTo: dateTo || defaultDateTo,
      competitionCodes,
    },
  };
};
