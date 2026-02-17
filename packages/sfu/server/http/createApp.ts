import { config as defaultConfig } from "../../config/config.js";
import { Logger } from "../../utilities/loggers.js";
import type { SfuState } from "../state.js";

export type CreateSfuAppOptions = {
  state: SfuState;
  config?: typeof defaultConfig;
};

export type SfuHttpApp = {
  fetch: (request: Request) => Promise<Response>;
};

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,X-SFU-SECRET,X-SFU-CLIENT",
};

const jsonResponse = (body: unknown, status = 200): Response => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
};

const noContentResponse = (): Response => {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
};

const normalizePathname = (pathname: string): string => {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
};

const hasValidSecret = (request: Request, secret: string): boolean => {
  const provided = request.headers.get("x-sfu-secret");
  return Boolean(provided && provided === secret);
};

export const createSfuApp = ({
  state,
  config = defaultConfig,
}: CreateSfuAppOptions): SfuHttpApp => {
  const fetch = async (request: Request): Promise<Response> => {
    if (request.method === "OPTIONS") {
      return noContentResponse();
    }

    const pathname = normalizePathname(new URL(request.url).pathname);

    if (request.method === "GET" && pathname === "/health") {
      const healthyWorkers = state.workers.filter((worker) => !worker.closed);
      const isHealthy = healthyWorkers.length > 0;

      const healthData = {
        status: isHealthy ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        port: config.port,
        workers: {
          total: state.workers.length,
          healthy: healthyWorkers.length,
          closed: state.workers.length - healthyWorkers.length,
        },
      };

      if (!isHealthy) {
        Logger.error("Health check failed: No healthy workers available");
        return jsonResponse(healthData, 503);
      }

      return jsonResponse(healthData);
    }

    if (request.method === "GET" && pathname === "/rooms") {
      if (!hasValidSecret(request, config.sfuSecret)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      const clientId = request.headers.get("x-sfu-client") || "default";
      const roomDetails = Array.from(state.rooms.values())
        .filter((room) => room.clientId === clientId)
        .map((room) => ({
          id: room.id,
          clients: room.clientCount,
        }));

      return jsonResponse({ rooms: roomDetails });
    }

    if (request.method === "GET" && pathname === "/status") {
      if (!hasValidSecret(request, config.sfuSecret)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      return jsonResponse({
        instanceId: config.instanceId,
        version: config.version,
        draining: state.isDraining,
        rooms: state.rooms.size,
        uptime: process.uptime(),
      });
    }

    if (request.method === "POST" && pathname === "/drain") {
      if (!hasValidSecret(request, config.sfuSecret)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      let body: { draining?: unknown } | null = null;
      try {
        body = (await request.json()) as { draining?: unknown };
      } catch (_error) {
        return jsonResponse({ error: "Invalid JSON body" }, 400);
      }

      if (typeof body?.draining !== "boolean") {
        return jsonResponse({ error: "Invalid draining flag" }, 400);
      }

      state.isDraining = body.draining;
      Logger.info(`Draining mode ${state.isDraining ? "enabled" : "disabled"}`);
      return jsonResponse({ draining: state.isDraining });
    }

    return jsonResponse({ error: "Not found" }, 404);
  };

  return { fetch };
};
