import {
  controlSimulationSession,
  getSimulationSessionState,
  hasSimulationSession,
  initializeSimulationSession,
} from "../services/simulation-session.service.js";

const BASE_TICK_INTERVAL_MS = 900;

export const getSimulationRoom = (matchId) => `simulation:${matchId}`;
export const getPlaybackInterval = (playbackSpeed = 1) =>
  Math.max(200, Math.round(BASE_TICK_INTERVAL_MS / Math.max(Number(playbackSpeed) || 1, 0.1)));

export const sortSimulationTimeline = (timeline = []) =>
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

export const createSimulationUpdatePayload = (state) => ({
  matchId: state.matchId,
  status: state.status,
  progress: state.progress,
  currentMinute: state.currentMinute,
  currentEvent: state.currentEvent,
  controls: state.controls,
});

export const buildSimulationUpdate = (matchId, event, index, totalEvents) => ({
  matchId,
  currentEvent: event,
  currentIndex: index,
  totalEvents,
  progress: totalEvents === 0 ? 100 : Math.round((index / totalEvents) * 100),
});

export const createSimulationSocketRuntime = (
  dependencies = {
    initializeSimulationSession,
    getSimulationSessionState,
    controlSimulationSession,
    hasSimulationSession,
    setTimer: setTimeout,
    clearTimer: clearTimeout,
  },
) => {
  const playbackTimers = new Map();

  const stopPlayback = (matchId) => {
    const timer = playbackTimers.get(matchId);
    if (timer) {
      dependencies.clearTimer(timer);
      playbackTimers.delete(matchId);
    }
  };

  const emitToMatchRoom = (io, matchId, eventName, payload) => {
    io.to(getSimulationRoom(matchId)).emit(eventName, payload);
  };

  const emitState = (io, state) => {
    emitToMatchRoom(io, state.matchId, "simulation:state", state);
  };

  const emitUpdate = (io, state) => {
    emitToMatchRoom(io, state.matchId, "simulation:update", createSimulationUpdatePayload(state));
  };

  const emitError = (socket, matchId, error) => {
    socket.emit("simulation:error", {
      matchId,
      message: error?.message || "Simulation error",
    });
  };

  const schedulePlayback = (io, matchId) => {
    stopPlayback(matchId);

    let state;
    try {
      state = dependencies.getSimulationSessionState(matchId);
    } catch {
      return;
    }

    if (state.status !== "running") {
      return;
    }

    const delay = getPlaybackInterval(state.playbackSpeed);
    const timer = dependencies.setTimer(() => {
      try {
        const nextState = dependencies.controlSimulationSession(matchId, "step");
        emitUpdate(io, nextState);
        emitState(io, nextState);

        if (nextState.status === "running") {
          schedulePlayback(io, matchId);
        } else {
          stopPlayback(matchId);
        }
      } catch {
        stopPlayback(matchId);
      }
    }, delay);

    playbackTimers.set(matchId, timer);
  };

  const handleConnection = (io, socket) => {
    socket.on("simulation:join", ({ matchId }) => {
      if (!matchId) {
        emitError(socket, null, new Error("A matchId is required to join simulation updates."));
        return;
      }

      socket.join(getSimulationRoom(matchId));

      if (dependencies.hasSimulationSession(matchId)) {
        socket.emit("simulation:state", dependencies.getSimulationSessionState(matchId));
      }
    });

    socket.on("simulation:sync", ({ matchId }) => {
      try {
        socket.emit("simulation:state", dependencies.getSimulationSessionState(matchId));
      } catch (error) {
        emitError(socket, matchId, error);
      }
    });

    socket.on("simulation:start", async ({ matchId }) => {
      if (!matchId) {
        emitError(socket, null, new Error("A matchId is required to start a simulation."));
        return;
      }

      try {
        socket.join(getSimulationRoom(matchId));

        let state;
        if (!dependencies.hasSimulationSession(matchId)) {
          await dependencies.initializeSimulationSession(matchId);
          state = dependencies.controlSimulationSession(matchId, "start");
        } else {
          const currentState = dependencies.getSimulationSessionState(matchId);
          if (currentState.status === "ready") {
            state = dependencies.controlSimulationSession(matchId, "start");
          } else if (currentState.status === "paused") {
            state = dependencies.controlSimulationSession(matchId, "resume");
          } else {
            state = currentState;
          }
        }

        emitUpdate(io, state);
        emitState(io, state);
        if (state.status === "running") {
          schedulePlayback(io, matchId);
        }
      } catch (error) {
        emitError(socket, matchId, error);
      }
    });

    socket.on("simulation:control", ({ matchId, action, speed }) => {
      try {
        const state = dependencies.controlSimulationSession(matchId, action, speed);
        emitState(io, state);

        if (["pause", "reset"].includes(action) || state.status !== "running") {
          stopPlayback(matchId);
        }

        if (["resume", "speed"].includes(action) && state.status === "running") {
          schedulePlayback(io, matchId);
        }

        if (action === "step") {
          emitUpdate(io, state);
        }
      } catch (error) {
        emitError(socket, matchId, error);
      }
    });
  };

  return {
    handleConnection,
    schedulePlayback,
    stopPlayback,
    stopAllPlayback: () => {
      for (const matchId of playbackTimers.keys()) {
        stopPlayback(matchId);
      }
    },
  };
};

export const registerSimulationHandlers = (io) => {
  const runtime = createSimulationSocketRuntime();
  io.on("connection", (socket) => {
    runtime.handleConnection(io, socket);
  });
  return runtime;
};
