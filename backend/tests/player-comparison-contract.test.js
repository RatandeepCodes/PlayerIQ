import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shapePlayerComparisonData } from "../src/services/player-comparison.service.js";

describe("Player comparison shaping", () => {
  it("keeps the winner nullable when the comparison result is a tie", () => {
    const comparison = shapePlayerComparisonData("P001", "P101", {
      playerOne: "Kevin De Bruyne",
      playerTwo: "Sunil Chhetri",
      winner: null,
      summary: "Close comparison.",
      radar: [],
    });

    assert.equal(comparison.winner, null);
    assert.equal(comparison.players.playerOne.playerId, "P001");
  });
});
