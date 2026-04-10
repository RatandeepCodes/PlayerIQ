import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createServer } from "node:http";

import app from "../src/app.js";

const server = createServer(app);
await new Promise((resolve) => server.listen(0, resolve));

const address = server.address();
const baseUrl =
  typeof address === "object" && address ? `http://127.0.0.1:${address.port}` : "http://127.0.0.1:5000";

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

describe("Auth routes", () => {
  it("returns health with dependency and config status", async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.equal(response.status, 200);

    const payload = await response.json();
    assert.ok(["ok", "degraded"].includes(payload.status));
    assert.ok(["connected", "disconnected"].includes(payload.database));
    assert.ok(["online", "offline"].includes(payload.aiService));
    assert.ok(["online", "offline", "disabled"].includes(payload.liveData));
    assert.equal(payload.services.backend, "online");
    assert.ok(["online", "offline", "disabled"].includes(payload.services.liveData));
    assert.ok(Array.isArray(payload.config.warnings));
    assert.equal(typeof payload.config.liveDataProvider, "string");
    assert.equal(typeof payload.config.footballData.configured, "boolean");
    assert.equal(typeof payload.config.footballData.baseUrl, "string");
    assert.equal(typeof payload.uptimeSeconds, "number");
    assert.equal(typeof payload.timestamp, "string");
  });

  it("requires authentication for current-user route", async () => {
    const response = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(response.status, 401);

    const payload = await response.json();
    assert.equal(payload.message, "Authentication required");
  });

  it("returns database unavailable when auth storage is offline", async () => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@playeriq.ai",
        password: "strongpassword",
      }),
    });

    assert.equal(response.status, 503);

    const payload = await response.json();
    assert.equal(payload.message, "Database unavailable");
  });
});
