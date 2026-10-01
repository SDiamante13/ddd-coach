import { describe, expect, it } from "vitest";
import { suggestedTeam, teamOfHolder } from "./whosWho.ts";

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

describe("suggestedTeam", () => {
  const teams = ["Carriers", "Ops (day desk)", "Ops (night desk)", "Code"];

  it("suggests the team a speaker names as their own, quoting where", () => {
    expect(suggestedTeam(["morning", "carrier desk here, for us Confirmed means accepted"], teams)).toEqual({ team: "Carriers", quote: "carrier desk here, for us Confirmed means accepted" });
    expect(suggestedTeam(["we on the day desk call it late at the window"], teams)).toEqual({ team: "Ops (day desk)", quote: "we on the day desk call it late at the window" });
  });

  it("suggests nothing from a line that only mentions a team", () => {
    expect(suggestedTeam(["ask the carrier desk about 7731"], teams)).toBeNull();
  });
});
