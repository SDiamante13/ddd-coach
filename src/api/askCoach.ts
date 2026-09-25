import type { Conversation } from "../domain/conversation.ts";
import type { AskResult } from "../domain/exchange.ts";
import {
  COACH_MESSAGE_TOO_LONG,
  COACH_TIMED_OUT,
  COACH_UNAVAILABLE,
  type ChatRequestBody,
} from "../shared/chatContract.ts";
import { readJson, stringField } from "../shared/json.ts";

const PAYLOAD_TOO_LARGE = 413;
const GATEWAY_TIMEOUT = 504;

const UNREACHABLE: AskResult = { ok: false, error: "Could not reach the coach.", retryable: true };
const UNEXPECTED: AskResult = { ok: false, error: "Unexpected response from the coach.", retryable: true };
const UNAVAILABLE: AskResult = { ok: false, error: COACH_UNAVAILABLE, retryable: true };
const TIMED_OUT: AskResult = { ok: false, error: COACH_TIMED_OUT, retryable: true };
const MESSAGE_TOO_LONG: AskResult = { ok: false, error: COACH_MESSAGE_TOO_LONG, retryable: false };
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

function postConversation({ prompt, history }: Conversation): Promise<Response> {
  const body: ChatRequestBody = { message: prompt, history };
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
  return reply === undefined ? UNEXPECTED : { ok: true, reply, signature: stringField(body, "signature") ?? "" };
}

function errorFrom(body: unknown, status: number): AskResult {
  const error = stringField(body, "error");
  if (error !== undefined) return { ok: false, error, retryable: status !== PAYLOAD_TOO_LARGE };
  return FALLBACK_BY_STATUS[status] ?? UNAVAILABLE;
}
