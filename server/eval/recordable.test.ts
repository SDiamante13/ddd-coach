// @vitest-environment node
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { recordable } from "./recordable.ts";

describe("recordable", () => {
  it("replaces the prompt with its length and sha256, keeping the reply", () => {
    const prompt = "A long pasted thread";

    expect(recordable({ label: "run 1", prompt, reply: "Events, in order", ms: 5 })).toEqual({
      label: "run 1",
      promptChars: prompt.length,
      promptSha256: createHash("sha256").update(prompt).digest("hex"),
      reply: "Events, in order",
      ms: 5,
    });
  });
});
