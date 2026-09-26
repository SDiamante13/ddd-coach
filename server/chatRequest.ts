import type { Conversation, Turn } from "../src/domain/conversation.ts";
import { MAX_SENT_ROWS, type KeptGlossaryRow } from "../src/domain/glossary.ts";
import { messageLength, parsePrompt, type Prompt } from "../src/domain/exchange.ts";
import { MAX_MESSAGE_CHARS } from "../src/shared/chatContract.ts";
import { field, stringField } from "../src/shared/json.ts";

export type RejectionReason = "malformed" | "tooLong" | "messageTooLong" | "glossaryTooLong";
export type ChatRequestResult = { ok: true; conversation: Conversation } | { ok: false; reason: RejectionReason };

export const MAX_HISTORY_TURNS = 50;
export const MAX_CONVERSATION_CHARS = 64_000;

const MALFORMED: ChatRequestResult = { ok: false, reason: "malformed" };
const TOO_LONG: ChatRequestResult = { ok: false, reason: "tooLong" };
const MESSAGE_TOO_LONG: ChatRequestResult = { ok: false, reason: "messageTooLong" };
const GLOSSARY_TOO_LONG: ChatRequestResult = { ok: false, reason: "glossaryTooLong" };
export const MAX_GLOSSARY_FIELD_CHARS = 300;

export function parseChatRequest(body: unknown): ChatRequestResult {
  if (hasTooManyTurns(body)) return TOO_LONG;
  if (hasTooBigGlossary(body)) return GLOSSARY_TOO_LONG;
  const conversation = readConversation(body);
  if (conversation === null) return MALFORMED;
  if (messageLength(conversation.prompt) > MAX_MESSAGE_CHARS) return MESSAGE_TOO_LONG;
  return charactersIn(conversation) > MAX_CONVERSATION_CHARS ? TOO_LONG : { ok: true, conversation };
}

function hasTooManyTurns(body: unknown): boolean {
  const history = field(body, "history");
  return Array.isArray(history) && history.length > MAX_HISTORY_TURNS;
}

function hasTooBigGlossary(body: unknown): boolean {
  const glossary = field(body, "glossary");
  if (!Array.isArray(glossary)) return false;
  const longField = (row: unknown) => typeof row === "object" && row !== null && Object.values(row).some(isLongText);
  return glossary.length > MAX_SENT_ROWS || glossary.some(longField);
}

const isLongText = (value: unknown): boolean => typeof value === "string" && value.length > MAX_GLOSSARY_FIELD_CHARS;

function charactersIn({ history, prompt, glossary }: Conversation): number {
  const kept = glossary.reduce((total, row) => total + Object.values(row).join("").length, 0);
  return history.reduce((total, turn) => total + turn.prompt.length + turn.reply.length, prompt.length + kept);
}

function readConversation(body: unknown): Conversation | null {
  const prompt = promptField(body, "message");
  const history = readHistory(body);
  const glossary = readGlossary(body);
  return prompt === null || history === null || glossary === null ? null : { history, prompt, glossary };
}

const KEPT_DAY = /^\d{4}-\d{2}-\d{2}$/;
const GLOSSARY_TEXT = ["word", "holder", "meaning", "keptOn", "from"] as const;

function readGlossary(body: unknown): KeptGlossaryRow[] | null {
  const glossary = field(body, "glossary");
  if (glossary === undefined) return [];
  if (!Array.isArray(glossary)) return null;
  const rows = glossary.map(readGlossaryRow);
  return rows.every((row) => row !== null) ? rows : null;
}

function readGlossaryRow(item: unknown): KeptGlossaryRow | null {
  const [word, holder, meaning, keptOn, from] = GLOSSARY_TEXT.map((name) => stringField(item, name));
  const source = stringField(item, "source");
  if (!word || !holder || !meaning || !keptOn || !from || !KEPT_DAY.test(keptOn)) return null;
  if (source !== "From thread" && source !== "Guess") return null;
  return { word, holder, meaning, source, keptOn, from };
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
