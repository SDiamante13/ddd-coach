// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DDD_REFERENCE } from "./dddReference.ts";

describe("DDD_REFERENCE", () => {
  it("is the extracted DDD Reference text, byte for byte, with its CC BY attribution header", () => {
    const source = readFileSync(new URL("../../work/ddd-reference-2015.txt", import.meta.url), "utf8");

    expect(DDD_REFERENCE).toBe(source);
  });

  it("still holds the sentence bin/check.sh looks for in dist/, so the client-bundle guard can't go silent", () => {
    const checkScript = readFileSync(new URL("../../bin/check.sh", import.meta.url), "utf8");
    const sentinel = /grep -rqF "([^"]+)" dist/.exec(checkScript)?.[1];

    expect(sentinel).toBeDefined();
    expect(DDD_REFERENCE).toContain(sentinel);
  });
});
