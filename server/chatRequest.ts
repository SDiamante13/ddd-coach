import type { Conversation, Turn } from "../src/domain/conversation.ts";
import { messageLength, parsePrompt, type Prompt } from "../src/domain/exchange.ts";
import { MAX_MESSAGE_CHARS } from "../src/shared/chatContract.ts";
import { field, stringField } from "../src/shared/json.ts";

export type RejectionReason = "malformed" | "tooLong" | "messageTooLong";
export type ChatRequestResult = { ok: true; conversation: Conversation } | { ok: false; reason: RejectionReason };

export const MAX_HISTORY_TURNS = 50;
export const MAX_CONVERSATION_CHARS = 24_000;

const MALFORMED: ChatRequestResult = { ok: false, reason: "malformed" };
const TOO_LONG: ChatRequestResult = { ok: false, reason: "tooLong" };
const MESSAGE_TOO_LONG: ChatRequestResult = { ok: false, reason: "messageTooLong" };

export function parseChatRequest(body: unknown): ChatRequestResult {
  if (hasTooManyTurns(body)) return TOO_LONG;
  const conversation = readConversation(body);
  if (conversation === null) return MALFORMED;
  if (messageLength(conversation.prompt) > MAX_MESSAGE_CHARS) return MESSAGE_TOO_LONG;
  return charactersIn(conversation) > MAX_CONVERSATION_CHARS ? TOO_LONG : { ok: true, conversation };
}

function hasTooManyTurns(body: unknown): boolean {
  const history = field(body, "history");
  return Array.isArray(history) && history.length > MAX_HISTORY_TURNS;
}

function charactersIn({ history, prompt }: Conversation): number {
  return history.reduce((total, turn) => total + turn.prompt.length + turn.reply.length, prompt.length);
}

function readConversation(body: unknown): Conversation | null {
  const prompt = promptField(body, "message");
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
  const prompt = promptField(item, "prompt");
  const reply = stringField(item, "reply");
  if (prompt === null || !reply?.trim()) return null;
  return { prompt, reply, signature: stringField(item, "signature") ?? "" };
}

function promptField(body: unknown, key: string): Prompt | null {
  return parsePrompt(stringField(body, key) ?? "");
}
