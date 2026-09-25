import { stringField } from "./json.ts";

export type ChatRequestBody = { message: string };
export type ChatResponseBody = { reply: string } | { error: string };

export function isChatRequestBody(body: unknown): body is ChatRequestBody {
  return stringField(body, "message") !== undefined;
}
