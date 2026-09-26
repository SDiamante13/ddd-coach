import { describe, expect, it } from "vitest";
import type { Exchange, ExchangeId } from "./exchange.ts";
import { latestQuestionOf } from "./latestQuestion.ts";
import { parsePrompt } from "./exchange.ts";

const WITH_QUESTION = "Events, in order\n1. From thread: Ops rebooks.\n\nQuestion for the ops lead: Which count includes load 48213?";
const replied = (id: string, reply: string): Exchange => ({ id: id as ExchangeId, prompt: parsePrompt("thread")!, status: "replied", reply, signature: "" });
const pending = (id: string): Exchange => ({ id: id as ExchangeId, prompt: parsePrompt("thread")!, status: "pending" });

describe("latestQuestionOf", () => {
  it("finds the latest replied exchange that asks a question, with its question", () => {
    const pinned = latestQuestionOf([replied("x1", WITH_QUESTION), replied("x2", WITH_QUESTION.replace("48213", "7731"))]);

    expect(pinned).toEqual({ exchangeId: "x2", roles: "the ops lead", text: "Which count includes load 7731?", sources: [] });
  });

  it("keeps the earlier question when later replies ask none or haven't arrived", () => {
    const exchanges = [replied("x1", WITH_QUESTION), replied("x2", "Good point. Settle the count first."), pending("x3")];

    expect(latestQuestionOf(exchanges)?.exchangeId).toBe("x1");
  });

  it("reads the question after restoring names", () => {
    const restore = (text: string) => text.replaceAll("the ops lead", "the day desk lead");

    expect(latestQuestionOf([replied("x1", WITH_QUESTION)], restore)?.roles).toBe("the day desk lead");
  });

  it("finds none before any reply asks a question", () => {
    expect(latestQuestionOf([replied("x1", "Hi! Paste a thread."), pending("x2")])).toBeNull();
  });
});
