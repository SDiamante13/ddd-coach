import type { Config } from "@netlify/functions";
import { readAccessPassword, readSigningKey } from "../../server/config.ts";
import { createSessionHandler } from "../../server/accessHandlers.ts";

export default (request: Request): Promise<Response> =>
  createSessionHandler({
    access: readAccessPassword(process.env),
    signingKey: readSigningKey(process.env),
    now: () => new Date(),
  })(request);

export const config: Config = {
  path: "/api/session",
};
