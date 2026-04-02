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
    metadata: {
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
    metadata: {
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
    metadata: {
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
    metadata: {
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
    metadata: {
      isIndian: false,
      sources: ["statsbomb_open_data"],
      displayMode: "global-directory",
    },
  },
];

const normalizePlayerCollection = (players = []) =>
  [...players].sort((left, right) => {
    const leftIndian = String(left.nationality || "").toLowerCase() === "india" ? 1 : 0;
    const rightIndian = String(right.nationality || "").toLowerCase() === "india" ? 1 : 0;

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
  metadata: {
    isIndian: player.isIndian,
    sources: player.sources,
    displayMode: player.isIndian ? "priority-showcase" : "global-directory",
  },
});

const applyDirectoryFilters = (players, { team, nationality, limit, search }) => {
  const normalizedNationality = nationality?.trim().toLowerCase();
  const normalizedSearch = search?.trim().toLowerCase();
  return normalizePlayerCollection(
    players.filter((player) => {
      const matchesTeam = team ? player.team === team : true;
      const matchesNationality = normalizedNationality
        ? String(player.nationality || "").toLowerCase() === normalizedNationality
        : true;
      const haystack = [
        player.name,
        player.team,
        player.position,
        player.nationality,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = normalizedSearch ? haystack.includes(normalizedSearch) : true;
      return matchesTeam && matchesNationality && matchesSearch;
    }),
  ).slice(0, Number(limit) || 50);
};

const mergePlayerCollections = (storedPlayers = [], aiPlayers = []) => {
  const merged = new Map();

  for (const player of aiPlayers) {
    merged.set(player.playerId, player);
  }

  for (const player of storedPlayers) {
    const existing = merged.get(player.playerId) || {};
    merged.set(player.playerId, {
      ...existing,
      ...player,
      metadata: {
        ...(existing.metadata || {}),
        ...(player.metadata || {}),
      },
    });
  }

  return [...merged.values()];
};

export const getStoredPlayerDirectory = async ({ team, nationality, limit, search } = {}) => {
  const storedPlayers = await listStoredPlayers({ team, nationality, limit });
  let players = normalizePlayerCollection(storedPlayers);
  let source = storedPlayers.length ? "database" : "showcase";

  try {
    const aiDirectory = await fetchPlayerDirectory();
    const aiPlayers = (aiDirectory.players || []).map(mapAiDirectoryPlayer);
    const mergedPlayers = mergePlayerCollections(storedPlayers, aiPlayers);
    players = applyDirectoryFilters(mergedPlayers, { team, nationality, limit, search });
    source = storedPlayers.length ? "database+ai-service" : "ai-service";
  } catch (_error) {
    if (!players.length) {
      players = applyDirectoryFilters(SHOWCASE_DIRECTORY, { team, nationality, limit, search });
      source = "showcase";
    }
  }

  return {
    players,
    metadata: {
      database: isDatabaseConnected() ? "connected" : "disconnected",
      source,
      total: players.length,
      filters: {
        team: team || null,
        nationality: nationality || null,
        search: search || null,
        limit: Number(limit) || 50,
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
