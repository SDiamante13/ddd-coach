import { CUT_SHORT_NOTE } from "../shared/chatContract.ts";
import { V10_GREETING_REPLY, V11_REPLY_WITH_SOURCES } from "./v10Replies.ts";

export const FIRST_BOARD_REPLY = V11_REPLY_WITH_SOURCES;
export const GREETING_REPLY = V10_GREETING_REPLY;

// Hand-written in the v11 shape, not a real coach reply: repeats event 1 word for word and adds two events.
export const SECOND_BOARD_REPLY = [
  "Events, in order",
  "1. From thread: Customer submits a bkg on the portal.",
  "2. From thread: The carrier rejects the booking.",
  "3. Guess: Ops chooses another carrier and resubmits the booking.",
  "",
  "Question for the ops sign-off lead, at the Tue 27 Oct RFC review: Who picks the next carrier after a rejection?",
  'From thread: "carrier rejected, ops picked another"',
].join("\n");

// Hand-written in the v11 shape, not a real coach reply: restates reply 2's guess as from the thread.
export const THIRD_BOARD_REPLY = [
  "Events, in order",
  "1. From thread: Ops chooses another carrier and resubmits the booking.",
  "",
  "Question for the ops sign-off lead, at the Tue 27 Oct RFC review: Does a resubmitted booking keep its number?",
  'From thread: "ops picked another carrier and resubmitted"',
].join("\n");

// Hand-written in the v11 shape, not a real coach reply: repeats reply 1's events word for word and nothing else.
export const REPEAT_ONLY_BOARD_REPLY = [
  "Events, in order",
  "1. From thread: Customer submits a bkg on the portal.",
  "2. From thread: The carrier billed TONU on the orig load, then hauled the new one.",
].join("\n");

export const PROSE_FOLLOW_UP_REPLY = "Good question. The day desk and the night shift disagree on what a rebook is, so settle that first.";

export const CUT_BOARD_REPLY = [
  "Events, in order",
  "1. From thread: Customer submits a bkg on the portal.",
  "2. Guess: The carrier rejects the booking.",
  CUT_SHORT_NOTE,
].join("\n");
