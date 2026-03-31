import { fetchMatchSimulation } from "../services/ai.service.js";

const DEFAULT_TICK_MS = 750;
const activeStreams = new Map();

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

export const buildSimulationUpdate = (matchId, event, index, totalEvents) => ({
  matchId,
  currentEvent: event,
  currentIndex: index,
  totalEvents,
  progress: totalEvents === 0 ? 100 : Math.round((index / totalEvents) * 100),
});

const clearSimulationStream = (socketId) => {
  const stream = activeStreams.get(socketId);
  if (stream?.timer) {
    clearTimeout(stream.timer);
  }
  activeStreams.delete(socketId);
};

const emitSimulationState = (socket, stream) => {
  socket.emit("simulation:state", {
    matchId: stream.matchId,
    status: stream.status,
    currentIndex: stream.currentIndex,
    totalEvents: stream.totalEvents,
    controls: ["start", "pause", "resume", "reset", "stop"],
  });
};

const queueNextEvent = (socket) => {
  const stream = activeStreams.get(socket.id);
  if (!stream || stream.status !== "running") {
    return;
  }

  if (stream.currentIndex >= stream.totalEvents) {
    stream.status = "completed";
    emitSimulationState(socket, stream);
    clearSimulationStream(socket.id);
    return;
  }

  const nextEvent = stream.timeline[stream.currentIndex];
  stream.currentIndex += 1;
  socket.emit("simulation:update", buildSimulationUpdate(stream.matchId, nextEvent, stream.currentIndex, stream.totalEvents));
  stream.timer = setTimeout(() => queueNextEvent(socket), DEFAULT_TICK_MS);
};

export const registerSimulationHandlers = (io) => {
  io.on("connection", (socket) => {
    socket.on("simulation:start", async ({ matchId }) => {
      try {
        clearSimulationStream(socket.id);
        const simulation = await fetchMatchSimulation(matchId);
        const timeline = sortSimulationTimeline(simulation.timeline);
        const stream = {
          matchId,
          timeline,
          totalEvents: timeline.length,
          currentIndex: 0,
          status: "running",
          timer: null,
        };

        activeStreams.set(socket.id, stream);
        emitSimulationState(socket, stream);
        queueNextEvent(socket);
      } catch (error) {
        socket.emit("simulation:error", {
          matchId,
          message: error?.message || "Simulation stream unavailable",
        });
      }
    });

    socket.on("simulation:pause", () => {
      const stream = activeStreams.get(socket.id);
      if (!stream) {
        return;
      }

      if (stream.timer) {
        clearTimeout(stream.timer);
      }
      stream.status = "paused";
      emitSimulationState(socket, stream);
    });

    socket.on("simulation:resume", () => {
      const stream = activeStreams.get(socket.id);
      if (!stream || stream.status !== "paused") {
        return;
      }

      stream.status = "running";
      emitSimulationState(socket, stream);
      queueNextEvent(socket);
    });

    socket.on("simulation:reset", () => {
      const stream = activeStreams.get(socket.id);
      if (!stream) {
        return;
      }

      if (stream.timer) {
        clearTimeout(stream.timer);
      }
      stream.currentIndex = 0;
      stream.status = "ready";
      emitSimulationState(socket, stream);
    });

    socket.on("simulation:stop", () => {
      const stream = activeStreams.get(socket.id);
      if (!stream) {
        return;
      }

      stream.status = "stopped";
      emitSimulationState(socket, stream);
      clearSimulationStream(socket.id);
    });

    socket.on("disconnect", () => {
      clearSimulationStream(socket.id);
    });
  });
};

