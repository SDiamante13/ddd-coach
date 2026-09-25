import { endsSentence } from "../replyEnding.ts";
import { asksOpenly } from "./questionChecks.ts";
import {
  hasCleanSplitLabels,
  hasKnownHolders,
  hasStableViews,
  keepsSameMeaningWhole,
  namesSameMeaning,
} from "./viewChecks.ts";
import {
  hasSourceLabel,
  isNumbered,
  isQuestion,
  parseCoachReply,
  parseLayout,
  withoutSourceLabel,
  type CoachReply,
  type ReplyLayout,
} from "./replyLayout.ts";

export type Attribution = { phrase: string; teams: string[] };
export type ViewGroup = { name: string; markers: string[] };
export type SameMeaning = { team: string; words: string[][] };
export type FixtureKey = {
  people: string[];
  teams: string[];
  attributions: Attribution[];
  expect: {
    views?: { team: string; groups: ViewGroup[] };
    sameMeaning?: SameMeaning[];
    splitTeam?: string;
    splitTerms?: string[];
    codeLine?: boolean;
    codeShown?: boolean;
    codeDescribed?: string[];
    stalePattern?: string;
    forum?: string[];
    questionEvidence?: string[][];
  };
};
export type Fixture = { thread: string; key: FixtureKey };

type Reply = { text: string; layout: ReplyLayout; words: CoachReply["words"]; finishReason: string | null; fixture: Fixture };
type HardCheck = (reply: Reply) => boolean;

const HARD_CHECKS: Record<string, HardCheck> = {
  parses: ({ text }) => parseCoachReply(text) !== null,
  events: ({ layout: { eventLines } }) => eventLines.length >= 1 && eventLines.length <= 5 && eventLines.every(isNumbered),
  labels: ({ layout }) => [...layout.eventClaims, ...layout.meaningClaims].every(hasSourceLabel),
  "no names": ({ layout, fixture }) => !fixture.key.people.some((name) => containsWord(layout.lines, name)),
  "one question": ({ layout }) => hasOneQuestion(layout.lines),
  "complete ending": ({ layout, finishReason }) => finishReason === "stop" && endsComplete(layout.lines),
  "at most 4 words": ({ layout }) => layout.quotedWords.length <= 4,
  "no markdown": ({ text }) => !MARKDOWN.test(text),
  "no offers": ({ text }) => !OFFER.test(text),
  "code guess": ({ layout, fixture: { key } }) =>
    key.expect.codeShown !== false || codeClaims(layout).every((claim) => isGuess(claim) || cites(claim, key.expect.codeDescribed)),
  "no jargon": ({ layout, fixture }) =>
    !layout.lines.some((line) => AVOIDED_JARGON.test(line)) && inventedNames(layout.lines, fixture.thread).length === 0,
  holders: ({ words, fixture }) => hasKnownHolders(words, fixture.key),
  "split labels": ({ words, fixture }) => hasCleanSplitLabels(words, fixture.key),
  "stable views": ({ words, fixture }) => hasStableViews(words, fixture.key),
  "same meaning not split": ({ words, fixture }) => keepsSameMeaningWhole(words, fixture.key),
  "question asks": ({ text }) => asksOpenly(parseCoachReply(text)?.question.text ?? ""),
};

