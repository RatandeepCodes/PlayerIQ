import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { shapePlayerComparisonData } from "../src/services/player-comparison.service.js";
import { buildProfileEnvelope } from "../src/services/player-profile.service.js";

describe("Player analytics contract shaping", () => {
  it("builds a normalized profile envelope with section availability", () => {
    const profile = buildProfileEnvelope({
      storedPlayer: {
        playerId: "P101",
        name: "Sunil Chhetri",
        team: "Bengaluru FC",
        position: "ST",
        nationality: "India",
      },
      rating: {
        playerId: "P101",
        playerName: "Sunil Chhetri",
        team: "Bengaluru FC",
        nationality: "India",
        position: "ST",
        overallRating: 67,
        ppi: 60,
        matchesAnalyzed: 2,
        sources: ["kaggle_indian_players"],
        attributes: {
          shooting: 75,
          passing: 76,
          dribbling: 75,
          defending: 35,
          creativity: 71,
          physical: 45,
        },
      },
      playstyle: {
        playstyle: "Striker",
        clusterDistance: 0.22,
        supportingTraits: ["direct attacking threat"],
      },
      pressure: {
        pressureIndex: 0.5,
        pressureScore: 25,
        pressureEvents: 2,
        interpretation: "Output dips in late close-game situations",
      },
      report: {
        summary: "Summary text",
        strengths: ["A", "B", "C"],
        developmentAreas: ["D"],
      },
    });

    assert.equal(profile.player.name, "Sunil Chhetri");
    assert.equal(profile.overview.overallRating, 67);
    assert.equal(profile.analytics.rating.matchesAnalyzed, 2);
    assert.equal(profile.analytics.playstyleProfile.name, "Striker");
    assert.equal(profile.analytics.availability.sections.report, true);
  });

  it("builds a structured comparison payload with metric winners", () => {
    const comparison = shapePlayerComparisonData("P001", "P101", {
      playerOne: "Kevin De Bruyne",
      playerTwo: "Sunil Chhetri",
      winner: "Sunil Chhetri",
      summary: "Comparison summary",
      radar: [
        { metric: "Shooting", playerOne: 46, playerTwo: 75 },
        { metric: "Passing", playerOne: 99, playerTwo: 76 },
      ],
    });

    assert.equal(comparison.players.playerOne.playerId, "P001");
    assert.equal(comparison.winner.playerId, "P101");
    assert.equal(comparison.scorecards.playerOne.metricsWon, 1);
    assert.equal(comparison.scorecards.playerTwo.metricsWon, 1);
    assert.equal(comparison.categoryWinners.length, 2);
  });

  it("builds a partial profile envelope when only non-rating sections are available", () => {
    const profile = buildProfileEnvelope({
      requestedPlayerId: "P404",
      playstyle: {
        playstyle: "Winger",
        clusterDistance: 0.41,
        supportingTraits: ["1v1 carry value"],
      },
      pressure: {
        pressureIndex: 1.08,
        pressureScore: 63,
        pressureEvents: 5,
        interpretation: "Improves when match pressure rises",
      },
    });

    assert.equal(profile.player.playerId, "P404");
    assert.equal(profile.player.name, "Unknown Player");
    assert.equal(profile.analytics.playstyle, "Winger");
    assert.equal(profile.analytics.availability.isPartial, true);
    assert.equal(profile.analytics.availability.hasLiveAnalytics, true);
  });
});
