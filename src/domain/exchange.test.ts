import { describe, expect, it } from "vitest";
import {
  fail,
  isBusy,
  parsePrompt,
  reply,
  retry,
  settle,
  submit,
  type ExchangeId,
  type Prompt,
} from "./exchange.ts";

const id = "exchange-1" as ExchangeId;
const prompt = "Hello coach" as Prompt;

describe("Exchange", () => {
  it("fails a pending exchange with the error", () => {
    expect(fail(submit(id, prompt), "Coach unavailable")).toEqual({
      id,
      prompt,
      status: "failed",
      error: "Coach unavailable",
    });
  });

  it("replies to a pending exchange", () => {
    expect(reply(submit(id, prompt), "Hi there")).toEqual({
      id,
      prompt,
      status: "replied",
      reply: "Hi there",
    });
  });

  it("retries a failed exchange as pending with the same id and prompt", () => {
    const failed = fail(submit(id, prompt), "Coach unavailable");

    expect(retry(failed)).toEqual({ id, prompt, status: "pending" });
  });

  it("leaves an exchange that has not failed unchanged on retry", () => {
    const replied = reply(submit(id, prompt), "Hi there");

    expect(retry(replied)).toBe(replied);
  });

  it("is busy while any exchange is pending", () => {
    const replied = reply(submit(id, prompt), "Hi there");

    expect(isBusy([replied, submit(id, prompt)])).toBe(true);
  });

  it("is idle when no exchange is pending", () => {
    const replied = reply(submit(id, prompt), "Hi there");
    const failed = fail(submit(id, prompt), "Coach unavailable");

    expect(isBusy([replied, failed])).toBe(false);
  });
});

describe("settle", () => {
  const otherId = "exchange-2" as ExchangeId;

  it("replies to the matching pending exchange only", () => {
    const other = submit(otherId, prompt);

    expect(settle([submit(id, prompt), other], id, { ok: true, reply: "Hi there" })).toEqual([
      reply(submit(id, prompt), "Hi there"),
      other,
    ]);
  });

  it("fails the matching pending exchange with the error", () => {
    expect(settle([submit(id, prompt)], id, { ok: false, error: "Coach unavailable" })).toEqual([
      fail(submit(id, prompt), "Coach unavailable"),
    ]);
  });

  it("leaves a matching exchange that is no longer pending unchanged", () => {
    const replied = reply(submit(id, prompt), "Hi there");

    expect(settle([replied], id, { ok: false, error: "Coach unavailable" })).toEqual([replied]);
  });
});

describe("parsePrompt", () => {
  it("rejects blank or whitespace-only text", () => {
    expect(parsePrompt(" \t\n ")).toBeNull();
  });

  it("keeps meaningful text without surrounding whitespace", () => {
    expect(parsePrompt("  Hello coach \n")).toBe("Hello coach");
  });
});
