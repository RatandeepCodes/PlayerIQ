import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildMatchAnalysisEnvelope, buildMatchSimulationEnvelope } from "../src/services/match-analysis.service.js";

describe("Match service shaping", () => {
  it("builds a stable match analysis envelope", () => {
    const payload = buildMatchAnalysisEnvelope(
      "SB-1001",
      {
        teams: ["Liverpool", "Manchester City"],
        buckets: [{ startMinute: 0, endMinute: 5 }],
      },
      {
        turningPoints: [{ minute: 21 }],
      },
    );

    assert.equal(payload.summary.totalMomentumWindows, 1);
    assert.equal(payload.summary.totalTurningPoints, 1);
    assert.equal(payload.liveStatus, "ready");
  });

  it("sorts simulation timelines and adds summary controls", () => {
    const payload = buildMatchSimulationEnvelope("SB-1001", {
      timeline: [
        { minute: 12, second: 20, team: "Liverpool" },
        { minute: 4, second: 30, team: "Manchester City" },
      ],
    });

    assert.equal(payload.timeline[0].minute, 4);
    assert.equal(payload.summary.totalEvents, 2);
    assert.equal(payload.controls.includes("stop"), true);
  });
});
