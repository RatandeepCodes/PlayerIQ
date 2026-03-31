import { fetchMatchSimulation } from "./ai.service.js";
import { createHttpError } from "../utils/http-error.js";

const simulationSessions = new Map();
const DEFAULT_PLAYBACK_SPEED = 1;
const PREVIEW_EVENT_LIMIT = 5;

const sortTimeline = (timeline = []) =>
  [...timeline].sort((left, right) => {
    const leftMinute = Number(left.minute || 0);
    const rightMinute = Number(right.minute || 0);
    if (leftMinute !== rightMinute) {
      return leftMinute - rightMinute;
    }

    const leftSecond = Number(left.second || 0);
    const rightSecond = Number(right.second || 0);
    return leftSecond - rightSecond;
  });

const deriveTeams = (timeline = []) => [...new Set(timeline.map((event) => event.team).filter(Boolean))];

export const deriveSimulationControls = (status) => {
  switch (status) {
    case "running":
      return ["pause", "step", "reset", "speed"];
    case "paused":
      return ["resume", "step", "reset", "speed"];
    case "completed":
      return ["reset"];
    case "ready":
    default:
      return ["start", "step", "reset", "speed"];
  }
};

const advanceTimeline = (session, steps = 1) => {
  const nextIndex = Math.min(session.currentIndex + steps, session.timeline.length);
  session.currentIndex = nextIndex;

  if (session.timeline.length === 0 || nextIndex >= session.timeline.length) {
    session.status = "completed";
  }
};

export const buildSimulationSessionPayload = (session, { includeTimeline = false } = {}) => {
  const currentEvent = session.currentIndex > 0 ? session.timeline[session.currentIndex - 1] : null;
  const nextEvents = session.timeline.slice(session.currentIndex, session.currentIndex + PREVIEW_EVENT_LIMIT);
  const recentEvents = session.timeline.slice(Math.max(0, session.currentIndex - 3), session.currentIndex);
  const totalTicks = session.timeline.length;
  const progress = totalTicks === 0 ? 100 : Math.round((session.currentIndex / totalTicks) * 100);

  return {
    sessionId: session.sessionId,
    matchId: session.matchId,
    teams: session.teams,
    status: session.status,
    playbackSpeed: session.playbackSpeed,
    currentIndex: session.currentIndex,
    totalTicks,
    progress,
    currentMinute: currentEvent?.minute ?? session.timeline[0]?.minute ?? 0,
    currentEvent,
    recentEvents,
    nextEvents,
    controls: deriveSimulationControls(session.status),
    timestamps: {
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
    ...(includeTimeline ? { timeline: session.timeline } : {}),
  };
};

const getRequiredSession = (matchId) => {
  const session = simulationSessions.get(matchId);
  if (!session) {
    throw createHttpError(404, `No simulation session exists for match '${matchId}'`);
  }

  return session;
};

export const initializeSimulationSession = async (matchId) => {
  const simulation = await fetchMatchSimulation(matchId);
  const timeline = sortTimeline(simulation.timeline);
  const timestamp = new Date().toISOString();

  const session = {
    sessionId: `sim-${matchId}`,
    matchId,
    teams: deriveTeams(timeline),
    timeline,
    playbackSpeed: DEFAULT_PLAYBACK_SPEED,
    status: timeline.length === 0 ? "completed" : "ready",
    currentIndex: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  simulationSessions.set(matchId, session);
  return buildSimulationSessionPayload(session, { includeTimeline: true });
};

export const getSimulationSessionState = (matchId) => buildSimulationSessionPayload(getRequiredSession(matchId));

export const controlSimulationSession = (matchId, action, speed) => {
  const session = getRequiredSession(matchId);

  switch (action) {
    case "start":
      if (session.status === "completed") {
        throw createHttpError(409, "Simulation has already completed. Reset it before starting again.");
      }
      session.status = "running";
      advanceTimeline(session, 1);
      break;
    case "pause":
      if (session.status !== "running") {
        throw createHttpError(409, "Simulation can only be paused while running.");
      }
      session.status = "paused";
      break;
    case "resume":
      if (session.status !== "paused") {
        throw createHttpError(409, "Simulation can only be resumed from a paused state.");
      }
      session.status = "running";
      advanceTimeline(session, 1);
      break;
    case "step":
      if (session.status === "completed") {
        throw createHttpError(409, "Simulation is already complete.");
      }
      advanceTimeline(session, 1);
      if (session.status !== "completed" && session.status !== "running") {
        session.status = "paused";
      }
      break;
    case "reset":
      session.currentIndex = 0;
      session.status = session.timeline.length === 0 ? "completed" : "ready";
      break;
    case "speed":
      session.playbackSpeed = Number(speed);
      break;
    default:
      throw createHttpError(400, `Unsupported simulation action '${action}'`);
  }

  session.updatedAt = new Date().toISOString();
  return buildSimulationSessionPayload(session);
};

export const clearSimulationSessions = () => {
  simulationSessions.clear();
};
