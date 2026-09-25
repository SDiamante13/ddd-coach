import type { Conversation } from "../domain/conversation.ts";
import type { AskResult } from "../domain/exchange.ts";
import { COACH_TIMED_OUT, COACH_UNAVAILABLE, type ChatRequestBody } from "../shared/chatContract.ts";
import { readJson, stringField } from "../shared/json.ts";

const UNREACHABLE: AskResult = { ok: false, error: "Could not reach the coach." };
const UNEXPECTED: AskResult = { ok: false, error: "Unexpected response from the coach." };
const UNAVAILABLE: AskResult = { ok: false, error: COACH_UNAVAILABLE };
const TIMED_OUT: AskResult = { ok: false, error: COACH_TIMED_OUT };

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
  return reply === undefined ? UNEXPECTED : { ok: true, reply };
}

function errorFrom(body: unknown, status: number): AskResult {
  const error = stringField(body, "error");
  if (error !== undefined) return { ok: false, error };
  return status === 504 ? TIMED_OUT : UNAVAILABLE;
}
