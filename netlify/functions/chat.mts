import type { Config } from "@netlify/functions";
import { createChatHandler } from "../../server/chatHandler.ts";
import { readConfig } from "../../server/config.ts";
import { createOpenRouterCoach } from "../../server/openRouterCoach.ts";

export default (request: Request): Promise<Response> =>
  createChatHandler({ config: readConfig(process.env), createCoach: createOpenRouterCoach })(request);

export const config: Config = { path: "/api/chat" };
