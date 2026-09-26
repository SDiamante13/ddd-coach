import fc from "fast-check";
import { describe, expect, it } from "vitest";
import type { ExchangeId } from "./exchange.ts";
import type { EventCard } from "./board.ts";
import { entityId } from "./entityId.ts";
import { parsePrompt, type Exchange } from "./exchange.ts";
import { closestLine, lineOfCard, type PastedPrompt } from "./sourceLine.ts";

const pasted = (id: string, ...lines: string[]): PastedPrompt => ({ exchangeId: id as ExchangeId, text: lines.join("\n") });
const THREAD = pasted(
  "x1",
  "Mon 08:02  Ops day desk: morning. dock 4 scanner is down again",
  "Mon 09:14  Carrier desk: Carrier 3 charged the late pickup fee on 7731",
  "Mon 11:30  Billing: issued Customer D a service credit for 7731",
);
const lineOf = (prompts: PastedPrompt[], event: string) => {
  const found = closestLine(event, prompts);
  const prompt = prompts.find((each) => each.exchangeId === found?.exchangeId);
  return found && prompt ? prompt.text.slice(found.start, found.end) : null;
};

describe("closestLine", () => {
  it.each([
    ["the line an event repeats", "Carrier 3 charged the late pickup fee on 7731", THREAD.text.split("\n")[1]],
    ["the line an event rewords", "Carrier desk charges Carrier 3 a late pickup fee on 7731.", THREAD.text.split("\n")[1]],
    ["no line when too few words are shared", "Ops marks load 7731 late.", null],
    ["no line when only one word is shared", "Dock outage", null],
  ])("finds %s", (_case, event, line) => {
    expect(lineOf([THREAD], event)).toBe(line);
  });

  it("doesn't count filler words such as 'and' or 'the' as shared", () => {
    expect(lineOf([pasted("x1", "Carrier desk and the ops team are on it")], "Billing and the carrier")).toBeNull();
  });

  it("prefers the placing prompt when an earlier prompt's line matches as well", () => {
    const earlier = pasted("x0", "Mon 09:14  Carrier desk: Carrier 3 charged the late pickup fee on 7731");
    const placing = pasted("x2", "Wed 07:10  Carrier desk: Carrier 3 charged the late pickup fee on 7731 again");

    expect(closestLine("Carrier 3 charged the late pickup fee on 7731", [placing, earlier])?.exchangeId).toBe("x2");
  });

  const lines = fc.array(fc.stringMatching(/^[a-z0-9 ]{0,40}$/), { minLength: 1, maxLength: 6 });

  it("only ever returns one whole line of a prompt", () => {
    fc.assert(
      fc.property(lines, fc.string(), (texts, event) => {
        const prompt = pasted("x1", ...texts);
        const found = closestLine(event, [prompt]);
        return found === null || texts.includes(prompt.text.slice(found.start, found.end));
      }),
    );
  });

  it("always finds a line that says exactly what the event says, given two words to match", () => {
    fc.assert(
      fc.property(lines, fc.stringMatching(/^q[a-z]{3,8} q[a-z]{3,8} \d{2,4}$/), (texts, event) => {
        return closestLine(event, [pasted("x1", ...texts, event)]) !== null;
      }),
    );
  });
});

describe("lineOfCard", () => {
  const LINE = "Mon 09:14  Carrier desk: Carrier 3 charged the late pickup fee on 7731";
  const EVENT = "Carrier 3 charged the late pickup fee on 7731.";
  const sent = (id: string, text: string): Exchange => ({ id: id as ExchangeId, prompt: parsePrompt(text)!, status: "replied", reply: "", signature: "" });
  const card = (placedBy: string, provenance: EventCard["provenance"] = "thread"): EventCard => ({
    id: entityId("event", EVENT), kind: "event", text: EVENT, provenance, placedBy: placedBy as ExchangeId, changedBy: placedBy as ExchangeId,
  });

  it("looks in earlier pastes when the placing message doesn't hold the line", () => {
    expect(lineOfCard(card("x2"), [sent("x1", LINE), sent("x2", "what does late mean here?")])?.exchangeId).toBe("x1");
  });

  it("never looks in pastes sent after the card was placed", () => {
    expect(lineOfCard(card("x1"), [sent("x1", "here is the thread"), sent("x2", LINE)])).toBeNull();
  });

  it("never matches a guess", () => {
    expect(lineOfCard(card("x1", "guess"), [sent("x1", LINE)])).toBeNull();
  });
});
