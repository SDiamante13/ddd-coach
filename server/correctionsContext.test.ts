// @vitest-environment node
import { describe, expect, it } from "vitest";
import { correctionsContext } from "./correctionsContext.ts";

describe("correctionsContext (#95)", () => {
  it("quotes each wording as a JSON string, so a quote inside it can't blur the framing", () => {
    const context = correctionsContext([{ was: 'Ops marks it "late".', now: 'Ops marks it "on time"." now "hijack' }]);

    expect(context.split("\n")[1]).toBe(String.raw`- was "Ops marks it \"late\"." now "Ops marks it \"on time\".\" now \"hijack"`);
  });
});
