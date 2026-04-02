import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createServer } from "node:http";

import jwt from "jsonwebtoken";

import app from "../src/app.js";
import { env } from "../src/config/env.js";

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

describe("Player persistence routes", () => {
  it("requires authentication for stored player directory", async () => {
    const response = await fetch(`${baseUrl}/api/player`);
    assert.equal(response.status, 401);
  });

  it("validates stored player directory query parameters", async () => {
    const response = await fetch(`${baseUrl}/api/player?limit=200`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 400);
  });

  it("falls back to a reviewer-friendly player directory when the database is unavailable", async () => {
    const response = await fetch(`${baseUrl}/api/player?limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.ok(["ai-service", "showcase"].includes(payload.metadata.source));
    assert.equal(payload.metadata.database, "disconnected");
    assert.ok(payload.players.length > 0);
    assert.equal(payload.players[0].nationality, "India");
  });

  it("supports lightweight player directory search", async () => {
    const response = await fetch(`${baseUrl}/api/player?limit=10&search=Sunil`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.ok(payload.players.length >= 1);
    assert.equal(payload.metadata.filters.search, "Sunil");
    assert.ok(payload.players.some((player) => player.name.includes("Sunil")));
  });

  it("returns empty player history when the database is unavailable", async () => {
    const response = await fetch(`${baseUrl}/api/player/P101/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 200);
    const payload = await response.json();
    assert.deepEqual(payload.snapshots, []);
    assert.equal(payload.metadata.database, "disconnected");
  });
});
