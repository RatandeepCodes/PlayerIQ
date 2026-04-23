import { isDatabaseConnected } from "../config/db.js";
import { findPlayerHistory, findPlayerProfileRecord } from "../repositories/analytics.repository.js";
import { listStoredPlayers } from "../repositories/player.repository.js";
import { fetchPlayerDirectory } from "./ai.service.js";

const SHOWCASE_DIRECTORY = [
  {
    playerId: "P101",
    name: "Sunil Chhetri",
    team: "Bengaluru FC",
    position: "ST",
    nationality: "India",
    hasAnalytics: true,
    metadata: {
      hasAnalytics: true,
      isIndian: true,
      sources: ["kaggle_indian_players"],
      displayMode: "priority-showcase",
    },
  },
  {
    playerId: "P104",
    name: "Lallianzuala Chhangte",
    team: "Mumbai City",
    position: "LW",
    nationality: "India",
    hasAnalytics: true,
    metadata: {
      hasAnalytics: true,
      isIndian: true,
      sources: ["kaggle_indian_players"],
      displayMode: "priority-showcase",
    },
  },
  {
    playerId: "P102",
    name: "Sahal Abdul Samad",
    team: "Mohun Bagan SG",
    position: "CAM",
    nationality: "India",
    hasAnalytics: true,
    metadata: {
      hasAnalytics: true,
      isIndian: true,
      sources: ["kaggle_indian_players"],
      displayMode: "priority-showcase",
    },
  },
  {
    playerId: "P103",
    name: "Sandesh Jhingan",
    team: "FC Goa",
    position: "CB",
    nationality: "India",
    hasAnalytics: true,
    metadata: {
      hasAnalytics: true,
      isIndian: true,
      sources: ["kaggle_indian_players"],
      displayMode: "priority-showcase",
    },
  },
  {
    playerId: "P001",
    name: "Kevin De Bruyne",
    team: "Manchester City",
    position: "CAM",
    nationality: "Belgium",
    hasAnalytics: true,
    metadata: {
      hasAnalytics: true,
      isIndian: false,
      sources: ["statsbomb_open_data"],
      displayMode: "global-directory",
    },
  },
];
const DEFAULT_SHOWCASE_PLAYER_ORDER = ["P101", "P104", "P102", "P103"];
const DEFAULT_VISIBLE_PLAYER_ORDER = ["P101", "P104", "P102", "P103", "P012", "P014", "4320", "P006", "P007", "P002", "P018", "P005", "P008"];

const normalizePlayerCollection = (players = []) =>
  [...players].sort((left, right) => {
    const leftAnalytics = left.metadata?.hasAnalytics ? 1 : 0;
    const rightAnalytics = right.metadata?.hasAnalytics ? 1 : 0;
    const leftIndian = String(left.nationality || "").toLowerCase() === "india" ? 1 : 0;
    const rightIndian = String(right.nationality || "").toLowerCase() === "india" ? 1 : 0;
    const leftShowcaseIndex = DEFAULT_SHOWCASE_PLAYER_ORDER.indexOf(left.playerId);
    const rightShowcaseIndex = DEFAULT_SHOWCASE_PLAYER_ORDER.indexOf(right.playerId);
    const leftVisibleIndex = DEFAULT_VISIBLE_PLAYER_ORDER.indexOf(left.playerId);
    const rightVisibleIndex = DEFAULT_VISIBLE_PLAYER_ORDER.indexOf(right.playerId);

    if (leftVisibleIndex !== -1 || rightVisibleIndex !== -1) {
      if (leftVisibleIndex === -1) {
        return 1;
      }

      if (rightVisibleIndex === -1) {
        return -1;
      }

      if (leftVisibleIndex !== rightVisibleIndex) {
        return leftVisibleIndex - rightVisibleIndex;
      }
    }

    if (leftAnalytics !== rightAnalytics) {
      return rightAnalytics - leftAnalytics;
    }

    if (leftShowcaseIndex !== -1 || rightShowcaseIndex !== -1) {
      if (leftShowcaseIndex === -1) {
        return 1;
      }

      if (rightShowcaseIndex === -1) {
        return -1;
      }

      if (leftShowcaseIndex !== rightShowcaseIndex) {
        return leftShowcaseIndex - rightShowcaseIndex;
      }
    }

    if (leftIndian !== rightIndian) {
      return rightIndian - leftIndian;
    }

    return String(left.name || left.playerName || "").localeCompare(String(right.name || right.playerName || ""));
  });

