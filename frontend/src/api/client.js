import { getStoredToken } from "../auth/session.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_TIMEOUT_MS = 12000;

export class ApiError extends Error {
  constructor(message, { statusCode = 500, requestId = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.requestId = requestId;
  }
}

async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  const token = getStoredToken();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  let response;
  let payload = null;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await response.json().catch(() => null);
    } else {
      const textPayload = await response.text().catch(() => "");
      payload = textPayload ? { message: textPayload } : null;
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("The request took too long. Check whether the backend is still running.", {
        statusCode: 408,
      });
    }

    throw new ApiError("Unable to reach the PlayerIQ backend. Check your API URL and server state.", {
      statusCode: 503,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new ApiError(payload?.message || payload?.detail || "Request failed", {
      statusCode: response.status,
      requestId: payload?.requestId || response.headers.get("x-request-id"),
    });
  }

  return payload;
}

export async function getHealth() {
  return apiRequest("/health");
}

export async function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });
}

export async function registerUser(details) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: details,
  });
}

export async function getCurrentUser() {
  return apiRequest("/auth/me");
}

export async function getPlayerProfile(playerId) {
  return apiRequest(`/player/${playerId}/profile`);
}

export async function getPlayerHistory(playerId) {
  return apiRequest(`/player/${playerId}/history`);
}

export async function getPlayers(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return apiRequest(`/player${query ? `?${query}` : ""}`);
}

export async function getMatches(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return apiRequest(`/matches${query ? `?${query}` : ""}`);
}

export async function getHomeMatchFeed() {
  return apiRequest("/matches/live-feed/home");
}

export async function getMatchAnalysis(matchId) {
  return apiRequest(`/matches/${matchId}/analysis`);
}

export async function getPlayerComparison(player1, player2) {
  const searchParams = new URLSearchParams({
    player1,
    player2,
  });

  return apiRequest(`/player/compare?${searchParams.toString()}`);
}

export async function startMatchSimulation(matchId) {
  return apiRequest(`/matches/${matchId}/simulate`, {
    method: "POST",
  });
}

export async function getMatchSimulation(matchId) {
  return apiRequest(`/matches/${matchId}/simulation`);
}

export async function controlMatchSimulation(matchId, action, speed) {
  return apiRequest(`/matches/${matchId}/simulation/control`, {
    method: "POST",
    body: {
      action,
      ...(speed !== undefined ? { speed } : {}),
    },
  });
}
