import { describe, expect, it } from "vitest";
import { fitsAbove, inView, isFollowing, revealOptions } from "./logFollow.ts";

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

describe("inView", () => {
  it.each([
    [0, 400, true],
    [-1, 300, false],
    [300, 401, false],
  ])("says whether an outcome from %i to %i px sits between the viewport top and a composer at 400 px", (top, bottom, expected) => {
    expect(inView({ top, bottom, composerTop: 400 })).toBe(expected);
  });
});

describe("below a pinned question (#94)", () => {
  it.each([
    [284, true],
    [285, false],
  ])("fits an outcome %i px tall between a question pinned down to 100 px and a composer at 400 px", (height, fits) => {
    expect(fitsAbove({ height, composerTop: 400, topInset: 100 })).toBe(fits);
  });

  it.each([
    [100, true],
    [99, false],
  ])("sees an outcome starting at %i px as in view only below a question pinned down to 100 px", (top, expected) => {
    expect(inView({ top, bottom: 300, composerTop: 400, topInset: 100 })).toBe(expected);
  });
});