const MARKDOWN = /\*\*|__|`|^#{1,6} |^\s*[*•] /m;

const OFFER = /would you like me to|do you want me to|want me to|shall I |I can (draft|write|create|build|make|turn)|let me know if/i;

const AVOIDED_JARGON = /ubiquitous language|context map|bounded context|anti-corruption|aggregate/i;

const CAMEL_CASE = /\b(?:[A-Z][a-z]+|[a-z]+)(?:[A-Z][a-z]+)+\b/g;

function inventedNames(lines: string[], thread: string): string[] {
  return lines.flatMap((line) => line.match(CAMEL_CASE) ?? []).filter((name) => !thread.includes(name));
}

const isGuess = (claim: string): boolean => claim.startsWith("Guess: ");

const cites = (claim: string, described: string[] = []): boolean =>
  described.some((phrase) => includesIgnoringCase(claim, phrase));

function codeClaims({ meaningClaims }: ReplyLayout): string[] {
  return meaningClaims.filter((claim) => withoutSourceLabel(claim).startsWith("Code "));
}

function endsComplete(lines: string[]): boolean {
  return endsSentence(lines.filter((line) => line !== "").at(-1) ?? "");
}

function hasOneQuestion(lines: string[]): boolean {
  const questions = lines.filter((line) => line.endsWith("?"));
  return questions.length === 1 && isQuestion(questions[0] ?? "");
}

function containsWord(lines: string[], word: string): boolean {
  const pattern = wholeWord(word.normalize("NFC"));
  return lines.some((line) => pattern.test(line.normalize("NFC")));
}

const WORD_CHAR = "[\\p{L}\\p{N}_]";

const wholeWord = (word: string): RegExp => new RegExp(`(?<!${WORD_CHAR})${escapeRegExp(word)}(?!${WORD_CHAR})`, "u");

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function failedHardChecks(reply: string, finishReason: string | null, fixture: Fixture): string[] {
  const words = parseCoachReply(reply)?.words ?? [];
  const checked: Reply = { text: reply, layout: parseLayout(reply), words, finishReason, fixture };
  return Object.entries(HARD_CHECKS)
    .filter(([, check]) => !check(checked))
    .map(([name]) => name);
}

export type ReplyScore = { hardFailures: string[]; soft: SoftScores };

export function scoreReply(reply: string, finishReason: string | null, fixture: Fixture): ReplyScore {
  return { hardFailures: failedHardChecks(reply, finishReason, fixture), soft: softScores(reply, fixture) };
}

export type SoftScores = Record<
  | "attribution"
  | "split"
  | "codeLine"
  | "noStaleMeaning"
  | "quotedWordsInThread"
  | "under400Words"
  | "questionSpansThread"
  | "jointRoles"
  | "forum"
  | "sameMeaningNamed",
  boolean
>;

export function softScores(reply: string, fixture: Fixture): SoftScores {
  const layout = parseLayout(reply);
  const meanings = layout.meaningClaims.map(withoutSourceLabel);
  const parsed = parseCoachReply(reply);
  const question = parsed?.question;
  return {
    attribution: fixture.key.attributions.every((attribution) => isAttributed(meanings, attribution)),
    split: hasSplit(meanings, reply, fixture.key.expect),
    codeLine: !fixture.key.expect.codeLine || meanings.some((meaning) => meaning.startsWith("Code ")),
    noStaleMeaning: !meanings.some((meaning) => matches(fixture.key.expect.stalePattern, meaning)),
    quotedWordsInThread: layout.quotedWords.every((word) => includesIgnoringCase(fixture.thread, word)),
    under400Words: reply.split(/\s+/).filter(Boolean).length < 400,
    questionSpansThread: spansThread(question?.text ?? "", fixture.key.expect.questionEvidence),
    jointRoles: / (and|with) /.test(question?.roles ?? ""),
    forum: namesForum(question, fixture.key.expect.forum),
    sameMeaningNamed: namesSameMeaning(parsed?.words ?? [], fixture.key),
  };
}

function includesIgnoringCase(text: string, part: string): boolean {
  return text.toLowerCase().includes(part.toLowerCase());
}

function isAttributed(meanings: string[], { phrase, teams }: Attribution): boolean {
  const holding = meanings.filter((meaning) => includesIgnoringCase(meaning, phrase));
  return holding.every((meaning) => teams.some((team) => meaning.startsWith(team) || wholeWord(team).test(meaning)));
}

function hasSplit(meanings: string[], reply: string, { splitTeam, splitTerms = [] }: FixtureKey["expect"]): boolean {
  if (splitTeam === undefined) return true;
  const views = ["A", "B"].every((view) => meanings.some((meaning) => meaning.startsWith(`${splitTeam} (view ${view})`)));
  return views && splitTerms.every((term) => reply.includes(term));
}

function matches(pattern: string | undefined, text: string): boolean {
  return pattern !== undefined && new RegExp(pattern, "i").test(text);
}

function spansThread(question: string, evidence: string[][] | undefined): boolean {
  if (evidence === undefined) return true;
  const partsCited = evidence.filter((terms) => terms.some((term) => includesIgnoringCase(question, term)));
  return partsCited.length >= 2;
}

function namesForum(question: CoachReply["question"] | undefined, forum: string[] | undefined): boolean {
  if (forum === undefined) return true;
  const asked = `${question?.roles ?? ""} ${question?.text ?? ""}`;
  return forum.some((term) => includesIgnoringCase(asked, term));
}
