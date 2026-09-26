import { ACCESS_REQUIRED } from "../src/shared/accessContract.ts";
import {
  COACH_EMPTY_REPLY,
  COACH_GLOSSARY_TOO_LONG,
  COACH_MALFORMED,
  COACH_MESSAGE_TOO_LONG,
  COACH_OUT_OF_CREDIT,
  COACH_TIMED_OUT,
  COACH_TOO_LONG,
  COACH_UNAVAILABLE,
  COACH_UNVERIFIED,
  coachUnavailableFor,
  type ChatFailureReason,
  type ChatResponseBody,
} from "../src/shared/chatContract.ts";
import { parseChatRequest, type RejectionReason } from "./chatRequest.ts";
import { CoachBusy, CoachOutOfCredit, type Coach } from "./coach.ts";
import { gatekeeperOf } from "./accessHandlers.ts";
import type { AccessPasswordResult, CoachConfig, ConfigResult, SigningKeyResult } from "./config.ts";
import { TIMED_OUT, withDeadline } from "./deadline.ts";
import { MAX_BODY_BYTES, readJsonWithin } from "./requestBody.ts";
import {
  createTurnSigner,
  verifyConversation,
  type TurnSigner,
  type VerifiedConversation,
} from "./turnSignature.ts";

export type CoachFailure = { name: string; statusCode: number | undefined };
export type CoachFailureLog = (failure: CoachFailure) => void;

const NO_STORE = { "Cache-Control": "no-store" };
const MISSED_DEADLINE: CoachFailure = { name: "Timeout", statusCode: undefined };

type VetReply = (reply: string) => string;
type CoachCallDeps = { deadlineMs: number; log: CoachFailureLog; vetReply?: VetReply };
type ReplyDeps = CoachCallDeps & { signer: TurnSigner };

type ChatHandlerDeps = CoachCallDeps & {
  access: AccessPasswordResult;
  now: () => Date;
  config: ConfigResult;
  createCoach: (config: CoachConfig) => Coach;
  signingKey: SigningKeyResult;
};

export function createChatHandler({ access, now, config, createCoach, signingKey, ...deps }: ChatHandlerDeps) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== "POST") return methodNotAllowed();
    const gatekeeper = gatekeeperOf({ access, signingKey });
    if (!gatekeeper.ok) return misconfigured(gatekeeper.error);
    if (!config.ok) return misconfigured(config.error);
    if (!gatekeeper.pass.admits(request.headers.get("Cookie"), now())) return accessRequired();
    const signer = createTurnSigner(gatekeeper.signingKey);
    const received = await readJsonWithin(request, MAX_BODY_BYTES);
    if (!received.ok) return rejected("messageTooLong");
    const parsed = parseChatRequest(received.body);
    if (!parsed.ok) return rejected(parsed.reason);
    const conversation = verifyConversation(signer, parsed.conversation);
    if (conversation === null) return rejected("unverified");
    return replyFrom(createCoach(config.config), conversation, { ...deps, signer });
  };
}

function methodNotAllowed(): Response {
  return respond({ error: "Use POST." }, { status: 405, headers: { Allow: "POST" } });
}

function accessRequired(): Response {
  return respond({ error: ACCESS_REQUIRED, reason: "access_expired" }, { status: 401, headers: NO_STORE });
}

function misconfigured(error: string): Response {
  return respond({ error, reason: "unavailable" }, { status: 500 });
}

type Refusal = RejectionReason | "unverified";

const REJECTIONS: Record<Refusal, { error: string; status: number; reason: ChatFailureReason }> = {
  malformed: { error: COACH_MALFORMED, status: 400, reason: "malformed" },
  tooLong: { error: COACH_TOO_LONG, status: 413, reason: "conversation_too_long" },
  messageTooLong: { error: COACH_MESSAGE_TOO_LONG, status: 413, reason: "message_too_long" },
  glossaryTooLong: { error: COACH_GLOSSARY_TOO_LONG, status: 413, reason: "glossary_too_long" },
  unverified: { error: COACH_UNVERIFIED, status: 400, reason: "unverified" },
};

function rejected(reason: Refusal): Response {
  const { status, ...body } = REJECTIONS[reason];
  return respond(body, { status });
}

async function replyFrom(
  coach: Coach,
  conversation: VerifiedConversation,
  { deadlineMs, log, signer, vetReply = asIs }: ReplyDeps,
): Promise<Response> {
  try {
    const reply = await withDeadline(coach.reply(conversation), deadlineMs);
    if (reply === TIMED_OUT) log(MISSED_DEADLINE);
    return replied(reply === TIMED_OUT ? reply : vetReply(reply), conversation.prompt, signer);
  } catch (error) {
    log(failureOf(error));
    return failedReply(error);
  }
}

function failedReply(error: unknown): Response {
  if (error instanceof CoachOutOfCredit) return coachOutOfCredit();
  if (error instanceof CoachBusy) return coachBusy(error.retryAfterSeconds);
  return coachUnavailable();
}

function failureOf(error: unknown): CoachFailure {
  const name = error instanceof Error ? error.name : typeof error;
  return { name, statusCode: statusCodeOf(error) };
}

function statusCodeOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("statusCode" in error)) return undefined;
  return typeof error.statusCode === "number" ? error.statusCode : undefined;
}

const asIs: VetReply = (reply) => reply;

function replied(reply: string | typeof TIMED_OUT, prompt: string, signer: TurnSigner): Response {
  if (reply === TIMED_OUT) return coachTooSlow();
  if (reply.trim() === "") return emptyReply();
  return respond({ reply, signature: signer.sign({ prompt, reply }) });
}

function coachTooSlow(): Response {
  return respond({ error: COACH_TIMED_OUT, reason: "timed_out" }, { status: 504 });
}

function emptyReply(): Response {
  return respond({ error: COACH_EMPTY_REPLY, reason: "empty_reply" }, { status: 502 });
}

function coachOutOfCredit(): Response {
  return respond({ error: COACH_OUT_OF_CREDIT, reason: "credit_exhausted" }, { status: 503 });
}

function coachBusy(retryAfterSeconds: number): Response {
  const body = { error: coachUnavailableFor(retryAfterSeconds), reason: "unavailable", retryAfterSeconds } as const;
  return respond(body, { status: 502, headers: { "Retry-After": String(retryAfterSeconds) } });
}

function coachUnavailable(): Response {
  return respond({ error: COACH_UNAVAILABLE, reason: "unavailable" }, { status: 502 });
}

function respond(body: ChatResponseBody, init?: ResponseInit): Response {
  return Response.json(body, init);
}
