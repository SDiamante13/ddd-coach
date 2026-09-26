import type { Config } from "@netlify/functions";
import { readApiKey } from "../../server/config.ts";
import { createHealthHandler } from "../../server/healthHandler.ts";

const handle = createHealthHandler({ apiKey: readApiKey(process.env), fetch: globalThis.fetch, now: Date.now });

export default (request: Request): Promise<Response> => handle(request);

export const config: Config = {
  path: "/api/health",
  rateLimit: { windowLimit: 300, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
