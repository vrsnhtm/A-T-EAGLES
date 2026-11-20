import type { IncomingMessage } from "node:http";
import { loadEnv, type Plugin } from "vite";
import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Dev-only middleware that runs the real Vercel function from `api/` during
 * `vite dev`, so the inquiry form can be tested end to end without the Vercel
 * CLI. Production still uses /api/send-inquiry on Vercel.
 */

const API_ROUTE = "/api/send-inquiry";
const API_MODULE = "/api/send-inquiry.ts";

type DevResponse = {
  statusCode: number;
  status: (code: number) => DevResponse;
  json: (payload: unknown) => void;
  setHeader: (name: string, value: string | number) => void;
};

function readRawBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

export function devApiPlugin(): Plugin {
  return {
    name: "at-dev-api",
    apply: "serve",
    configureServer(server) {
      // Vite loads .env / .env.local for the client, but the serverless
      // handler reads process.env, so copy the values across once.
      const env = loadEnv(server.config.mode, server.config.root, "");
      for (const [key, value] of Object.entries(env)) {
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }

      server.middlewares.use((req, res, next) => {
        if (!req.url) {
          next();
          return;
        }

        const { pathname } = new URL(req.url, "http://localhost");
        if (pathname !== API_ROUTE) {
          next();
          return;
        }

        void (async () => {
          try {
            const rawBody = await readRawBody(req);
            const module = (await server.ssrLoadModule(API_MODULE)) as {
              default?: unknown;
            };
            const handler = module.default;

            if (typeof handler !== "function") {
              throw new Error(`No default export found in ${API_MODULE}`);
            }

            const headers: Record<string, string | number> = {};
            const devRes: DevResponse = {
              statusCode: 200,
              status(code) {
                devRes.statusCode = code;
                return devRes;
              },
              setHeader(name, value) {
                headers[name] = value;
              },
              json(payload) {
                res.writeHead(devRes.statusCode, {
                  "Content-Type": "application/json; charset=utf-8",
                  "Cache-Control": "no-store",
                  ...headers,
                });
                res.end(JSON.stringify(payload));
              },
            };

            // Vercel pre-parses JSON bodies; the handler also accepts a string.
            const vercelReq = Object.assign(req, {
              body: rawBody.length > 0 ? rawBody : undefined,
            }) as unknown as VercelRequest;

            await (handler as (
              request: VercelRequest,
              response: VercelResponse,
            ) => Promise<void>)(vercelReq, devRes as unknown as VercelResponse);
          } catch (error) {
            console.error(
              "[dev-api] /api/send-inquiry failed:",
              error instanceof Error ? error.message : error,
            );
            if (!res.headersSent) {
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  success: false,
                  message: "The local API route crashed. Check the terminal log.",
                }),
              );
            }
          }
        })();
      });
    },
  };
}
