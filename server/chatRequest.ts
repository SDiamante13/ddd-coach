import type { Conversation, Turn } from "../src/domain/conversation.ts";
import { parsePrompt } from "../src/domain/exchange.ts";
import { field, stringField } from "../src/shared/json.ts";

export type RejectionReason = "malformed" | "tooLong";
export type ChatRequestResult = { ok: true; conversation: Conversation } | { ok: false; reason: RejectionReason };

export const MAX_HISTORY_TURNS = 50;
export const MAX_CONVERSATION_CHARS = 24_000;

const MALFORMED: ChatRequestResult = { ok: false, reason: "malformed" };
const TOO_LONG: ChatRequestResult = { ok: false, reason: "tooLong" };

export function parseChatRequest(body: unknown): ChatRequestResult {
  const conversation = readConversation(body);
  if (conversation === null) return MALFORMED;
  return isTooLong(conversation) ? TOO_LONG : { ok: true, conversation };
}

function isTooLong(conversation: Conversation): boolean {
  return conversation.history.length > MAX_HISTORY_TURNS || charactersIn(conversation) > MAX_CONVERSATION_CHARS;
}

function charactersIn({ history, prompt }: Conversation): number {
  return history.reduce((total, turn) => total + turn.prompt.length + turn.reply.length, prompt.length);
}

function readConversation(body: unknown): Conversation | null {
  const prompt = parsePrompt(stringField(body, "message") ?? "");
  const history = readHistory(body);
  return prompt === null || history === null ? null : { history, prompt };
}

function readHistory(body: unknown): Turn[] | null {
  const history = field(body, "history");
  if (!Array.isArray(history)) return null;
  const turns = history.map(readTurn);
  return turns.every((turn) => turn !== null) ? turns : null;
}

function readTurn(item: unknown): Turn | null {
  const prompt = parsePrompt(stringField(item, "prompt") ?? "");
  const reply = stringField(item, "reply");
  return prompt === null || !reply?.trim() ? null : { prompt, reply };
}
