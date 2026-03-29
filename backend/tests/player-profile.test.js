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

describe("Player profile routes", () => {
  it("requires authentication for player lookup", async () => {
    const response = await fetch(`${baseUrl}/api/player/P101`);
    assert.equal(response.status, 401);
  });

  it("requires authentication for player profile", async () => {
    const response = await fetch(`${baseUrl}/api/player/P101/profile`);
    assert.equal(response.status, 401);
  });

  it("returns upstream unavailable for player lookup when AI service is offline", async () => {
    const response = await fetch(`${baseUrl}/api/player/P101`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 502);

    const payload = await response.json();
    assert.equal(payload.message, "Player analytics service unavailable");
  });

  it("returns upstream unavailable when AI service is offline and no stored player exists", async () => {
    const response = await fetch(`${baseUrl}/api/player/P101/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.equal(response.status, 502);

    const payload = await response.json();
    assert.equal(payload.message, "Player analytics service unavailable");
  });
});
