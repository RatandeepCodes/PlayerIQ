import { fetchMatchDirectory, fetchMatchMomentum, fetchMatchSimulation, fetchMatchTurningPoints } from "./ai.service.js";
import { fetchFootballMatchStatusFeed, fetchUpcomingFootballFixtures, isFootballDataConfigured } from "./football-data.service.js";
import {
  getCachedMatchAnalysis,
  getCachedMatchMomentum,
  getCachedTurningPoints,
  saveMatchAnalysisCache,
  saveMatchMomentumCache,
  saveTurningPointsCache,
} from "./analytics-cache.service.js";

const SHOWCASE_MATCH_DIRECTORY = [
  {
    matchId: "ISL-2001",
    title: "Bengaluru FC vs Kerala Blasters",
    competition: "Indian Super League",
    season: "2025-26",
    teams: ["Bengaluru FC", "Kerala Blasters"],
    sources: ["kaggle_indian_players"],
    status: "completed",
    hasEvents: true,
    homeScore: 2,
    awayScore: 1,
  },
  {
    matchId: "SB-1001",
    title: "Barcelona vs Real Madrid",
    competition: "La Liga Showcase",
    season: "2025-26",
    teams: ["Barcelona", "Real Madrid"],
    sources: ["statsbomb_open_data"],
    status: "completed",
    hasEvents: true,
    homeScore: 1,
    awayScore: 2,
  },
];

const normalizeDirectoryMatch = (match = {}, fallback = {}) => ({
  matchId: match.matchId || fallback.matchId || "",
  title: match.title || fallback.title || "",
  competition: match.competition || fallback.competition || "",
  season: match.season || fallback.season || "",
  teams: Array.isArray(match.teams) ? match.teams : fallback.teams || [],
  sources: Array.isArray(match.sources) ? match.sources : fallback.sources || [],
  status: match.status || fallback.status || "completed",
  homeScore: Number(match.homeScore ?? fallback.homeScore ?? 0),
  awayScore: Number(match.awayScore ?? fallback.awayScore ?? 0),
  hasEvents: Boolean(match.hasEvents ?? fallback.hasEvents ?? false),
});

const buildMatchIdentityKey = (match = {}) => {
  const competition = String(match.competition || "").trim().toLowerCase();
  const teams = (match.teams || []).map((team) => String(team || "").trim().toLowerCase()).filter(Boolean);
  const title = String(match.title || "").trim().toLowerCase();
  return [competition, teams.join("::"), title].join("|");
};

export const mergeMatchDirectories = (primaryMatches = [], secondaryMatches = []) => {
  const merged = new Map();

  for (const match of primaryMatches.map((entry) => normalizeDirectoryMatch(entry))) {
    merged.set(buildMatchIdentityKey(match), match);
  }

  for (const secondary of secondaryMatches.map((entry) => normalizeDirectoryMatch(entry))) {
    const key = buildMatchIdentityKey(secondary);
    const current = merged.get(key);
    if (!current) {
      merged.set(key, secondary);
      continue;
    }

    merged.set(key, {
      ...secondary,
      ...current,
      sources: [...new Set([...(current.sources || []), ...(secondary.sources || [])])],
      status: current.hasEvents ? current.status : secondary.status || current.status,
      homeScore: current.hasEvents ? current.homeScore : secondary.homeScore,
      awayScore: current.hasEvents ? current.awayScore : secondary.awayScore,
      hasEvents: current.hasEvents || secondary.hasEvents,
    });
  }

  const statusPriority = {
    live: 0,
    completed: 1,
    upcoming: 2,
  };

  return [...merged.values()].sort((left, right) => {
    const statusCompare = (statusPriority[left.status] ?? 9) - (statusPriority[right.status] ?? 9);
    if (statusCompare !== 0) {
      return statusCompare;
    }

    const competitionCompare = String(left.competition || "").localeCompare(String(right.competition || ""));
    if (competitionCompare !== 0) {
      return competitionCompare;
    }

    return String(left.title || "").localeCompare(String(right.title || ""));
  });
};

const normalizeBucketScores = (scores = []) => {
  if (Array.isArray(scores)) {
    return Object.fromEntries(scores.map((entry) => [entry.team, Number(entry.score || 0)]));
  }

  return Object.fromEntries(
    Object.entries(scores || {}).map(([team, score]) => [team, Number(score || 0)]),
  );
};

const toMinuteRangeLabel = (bucket) =>
  `${bucket.bucketStart ?? bucket.startMinute ?? 0}'-${bucket.bucketEnd ?? bucket.endMinute ?? 0}'`;

