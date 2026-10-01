// Hand-written in the v11 shape, not a real coach reply: a question whose two source quotes come from the lines of events 1 and 2.
export const QUESTION_PASTE = ["Mon 08:10 Ops: truck picked up 7731 fifty minutes after the pickup window", "Tue 09:30 Billing: issued Customer D a service credit for 7731"].join("\n");

export const QUESTION_REPLY = [
  "Events, in order",
  "1. From thread: The truck picks up 7731 fifty minutes after the pickup window.",
  "2. From thread: Billing issues Customer D a service credit for 7731.",
  "3. Guess: Billing reverses the credit.",
  "",
  "Question for the billing lead, at Friday's review: Does a late pickup earn the credit?",
  'From thread: "truck picked up 7731 fifty minutes after the pickup window"',
  'From thread: "issued Customer D a service credit for 7731"',
].join("\n");

// Hand-written in the v11 shape, not a real coach reply: the question quotes an event's line and a term row's line.
export const ROW_QUOTE_PASTE = [
  "Mon 08:10 Ops: truck picked up 7731 fifty minutes after the pickup window",
  "Wed 10:00 Account team: late means missing the booked delivery appointment",
].join("\n");

export const ROW_QUOTE_REPLY = [
  "Events, in order",
  "1. From thread: The truck picks up 7731 fifty minutes after the pickup window.",
  "",
  "Words that don't match",
  '"late"',
  "- From thread: Account team means missing the booked delivery appointment.",
  "",
  "Question for the account team lead, at Friday's review: Which late counts for the credit?",
  'From thread: "truck picked up 7731 fifty minutes after the pickup window"',
  'From thread: "late means missing the booked delivery appointment"',
].join("\n");
