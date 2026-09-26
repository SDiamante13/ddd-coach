import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { keptRowsOf, MAX_SENT_ROWS, type KeptRow } from "../domain/glossary.ts";
import { parseReply } from "../domain/replyBlocks.ts";
import { V11_EXAMPLE_REPLY } from "../test/v10Replies.ts";
import { SentGlossary } from "./SentGlossary.tsx";

const base = keptRowsOf(parseReply(V11_EXAMPLE_REPLY), "2026-09-25", "load 7731")[3]!;

describe("SentGlossary", () => {
  it("names the kept rows that stay behind at the limit and says the newest go first", () => {
    const older: KeptRow = { ...base, keptOn: "2026-09-18", from: "load 7702" };
    const newer = Array.from({ length: MAX_SENT_ROWS }, (_, index): KeptRow => ({ ...base, id: `meaning:w${index}|ops` as never, word: `w${index}` }));

    render(<SentGlossary glossary={[older, ...newer]} swaps={[]} />);

    expect(screen.getByRole("note")).toHaveTextContent(
      `1 kept row isn't sent: "late" (Carrier desk, kept 18 Sep 2026 from load 7702). Only the newest ${MAX_SENT_ROWS} kept rows are sent.`,
    );
  });
});