export const buildMomentumEnvelope = (matchId, momentum) => {
  const buckets = (momentum.buckets || []).map((bucket) => ({
    bucketStart: bucket.bucketStart ?? bucket.startMinute ?? 0,
    bucketEnd: bucket.bucketEnd ?? bucket.endMinute ?? 0,
    label: bucket.label || toMinuteRangeLabel(bucket),
    minuteMark: bucket.minuteMark ?? bucket.minute_mark ?? bucket.bucketStart ?? 0,
    scores: normalizeBucketScores(bucket.scores),
    leadingTeam: bucket.leadingTeam ?? bucket.leading_team ?? null,
    isSwing: Boolean(bucket.isSwing ?? bucket.swing),
    swingMagnitude: Number(bucket.swingMagnitude ?? bucket.swing_magnitude ?? 0),
    note: bucket.note ?? null,
  }));

  const swings = buckets.filter((bucket) => bucket.isSwing);
  const peakBucket = buckets.reduce((peak, bucket) => {
    const peakScore = peak ? Math.max(...Object.values(peak.scores || { default: -1 })) : -1;
    const bucketScore = Math.max(...Object.values(bucket.scores || { default: -1 }));
    return bucketScore > peakScore ? bucket : peak;
  }, null);

  return {
    matchId,
    teams: momentum.teams,
    bucketSizeMinutes: momentum.bucketSizeMinutes,
    buckets,
    summary: {
      totalBuckets: buckets.length,
      swingCount: swings.length,
      peakWindow: peakBucket
        ? {
            label: peakBucket.label,
            leader: peakBucket.leadingTeam,
            score: Math.max(...Object.values(peakBucket.scores || {})),
          }
        : null,
    },
  };
};

export const buildTurningPointsEnvelope = (matchId, turningPoints) => ({
  matchId,
  totalTurningPoints: (turningPoints.turningPoints || []).length,
  turningPoints: turningPoints.turningPoints || [],
});

export const buildMatchAnalysisEnvelope = (matchId, momentum, turningPoints) => {
  const momentumEnvelope = buildMomentumEnvelope(matchId, momentum);
  const turningPointEnvelope = buildTurningPointsEnvelope(matchId, turningPoints);

  return {
    matchId,
    teams: momentumEnvelope.teams,
    momentum: momentumEnvelope,
    momentumBuckets: momentumEnvelope.buckets,
    turningPoints: turningPointEnvelope,
    turningPointList: turningPointEnvelope.turningPoints,
    liveStatus: "ready",
    summary: {
      totalMomentumWindows: momentumEnvelope.summary.totalBuckets,
      totalTurningPoints: turningPointEnvelope.totalTurningPoints,
      swingMoments: momentumEnvelope.summary.swingCount,
    },
    overview: {
      teams: momentumEnvelope.teams,
      liveStatus: "ready",
      totalTurningPoints: turningPointEnvelope.totalTurningPoints,
      totalMomentumWindows: momentumEnvelope.summary.totalBuckets,
      swingMoments: momentumEnvelope.summary.swingCount,
    },
  };
};

export const buildMatchSimulationEnvelope = (matchId, simulation) => {
  const timeline = [...(simulation.timeline || [])].sort((left, right) => {
    const leftMinute = Number(left.minute || 0);
    const rightMinute = Number(right.minute || 0);
    if (leftMinute !== rightMinute) {
      return leftMinute - rightMinute;
    }

    const leftSecond = Number(left.second || 0);
    const rightSecond = Number(right.second || 0);
    return leftSecond - rightSecond;
  });

  return {
    ...simulation,
    matchId,
    timeline,
    controls: ["start", "pause", "resume", "reset", "speed", "stop"],
    summary: {
      totalEvents: timeline.length,
      firstMinute: timeline[0]?.minute ?? null,
      lastMinute: timeline.at(-1)?.minute ?? null,
    },
  };
};

