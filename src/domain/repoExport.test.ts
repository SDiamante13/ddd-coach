// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseReply } from "./replyBlocks.ts";
import { claudeSection, glossaryMarkdown, repoCopiedMessage, repoMarkdown } from "./repoExport.ts";
import { replyGlossary } from "./repoGlossary.ts";
import { rfcDocument } from "./rfcExport.ts";

const AS_OF = new Date(2026, 8, 25, 14, 30);

const glossaryOf = (reply: string) => replyGlossary(rfcDocument(parseReply(reply)));

const WORDS = [
  "Words that don't match",
  '"rebook"',
  "- From thread: Ops (day desk) means a date change with the same carrier is AMENDED.",
  "- Guess: Code counts both rows of a rebook.",
].join("\n");

const LATE = [
  "Words that don't match",
  '"late"',
  "- From thread: Account team means missing the delivery appointment the customer booked.",
  "- From thread: Ops (day desk) means a truck not at pickup by the end of the pickup window.",
  "- From thread: Billing means a load included on the weekly late report.",
  '"on time"',
  "- From thread: Account team means meeting the customer's booked delivery appointment.",
  "",
  "Question for the account team lead and the billing lead, at Friday's service review: For load 7731, which count includes it: the service-credit count or the weekly late report?",
  'From thread: "issued Customer D a service credit for 7731, it\'s on this week\'s late report"',
].join("\n");

describe("claudeSection", () => {
  it("points at GLOSSARY.md, names the contexts, and lists each unsettled point with the rest left buildable", () => {
    const withGuess = LATE.replace('"on time"\n', '"on time"\n- Guess: Code means delivered_at is before the appointment.\n');

    expect(claudeSection(glossaryOf(withGuess), AS_OF)).toBe(
      [
        "## Domain language (from GLOSSARY.md, as of 25 Sep 2026)",
        "",
        "- Use the terms in `GLOSSARY.md` exactly as defined. A term's meaning depends on the context in its row (Account team, Ops (day desk), Billing, Code). Never merge meanings across contexts.",
        "- Build what's settled: a settled row is safe to build on and to name code after, in its own context.",
        "- **Unsettled, don't pick a side:** `late` for Account team (Q1), Billing (Q1); `on time` for Code (a guess). Don't name new code, columns or statuses after either reading. Leave a `TODO(glossary): <term>` at that one point, keep building the rest of the task, and say what you left open.",
        "- Don't introduce a new domain term. If you need a word that isn't in `GLOSSARY.md`, ask first.",
        "",
      ].join("\n"),
    );
  });

  it("names the words not to use, each with the term to write instead, only when the thread gives any", () => {
    const pending = ["Words that don't match", '"pending"', '- From thread: Front desk means a request nobody has confirmed yet, whether they say "pending" or "unconfirmed".'].join("\n");

    expect(claudeSection(glossaryOf(pending), AS_OF)).toContain(
      "- **Don't use:** `unconfirmed` (write `pending`). The thread uses these for the same meaning as a term in `GLOSSARY.md`.\n- Don't introduce",
    );
    expect(claudeSection(glossaryOf(LATE), AS_OF)).not.toContain("Don't use");
  });

  it("says nothing is unsettled when every row is settled, so the whole task is buildable", () => {
    const settled = ["Words that don't match", '"late"', "- From thread: Billing means a load included on the weekly late report."].join("\n");

    expect(claudeSection(glossaryOf(settled), AS_OF)).toContain(
      "- **Unsettled:** nothing in this export. If the task needs a meaning that isn't here, leave a `TODO(glossary): <term>` at that one point and ask.",
    );
  });
});

