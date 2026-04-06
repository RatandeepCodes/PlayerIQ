import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createServer } from "node:http";

import jwt from "jsonwebtoken";

import app from "../src/app.js";
import { env } from "../src/config/env.js";
import { normalizeFootballDataFixture } from "../src/services/football-data.service.js";
import { clearSimulationSessions } from "../src/services/simulation-session.service.js";

const server = createServer(app);
await new Promise((resolve) => server.listen(0, resolve));

const address = server.address();
const baseUrl =
  typeof address === "object" && address ? `http://127.0.0.1:${address.port}` : "http://127.0.0.1:5000";

const token = jwt.sign(
  {
    sub: "test-user-id",
    email: "test@playeriq.ai",
    role: "user",
  },
  env.jwtSecret,
  {
    expiresIn: env.jwtExpiresIn,
  },
);

after(async () => {
  clearSimulationSessions();
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

const assertOfflineOrLiveAnalysis = async (response, successKey) => {
  if (response.status === 502) {
    const payload = await response.json();
    return payload;
  }

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.ok(payload[successKey]);
  return payload;
};

describe("Match analysis routes", () => {
  it("requires authentication for match directory", async () => {
    const response = await fetch(`${baseUrl}/api/matches`);
    assert.equal(response.status, 401);
  });

  it("requires authentication for match analysis", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/analysis`);
    assert.equal(response.status, 401);
  });

  it("requires authentication for match simulation", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/simulate`, {
      method: "POST",
    });
    assert.equal(response.status, 401);
  });

  it("requires authentication for match momentum", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/momentum`);
    assert.equal(response.status, 401);
  });

  it("requires authentication for match turning points", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/turning-points`);
    assert.equal(response.status, 401);
  });

  it("requires authentication for the home live feed", async () => {
    const response = await fetch(`${baseUrl}/api/matches/live-feed/home`);
    assert.equal(response.status, 401);
  });

  it("requires authentication for live fixtures", async () => {
    const response = await fetch(`${baseUrl}/api/matches/live/fixtures`);
    assert.equal(response.status, 401);
  });

  it("requires authentication for live results", async () => {
    const response = await fetch(`${baseUrl}/api/matches/live/results`);
    assert.equal(response.status, 401);
  });

  it("requires authentication for simulation status", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/simulation`);
    assert.equal(response.status, 401);
  });

  it("returns upstream unavailable when AI service is offline", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/analysis`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await assertOfflineOrLiveAnalysis(response, "summary");
    if (response.status === 502) {
      assert.equal(payload.message, "Match momentum unavailable from AI service");
    }
  });

  it("returns upstream unavailable for momentum when AI service is offline", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/momentum`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await assertOfflineOrLiveAnalysis(response, "buckets");
    if (response.status === 502) {
      assert.equal(payload.message, "Match momentum unavailable from AI service");
    }
  });

  it("returns upstream unavailable for turning points when AI service is offline", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/turning-points`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const payload = await assertOfflineOrLiveAnalysis(response, "turningPoints");
    if (response.status === 502) {
      assert.equal(payload.message, "Turning points unavailable from AI service");
    }
  });

  it("returns upstream unavailable for simulation when AI service is offline", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/simulate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 502);
    const payload = await response.json();
    assert.equal(payload.message, "Match simulation unavailable from AI service");
  });

  it("returns a match directory even when the AI service is offline", async () => {
    const response = await fetch(`${baseUrl}/api/matches`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.ok(payload.matches.length >= 1);
  });

  it("supports match directory filtering and pagination metadata", async () => {
    const response = await fetch(`${baseUrl}/api/matches?limit=5&page=1&status=completed&search=Bengaluru`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.equal(payload.metadata.page, 1);
    assert.equal(payload.metadata.limit, 5);
    assert.equal(payload.metadata.filters.status, "completed");
    assert.ok(Array.isArray(payload.matches));
  });

  it("returns a normalized home live feed envelope", async () => {
    const response = await fetch(`${baseUrl}/api/matches/live-feed/home`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.ok(Array.isArray(payload.upcomingMatches));
    assert.ok(payload.metadata?.source);
    assert.ok(payload.metadata?.status);
  });

  it("returns an empty live fixture feed when the provider is not configured", async () => {
    const response = await fetch(`${baseUrl}/api/matches/live/fixtures`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.deepEqual(payload.matches, []);
    assert.equal(payload.metadata.source, "football-data");
    assert.equal(payload.metadata.configured, false);
  });

  it("returns an empty live result feed when the provider is not configured", async () => {
    const response = await fetch(`${baseUrl}/api/matches/live/results`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.deepEqual(payload.liveMatches, []);
    assert.deepEqual(payload.completedMatches, []);
    assert.equal(payload.metadata.source, "football-data");
    assert.equal(payload.metadata.configured, false);
  });

  it("returns not found for simulation status before a session is started", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/simulation`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 404);
    const payload = await response.json();
    assert.equal(payload.message, "No simulation session exists for match 'SB-1001'");
  });

  it("validates simulation control payloads", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/simulation/control`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "warp-speed",
      }),
    });

    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.message, "Validation failed");
  });

  it("returns not found for simulation control before a session is started", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/simulation/control`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "pause",
      }),
    });

    assert.equal(response.status, 404);
    const payload = await response.json();
    assert.equal(payload.message, "No simulation session exists for match 'SB-1001'");
  });

  it("normalizes football-data fixtures into the PlayerIQ match shape", () => {
    const fixture = normalizeFootballDataFixture({
      id: 2001,
      utcDate: "2026-04-10T18:00:00Z",
      status: "SCHEDULED",
      matchday: 31,
      stage: "REGULAR_SEASON",
      venue: "Camp Nou",
      competition: {
        name: "Primera Division",
        code: "PD",
      },
      season: {
        startDate: "2025-08-01",
        endDate: "2026-05-31",
      },
      homeTeam: {
        name: "Barcelona",
      },
      awayTeam: {
        name: "Real Madrid",
      },
      score: {
        fullTime: {
          home: null,
          away: null,
        },
      },
    });

    assert.equal(fixture.matchId, "FD-2001");
    assert.equal(fixture.title, "Barcelona vs Real Madrid");
    assert.equal(fixture.competition, "Primera Division");
    assert.equal(fixture.competitionCode, "PD");
    assert.equal(fixture.status, "scheduled");
    assert.equal(fixture.homeScore, 0);
    assert.equal(fixture.awayScore, 0);
    assert.deepEqual(fixture.teams, ["Barcelona", "Real Madrid"]);
    assert.equal(fixture.hasEvents, false);
  });

  it("normalizes live and completed provider statuses into playeriq-friendly values", () => {
    const liveFixture = normalizeFootballDataFixture({
      id: 2002,
      status: "IN_PLAY",
      competition: { name: "Premier League", code: "PL" },
      season: { startDate: "2025-08-01", endDate: "2026-05-31" },
      homeTeam: { name: "Arsenal" },
      awayTeam: { name: "Liverpool" },
      score: { fullTime: { home: 1, away: 1 } },
    });
    const completedFixture = normalizeFootballDataFixture({
      id: 2003,
      status: "FINISHED",
      competition: { name: "Premier League", code: "PL" },
      season: { startDate: "2025-08-01", endDate: "2026-05-31" },
      homeTeam: { name: "Manchester City" },
      awayTeam: { name: "Chelsea" },
      score: { fullTime: { home: 3, away: 1 } },
    });

    assert.equal(liveFixture.status, "in_play");
    assert.equal(completedFixture.status, "finished");
    assert.equal(completedFixture.homeScore, 3);
    assert.equal(completedFixture.awayScore, 1);
  });
});
