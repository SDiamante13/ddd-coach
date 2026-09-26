// @vitest-environment node
import { describe, expect, it } from "vitest";
import { loadFixture } from "./fixtures.ts";
import { failedHardChecks } from "./replyChecks.ts";

// Hand-written replies (not model output) that pin what the #99 fixture keys accept and refuse.
const INVITE = "Paste a thread, meeting notes or code from your work.";
const DDD_SOURCED = `DDD shapes software around a model the developers and the business share, in the words they both use.\nSource: Evans, Domain-Driven Design Reference (2015), "Ubiquitous Language"\n${INVITE}`;
const DDD_GENERAL = `The sources I have don't cover this.\nGeneral practice: DDD shapes software around a model the developers and the business share.\n${INVITE}`;
const DDD_UNLABELLED = `DDD shapes software around a model the developers and the business share.\n${INVITE}`;
const DDD_UNKNOWN_TITLE = DDD_SOURCED.replace('"Ubiquitous Language"', '"Domain-Driven Design"');
const DDD_GENERAL_ONLY = `General practice: DDD shapes software around a model the developers and the business share.\n${INVITE}`;
const DDD_NOT_COVERED_ONLY = `The sources I have don't cover this. DDD shapes software around a shared model.\n${INVITE}`;

const SIDES_GOOD = `Events, in order
1. From thread: A partial return on issue #5120 creates a credit note in a new number series.
2. From thread: The German localisation maintainer says a credit note should reuse the invoice's number with a suffix.
3. From thread: The India localisation maintainer says a credit note needs its own GST number series.
4. From thread: The release manager holds release 15.2 until the maintainers agree before Friday's release call.

Words that don't match
"credit note"
- From thread: German localisation maintainer means a correction to an invoice already sent, numbered from that invoice.
- From thread: India localisation maintainer means its own GST document for returned goods, with its own number series.
- From thread: Code means a return flagged is_return, numbered from one credit_note_series setting for every country.

Question for the German localisation maintainer and the India localisation maintainer, at Friday's release call: For issue #5120, which number series does a credit note for a partial return take in each country: the invoice's own number with a suffix, or a separate GST series?
From thread: "It should reuse the invoice's number with a suffix"
From thread: "It needs its own number series"`;
const SIDES_UNCLEAR = SIDES_GOOD.replace("German localisation maintainer means", "Team unclear (view A) means").replace("India localisation maintainer means", "Team unclear (view B) means");
const SIDES_INVENTED_ROLES = SIDES_GOOD.replace("Question for the German localisation maintainer and the India localisation maintainer", "Question for the invoicing product lead and the tax compliance officer");
const SIDES_NO_CASE = SIDES_GOOD.replace("For issue #5120, which number series", "For a partial return, which number series");
const SIDES_BACKTICKS = SIDES_GOOD.replace("one credit_note_series setting", "one `credit_note_series` setting");

const SETTLED_GOOD = `Events, in order
1. From thread: Warehouse holds load 6120 for Customer F at dock 4.
2. From thread: Account team settles what the hold means, and Billing names its own meaning invoice hold.
3. From thread: The driver for 6120 arrives and leaves with nothing loaded.
4. From thread: Carrier desk says Carrier 5 is owed the dry run fee.
5. From thread: Account team takes dry run to Thursday's carrier review.

Words that don't match
"dry run"
- From thread: Carrier desk means any trip with nothing loaded, whatever the reason.
- From thread: Billing means a truck sent back empty because the shipper wasn't ready.

Question for the carrier desk lead and the billing lead, at Thursday's carrier review: For load 6120, which trip counts as a dry run: any trip with nothing loaded, or only one where the shipper wasn't ready?
From thread: "any trip with nothing loaded is a dry run"
From thread: "a dry run is when the truck is sent back empty"`;
const SETTLED_NO_CASE = SETTLED_GOOD.replace("For load 6120, which trip", "Which trip");
const SETTLED_REASKED = SETTLED_GOOD.replace("For load 6120, which trip counts", "For load 6120, what does on hold mean now, and which trip counts");
const SETTLED_RELISTED = SETTLED_GOOD.replace('\n\nQuestion for', '\n"on hold"\n- From thread: Warehouse means the freight stays on the dock until the customer releases it.\n- From thread: Billing means the load isn\'t invoiced yet.\n\nQuestion for');

describe("the #99 prompt-gap fixtures", () => {
  it.each([
    ["a what-is-DDD answer citing a real section", "ddd-question", DDD_SOURCED, []],
    ["a what-is-DDD answer that says it isn't covered and labels general practice", "ddd-question", DDD_GENERAL, []],
    ["an unlabelled what-is-DDD answer", "ddd-question", DDD_UNLABELLED, ["sourced or general practice"]],
    ["a what-is-DDD answer citing a title the Reference doesn't have", "ddd-question", DDD_UNKNOWN_TITLE, ["citations verbatim", "sourced or general practice"]],
    ["a what-is-DDD answer labelled general practice without saying the sources don't cover it", "ddd-question", DDD_GENERAL_ONLY, ["sourced or general practice"]],
    ["a what-is-DDD answer that says it isn't covered but labels nothing", "ddd-question", DDD_NOT_COVERED_ONLY, ["sourced or general practice"]],
    ["a reply that names the sides by their stated context", "named-sides", SIDES_GOOD, []],
    ["a reply that writes Team unclear for sides the thread names", "named-sides", SIDES_UNCLEAR, ["sides named"]],
    ["a reply whose question invents roles", "named-sides", SIDES_INVENTED_ROLES, ["roles from thread"]],
    ["a product-debate reply whose question names no number, since that check is scoped to ops threads", "named-sides", SIDES_NO_CASE, []],
    ["a reply that copies the thread's backticks", "named-sides", SIDES_BACKTICKS, ["no markdown"]],
    ["a reply that leaves the settled split alone and asks what's open", "settled-in-thread", SETTLED_GOOD, []],
    ["an ops reply whose question names no case", "settled-in-thread", SETTLED_NO_CASE, ["question names a case"]],
    ["a reply that re-asks the split the thread settled", "settled-in-thread", SETTLED_REASKED, ["settled not re-asked"]],
    ["a reply that relists the split the thread settled", "settled-in-thread", SETTLED_RELISTED, ["settled not relisted"]],
  ])("judge %s", (_case, fixture, reply, failures) => {
    expect(failedHardChecks(reply, "stop", loadFixture(fixture))).toEqual(failures);
  });
});
