import { describe, expect, it } from "vitest";
import { parseReply } from "./replyBlocks.ts";
import { rfcDocument, toHtml } from "./rfcExport.ts";

const AS_OF = new Date(2026, 8, 25, 14, 30);

const REPLY = [
  "Events, in order",
  "1. From thread: The customer submits a booking on the portal.",
  "",
  "Words that don't match",
  '"rebook"',
  "- From thread: Ops (day desk) means a date change with the same carrier is AMENDED.",
  "- Guess: Code counts both rows of a rebook.",
  "",
  "Question for the ops lead, at the 27 Oct review: For load 48213, which count includes the new row?",
  'From thread: "carrier billed TONU on orig load, then hauled the new one"',
].join("\n");

const htmlOf = (reply: string) => new DOMParser().parseFromString(toHtml(rfcDocument(parseReply(reply)), AS_OF), "text/html").body;
const texts = (nodes: Iterable<Element>) => [...nodes].map((node) => node.textContent);

describe("toHtml", () => {
  it("writes the as-of line, the sections as headings and the words as a table with header cells", () => {
    const body = htmlOf(REPLY);

    expect(body.querySelector("p")?.textContent).toBe("As of 25 Sep 2026");
    expect(texts(body.querySelectorAll("h2"))).toEqual(["Words that don't match", "Open questions", "Events, in order"]);
    expect(texts(body.querySelectorAll("table th"))).toEqual(["Term", "Team", "Meaning", "Source"]);
    expect([...body.querySelectorAll("table tbody tr")].map((row) => texts(row.querySelectorAll("td")))).toEqual([
      ["rebook", "Ops (day desk)", "A date change with the same carrier is AMENDED.", "From thread"],
      ["", "Code", "Guess: Counts both rows of a rebook.", "Guess"],
    ]);
  });

  it("lists the question with its thread lines nested under it, and the events in order", () => {
    const body = htmlOf(REPLY);

    expect(body.querySelector("ul > li")?.firstChild?.textContent).toBe(
      "Question for the ops lead, at the 27 Oct review: For load 48213, which count includes the new row?",
    );
    expect(texts(body.querySelectorAll("ul > li > ul > li"))).toEqual(['From thread: "carrier billed TONU on orig load, then hauled the new one"']);
    expect(texts(body.querySelectorAll("ol > li"))).toEqual(["From thread: The customer submits a booking on the portal."]);
  });

  it("escapes markup from the reply, so it arrives as text", () => {
    const body = htmlOf(['Words that don\'t match', '"hold"', "- Guess: Ops means <img src=x onerror=alert(1)> & <b>waiting</b>."].join("\n"));

    expect(body.querySelector("img, b")).toBeNull();
    expect(body.querySelector("td:nth-child(3)")?.textContent).toBe("Guess: <img src=x onerror=alert(1)> & <b>waiting</b>.");
  });
});
