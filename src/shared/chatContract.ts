import type { KeptGlossaryRow } from "../domain/glossary.ts";
export type ChatTurn = { prompt: string; reply: string; signature: string };
export type ChatRequestBody = { message: string; history: readonly ChatTurn[]; glossary?: readonly KeptGlossaryRow[] };
export type ChatResponseBody = { reply: string; signature: string } | { error: string };

export const MAX_MESSAGE_CHARS = 24_000;

export const COACH_UNAVAILABLE = "The coach is unavailable. Try again.";
export const COACH_OUT_OF_CREDIT = "The coach is paused: its usage budget is used up. Tell the organizer.";
export const COACH_TIMED_OUT = "The coach took too long. Try a shorter question or Retry.";
export const COACH_TOO_LONG = "This conversation is too long for the coach. Copy the conversation, then start a new one.";
export const COACH_UNVERIFIED =
  "That message couldn't be checked, so it was skipped. Send it again. " +
  "If it keeps happening, copy the conversation and start a new one.";
export const COACH_MESSAGE_TOO_LONG = "This message is too long for the coach. Shorten it and send it again.";
export const CUT_SHORT_NOTE = '(Cut short at the length limit. Say "continue" for the rest.)';
