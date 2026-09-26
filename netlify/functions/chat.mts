import type { Config } from "@netlify/functions";
import { createChatHandler, type CoachFailure } from "../../server/chatHandler.ts";
import { systemPrompt } from "../../server/systemPrompt.ts";
import { readAccessPassword, readConfig, readSigningKey, readTimeoutMs } from "../../server/config.ts";
import { createOpenRouterCoach } from "../../server/openRouterCoach.ts";

const logCoachFailure = (failure: CoachFailure): void => console.error("Coach failed", failure);

export default (request: Request): Promise<Response> =>
  createChatHandler({
    access: readAccessPassword(process.env),
    now: () => new Date(),
    config: readConfig(process.env),
    createCoach: (config) => createOpenRouterCoach(config, systemPrompt()),
    deadlineMs: readTimeoutMs(process.env),
    log: logCoachFailure,
    signingKey: readSigningKey(process.env),
  })(request);

export const config: Config = {
  path: "/api/chat",
  rateLimit: { windowLimit: 300, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
