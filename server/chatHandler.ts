import { parsePrompt, type Prompt } from "../src/domain/exchange.ts";
import {
  COACH_TIMED_OUT,
  COACH_UNAVAILABLE,
  isChatRequestBody,
  type ChatResponseBody,
} from "../src/shared/chatContract.ts";
import { readJson } from "../src/shared/json.ts";
import type { Coach } from "./coach.ts";
import type { CoachConfig, ConfigResult } from "./config.ts";
import { TIMED_OUT, withDeadline } from "./deadline.ts";

export type CoachFailure = { name: string; statusCode: number | undefined };
export type CoachFailureLog = (failure: CoachFailure) => void;

type ReplyDeps = { deadlineMs: number; log: CoachFailureLog };

type ChatHandlerDeps = ReplyDeps & {
  config: ConfigResult;
  createCoach: (config: CoachConfig) => Coach;
};

export function createChatHandler({ config, createCoach, ...replyDeps }: ChatHandlerDeps) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST") return methodNotAllowed();
    if (!config.ok) return misconfigured(config.error);
    const prompt = await readPrompt(request);
    if (prompt === null) return badRequest();
    return replyFrom(createCoach(config.config), prompt, replyDeps);
  };
}

function methodNotAllowed(): Response {
  return respond({ error: "Use POST." }, { status: 405, headers: { Allow: "POST" } });
}

function misconfigured(error: string): Response {
  return respond({ error }, { status: 500 });
}

function badRequest(): Response {
  return respond({ error: "Send a message." }, { status: 400 });
}

async function readPrompt(request: Request): Promise<Prompt | null> {
  const body = await readJson(request);
  return isChatRequestBody(body) ? parsePrompt(body.message) : null;
}

async function replyFrom(coach: Coach, prompt: Prompt, { deadlineMs, log }: ReplyDeps): Promise<Response> {
  try {
    return replied(await withDeadline(coach.reply(prompt), deadlineMs));
  } catch (error) {
    log(failureOf(error));
    return coachUnavailable();
  }
}

function failureOf(error: unknown): CoachFailure {
  const name = error instanceof Error ? error.name : typeof error;
  return { name, statusCode: statusCodeOf(error) };
}

function statusCodeOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return undefined;
  return typeof error.statusCode === "number" ? error.statusCode : undefined;
}

function replied(reply: string | typeof TIMED_OUT): Response {
  if (reply === TIMED_OUT) return coachTooSlow();
  if (reply.trim() === "") return emptyReply();
  return respond({ reply });
}

function coachTooSlow(): Response {
  return respond({ error: COACH_TIMED_OUT }, { status: 504 });
}

function emptyReply(): Response {
  return respond({ error: "The coach sent an empty reply. Try again." }, { status: 502 });
}

function coachUnavailable(): Response {
  return respond({ error: COACH_UNAVAILABLE }, { status: 502 });
}

function respond(body: ChatResponseBody, init?: ResponseInit): Response {
  return Response.json(body, init);
}
