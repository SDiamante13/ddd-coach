import { stringField } from "./json.ts";

export type ChatRequestBody = { message: string };
export type ChatResponseBody = { reply: string } | { error: string };

export const COACH_UNAVAILABLE = "The coach is unavailable. Try again.";
export const COACH_TIMED_OUT = "The coach took too long. Try a shorter question or Retry.";

export function isChatRequestBody(body: unknown): body is ChatRequestBody {
  return stringField(body, "message") !== undefined;
}
