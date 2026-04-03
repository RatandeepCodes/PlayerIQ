import axios from "axios";

import { env } from "../config/env.js";

const footballDataClient = axios.create({
  baseURL: "https://api.football-data.org/v4",
  timeout: 8000,
});

const sportsDbClient = axios.create({
  baseURL: "https://www.thesportsdb.com/api/v1/json/123",
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

const HOME_FEED_FALLBACK_LEAGUES = [4328, 4335, 4331, 4332, 4334, 4480, 4791];

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
  if (normalized === "FINISHED" || normalized === "MATCH FINISHED" || normalized === "FT") {
    return "completed";
  }

  if (
    normalized === "IN_PLAY" ||
    normalized === "PAUSED" ||
    normalized === "LIVE" ||
    normalized === "MATCH LIVE"
  ) {
    return "live";
  }

  return "upcoming";
};

const resolveMatchDate = (match) => {
  if (match.utcDate) {
    return match.utcDate;
  }

  if (match.strTimestamp) {
    return match.strTimestamp;
  }

  if (match.dateEvent && match.strTime) {
    return `${match.dateEvent}T${match.strTime}`;
  }

  return match.dateEvent || "";
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

const mapSportsDbMatch = (match) => ({
  id: `tsdb-${match.idEvent}`,
  externalMatchId: String(match.idEvent),
  homeTeam: match.strHomeTeam || "Home",
  awayTeam: match.strAwayTeam || "Away",
  homeScore: Number(match.intHomeScore ?? 0),
  awayScore: Number(match.intAwayScore ?? 0),
  competition: match.strLeague || "Competition",
  date: resolveMatchDate(match),
  venue: match.strVenue || "Venue pending",
  status: mapMatchStatus(match.strStatus),
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

const fetchSportsDbLeagueMatches = async (endpoint, leagueId) => {
  const response = await sportsDbClient.get(endpoint, {
    params: {
      id: leagueId,
    },
  });

  return response.data?.events || [];
};

const fetchSportsDbMatches = async (endpoint) => {
  const settledMatches = await Promise.allSettled(
    HOME_FEED_FALLBACK_LEAGUES.map((leagueId) => fetchSportsDbLeagueMatches(endpoint, leagueId)),
  );

  const matches = settledMatches.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
  const uniqueMatches = new Map();

  for (const match of matches) {
    const matchId = String(match.idEvent || "");
    if (!matchId || uniqueMatches.has(matchId)) {
      continue;
    }

    uniqueMatches.set(matchId, match);
  }

  return [...uniqueMatches.values()];
};

const sortMatchesByDate = (matches, direction = "desc") =>
  [...matches].sort((left, right) => {
    const leftTime = new Date(resolveMatchDate(left) || 0).getTime();
    const rightTime = new Date(resolveMatchDate(right) || 0).getTime();

    return direction === "asc" ? leftTime - rightTime : rightTime - leftTime;
  });

const getSportsDbHomeFeed = async () => {
  try {
    const [recentMatches, upcomingMatches] = await Promise.all([
      fetchSportsDbMatches("/eventspastleague.php"),
      fetchSportsDbMatches("/eventsnextleague.php"),
    ]);

    const latestFinishedMatch = sortMatchesByDate(recentMatches, "desc").at(0);
    const nextMatches = sortMatchesByDate(upcomingMatches, "asc").slice(0, 6);

    return {
      recentMatch: latestFinishedMatch ? mapSportsDbMatch(latestFinishedMatch) : null,
      upcomingMatches: nextMatches.map(mapSportsDbMatch),
      metadata: {
        source: "thesportsdb",
        status: "live",
        retrievedAt: new Date().toISOString(),
      },
    };
  } catch (_error) {
    return {
      recentMatch: null,
      upcomingMatches: [],
      metadata: {
        source: "thesportsdb",
        status: "unavailable",
        retrievedAt: new Date().toISOString(),
      },
    };
  }
};

export const getHomeLiveMatchFeed = async () => {
  if (!env.footballDataApiToken) {
    return getSportsDbHomeFeed();
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
    return getSportsDbHomeFeed();
  }
};
