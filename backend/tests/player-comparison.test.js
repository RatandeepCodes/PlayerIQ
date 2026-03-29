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

describe("Player comparison route", () => {
  it("requires authentication for comparison", async () => {
    const response = await fetch(`${baseUrl}/api/player/compare?player1=P001&player2=P101`);
    assert.equal(response.status, 401);
  });

  it("validates missing query parameters", async () => {
    const response = await fetch(`${baseUrl}/api/player/compare?player1=P001`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.message, "Validation failed");
  });

  it("rejects identical comparison targets", async () => {
    const response = await fetch(`${baseUrl}/api/player/compare?player1=P001&player2=P001`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 400);
    const payload = await response.json();
    assert.equal(payload.message, "Validation failed");
  });

  it("returns upstream unavailable when AI service is offline", async () => {
    const response = await fetch(`${baseUrl}/api/player/compare?player1=P001&player2=P101`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 502);
    const payload = await response.json();
    assert.equal(payload.message, "Player comparison unavailable from AI service");
  });
});
