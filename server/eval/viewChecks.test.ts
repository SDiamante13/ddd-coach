// @vitest-environment node
import { describe, expect, it } from "vitest";
import { holderOf, namesSides } from "./viewChecks.ts";

describe("holderOf", () => {
  it("reads a view named after its group inside the team (#77 U2)", () => {
    expect(holderOf("From thread: Ops (night shift) means every change is REBOOKED.", ["Ops"])).toEqual({ team: "Ops", view: "night shift" });
  });
});

describe("namesSides (#99)", () => {
  const sides = [["German", "Germany"], ["India", "Indian"]];
  const wordWith = (...meanings: string[]) => [{ word: "credit note", meanings }];

  it.each([
    ["holds each view by the side the thread names", wordWith("From thread: German maintainers mean a correction.", "From thread: India maintainers mean a GST document."), true],
    ["leaves one side out", wordWith("From thread: German maintainers mean a correction.", "From thread: Code means a return flag."), false],
    ["adds a Team unclear view beside both sides", wordWith("From thread: German maintainers mean a correction.", "From thread: India maintainers mean a GST document.", "Guess: Team unclear means a refund."), false],
    ["writes Team unclear for a named side", wordWith("From thread: German maintainers mean a correction.", "From thread: Team unclear means a GST document."), false],
  ])("judges a reply that %s", (_case, words, passes) => {
    expect(namesSides(words, sides)).toBe(passes);
  });

  it("passes any reply when the thread names no sides", () => {
    expect(namesSides(wordWith("From thread: Team unclear means a correction."), undefined)).toBe(true);
  });
});
