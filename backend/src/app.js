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

app.use(
  cors({
    origin: env.clientOrigin,
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
