import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildSimulationUpdate, sortSimulationTimeline } from "../src/sockets/simulation.socket.js";

describe("Simulation socket helpers", () => {
  it("sorts simulation timelines by minute then second", () => {
    const sorted = sortSimulationTimeline([
      { minute: 15, second: 40 },
      { minute: 15, second: 5 },
      { minute: 3, second: 10 },
    ]);

    assert.deepEqual(
      sorted.map((event) => `${event.minute}:${event.second}`),
      ["3:10", "15:5", "15:40"],
    );
  });

  it("builds progress-aware simulation updates", () => {
    const payload = buildSimulationUpdate("SB-1001", { minute: 21, playerId: "P101" }, 3, 6);
    assert.equal(payload.progress, 50);
    assert.equal(payload.currentEvent.playerId, "P101");
  });
});
