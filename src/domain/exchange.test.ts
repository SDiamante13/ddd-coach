import { describe, expect, it } from "vitest";
import {
  canRetry,
  fail,
  isBusy,
  parsePrompt,
  reply,
  retry,
  settle,
  submit,
  type ExchangeId,
  type Failure,
  type Prompt,
} from "./exchange.ts";

const id = "exchange-1" as ExchangeId;
const prompt = "Hello coach" as Prompt;
const unavailable: Failure = { error: "Coach unavailable", retryable: true };

describe("Exchange", () => {
  it("fails a pending exchange with the error", () => {
    expect(fail(submit(id, prompt), unavailable)).toEqual({
      id,
      prompt,
      status: "failed",
      error: "Coach unavailable",
      retryable: true,
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
    const failed = fail(submit(id, prompt), unavailable);

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
    const failed = fail(submit(id, prompt), unavailable);

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
    expect(settle([submit(id, prompt)], id, { ok: false, ...unavailable })).toEqual([
      fail(submit(id, prompt), unavailable),
    ]);
  });

  it("leaves a matching exchange that is no longer pending unchanged", () => {
    const replied = reply(submit(id, prompt), "Hi there");

    expect(settle([replied], id, { ok: false, ...unavailable })).toEqual([replied]);
  });
});

describe("canRetry", () => {
  const otherId = "exchange-2" as ExchangeId;
  const failed = fail(submit(id, prompt), unavailable);

  it("allows retrying a failed exchange while nothing is pending", () => {
    expect(canRetry([failed, reply(submit(otherId, prompt), "Hi there")], id)).toBe(true);
  });

  it("blocks retrying while another exchange is pending", () => {
    expect(canRetry([failed, submit(otherId, prompt)], id)).toBe(false);
  });

  it("allows retrying only an exchange that failed", () => {
    expect(canRetry([reply(submit(id, prompt), "Hi there")], id)).toBe(false);
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
