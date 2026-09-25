import { CUT_SHORT_NOTE } from "../shared/chatContract.ts";
import { CITATION, EVENTS_HEADING, QUESTION, SOURCE_QUOTE, WORDS_HEADING } from "../shared/replyLayout.ts";

export type Source = "From thread" | "Guess";
export type Claim = { source: Source; text: string };
export type Meaning = { source: Source; holder: string; meaning: string };
export type WordRow = { word: string; meanings: Meaning[] };
export type ReplyBlock =
  | { kind: "events"; items: Claim[] }
  | { kind: "words"; rows: WordRow[] }
  | { kind: "question"; roles: string; text: string; sources: string[] }
  | { kind: "cut" }
  | { kind: "citation"; title: string }
  | { kind: "text"; text: string };

const QUOTED_WORD = /^["“](.+)["”]$/;
const EVENT_LINE = /^\d+\. (From thread|Guess): (.+)$/;
const MEANING_LINE = /^- (From thread|Guess): (.+)$/;
const FIXED_HOLDER = /^(Code|Team unclear) (?:means? )?(.+)$/;
const HOLDER_VERB = /^(\S+(?: \S+){0,4}?) means? (.+)$/;

export function parseReply(reply: string): ReplyBlock[] {
  return reply
    .split("\n")
    .map((line) => line.trim())
    .reduce<ReplyBlock[]>((blocks, line, i, lines) => withLine(blocks, line, lines[i - 1] ?? ""), []);
}

function withLine(blocks: ReplyBlock[], line: string, previous: string): ReplyBlock[] {
  const opened = openedBy(line);
  if (opened !== null) return [...blocks, opened];
  const last = blocks.at(-1);
  const joined = last === undefined ? null : joinedTo(last, line);
  if (joined !== null) return [...blocks.slice(0, -1), joined];
  if (line === "") return blocks;
  if (last?.kind === "text" && previous !== "") return [...blocks.slice(0, -1), { kind: "text", text: `${last.text}\n${line}` }];
  return [...blocks, { kind: "text", text: line }];
}

function openedBy(line: string): ReplyBlock | null {
  const question = QUESTION.exec(line);
  if (question) return { kind: "question", roles: question[1]!, text: question[2]!, sources: [] };
  if (line === EVENTS_HEADING) return { kind: "events", items: [] };
  if (line === WORDS_HEADING) return { kind: "words", rows: [] };
  if (line === CUT_SHORT_NOTE) return { kind: "cut" };
  const citation = CITATION.exec(line)?.[1];
  if (citation !== undefined) return { kind: "citation", title: citation };
  return null;
}

function joinedTo(block: ReplyBlock, line: string): ReplyBlock | null {
  if (block.kind === "events") return withEvent(block.items, line);
  if (block.kind === "words") return withWordLine(block.rows, line);
  if (block.kind === "question") return withSource(block, line);
  return null;
}

function withSource(question: Extract<ReplyBlock, { kind: "question" }>, line: string): ReplyBlock | null {
  const source = SOURCE_QUOTE.exec(line)?.[1];
  return source === undefined ? null : { ...question, sources: [...question.sources, source] };
}

function withEvent(items: Claim[], line: string): ReplyBlock | null {
  const event = EVENT_LINE.exec(line);
  return event ? { kind: "events", items: [...items, { source: event[1] as Source, text: event[2]! }] } : null;
}

function withWordLine(rows: WordRow[], line: string): ReplyBlock | null {
  const word = QUOTED_WORD.exec(line)?.[1];
  if (word !== undefined) return { kind: "words", rows: [...rows, { word, meanings: [] }] };
  const meaning = MEANING_LINE.exec(line);
  const current = rows.at(-1);
  if (!meaning || current === undefined) return null;
  const withMeaning = { ...current, meanings: [...current.meanings, meaningOf(meaning[1] as Source, meaning[2]!)] };
  return { kind: "words", rows: [...rows.slice(0, -1), withMeaning] };
}

function meaningOf(source: Source, claim: string): Meaning {
  const [, holder = "", meaning = claim] = FIXED_HOLDER.exec(claim) ?? HOLDER_VERB.exec(claim) ?? [];
  return { source, holder, meaning: capitalised(meaning) };
}

const capitalised = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);
