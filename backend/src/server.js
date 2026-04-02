import { createServer } from "node:http";

import { Server } from "socket.io";

import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env, getRuntimeWarnings } from "./config/env.js";
import { registerSimulationHandlers } from "./sockets/simulation.socket.js";
import { logger } from "./utils/logger.js";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.clientOrigin,
    credentials: true,
  },
});

registerSimulationHandlers(io);

const startServer = async () => {
  const runtimeWarnings = getRuntimeWarnings();
  runtimeWarnings.forEach((warning) => {
    logger.warn("Backend runtime warning", warning);
  });

  await connectDatabase();

  httpServer.listen(env.port, () => {
    logger.info("PlayerIQ backend listening", {
      port: env.port,
      aiServiceUrl: env.aiServiceUrl,
      clientOrigin: env.clientOrigin,
    });
  });
};

startServer().catch((error) => {
  logger.error("Failed to start backend", {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