const mapAiDirectoryPlayer = (player) => ({
  playerId: player.playerId,
  name: player.playerName,
  team: player.team,
  position: player.position,
  nationality: player.nationality,
  hasAnalytics: Boolean(player.hasAnalytics),
  metadata: {
    hasAnalytics: Boolean(player.hasAnalytics),
    isIndian: player.isIndian,
    sources: player.sources,
    displayMode: player.isIndian ? "priority-showcase" : "global-directory",
  },
});

const filterDirectoryPlayers = (players, { team, nationality, search, analyticsOnly }) => {
  const normalizedNationality = nationality?.trim().toLowerCase();
  const searchTokens = String(search || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const requireAnalytics = analyticsOnly === true || String(analyticsOnly).toLowerCase() === "true";
  return normalizePlayerCollection(
    players.filter((player) => {
      const matchesTeam = team ? player.team === team : true;
      const matchesNationality = normalizedNationality
        ? String(player.nationality || "").toLowerCase() === normalizedNationality
        : true;
      const matchesAnalytics = requireAnalytics ? Boolean(player.hasAnalytics ?? player.metadata?.hasAnalytics) : true;
      const haystack = [player.name, player.team, player.position, player.nationality]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchTokens.length ? searchTokens.every((token) => haystack.includes(token)) : true;
      return matchesTeam && matchesNationality && matchesAnalytics && matchesSearch;
    }),
  );
};

const mergePlayerCollections = (storedPlayers = [], aiPlayers = []) => {
  const merged = new Map();

  for (const player of aiPlayers) {
    merged.set(player.playerId, {
      ...player,
      hasAnalytics: player.hasAnalytics ?? player.metadata?.hasAnalytics ?? false,
    });
  }

  for (const player of storedPlayers) {
    const existing = merged.get(player.playerId) || {};
    merged.set(player.playerId, {
      ...existing,
      ...player,
      hasAnalytics:
        player.hasAnalytics ??
        player.metadata?.hasAnalytics ??
        existing.hasAnalytics ??
        existing.metadata?.hasAnalytics ??
        false,
      metadata: {
        ...(existing.metadata || {}),
        ...(player.metadata || {}),
      },
    });
  }

  return [...merged.values()];
};

export const getStoredPlayerDirectory = async ({ team, nationality, limit, page, search, analyticsOnly } = {}) => {
  const storedPlayers = await listStoredPlayers({ team, nationality, limit });
  let players = normalizePlayerCollection(storedPlayers);
  let source = storedPlayers.length ? "database" : "showcase";

  try {
    const aiDirectory = await fetchPlayerDirectory();
    const aiPlayers = (aiDirectory.players || []).map(mapAiDirectoryPlayer);
    players = mergePlayerCollections(storedPlayers, aiPlayers);
    source = storedPlayers.length ? "database+ai-service" : "ai-service";
  } catch (_error) {
    if (!players.length) {
      players = SHOWCASE_DIRECTORY;
      source = "showcase";
    }
  }

  const filteredPlayers = filterDirectoryPlayers(players, { team, nationality, search, analyticsOnly });
  const normalizedLimit = Number(limit) || 50;
  const normalizedPage = Number(page) || 1;
  const startIndex = (normalizedPage - 1) * normalizedLimit;
  players = filteredPlayers.slice(startIndex, startIndex + normalizedLimit);

  return {
    players,
    metadata: {
      database: isDatabaseConnected() ? "connected" : "disconnected",
      source,
      total: filteredPlayers.length,
      page: normalizedPage,
      limit: normalizedLimit,
      totalPages: Math.max(1, Math.ceil(filteredPlayers.length / normalizedLimit)),
      hasMore: startIndex + normalizedLimit < filteredPlayers.length,
      filters: {
        team: team || null,
        nationality: nationality || null,
        search: search || null,
        analyticsOnly: analyticsOnly === true || String(analyticsOnly).toLowerCase() === "true",
        limit: normalizedLimit,
      },
    },
  };
};

export const getPlayerAnalyticsHistory = async (playerId) => {
  const record = await findPlayerProfileRecord(playerId);
  const snapshots = await findPlayerHistory(playerId);

  return {
    playerId,
    snapshots,
    metadata: {
      database: isDatabaseConnected() ? "connected" : "disconnected",
      hasSnapshotRecord: Boolean(record),
      totalSnapshots: snapshots.length,
      lastCapturedAt: snapshots.at(-1)?.capturedAt || null,
    },
  };
};
