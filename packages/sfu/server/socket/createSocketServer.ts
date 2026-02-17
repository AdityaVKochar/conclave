import { Server as BunEngine } from "@socket.io/bun-engine";
import { Server as SocketIOServer } from "socket.io";
import { config as defaultConfig } from "../../config/config.js";
import type { SfuState } from "../state.js";
import { attachSocketAuth } from "./auth.js";
import { registerConnectionHandlers } from "./registerConnectionHandlers.js";

export type CreateSocketServerOptions = {
  state: SfuState;
  config?: typeof defaultConfig;
};

export type SfuSocketServer = {
  io: SocketIOServer;
  engine: BunEngine;
  isSocketPath: (pathname: string) => boolean;
  handler: ReturnType<BunEngine["handler"]>;
};

const SOCKET_IO_PATH = "/socket.io/";

export const createSfuSocketServer = (
  options: CreateSocketServerOptions,
): SfuSocketServer => {
  const socketConfig = options.config ?? defaultConfig;
  const connectionStateRecovery =
    socketConfig.socket.recoveryMaxDisconnectionMs > 0
      ? {
          maxDisconnectionDuration:
            socketConfig.socket.recoveryMaxDisconnectionMs,
          skipMiddlewares: true,
        }
      : undefined;

  const io = new SocketIOServer({
    connectionStateRecovery,
  });

  const engine = new BunEngine({
    path: SOCKET_IO_PATH,
    pingInterval: socketConfig.socket.pingIntervalMs,
    pingTimeout: socketConfig.socket.pingTimeoutMs,
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.bind(engine);

  attachSocketAuth(io, { config: options.config });
  registerConnectionHandlers(io, options.state);

  const handler = engine.handler();
  const isSocketPath = (pathname: string): boolean => {
    return pathname === SOCKET_IO_PATH || pathname === SOCKET_IO_PATH.slice(0, -1);
  };

  return {
    io,
    engine,
    isSocketPath,
    handler,
  };
};
