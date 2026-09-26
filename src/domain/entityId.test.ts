import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { entityId } from "./entityId.ts";

const word = fc.stringMatching(/^[a-z0-9']{1,8}$/);
const gap = fc.constantFrom(" ", "  ", "\t", " \n ");
const casedWord = fc.tuple(word, fc.boolean()).map(([w, upper]) => (upper ? w.toUpperCase() : w));
const restatedEvent = fc
  .tuple(fc.array(casedWord, { minLength: 1, maxLength: 6 }), gap, gap, fc.constantFrom("", ".", "!", "?"))
  .map(([words, inner, edge, ending]) => ({
    plain: words.join(" ").toLowerCase(),
    restated: `${edge}${words.join(inner)}${ending}${edge}`,
  }));

describe("entityId", () => {
  it("keys an entity by its kind and lower-cased text without the final full stop", () => {
    expect(entityId("event", "Customer submits a bkg on the portal.")).toBe("event:customer submits a bkg on the portal");
  });

  it("collapses runs of whitespace and drops any final ., ! or ?", () => {
    expect(entityId("event", "  The  carrier rejects\tthe booking!? ")).toBe("event:the carrier rejects the booking");
  });

  it("drops a space left before the final punctuation", () => {
    expect(entityId("event", "Carrier rejects .")).toBe("event:carrier rejects");
  });

  it("drops trailing commas, colons, semicolons and ellipses too", () => {
    expect(["Ops rebooks the load…", "Ops rebooks the load;", "Ops rebooks the load, :"].map((text) => entityId("event", text))).toEqual(
      Array(3).fill("event:ops rebooks the load"),
    );
  });

  it("straightens curly quotes", () => {
    expect(entityId("event", "Ops counts “bookings today” twice, per Tom‘s ‚note’")).toBe(
      `event:ops counts "bookings today" twice, per tom's 'note'`,
    );
  });

  it("gives the same id however the event is cased, spaced or ended", () => {
    fc.assert(
      fc.property(restatedEvent, ({ plain, restated }) => {
        expect(entityId("event", restated)).toBe(entityId("event", plain));
      }),
    );
  });
});

describe("entityId for glossary entities", () => {
  it("keys a term on its word alone", () => {
    expect(entityId("term", "Bookings Today")).toBe("term:bookings today");
  });

  it("keys a meaning on its word and team, so each side of a split team keeps its own id", () => {
    const ids = ["RB|Ops (day desk)", "RB|Ops (night shift)", "rb|OPS (Night Shift)"].map((key) => entityId("meaning", key));
    expect(ids).toEqual(["meaning:rb|ops (day desk)", "meaning:rb|ops (night shift)", "meaning:rb|ops (night shift)"]);
  });

  it("keys a question on its text without the question mark", () => {
    expect(entityId("question", "Which booking count includes the orig load?")).toBe(
      "question:which booking count includes the orig load",
    );
  });
});
