import type { Server as SocketIOServer } from "socket.io";
import { config as defaultConfig } from "../config/config.js";
import { Logger } from "../utilities/loggers.js";
import { initMediaSoup } from "./init.js";
import { createSfuApp } from "./http/createApp.js";
import type { SfuHttpApp } from "./http/createApp.js";
import { createSfuSocketServer } from "./socket/createSocketServer.js";
import { createSfuState } from "./state.js";
import type { SfuState } from "./state.js";

export type SfuServer = {
  app: SfuHttpApp;
  httpServer: Bun.Server<any> | null;
  io: SocketIOServer;
  state: SfuState;
  start: () => Promise<void>;
  stop: () => Promise<void>;
};

export type CreateSfuServerOptions = {
  config?: typeof defaultConfig;
};

export const createSfuServer = (
  options: CreateSfuServerOptions = {},
): SfuServer => {
  const config = options.config ?? defaultConfig;
  const state = createSfuState({ isDraining: config.draining });

  const app = createSfuApp({ state, config });
  const socketServer = createSfuSocketServer({ state, config });
  const io = socketServer.io;
  let httpServer: Bun.Server<any> | null = null;

  const start = async (): Promise<void> => {
    if (httpServer) {
      return;
    }

    await initMediaSoup(state);

    httpServer = Bun.serve({
      port: config.port,
      websocket: socketServer.handler.websocket,
      idleTimeout: socketServer.handler.idleTimeout,
      maxRequestBodySize: socketServer.handler.maxRequestBodySize,
      fetch: (request, server) => {
        const pathname = new URL(request.url).pathname;
        if (socketServer.isSocketPath(pathname)) {
          return socketServer.engine.handleRequest(request, server);
        }

        return app.fetch(request);
      },
    });

    Logger.success(`Server running on port ${config.port}`);
  };

  const stop = async (): Promise<void> => {
    socketServer.engine.close();
    io.close();

    if (httpServer) {
      httpServer.stop(true);
      httpServer = null;
    }

    for (const room of state.rooms.values()) {
      room.close();
    }
    state.rooms.clear();

    for (const worker of state.workers) {
      try {
        worker.close();
      } catch (error) {
        Logger.warn("Error closing mediasoup worker", error);
      }
    }
    state.workers = [];
  };

  return {
    app,
    get httpServer() {
      return httpServer;
    },
    io,
    state,
    start,
    stop,
  };
};
