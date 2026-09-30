import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { clampWords } from "./linkLines.ts";

const word = fc.stringMatching(/^[A-Za-z0-9.,“”]{1,8}$/);
const title = (min: number, max: number) => fc.array(word, { minLength: min, maxLength: max }).map((words) => words.join(" "));

describe("clampWords", () => {
  it("leaves a title of up to 6 words as it is", () => {
    fc.assert(
      fc.property(title(1, 6), (text) => {
        expect(clampWords(text)).toBe(text);
      }),
    );
  });

  it("keeps the first 6 words of a longer title and marks the cut", () => {
    fc.assert(
      fc.property(title(7, 20), (text) => {
        expect(clampWords(text)).toBe(`${text.split(" ").slice(0, 6).join(" ")}…`);
      }),
    );
  });
});
