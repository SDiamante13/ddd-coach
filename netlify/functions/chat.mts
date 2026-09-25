import type { Config } from "@netlify/functions";
import { createChatHandler, type CoachFailure } from "../../server/chatHandler.ts";
import { readConfig, readTimeoutMs } from "../../server/config.ts";
import { createOpenRouterCoach } from "../../server/openRouterCoach.ts";

const logCoachFailure = (failure: CoachFailure): void => console.error("Coach failed", failure);

export default (request: Request): Promise<Response> =>
  createChatHandler({
    config: readConfig(process.env),
    createCoach: createOpenRouterCoach,
    deadlineMs: readTimeoutMs(process.env),
    log: logCoachFailure,
    signingKey: process.env.COACH_SIGNING_KEY ?? "",
  })(request);

export const config: Config = {
  path: "/api/chat",
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
