import { describe, expect, it } from "vitest";
import { isFollowing, revealOptions } from "./logFollow.ts";

describe("revealOptions", () => {
  it("glides to the entry's end", () => {
    expect(revealOptions({ reducedMotion: false })).toEqual({ block: "end", behavior: "smooth" });
  });

  it("jumps to the entry's end without animation when the visitor prefers reduced motion", () => {
    expect(revealOptions({ reducedMotion: true })).toEqual({ block: "end", behavior: "auto" });
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