describe("repoMarkdown", () => {
  it("puts GLOSSARY.md first and the CLAUDE.md section after it, each labelled with where it goes", () => {
    const glossary = glossaryOf(LATE);

    expect(repoMarkdown(glossary, AS_OF)).toBe(
      [
        "<!-- GLOSSARY.md: save this part as GLOSSARY.md at the root of your repo. -->",
        glossaryMarkdown(glossary, AS_OF),
        "<!-- CLAUDE.md or AGENTS.md: paste this section in. It points at GLOSSARY.md, so there is one copy to keep current. -->",
        claudeSection(glossary, AS_OF),
      ].join("\n"),
    );
  });
});

describe("repoCopiedMessage", () => {
  it.each([
    [0, "Copied for your repo: GLOSSARY.md, then a section for CLAUDE.md."],
    [1, "Copied for your repo: GLOSSARY.md, then a section for CLAUDE.md. 1 term is still unsettled."],
    [2, "Copied for your repo: GLOSSARY.md, then a section for CLAUDE.md. 2 terms are still unsettled."],
  ])("counts %i unsettled terms", (unsettled, message) => {
    expect(repoCopiedMessage(unsettled)).toBe(message);
  });
});

describe("glossaryMarkdown escaping", () => {
  const LIVE = "[x](javascript:alert(1)) <img src=x onerror=alert(1)> `run` a\\b";
  const ESCAPED = "\\[x\\](javascript:alert(1)) \\<img src=x onerror=alert(1)\\> \\`run\\` a\\\\b";

  it("escapes link, HTML and code characters in the term, its cells and the question, as #6 does", () => {
    const reply = [
      "Words that don't match",
      `"hold ${LIVE}"`,
      `- From thread: Ops means ${LIVE} | CONFIRMED.`,
      "",
      `Question for the ops lead: For load 48213, which ${LIVE}?`,
    ].join("\n");
    const markdown = glossaryMarkdown(glossaryOf(reply), AS_OF);

    expect(markdown).toContain(`## hold ${ESCAPED}`);
    expect(markdown).toContain(`| Ops | ${ESCAPED} \\| CONFIRMED. | From thread | Settled |`);
    expect(markdown).toContain(`1. Question for the ops lead: For load 48213, which ${ESCAPED}?`);
  });
});

