import axios from "axios";

import { env } from "../config/env.js";

const footballDataClient = axios.create({
  baseURL: "https://api.football-data.org/v4",
  timeout: 8000,
});

const HOME_FEED_COMPETITIONS = [
  "PL",
  "PD",
  "SA",
  "BL1",
  "FL1",
  "CL",
  "ELC",
  "PPL",
];

const padDate = (value) => String(value).padStart(2, "0");

const formatDate = (date) =>
  `${date.getUTCFullYear()}-${padDate(date.getUTCMonth() + 1)}-${padDate(date.getUTCDate())}`;

const addDays = (date, amount) => {
  const clone = new Date(date);
  clone.setUTCDate(clone.getUTCDate() + amount);
  return clone;
};

const mapMatchStatus = (status = "") => {
  const normalized = String(status).toUpperCase();
  if (normalized === "FINISHED") {
    return "completed";
  }

  if (normalized === "IN_PLAY" || normalized === "PAUSED" || normalized === "LIVE") {
    return "live";
  }

  return "upcoming";
};

const mapFootballDataMatch = (match) => ({
  id: `fd-${match.id}`,
  externalMatchId: String(match.id),
  homeTeam: match.homeTeam?.shortName || match.homeTeam?.name || "Home",
  awayTeam: match.awayTeam?.shortName || match.awayTeam?.name || "Away",
  homeScore: Number(match.score?.fullTime?.home ?? 0),
  awayScore: Number(match.score?.fullTime?.away ?? 0),
  competition: match.competition?.name || "Competition",
  date: match.utcDate || "",
  venue: match.venue || "Venue pending",
  status: mapMatchStatus(match.status),
});

const fetchFootballDataMatches = async (params = {}) => {
  const response = await footballDataClient.get("/matches", {
    headers: {
      "X-Auth-Token": env.footballDataApiToken,
    },
    params: {
      competitions: HOME_FEED_COMPETITIONS.join(","),
      ...params,
    },
  });

  return response.data?.matches || [];
};

export const getHomeLiveMatchFeed = async () => {
  if (!env.footballDataApiToken) {
    return {
      recentMatch: null,
      upcomingMatches: [],
      metadata: {
        source: "football-data",
        status: "not-configured",
        retrievedAt: new Date().toISOString(),
      },
    };
  }

  const now = new Date();
  const recentFrom = formatDate(addDays(now, -3));
  const recentTo = formatDate(now);
  const upcomingFrom = formatDate(now);
  const upcomingTo = formatDate(addDays(now, 7));

  try {
    const [recentMatches, upcomingMatches] = await Promise.all([
      fetchFootballDataMatches({
        status: "FINISHED",
        dateFrom: recentFrom,
        dateTo: recentTo,
      }),
      fetchFootballDataMatches({
        status: "TIMED,SCHEDULED",
        dateFrom: upcomingFrom,
        dateTo: upcomingTo,
      }),
    ]);

    const latestFinishedMatch = [...recentMatches]
      .sort((left, right) => new Date(right.utcDate || 0).getTime() - new Date(left.utcDate || 0).getTime())
      .at(0);

    const nextMatches = [...upcomingMatches]
      .sort((left, right) => new Date(left.utcDate || 0).getTime() - new Date(right.utcDate || 0).getTime())
      .slice(0, 6);

    return {
      recentMatch: latestFinishedMatch ? mapFootballDataMatch(latestFinishedMatch) : null,
      upcomingMatches: nextMatches.map(mapFootballDataMatch),
      metadata: {
        source: "football-data",
        status: "live",
        retrievedAt: new Date().toISOString(),
      },
    };
  } catch (_error) {
    return {
      recentMatch: null,
      upcomingMatches: [],
      metadata: {
        source: "football-data",
        status: "unavailable",
        retrievedAt: new Date().toISOString(),
      },
    };
  }
};
