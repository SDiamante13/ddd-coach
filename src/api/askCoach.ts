import type { ChatRequestBody } from "../shared/chatContract.ts";

export type AskResult = { ok: true; reply: string } | { ok: false; error: string };

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

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function stringField(body: unknown, key: string): string | undefined {
  if (typeof body !== "object" || body === null) return undefined;
  const value: unknown = (body as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}