export const getMatchMomentumData = async (matchId) => {
  try {
    const momentum = await fetchMatchMomentum(matchId);
    const envelope = buildMomentumEnvelope(matchId, momentum);
    await saveMatchMomentumCache(matchId, envelope, envelope.teams).catch(() => undefined);
    return envelope;
  } catch (error) {
    const cached = await getCachedMatchMomentum(matchId).catch(() => null);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const getMatchTurningPointsData = async (matchId) => {
  try {
    const turningPoints = await fetchMatchTurningPoints(matchId);
    const envelope = buildTurningPointsEnvelope(matchId, turningPoints);
    await saveTurningPointsCache(matchId, envelope).catch(() => undefined);
    return envelope;
  } catch (error) {
    const cached = await getCachedTurningPoints(matchId).catch(() => null);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

export const getMatchAnalysisData = async (matchId) => {
  try {
    const [momentum, turningPoints] = await Promise.all([
      fetchMatchMomentum(matchId),
      fetchMatchTurningPoints(matchId),
    ]);

    const envelope = buildMatchAnalysisEnvelope(matchId, momentum, turningPoints);
    await saveMatchAnalysisCache(matchId, envelope, envelope.teams).catch(() => undefined);
    return envelope;
  } catch (error) {
    const cached = await getCachedMatchAnalysis(matchId).catch(() => null);
    if (cached) {
      return cached;
    }
    throw error;
  }
};

const filterDirectoryMatches = (matches = [], { status, search, competition } = {}) => {
  const normalizedSearch = String(search || "")
    .trim()
    .toLowerCase();
  const normalizedCompetition = String(competition || "")
    .trim()
    .toLowerCase();

  return matches.filter((match) => {
    const matchesStatus = status && status !== "all" ? match.status === status : true;
    const matchesCompetition = normalizedCompetition
      ? String(match.competition || "").toLowerCase().includes(normalizedCompetition)
      : true;
    const haystack = [match.title, ...(match.teams || []), match.competition, match.season]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = normalizedSearch ? haystack.includes(normalizedSearch) : true;
    return matchesStatus && matchesCompetition && matchesSearch;
  });
};

export const getMatchDirectoryData = async ({ limit, page, status, search, competition } = {}) => {
  try {
    const [directory, providerResults, providerFixtures] = await Promise.all([
      fetchMatchDirectory(),
      isFootballDataConfigured() ? fetchFootballMatchStatusFeed() : Promise.resolve({ liveMatches: [], completedMatches: [] }),
      isFootballDataConfigured() ? fetchUpcomingFootballFixtures() : Promise.resolve({ matches: [] }),
    ]);

    const allMatches = mergeMatchDirectories(
      (directory.matches || []).map((match) =>
        normalizeDirectoryMatch(match, {
          status: match.status || "completed",
          hasEvents: true,
        }),
      ),
      [
        ...(providerResults.liveMatches || []).map((match) =>
          normalizeDirectoryMatch(match, {
            hasEvents: false,
          }),
        ),
        ...(providerResults.completedMatches || []).map((match) =>
          normalizeDirectoryMatch(match, {
            hasEvents: false,
          }),
        ),
        ...(providerFixtures.matches || []).map((match) =>
          normalizeDirectoryMatch(match, {
            hasEvents: false,
          }),
        ),
      ],
    );
    const filteredMatches = filterDirectoryMatches(allMatches, { status, search, competition });
    const normalizedLimit = Number(limit) || 50;
    const normalizedPage = Number(page) || 1;
    const startIndex = (normalizedPage - 1) * normalizedLimit;
    const matches = filteredMatches.slice(startIndex, startIndex + normalizedLimit);
    return {
      matches,
      metadata: {
        source: isFootballDataConfigured() ? "ai-service+football-data" : "ai-service",
        total: filteredMatches.length,
        page: normalizedPage,
        limit: normalizedLimit,
        totalPages: Math.max(1, Math.ceil(filteredMatches.length / normalizedLimit)),
        hasMore: startIndex + normalizedLimit < filteredMatches.length,
        filters: {
          status: status || "all",
          search: search || null,
          competition: competition || null,
        },
      },
    };
  } catch (_error) {
    const filteredMatches = filterDirectoryMatches(SHOWCASE_MATCH_DIRECTORY, { status, search, competition });
    const normalizedLimit = Number(limit) || 50;
    const normalizedPage = Number(page) || 1;
    const startIndex = (normalizedPage - 1) * normalizedLimit;
    const matches = filteredMatches.slice(startIndex, startIndex + normalizedLimit);
    return {
      matches,
      metadata: {
        source: "showcase",
        total: filteredMatches.length,
        page: normalizedPage,
        limit: normalizedLimit,
        totalPages: Math.max(1, Math.ceil(filteredMatches.length / normalizedLimit)),
        hasMore: startIndex + normalizedLimit < filteredMatches.length,
        filters: {
          status: status || "all",
          search: search || null,
          competition: competition || null,
        },
      },
    };
  }
};

export const getMatchSimulationData = async (matchId) => {
  const simulation = await fetchMatchSimulation(matchId);
  return buildMatchSimulationEnvelope(matchId, simulation);
};

export const getUpcomingFixtureDirectoryData = async ({ limit, competition } = {}) => {
  if (!isFootballDataConfigured()) {
    return {
      matches: [],
      metadata: {
        source: "football-data",
        configured: false,
        total: 0,
        competition: competition || null,
      },
    };
  }

  const normalizedLimit = Number(limit) || 100;
  const competitionCodes = competition
    ? [String(competition).trim().toUpperCase()]
    : undefined;

  const fixtures = await fetchUpcomingFootballFixtures({
    competitionCodes,
    limit: normalizedLimit,
  });

  return {
    matches: fixtures.matches,
    metadata: {
      ...fixtures.metadata,
      limit: normalizedLimit,
      competition: competition || null,
    },
  };
};

export const getLiveMatchStatusFeedData = async ({ limit, competition } = {}) => {
  if (!isFootballDataConfigured()) {
    return {
      liveMatches: [],
      completedMatches: [],
      metadata: {
        source: "football-data",
        configured: false,
        total: 0,
        competition: competition || null,
      },
    };
  }

  const normalizedLimit = Number(limit) || 100;
  const competitionCodes = competition
    ? [String(competition).trim().toUpperCase()]
    : undefined;

  const feed = await fetchFootballMatchStatusFeed({
    competitionCodes,
    limit: normalizedLimit,
  });

  return {
    liveMatches: feed.liveMatches,
    completedMatches: feed.completedMatches,
    metadata: {
      ...feed.metadata,
      limit: normalizedLimit,
      competition: competition || null,
    },
  };
};
