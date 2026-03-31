import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildComparisonCacheKey,
  buildMatchSnapshotCacheKey,
  buildProfileHistoryEntry,
} from "../src/repositories/analytics.repository.js";
import { buildPlayerUpsertPayload } from "../src/repositories/player.repository.js";
import {
  getCachedMatchAnalysis,
  getCachedMatchMomentum,
  getCachedTurningPoints,
  saveMatchAnalysisCache,
  saveMatchMomentumCache,
  saveTurningPointsCache,
} from "../src/services/analytics-cache.service.js";

describe("Persistence contracts", () => {
  it("builds normalized cache keys and profile history entries", () => {
    assert.equal(buildComparisonCacheKey("P101", "P001"), "P001::P101");
    assert.equal(buildMatchSnapshotCacheKey("SB-1001", "analysis"), "analysis::SB-1001");

    const entry = buildProfileHistoryEntry({
      analytics: {
        overallRating: 84,
        ppi: 79,
        pressureIndex: 1.12,
        playstyle: "Playmaker",
      },
    });

    assert.equal(entry.overallRating, 84);
    assert.equal(entry.playstyle, "Playmaker");
    assert.ok(entry.capturedAt);
  });

  it("builds a normalized player upsert payload", () => {
    const payload = buildPlayerUpsertPayload({
      player: {
        playerId: "P101",
        name: "Sunil Chhetri",
        team: "Bengaluru FC",
        position: "Forward",
        nationality: "India",
      },
      overview: {
        overallRating: 84,
      },
      metadata: {
        sources: ["kaggle_indian_players"],
      },
    });

    assert.equal(payload.playerId, "P101");
    assert.equal(payload.metadata.overview.overallRating, 84);
  });

  it("keeps match cache helpers safe when the database is unavailable", async () => {
    assert.equal(await getCachedMatchAnalysis("SB-1001"), null);
    assert.equal(await getCachedMatchMomentum("SB-1001"), null);
    assert.equal(await getCachedTurningPoints("SB-1001"), null);

    await saveMatchAnalysisCache("SB-1001", { ok: true });
    await saveMatchMomentumCache("SB-1001", { ok: true });
    await saveTurningPointsCache("SB-1001", { ok: true });
  });
});
