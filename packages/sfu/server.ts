import { createSfuServer } from "./server/createSfuServer.js";

const server = createSfuServer();
let shuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log(`[SFU] Received ${signal}. Shutting down...`);
  await server.stop();
  process.exit(0);
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void server.start().catch((error) => {
  console.error("[SFU] Failed to start server", error);
  process.exit(1);
});
