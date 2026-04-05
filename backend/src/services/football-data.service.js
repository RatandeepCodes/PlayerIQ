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
