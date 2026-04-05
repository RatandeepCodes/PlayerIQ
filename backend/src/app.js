import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { isDatabaseConnected } from "./config/db.js";
import { env, getRuntimeWarnings } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { attachRequestContext } from "./middleware/request-context.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import playerRoutes from "./routes/player.routes.js";
import matchRoutes from "./routes/match.routes.js";
import { getAiServiceHealth } from "./services/ai.service.js";

const app = express();
const allowedOrigins = [env.clientOrigin, "http://localhost:8080", "http://127.0.0.1:8080", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(express.json());
app.use(attachRequestContext);
app.use(morgan("dev"));

app.get("/api/health", async (_req, res) => {
  const warnings = getRuntimeWarnings();
  const aiHealth = await getAiServiceHealth();
  const database = isDatabaseConnected() ? "connected" : "disconnected";
  const status = database === "connected" && aiHealth.status === "online" && warnings.length === 0 ? "ok" : "degraded";

  res.json({
    status,
    service: "playeriq-backend",
    database,
    aiService: aiHealth.status,
    services: {
      backend: "online",
      database,
      aiService: aiHealth.status,
    },
    config: {
      liveDataProvider: env.liveDataProvider,
      footballData: {
        configured: Boolean(env.footballDataApiToken),
        baseUrl: env.footballDataApiBaseUrl,
      },
      hasWarnings: warnings.length > 0,
      warnings,
    },
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/matches", matchRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
