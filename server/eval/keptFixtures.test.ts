// @vitest-environment node
import { describe, expect, it } from "vitest";
import { loadFixture } from "./fixtures.ts";
import { failedHardChecks } from "./replyChecks.ts";

// Hand-written v14-shaped replies (not model output) that pin what the kept-glossary fixture keys accept and refuse.
const DRIFT_GOOD = `Events, in order
1. From thread: Carrier desk says Carrier 3's dedicated-lane contract for the Customer D lanes starts Monday.
2. From thread: Carrier 3 picks up load 7815 2h late and it delivers 15 min before the appointment.
3. From thread: Ops closes 7815 on the app photo while Billing waits for the signed paper.
4. From thread: Account team brings 7815 and the POD question to Friday's ops sync.

Words that don't match
"POD"
- From thread: Billing means the signed paper from the receiver, which releases the invoice.
- From thread: Ops (day desk) means the driver's app photo, which closes the load on the board.
- Guess: Code has no POD field on the invoice release.

Changed since you kept it
- "late": Carrier desk here means a missed delivery appointment under the dedicated-lane contract; you kept: "A missed pickup that can incur a carrier late fee." (kept 25 Sep 2026 from load 7731).

Question for the billing lead and the ops lead, at Friday's ops sync: For load 7815, which POD releases the invoice: the signed paper from the receiver or the app photo from the driver?
From thread: "a POD is the signed paper from the receiver"
From thread: "for us the POD is the app photo, that's what closes the load on our board"`;

const STEADY_GOOD = `Events, in order
1. From thread: Carrier desk charges Carrier 3 the late pickup fee on 7820.
2. From thread: Billing plans to rebill Customer D for 7790 because the accessorial was missing.
3. From thread: Account team takes the 7790 rebill wording to Friday's ops sync.

Words that don't match
"rebill"
- From thread: Billing means a corrected invoice replacing the old one.
- From thread: Account team means reversing a credit given to the customer.
- From thread: Code means the invoices table's rebill_of column pointing at the replaced invoice.

Question for the billing lead and the account team lead, at Friday's ops sync: For Customer D's load 7790, which does the rebill mean: a corrected invoice replacing the old one, or reversing the credit?
From thread: "a rebill is a corrected invoice replacing the old one"
From thread: "for us a rebill is when we reverse the credit we gave them"`;

const STEADY_FALSE = STEADY_GOOD.replace("\n\nQuestion for", '\n\nChanged since you kept it\n- "late": Ops here means a truck not at the pickup by the end of the window; you kept: "A truck not at pickup by the end of the pickup window." (kept 25 Sep 2026 from load 7731).\n\nQuestion for');
const AGREEING_LINE = '- "late": Ops (day desk) here means a truck that misses the end of the pickup window; you kept: "A truck not at pickup by the end of the pickup window." (kept 25 Sep 2026 from load 7731).';
const DRIFT_AT_AGREEING_ROW = DRIFT_GOOD.replace("\n\nQuestion for", `\n${AGREEING_LINE}\n\nQuestion for`);
const DRIFT_REASK = DRIFT_GOOD.replace("which POD releases the invoice", "does on time still mean the booked delivery appointment, and which POD releases the invoice");


describe("the kept-glossary fixtures (#100)", () => {
  it.each([
    ["a reply that names the planted drift and asks about the new POD split", "kept-drift", DRIFT_GOOD, []],
    ["a reply that re-asks the settled on time", "kept-drift", DRIFT_REASK, ["settled not re-asked"]],
    ["a reply that misses the planted drift", "kept-drift", DRIFT_GOOD.replace(/\n\nChanged since you kept it\n[^\n]+/, ""), ["drift named"]],
    ["a reply that also flags a kept row the thread agrees with", "kept-drift", DRIFT_AT_AGREEING_ROW, ["no false drift"]],
    ["a control reply that uses every kept word as kept", "kept-steady", STEADY_GOOD, []],
    ["a control reply that calls a paraphrase a drift", "kept-steady", STEADY_FALSE, ["no false drift"]],
  ])("judge %s", (_case, fixture, reply, failures) => {
    expect(failedHardChecks(reply, "stop", loadFixture(fixture))).toEqual(failures);
  });
});
