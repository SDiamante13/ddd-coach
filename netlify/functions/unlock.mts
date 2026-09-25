import type { Config } from "@netlify/functions";
import { readAccessPassword, readSigningKey } from "../../server/config.ts";
import { createUnlockHandler } from "../../server/unlockHandler.ts";

export default (request: Request): Promise<Response> =>
  createUnlockHandler({
    access: readAccessPassword(process.env),
    signingKey: readSigningKey(process.env),
    now: () => new Date(),
  })(request);

export const config: Config = {
  path: "/api/unlock",
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
