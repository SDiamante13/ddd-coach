import {
  hasSourceLabel,
  isNumbered,
  isQuestion,
  parseLayout,
  withoutSourceLabel,
  type ReplyLayout,
} from "./replyLayout.ts";

export type Attribution = { phrase: string; teams: string[] };
export type FixtureKey = {
  people: string[];
  attributions: Attribution[];
  expect: { splitTeam?: string; splitTerms?: string[]; codeLine?: boolean; stalePattern?: string };
};
export type Fixture = { thread: string; key: FixtureKey };

type Reply = { layout: ReplyLayout; finishReason: string | null; fixture: Fixture };
type HardCheck = (reply: Reply) => boolean;

const HARD_CHECKS: Record<string, HardCheck> = {
  layout: ({ layout }) => layout.inOrder,
  events: ({ layout: { eventLines } }) => eventLines.length >= 1 && eventLines.length <= 5 && eventLines.every(isNumbered),
  labels: ({ layout }) => [...layout.eventClaims, ...layout.meaningClaims].every(hasSourceLabel),
  "no names": ({ layout, fixture }) => !fixture.key.people.some((name) => containsWord(layout.lines, name)),
  "one question": ({ layout }) => hasOneQuestion(layout.lines),
  "complete ending": ({ layout, finishReason }) => finishReason === "stop" && endsComplete(layout.lines),
  "at most 4 words": ({ layout }) => layout.quotedWords.length <= 4,
  "no jargon": ({ layout, fixture }) =>
    !layout.lines.some((line) => AVOIDED_JARGON.test(line)) && inventedNames(layout.lines, fixture.thread).length === 0,
};

const AVOIDED_JARGON = /ubiquitous language|context map|bounded context|anti-corruption|aggregate/i;

const CAMEL_CASE = /\b(?:[A-Z][a-z]+|[a-z]+)(?:[A-Z][a-z]+)+\b/g;

function inventedNames(lines: string[], thread: string): string[] {
  return lines.flatMap((line) => line.match(CAMEL_CASE) ?? []).filter((name) => !thread.includes(name));
}

function endsComplete(lines: string[]): boolean {
  return /[.?!)]$/.test(lines.filter((line) => line !== "").at(-1) ?? "");
}

function hasOneQuestion(lines: string[]): boolean {
  const questions = lines.filter((line) => line.endsWith("?"));
  return questions.length === 1 && isQuestion(questions[0] ?? "");
}

function containsWord(lines: string[], word: string): boolean {
  return lines.some((line) => new RegExp(`\\b${word}\\b`).test(line));
}

export function failedHardChecks(reply: string, finishReason: string | null, fixture: Fixture): string[] {
  const checked: Reply = { layout: parseLayout(reply), finishReason, fixture };
  return Object.entries(HARD_CHECKS)
    .filter(([, check]) => !check(checked))
    .map(([name]) => name);
}

export type SoftScores = Record<
  "attribution" | "split" | "codeLine" | "noStaleMeaning" | "quotedWordsInThread" | "under400Words",
  boolean
>;

export function softScores(reply: string, fixture: Fixture): SoftScores {
  const layout = parseLayout(reply);
  const meanings = layout.meaningClaims.map(withoutSourceLabel);
  return {
    attribution: fixture.key.attributions.every((attribution) => isAttributed(meanings, attribution)),
    split: hasSplit(meanings, reply, fixture.key.expect),
    codeLine: !fixture.key.expect.codeLine || meanings.some((meaning) => meaning.startsWith("Code ")),
    noStaleMeaning: !meanings.some((meaning) => matches(fixture.key.expect.stalePattern, meaning)),
    quotedWordsInThread: layout.quotedWords.every((word) => includesIgnoringCase(fixture.thread, word)),
    under400Words: reply.split(/\s+/).filter(Boolean).length < 400,
  };
}

function includesIgnoringCase(text: string, part: string): boolean {
  return text.toLowerCase().includes(part.toLowerCase());
}

function isAttributed(meanings: string[], { phrase, teams }: Attribution): boolean {
  const holding = meanings.filter((meaning) => includesIgnoringCase(meaning, phrase));
  return holding.every((meaning) => teams.some((team) => meaning.startsWith(team)));
}

function hasSplit(meanings: string[], reply: string, { splitTeam, splitTerms = [] }: FixtureKey["expect"]): boolean {
  if (splitTeam === undefined) return true;
  const views = ["A", "B"].every((view) => meanings.some((meaning) => meaning.startsWith(`${splitTeam} (view ${view})`)));
  return views && splitTerms.every((term) => reply.includes(term));
}

function matches(pattern: string | undefined, text: string): boolean {
  return pattern !== undefined && new RegExp(pattern, "i").test(text);
}
