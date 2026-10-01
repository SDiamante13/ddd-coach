import { describe, expect, it } from "vitest";
import { boardOf, type VisitorAction } from "./boardFromReplies.ts";
import { compactMoves, lastEdit } from "./cardMoves.ts";
import { entityId } from "./entityId.ts";
import type { Exchange, ExchangeId, Prompt } from "./exchange.ts";
import { checksOf, withoutCheck } from "./rowChecks.ts";

const e1 = "e1" as ExchangeId;
const billing = entityId("meaning", "late|Billing");
const code = entityId("meaning", "late|Code");
const check = (row: typeof billing, verdict: "holds" | "wrong" | "unknown", where?: string): VisitorAction => ({ kind: "check", row, verdict, at: "2026-10-01", after: e1, ...(where && { where }) });
const link: VisitorAction = { kind: "connect", from: entityId("event", "a"), to: entityId("event", "b"), after: e1 };

describe("row checks", () => {
  it("keeps each row's latest check", () => {
    const checks = checksOf([check(billing, "unknown"), check(code, "holds", "Booking#rebook!"), check(billing, "holds", "Contract §4")]);

    expect(checks.get(billing)).toEqual({ verdict: "holds", where: "Contract §4", at: "2026-10-01" });
    expect(checks.get(code)).toEqual({ verdict: "holds", where: "Booking#rebook!", at: "2026-10-01" });
  });

  it("saves only each row's latest check, and Undo skips checks", () => {
    expect(compactMoves([check(billing, "unknown"), link, check(billing, "holds")])).toEqual([link, check(billing, "holds")]);
    expect(lastEdit([link, check(billing, "holds")])).toBe(link);
  });

  it("clears a row's check, leaving other rows' checks and every other edit", () => {
    const fix: VisitorAction = { kind: "correct", id: billing, text: "Any load past the booked appointment.", after: e1 };

    expect(withoutCheck([check(billing, "unknown"), link, fix, check(code, "holds"), check(billing, "wrong")], billing)).toEqual([link, fix, check(code, "holds")]);
  });

  it("leaves the board's events untouched by checks", () => {
    const exchanges: Exchange[] = [{ id: e1, prompt: "x" as Prompt, status: "replied", reply: "Events, in order\n1. From thread: Customer submits a bkg on the portal.", signature: "s" }];
    expect(boardOf(exchanges, [check(billing, "holds")])).toEqual(boardOf(exchanges));
  });
});
