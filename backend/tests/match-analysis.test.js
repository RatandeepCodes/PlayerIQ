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
});
