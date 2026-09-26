// @vitest-environment node
import { describe, expect, it } from "vitest";
import { coachInstructions } from "./coachInstructions.ts";
import { DDD_REFERENCE } from "./knowledge/dddReference.ts";
import { systemPrompt } from "./systemPrompt.ts";

describe("systemPrompt", () => {
  it("is the coaching instructions grounded in the whole DDD Reference, the same text on every call so it caches", () => {
    expect(systemPrompt()).toBe(coachInstructions(DDD_REFERENCE));
    expect(systemPrompt()).toContain(`<reference>\n${DDD_REFERENCE}\n</reference>`);
  });
});
