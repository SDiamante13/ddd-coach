import { describe, expect, it } from "vitest";
import { speakersOf, spokenLinesOf } from "./pasteSpeakers.ts";

const said = (paste: string) => spokenLinesOf(paste).map(({ speaker, start, end }) => [speaker, paste.slice(start, end)]);

describe("spokenLinesOf", () => {
  it("takes the speaker of a 'Name: text' line, past a day and time", () => {
    const paste = "Mon 08:04  Ops day desk: morning all\nMon 08:06  Carrier desk: heads up";

    expect(said(paste)).toEqual([
      ["Ops day desk", "Mon 08:04  Ops day desk: morning all"],
      ["Carrier desk", "Mon 08:06  Carrier desk: heads up"],
    ]);
  });

  it("gives each message line under a Slack 'Name  8:12 AM' header to that person, even one with a colon in it", () => {
    const paste = "#carrier-desk\n\nLuis Ortega  8:12 AM\nmorning. Customer D called\nabout 7731\n\nRosa Delgado  8:15 AM\nfrom carrier desk side: Confirmed means accepted";

    expect(said(paste)).toEqual([
      ["Luis Ortega", "morning. Customer D called"],
      ["Luis Ortega", "about 7731"],
      ["Rosa Delgado", "from carrier desk side: Confirmed means accepted"],
    ]);
  });

  it("reads meeting notes: a 'Name:' bullet, a line ending '(Name, …)' for someone on the present list, and sub-bullets under them", () => {
    const paste = [
      "Rebook sync, Tue 22 Sep (notes: Priya; present: Dana, Maya, Tom)",
      "- bkg = customer request once submitted (Dana)",
      "- RB = same bkg unless lane/date chg (Dana, from 2019 sheet row 12)",
      "  - i.e. lane or date change = AMENDED",
      "- Maya: nights RB everything.",
      "- carrier billed TONU on orig load (see ticket)",
    ].join("\n");

    expect(said(paste)).toEqual([
      ["Dana", "- bkg = customer request once submitted (Dana)"],
      ["Dana", "- RB = same bkg unless lane/date chg (Dana, from 2019 sheet row 12)"],
      ["Dana", "  - i.e. lane or date change = AMENDED"],
      ["Maya", "- Maya: nights RB everything."],
    ]);
  });

  it("counts each speaker's lines, in the order they first speak", () => {
    const paste = ["Luis Ortega  8:12 AM", "one", "two", "", "Rosa Delgado  8:15 AM", "three", "", "Luis Ortega  8:20 AM", "four"].join("\n");

    expect(speakersOf(paste)).toEqual([
      { speaker: "Luis Ortega", lines: 3 },
      { speaker: "Rosa Delgado", lines: 1 },
    ]);
  });
});
