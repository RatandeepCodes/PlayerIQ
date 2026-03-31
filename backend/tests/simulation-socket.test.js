import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSimulationSocketRuntime,
  createSimulationUpdatePayload,
  getPlaybackInterval,
  getSimulationRoom,
} from "../src/sockets/simulation.socket.js";

const createFakeIo = () => {
  const roomEvents = [];

  return {
    roomEvents,
    to(room) {
      return {
        emit(event, payload) {
          roomEvents.push({ room, event, payload });
        },
      };
    },
  };
};

const createFakeSocket = () => {
  const handlers = new Map();
  const directEvents = [];
  const joinedRooms = [];

  return {
    directEvents,
    joinedRooms,
    on(event, handler) {
      handlers.set(event, handler);
    },
    emit(event, payload) {
      directEvents.push({ event, payload });
    },
    join(room) {
      joinedRooms.push(room);
    },
    trigger(event, payload) {
      const handler = handlers.get(event);
      return handler?.(payload);
    },
  };
};

describe("Simulation socket runtime", () => {
  it("exposes stable room and payload helpers", () => {
    assert.equal(getSimulationRoom("SB-1001"), "simulation:SB-1001");
    assert.equal(getPlaybackInterval(2), 450);

    const payload = createSimulationUpdatePayload({
      matchId: "SB-1001",
      status: "running",
      progress: 42,
      currentMinute: 37,
      currentEvent: { minute: 37, playerId: "P001" },
      controls: ["pause", "step"],
    });

    assert.equal(payload.currentMinute, 37);
    assert.equal(payload.currentEvent.playerId, "P001");
  });

  it("joins simulation rooms and emits existing state on join", () => {
    const io = createFakeIo();
    const socket = createFakeSocket();
    const runtime = createSimulationSocketRuntime({
      hasSimulationSession: () => true,
      getSimulationSessionState: () => ({ matchId: "SB-1001", status: "paused" }),
      initializeSimulationSession: async () => undefined,
      controlSimulationSession: () => ({ matchId: "SB-1001", status: "paused" }),
      setTimer: () => 1,
      clearTimer: () => undefined,
    });

    runtime.handleConnection(io, socket);
    socket.trigger("simulation:join", { matchId: "SB-1001" });

    assert.deepEqual(socket.joinedRooms, ["simulation:SB-1001"]);
    assert.equal(socket.directEvents[0].event, "simulation:state");
    assert.equal(socket.directEvents[0].payload.status, "paused");
  });

  it("starts a new simulation and emits room updates", async () => {
    const io = createFakeIo();
    const socket = createFakeSocket();
    let initialized = false;

    const runtime = createSimulationSocketRuntime({
      hasSimulationSession: () => initialized,
      initializeSimulationSession: async () => {
        initialized = true;
      },
      getSimulationSessionState: () => ({ matchId: "SB-1001", status: "running", playbackSpeed: 1 }),
      controlSimulationSession: () => ({
        matchId: "SB-1001",
        status: "running",
        progress: 9,
        currentMinute: 4,
        currentEvent: { minute: 4, playerId: "P001" },
        controls: ["pause", "step"],
        playbackSpeed: 1,
      }),
      setTimer: () => 1,
      clearTimer: () => undefined,
    });

    runtime.handleConnection(io, socket);
    await socket.trigger("simulation:start", { matchId: "SB-1001" });

    assert.equal(initialized, true);
    assert.equal(io.roomEvents[0].event, "simulation:update");
    assert.equal(io.roomEvents[1].event, "simulation:state");
    assert.equal(io.roomEvents[0].payload.currentEvent.playerId, "P001");
  });

  it("emits socket errors when control actions fail", () => {
    const io = createFakeIo();
    const socket = createFakeSocket();
    const runtime = createSimulationSocketRuntime({
      hasSimulationSession: () => true,
      initializeSimulationSession: async () => undefined,
      getSimulationSessionState: () => ({ matchId: "SB-1001", status: "paused", playbackSpeed: 1 }),
      controlSimulationSession: () => {
        throw new Error("Simulation can only be resumed from a paused state.");
      },
      setTimer: () => 1,
      clearTimer: () => undefined,
    });

    runtime.handleConnection(io, socket);
    socket.trigger("simulation:control", { matchId: "SB-1001", action: "resume" });

    assert.equal(socket.directEvents[0].event, "simulation:error");
    assert.equal(socket.directEvents[0].payload.matchId, "SB-1001");
  });
});
