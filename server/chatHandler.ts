import { parsePrompt, type Prompt } from "../src/domain/exchange.ts";
import { isChatRequestBody, type ChatResponseBody } from "../src/shared/chatContract.ts";
import type { Coach } from "./coach.ts";
import type { CoachConfig, ConfigResult } from "./config.ts";

type ChatHandlerDeps = {
  config: ConfigResult;
  createCoach: (config: CoachConfig) => Coach;
};

export function createChatHandler({ config, createCoach }: ChatHandlerDeps) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST") return methodNotAllowed();
    if (!config.ok) return respond({ error: config.error }, { status: 500 });
    const prompt = await readPrompt(request);
    if (prompt === null) return respond({ error: "Send a message." }, { status: 400 });
    return replyFrom(createCoach(config.config), prompt);
  };
}

function methodNotAllowed(): Response {
  return respond({ error: "Use POST." }, { status: 405, headers: { Allow: "POST" } });
}

async function readPrompt(request: Request): Promise<Prompt | null> {
  const body = await readJson(request);
  return isChatRequestBody(body) ? parsePrompt(body.message) : null;
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function replyFrom(coach: Coach, prompt: Prompt): Promise<Response> {
  try {
    return respond({ reply: await coach.reply(prompt) });
  } catch {
    return respond({ error: "The coach is unavailable. Try again." }, { status: 502 });
  }
}

function respond(body: ChatResponseBody, init?: ResponseInit): Response {
  return Response.json(body, init);
}
