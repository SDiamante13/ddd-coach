import { V11_EXAMPLE_REPLY } from "./v10Replies.ts";

// Canned replies for `npm run demo:board` (#94), answered in order by dev/fixtureApi.ts.
export const BOARD_DEMO_REPLIES = [
  // 1. Real: the recorded prompt v11 reply to "Try an example thread".
  V11_EXAMPLE_REPLY,
  // 2. Hand-written in the v11 shape, not a real coach reply: repeats one event, adds one from the thread and one guess.
  [
    "Events, in order",
    "1. From thread: Carrier desk charges Carrier 3 a late pickup fee on 7731.",
    "2. From thread: Carrier 3 rejects the 7731 rebook.",
    "3. Guess: Ops books another carrier for 7731.",
    "",
    "Words that don't match",
    '"late"',
    "- From thread: Carrier desk means a missed pickup that can incur a carrier late fee.",
    "- From thread: Account team means missing the delivery appointment the customer booked.",
    "",
    "Question for the carrier desk lead and the account team lead, at Friday's service review: For load 7731, which counts as late for the rebook: the missed pickup window or the delivery appointment?",
    'From thread: "charged Carrier 3 the late pickup fee on 7731"',
    'From thread: "in the contract a load is late when we miss the delivery appointment the customer booked"',
  ].join("\n"),
  // 3. Hand-written in the v11 shape, not a real coach reply: restates reply 2's guess as from the thread.
  [
    "Events, in order",
    "1. From thread: Ops books another carrier for 7731.",
    "",
    "Question for the ops lead and the carrier desk lead, at Friday's service review: For load 7731, who pays the late pickup fee when Ops books another carrier?",
    'From thread: "charged Carrier 3 the late pickup fee on 7731"',
  ].join("\n"),
];
