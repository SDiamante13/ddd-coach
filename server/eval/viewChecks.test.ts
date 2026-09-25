// @vitest-environment node
import { describe, expect, it } from "vitest";
import { holderOf } from "./viewChecks.ts";

describe("holderOf", () => {
  it("reads a view named after its group inside the team (#77 U2)", () => {
    expect(holderOf("From thread: Ops (night shift) means every change is REBOOKED.", ["Ops"])).toEqual({ team: "Ops", view: "night shift" });
  });
});
