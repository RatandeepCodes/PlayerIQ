import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { isDatabaseConnected } from "./config/db.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";
import { attachRequestContext } from "./middleware/request-context.middleware.js";
import authRoutes from "./routes/auth.routes.js";
import playerRoutes from "./routes/player.routes.js";
import matchRoutes from "./routes/match.routes.js";

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

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "playeriq-backend",
    database: isDatabaseConnected() ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/player", playerRoutes);
app.use("/api/matches", matchRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