describe("glossaryMarkdown", () => {
  it("opens with the real export date and where the file came from", () => {
    expect(glossaryMarkdown(glossaryOf(WORDS), AS_OF).split("\n").slice(0, 3)).toEqual([
      "# Glossary",
      "",
      "As of 25 Sep 2026. Exported from DDD Coach, from one coach reply to a pasted thread. When a question below is settled, change its rows here, or export again.",
    ]);
  });

  it("tells coding agents to build what's settled and leave a TODO only at the unsettled point", () => {
    expect(glossaryMarkdown(glossaryOf(WORDS), AS_OF).split("\n")[4]).toBe(
      "**For coding agents:** use these words exactly as defined here. A term's meaning depends on the context named in its row; don't merge meanings across contexts. Build what's settled. Rows marked **Unsettled** have no agreed meaning yet: don't pick one, and don't name code, columns or statuses after either reading. Leave a `TODO(glossary): <term>` at that one point and keep building the rest of the task. Don't introduce a domain term that isn't in this file; ask instead.",
    );
  });

  it("writes each term as a context table, settled rows from the thread and a guess marked unsettled", () => {
    expect(glossaryMarkdown(glossaryOf(WORDS), AS_OF)).toContain(
      [
        "## rebook",
        "",
        "2 meanings by context.",
        "",
        "| Context | Meaning | Source | Status |",
        "|---|---|---|---|",
        "| Ops (day desk) | A date change with the same carrier is AMENDED. | From thread | Settled |",
        "| Code | Guess: Counts both rows of a rebook. | Guess | **Unsettled**, a guess |",
      ].join("\n"),
    );
  });

  it("marks unsettled only the rows of the teams an open question about the term asks", () => {
    expect(glossaryMarkdown(glossaryOf(LATE), AS_OF)).toContain(
      [
        "| Account team | Missing the delivery appointment the customer booked. | From thread | **Unsettled**, see Q1 |",
        "| Ops (day desk) | A truck not at pickup by the end of the pickup window. | From thread | Settled |",
        "| Billing | A load included on the weekly late report. | From thread | **Unsettled**, see Q1 |",
      ].join("\n"),
    );
  });

  it("marks every thread row of a term unsettled when the question about it asks none of its teams", () => {
    const asksCarrierDesk = `${WORDS}\n\nQuestion for the carrier desk lead, at the 27 Oct review: For load 48213, does a rebook keep the ref?`;

    expect(glossaryMarkdown(glossaryOf(asksCarrierDesk), AS_OF)).toContain(
      "| Ops (day desk) | A date change with the same carrier is AMENDED. | From thread | **Unsettled**, see Q1 |",
    );
  });

  it("labels a row with no named team 'Team unclear', and never counts it as a team the question asks", () => {
    const unnamed = [
      "Words that don't match",
      '"rebook"',
      "- From thread: a rebook keeps the ref.",
      "- From thread: Ops (day desk) means a date change with the same carrier is AMENDED.",
      "",
      "Question for the carrier desk lead, at Friday's review: For load 48213, does a rebook keep the ref?",
    ].join("\n");

    expect(glossaryMarkdown(glossaryOf(unnamed), AS_OF)).toContain(
      [
        "| Team unclear | A rebook keeps the ref. | From thread | **Unsettled**, see Q1 |",
        "| Ops (day desk) | A date change with the same carrier is AMENDED. | From thread | **Unsettled**, see Q1 |",
      ].join("\n"),
    );
  });

  it("lists under a term the other words the thread uses for the same meaning, as the coach names them in one line", () => {
    const pending = [
      "Words that don't match",
      '"pending"',
      '- From thread: Front desk means a request nobody has confirmed yet, whether they say "pending" or "unconfirmed".',
      "- From thread: Billing means a request it can't charge for yet.",
    ].join("\n");

    expect(glossaryMarkdown(glossaryOf(pending), AS_OF)).toContain(
      "## pending\n\n2 meanings by context.\n\nDon't use: `unconfirmed`. The thread uses it for the same meaning; write `pending` instead.\n\n| Context",
    );
  });

  it("says 'them' when the thread uses more than one other word", () => {
    const reply = ["Words that don't match", '"pending"', '- From thread: Front desk means an unconfirmed request, whether they say "pending", "tbc" or "unconfirmed".'].join("\n");

    expect(glossaryMarkdown(glossaryOf(reply), AS_OF)).toContain(
      "Don't use: `tbc`, `unconfirmed`. The thread uses them for the same meaning; write `pending` instead.",
    );
  });

  it.each([
    ["a guess names the pair", '- Guess: Front desk means an unconfirmed request, whether they say "pending" or "unconfirmed".'],
    ["the quoted words don't include the term", '- From thread: Ops means a load marked "REBOOKED" or "AMENDED".'],
  ])("adds no Don't use line when %s, so no other word is ever invented", (_case, line) => {
    const reply = ["Words that don't match", '"pending"', line].join("\n");

    expect(glossaryMarkdown(glossaryOf(reply), AS_OF)).not.toContain("Don't use:");
  });

  it("says a term with one row has one meaning recorded", () => {
    expect(glossaryMarkdown(glossaryOf(LATE), AS_OF)).toContain("## on time\n\nOne meaning recorded.\n");
  });

  it("ends with the open questions, numbered, each with its thread lines", () => {
    expect(glossaryMarkdown(glossaryOf(LATE), AS_OF).endsWith(
      [
        "## Open questions",
        "",
        "1. Question for the account team lead and the billing lead, at Friday's service review: For load 7731, which count includes it: the service-credit count or the weekly late report?",
        "   - From thread: \"issued Customer D a service credit for 7731, it's on this week's late report\"",
        "",
      ].join("\n"),
    )).toBe(true);
  });
});
