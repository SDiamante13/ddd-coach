import type { Conversation } from "../src/domain/conversation.ts";
import {
  COACH_TIMED_OUT,
  COACH_TOO_LONG,
  COACH_UNAVAILABLE,
  type ChatResponseBody,
} from "../src/shared/chatContract.ts";
import { parseChatRequest, type RejectionReason } from "./chatRequest.ts";
import type { Coach } from "./coach.ts";
import type { CoachConfig, ConfigResult } from "./config.ts";
import { TIMED_OUT, withDeadline } from "./deadline.ts";
import { MAX_BODY_BYTES, readJsonWithin } from "./requestBody.ts";

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
    const received = await readJsonWithin(request, MAX_BODY_BYTES);
    if (!received.ok) return tooLong();
    const parsed = parseChatRequest(received.body);
    if (!parsed.ok) return rejected(parsed.reason);
    return replyFrom(createCoach(config.config), parsed.conversation, replyDeps);
  };
}

function methodNotAllowed(): Response {
  return respond({ error: "Use POST." }, { status: 405, headers: { Allow: "POST" } });
}

function misconfigured(error: string): Response {
  return respond({ error }, { status: 500 });
}

function rejected(reason: RejectionReason): Response {
  return reason === "tooLong" ? tooLong() : badRequest();
}

function tooLong(): Response {
  return respond({ error: COACH_TOO_LONG }, { status: 413 });
}

function badRequest(): Response {
  return respond({ error: "Send a message." }, { status: 400 });
}

async function replyFrom(
  coach: Coach,
  conversation: Conversation,
  { deadlineMs, log }: ReplyDeps,
): Promise<Response> {
  try {
    return replied(await withDeadline(coach.reply(conversation), deadlineMs));
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
