import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createServer } from "node:http";

import jwt from "jsonwebtoken";

import app from "../src/app.js";
import { env } from "../src/config/env.js";
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

describe("Match analysis routes", () => {
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

    assert.equal(response.status, 502);
    const payload = await response.json();
    assert.equal(payload.message, "Match momentum unavailable from AI service");
  });

  it("returns upstream unavailable for momentum when AI service is offline", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/momentum`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 502);
    const payload = await response.json();
    assert.equal(payload.message, "Match momentum unavailable from AI service");
  });

  it("returns upstream unavailable for turning points when AI service is offline", async () => {
    const response = await fetch(`${baseUrl}/api/matches/SB-1001/turning-points`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 502);
    const payload = await response.json();
    assert.equal(payload.message, "Turning points unavailable from AI service");
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
});
