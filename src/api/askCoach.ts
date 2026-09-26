import type { Conversation } from "../domain/conversation.ts";
import type { AskResult } from "../domain/exchange.ts";
import {
  COACH_MESSAGE_TOO_LONG,
  COACH_TIMED_OUT,
  COACH_UNAVAILABLE,
  isChatFailureReason,
  type ChatRequestBody,
} from "../shared/chatContract.ts";
import { ACCESS_REQUIRED } from "../shared/accessContract.ts";
import { field, readJson, stringField } from "../shared/json.ts";
import { failureFor } from "./chatFailures.ts";

const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const PAYLOAD_TOO_LARGE = 413;
const SERVICE_UNAVAILABLE = 503;
const GATEWAY_TIMEOUT = 504;

const UNREACHABLE: AskResult = { ok: false, error: "Could not reach the coach.", remedy: "retry" };
const UNEXPECTED: AskResult = { ok: false, error: "Unexpected response from the coach.", remedy: "retry" };
const UNAVAILABLE: AskResult = { ok: false, error: COACH_UNAVAILABLE, remedy: "retry" };
const TIMED_OUT: AskResult = { ok: false, error: COACH_TIMED_OUT, remedy: "retry" };
const MESSAGE_TOO_LONG: AskResult = { ok: false, error: COACH_MESSAGE_TOO_LONG, remedy: "copy" };
const ACCESS_LOST: AskResult = { ok: false, error: ACCESS_REQUIRED, remedy: "unlock" };
const NOT_WORTH_RETRYING: readonly number[] = [BAD_REQUEST, PAYLOAD_TOO_LARGE, SERVICE_UNAVAILABLE];
const FALLBACK_BY_STATUS: Partial<Record<number, AskResult>> = {
  [PAYLOAD_TOO_LARGE]: MESSAGE_TOO_LONG,
  [GATEWAY_TIMEOUT]: TIMED_OUT,
};

export async function askCoach(conversation: Conversation): Promise<AskResult> {
  try {
    return await readResult(await postConversation(conversation));
  } catch {
    return UNREACHABLE;
  }
}

function postConversation({ prompt, history, glossary }: Conversation): Promise<Response> {
  const body: ChatRequestBody = { message: prompt, history, ...(glossary.length > 0 && { glossary }) };
  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function readResult(response: Response): Promise<AskResult> {
  const body = await readJson(response);
  if (!response.ok) return errorFrom(body, response.status);
  const reply = stringField(body, "reply");
  const signature = stringField(body, "signature");
  return reply === undefined || signature === undefined ? UNEXPECTED : { ok: true, reply, signature };
}

function errorFrom(body: unknown, status: number): AskResult {
  return failureByReason(body) ?? failureByStatus(body, status);
}

function failureByReason(body: unknown): AskResult | undefined {
  const reason = field(body, "reason");
  if (!isChatFailureReason(reason)) return undefined;
  return { ok: false, ...failureFor(reason, wholeSecondsIn(body, "retryAfterSeconds")) };
}

function failureByStatus(body: unknown, status: number): AskResult {
  if (status === UNAUTHORIZED) return ACCESS_LOST;
  const error = stringField(body, "error");
  if (error !== undefined) return { ok: false, error, remedy: NOT_WORTH_RETRYING.includes(status) ? "copy" : "retry" };
  return FALLBACK_BY_STATUS[status] ?? UNAVAILABLE;
}

function wholeSecondsIn(body: unknown, key: string): number | undefined {
  const value = field(body, key);
  return Number.isInteger(value) && Number(value) > 0 ? Number(value) : undefined;
}
