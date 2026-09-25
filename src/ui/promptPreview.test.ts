import { describe, expect, it } from "vitest";
import { PREVIEW_CHARS, previewOf } from "./promptPreview.ts";

describe("previewOf", () => {
  it("hides nothing in a four-line message", () => {
    expect(previewOf("a\nb\nc\nd")).toEqual({ preview: "a\nb\nc\nd", hidden: 0 });
  });

  it("keeps the first four lines of a longer message and counts the characters left out", () => {
    expect(previewOf("a\nb\nc\nd\ne")).toEqual({ preview: "a\nb\nc\nd", hidden: 2 });
  });

  it("hides nothing in a single line of exactly the preview length", () => {
    expect(previewOf("M".repeat(PREVIEW_CHARS))).toEqual({ preview: "M".repeat(PREVIEW_CHARS), hidden: 0 });
  });

  it("cuts a single line one character past the preview length", () => {
    expect(previewOf("M".repeat(PREVIEW_CHARS + 1))).toEqual({ preview: "M".repeat(PREVIEW_CHARS), hidden: 1 });
  });
});
