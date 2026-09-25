export type ChatRequestBody = { message: string };
export type ChatResponseBody = { reply: string } | { error: string };

export function isChatRequestBody(body: unknown): body is ChatRequestBody {
  return typeof body === "object" && body !== null && typeof (body as ChatRequestBody).message === "string";
}
