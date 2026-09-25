import { describe, expect, it } from "vitest";
import { fitsAbove, isFollowing, revealOptions } from "./logFollow.ts";

describe("revealOptions", () => {
  it("glides to the entry's end", () => {
    expect(revealOptions({ reducedMotion: false })).toEqual({ block: "end", behavior: "smooth" });
  });

  it("jumps to the entry's end without animation when the visitor prefers reduced motion", () => {
    expect(revealOptions({ reducedMotion: true })).toEqual({ block: "end", behavior: "auto" });
  });

  it("lands on the entry's start when it doesn't fit above the composer, so it reads from the top", () => {
    expect(revealOptions({ reducedMotion: false, fits: false })).toEqual({ block: "start", behavior: "smooth" });
  });
});

describe("isFollowing", () => {
  it("still follows when the newest entry tucks up to 48 px under the composer", () => {
    expect(isFollowing({ newestEntryBottom: 448, composerTop: 400 })).toBe(true);
  });

  it("stops following once more than 48 px of the newest entry is hidden under the composer", () => {
    expect(isFollowing({ newestEntryBottom: 449, composerTop: 400 })).toBe(false);
  });
});

describe("fitsAbove", () => {
  it.each([
    [384, true],
    [385, false],
  ])("says whether an outcome %i px tall fits above a composer at 400 px, leaving a 16 px gap at the top", (height, fits) => {
    expect(fitsAbove({ height, composerTop: 400 })).toBe(fits);
  });
});
