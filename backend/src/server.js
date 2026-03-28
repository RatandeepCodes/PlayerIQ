import { createServer } from "node:http";

import { Server } from "socket.io";

import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { registerSimulationHandlers } from "./sockets/simulation.socket.js";

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.clientOrigin,
    credentials: true,
  },
});

registerSimulationHandlers(io);

const startServer = async () => {
  await connectDatabase();

  httpServer.listen(env.port, () => {
    console.log(`PlayerIQ backend listening on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});

