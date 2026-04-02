import { getCachedPlayerProfile, savePlayerProfileCache } from "./analytics-cache.service.js";
import {
  fetchPlayerDirectory,
  fetchPlayerPlaystyle,
  fetchPlayerPressure,
  fetchPlayerRating,
  fetchPlayerReport,
} from "./ai.service.js";
import { findStoredPlayerById, upsertStoredPlayer } from "../repositories/player.repository.js";
import { createHttpError } from "../utils/http-error.js";

const ATTRIBUTE_KEYS = ["shooting", "passing", "dribbling", "defending", "creativity", "physical"];

const getSectionValue = (result) => (result?.status === "fulfilled" ? result.value : null);

const normalizeAttributes = (attributes = null) =>
  Object.fromEntries(ATTRIBUTE_KEYS.map((key) => [key, attributes?.[key] ?? null]));

const buildIdentity = (storedPlayer, rating, requestedPlayerId = "") => ({
  playerId: storedPlayer?.playerId || rating?.playerId || requestedPlayerId,
  name: storedPlayer?.name || rating?.playerName || "Unknown Player",
  team: storedPlayer?.team || rating?.team || "Unknown Team",
  position: storedPlayer?.position || rating?.position || "Unknown",
  nationality: storedPlayer?.nationality || rating?.nationality || "Unknown",
});

export const buildProfileEnvelope = ({
  storedPlayer = null,
  rating = null,
  playstyle = null,
  pressure = null,
  report = null,
  requestedPlayerId = "",
}) => {
  const hasLiveAnalytics = Boolean(rating || playstyle || pressure || report);
  const availability = {
    hasLiveAnalytics,
    isPartial: hasLiveAnalytics && (!rating || !playstyle || !pressure || !report),
    sourceMode: hasLiveAnalytics ? (storedPlayer ? "hybrid" : "ai-service") : "stored-player",
    sections: {
      rating: Boolean(rating),
      playstyle: Boolean(playstyle),
      pressure: Boolean(pressure),
      report: Boolean(report),
    },
  };

  const analytics = {
    overallRating: rating?.overallRating ?? null,
    attributes: normalizeAttributes(rating?.attributes),
    playstyle: playstyle?.playstyle ?? null,
    ppi: rating?.ppi ?? null,
    pressureIndex: pressure?.pressureIndex ?? null,
    summary: report?.summary ?? null,
    rating: rating
      ? {
          overallRating: rating.overallRating,
          ppi: rating.ppi,
          matchesAnalyzed: rating.matchesAnalyzed,
          sources: rating.sources,
          attributes: normalizeAttributes(rating.attributes),
        }
      : null,
    playstyleProfile: playstyle
      ? {
          name: playstyle.playstyle,
          clusterDistance: playstyle.clusterDistance,
          supportingTraits: playstyle.supportingTraits,
        }
      : null,
    pressure: pressure
      ? {
          pressureIndex: pressure.pressureIndex,
          pressureScore: pressure.pressureScore,
          pressureEvents: pressure.pressureEvents,
          interpretation: pressure.interpretation,
        }
      : null,
    report: report
      ? {
          summary: report.summary,
          strengths: report.strengths,
          developmentAreas: report.developmentAreas,
        }
      : null,
    availability,
  };

  return {
    player: buildIdentity(storedPlayer, rating, requestedPlayerId),
    overview: {
      overallRating: analytics.overallRating,
      ppi: analytics.ppi,
      playstyle: analytics.playstyle,
      pressureIndex: analytics.pressureIndex,
      matchesAnalyzed: rating?.matchesAnalyzed ?? 0,
      sources: rating?.sources ?? [],
      reportSummary: analytics.summary,
    },
    analytics,
    metadata: {
      hasStoredProfile: Boolean(storedPlayer),
      matchesAnalyzed: rating?.matchesAnalyzed ?? 0,
      sources: rating?.sources ?? [],
      availability,
    },
  };
};

const buildStoredPlayerProfile = (storedPlayer) => buildProfileEnvelope({ storedPlayer, requestedPlayerId: storedPlayer.playerId });

const findPlayerInDirectory = async (playerId) => {
  const directory = await fetchPlayerDirectory();
  const player = (directory?.players || []).find((candidate) => candidate.playerId === playerId);

  if (!player) {
    return null;
  }

  return {
    playerId: player.playerId,
    name: player.playerName || player.name || "Unknown Player",
    team: player.team || "Unknown Team",
    position: player.position || "Unknown",
    nationality: player.nationality || "Unknown",
    metadata: {
      sources: player.sources || [],
      displayMode: player.isIndian ? "priority-showcase" : "global-directory",
    },
  };
};

export const getPlayerProfileData = async (playerId) => {
  const [storedPlayerResult, cachedProfileResult, ratingResult, playstyleResult, pressureResult, reportResult] = await Promise.allSettled([
    findStoredPlayerById(playerId),
    getCachedPlayerProfile(playerId),
    fetchPlayerRating(playerId),
    fetchPlayerPlaystyle(playerId),
    fetchPlayerPressure(playerId),
    fetchPlayerReport(playerId),
  ]);

  const storedPlayer = storedPlayerResult.status === "fulfilled" ? storedPlayerResult.value : null;
  const cachedProfile = cachedProfileResult.status === "fulfilled" ? cachedProfileResult.value : null;
  const rating = getSectionValue(ratingResult);
  const playstyle = getSectionValue(playstyleResult);
  const pressure = getSectionValue(pressureResult);
  const report = getSectionValue(reportResult);
  const hasAnalytics = Boolean(rating || playstyle || pressure || report);

  if (storedPlayer || rating || hasAnalytics) {
    const profile = buildProfileEnvelope({
      storedPlayer,
      rating,
      playstyle,
      pressure,
      report,
      requestedPlayerId: playerId,
    });
    await Promise.allSettled([savePlayerProfileCache(profile), upsertStoredPlayer(profile)]);
    return profile;
  }

  if (cachedProfile) {
    return cachedProfile;
  }

  try {
    const directoryPlayer = await findPlayerInDirectory(playerId);
    if (directoryPlayer) {
      return buildStoredPlayerProfile(directoryPlayer);
    }
  } catch (_error) {
    // Ignore directory lookup failures and preserve the original upstream error below.
  }

  const upstreamErrors = [ratingResult, playstyleResult, pressureResult, reportResult]
    .filter((result) => result.status === "rejected")
    .map((result) => result.reason);

  if (upstreamErrors.some((error) => error?.statusCode === 404)) {
    throw createHttpError(404, `Player '${playerId}' not found`);
  }

  throw createHttpError(502, "Player analytics service unavailable");
};

export const getPlayerData = async (playerId) => {
  const profile = await getPlayerProfileData(playerId);
  return profile.player;
};
