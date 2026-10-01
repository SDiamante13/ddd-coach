// Hand-written in the v11 shape, not real coach replies: one event and a split word, then a reply with a new word only.
export const WORDS_PASTE = ["Mon Ops (day desk): late means the truck missed the pickup window", "Tue Billing: late is anything on the weekly late report"].join("\n");

export const WORDS_REPLY = [
  "Events, in order",
  "1. From thread: Ops marks load 7731 late after the pickup window.",
  "",
  "Words that don't match",
  '"late"',
  "- From thread: Ops (day desk) means a truck not at pickup by the end of the pickup window.",
  "- From thread: Billing means a load on the weekly late report.",
  "- Guess: Code means actual_pickup_at is after pickup_window_end.",
].join("\n");

export const WORDS_ONLY_REPLY = ["Words that don't match", '"on time"', "- Guess: Account team means meeting the booked delivery appointment."].join("\n");

// Hand-written in the v11 shape, not a real coach reply: the split word plus a question that quotes Billing's line.
export const WORDS_QUESTION_REPLY = [
  WORDS_REPLY,
  "",
  "Question for the billing lead, at Friday's review: Which late counts for the credit?",
  'From thread: "late is anything on the weekly late report"',
].join("\n");
