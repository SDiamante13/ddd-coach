import type { KeptGlossaryRow } from "../domain/glossary.ts";
export type ChatTurn = { prompt: string; reply: string; signature: string };
export type ChatRequestBody = { message: string; history: readonly ChatTurn[]; glossary?: readonly KeptGlossaryRow[] };
export type ChatFailureReason =
  | "malformed"
  | "conversation_too_long"
  | "message_too_long"
  | "glossary_too_long"
  | "unverified"
  | "access_expired"
  | "credit_exhausted"
  | "timed_out"
  | "empty_reply"
  | "unavailable";
export type ChatFailureBody = { error: string; reason: ChatFailureReason; retryAfterSeconds?: number };
export type ChatResponseBody = { reply: string; signature: string } | ChatFailureBody | { error: string };

export const MAX_MESSAGE_CHARS = 24_000;

export const COACH_UNAVAILABLE = "The coach is unavailable. Try again.";
export const coachUnavailableFor = (seconds: number) => `The coach is unavailable. Try again in ${seconds} s.`;
export const COACH_EMPTY_REPLY = "The coach sent an empty reply. Try again.";
export const COACH_MALFORMED = "Send a message.";
export const COACH_OUT_OF_CREDIT = "The coach is paused: its usage budget is used up. Tell the organizer.";
export const COACH_TIMED_OUT = "The coach took too long. Try a shorter question or Retry.";
export const COACH_TOO_LONG = "This conversation is too long for the coach. Copy the conversation, then start a new conversation.";
export const COACH_UNVERIFIED =
  "That message couldn't be checked, so it was skipped. Send it again. " +
  "If it keeps happening, copy the conversation and start a new conversation.";
export const COACH_MESSAGE_TOO_LONG = "This message is too long for the coach. Shorten it and send it again.";
export const COACH_GLOSSARY_TOO_LONG = "Your kept glossary is too big to send. Remove some rows, then send again.";
export const CUT_SHORT_NOTE = '(Cut short at the length limit. Say "continue" for the rest.)';
