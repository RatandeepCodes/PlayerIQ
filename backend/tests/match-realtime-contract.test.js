import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildMatchAnalysisEnvelope } from "../src/services/match-analysis.service.js";
import {
  buildSimulationSessionPayload,
  deriveSimulationControls,
} from "../src/services/simulation-session.service.js";

describe("Match realtime contract shaping", () => {
  it("builds a frontend-ready match analysis envelope", () => {
    const analysis = buildMatchAnalysisEnvelope(
      "SB-1001",
      {
        teams: ["Liverpool", "Manchester City"],
        bucketSizeMinutes: 5,
        buckets: [
          {
            startMinute: 0,
            endMinute: 5,
            scores: { Liverpool: 6.1, "Manchester City": 2.5 },
            leadingTeam: "Liverpool",
            isSwing: false,
          },
          {
            startMinute: 5,
            endMinute: 10,
            scores: { Liverpool: 1.5, "Manchester City": 7.8 },
            leadingTeam: "Manchester City",
            isSwing: true,
          },
        ],
      },
      {
        turningPoints: [{ minute: 8, team: "Manchester City", reason: "Momentum swing" }],
      },
    );

    assert.equal(analysis.overview.totalMomentumWindows, 2);
    assert.equal(analysis.overview.swingMoments, 1);
    assert.equal(analysis.turningPoints.totalTurningPoints, 1);
    assert.equal(analysis.momentum.buckets[0].label, "0'-5'");
  });

  it("derives simulation controls from session status", () => {
    assert.deepEqual(deriveSimulationControls("ready"), ["start", "step", "reset", "speed"]);
    assert.deepEqual(deriveSimulationControls("running"), ["pause", "step", "reset", "speed"]);
    assert.deepEqual(deriveSimulationControls("paused"), ["resume", "step", "reset", "speed"]);
    assert.deepEqual(deriveSimulationControls("completed"), ["reset"]);
  });

  it("builds a normalized simulation session payload", () => {
    const payload = buildSimulationSessionPayload({
      sessionId: "sim-SB-1001",
      matchId: "SB-1001",
      teams: ["Liverpool", "Manchester City"],
      status: "paused",
      playbackSpeed: 1.5,
      currentIndex: 2,
      createdAt: "2026-03-31T10:00:00.000Z",
      updatedAt: "2026-03-31T10:05:00.000Z",
      timeline: [
        { minute: 3, team: "Liverpool", playerId: "P001" },
        { minute: 7, team: "Manchester City", playerId: "P002" },
        { minute: 11, team: "Liverpool", playerId: "P003" },
      ],
    });

    assert.equal(payload.progress, 67);
    assert.equal(payload.currentMinute, 7);
    assert.equal(payload.currentEvent.playerId, "P002");
    assert.equal(payload.nextEvents.length, 1);
    assert.equal(payload.controls[0], "resume");
  });
});
