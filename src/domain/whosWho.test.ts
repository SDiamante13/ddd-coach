import { describe, expect, it } from "vitest";
import { teamOfHolder } from "./whosWho.ts";

const TEAMS = ["Ops day desk", "Ops night desk", "Carrier desk", "Finance"];

describe("teamOfHolder", () => {
  it.each([
    ["Ops (night shift)", "Ops night desk"],
    ["Ops (day desk)", "Ops day desk"],
    ["Carriers", "Carrier desk"],
    ["finance", "Finance"],
  ])("gives %s to the one team its words point at", (holder, team) => {
    expect(teamOfHolder(holder, TEAMS)).toBe(team);
  });

  it.each(["Ops (view B)", "Ops", "Billing", "Code"])("gives %s to no team when none or more than one could be meant", (holder) => {
    expect(teamOfHolder(holder, TEAMS)).toBeNull();
  });
});
