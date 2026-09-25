import type { AskResult } from "../domain/exchange.ts";
import type { ChatRequestBody } from "../shared/chatContract.ts";
import { readJson, stringField } from "../shared/json.ts";

const UNREACHABLE: AskResult = { ok: false, error: "Could not reach the coach." };
const UNEXPECTED: AskResult = { ok: false, error: "Unexpected response from the coach." };

export async function askCoach(message: string): Promise<AskResult> {
  try {
    return await readResult(await postMessage(message));
  } catch {
    return UNREACHABLE;
  }
}

function postMessage(message: string): Promise<Response> {
  const body: ChatRequestBody = { message };
  return fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function readResult(response: Response): Promise<AskResult> {
  const body = await readJson(response);
  if (!response.ok) return errorFrom(body);
  const reply = stringField(body, "reply");
  return reply === undefined ? UNEXPECTED : { ok: true, reply };
}

function errorFrom(body: unknown): AskResult {
  const error = stringField(body, "error");
  return error === undefined ? UNEXPECTED : { ok: false, error };
}
