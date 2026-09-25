import { endsSentence } from "../replyEnding.ts";
import { asksOpenly, namesACase } from "./questionChecks.ts";
import {
  hasCleanSplitLabels,
  hasKnownHolders,
  hasStableViews,
  holderOf,
  keepsSameMeaningWhole,
  namesSameMeaning,
} from "./viewChecks.ts";
import {
  EVENTS_HEADING,
  hasSourceLabel,
  isNumbered,
  isQuestion,
  parseCoachReply,
  parseLayout,
  withoutSourceLabel,
  WORDS_HEADING,
  type CoachReply,
  type ReplyLayout,
} from "../../src/shared/replyLayout.ts";

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
    nonThread?: boolean;
  };
};
export type Fixture = { thread: string; key: FixtureKey };

type Reply = { text: string; layout: ReplyLayout; words: CoachReply["words"]; finishReason: string | null; fixture: Fixture };
type HardCheck = (reply: Reply) => boolean;

function noMarkdown({ text }: Reply): boolean {
  return !MARKDOWN.test(text);
}

const HARD_CHECKS: Record<string, HardCheck> = {
  parses: ({ text }) => parseCoachReply(text) !== null,
  events: ({ layout: { eventLines } }) => eventLines.length >= 1 && eventLines.length <= 5 && eventLines.every(isNumbered),
  labels: ({ layout }) => [...layout.eventClaims, ...layout.meaningClaims].every(hasSourceLabel),
  "no names": ({ layout, fixture }) => !fixture.key.people.some((name) => containsWord(layout.lines, name)),
  "one question": ({ layout }) => hasOneQuestion(layout.lines),
  "complete ending": ({ layout, finishReason }) => finishReason === "stop" && endsComplete(layout.lines),
  "at most 4 words": ({ layout }) => layout.quotedWords.length <= 4,
  "no markdown": noMarkdown,
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
  "question names a case": ({ text }) => namesACase(parseCoachReply(text)?.question.text ?? ""),
  "at most 600 words": ({ text }) => wordCount(text) <= RUNAWAY_WORDS,
};

const NON_THREAD_CHECKS: Record<string, HardCheck> = {
  "no boilerplate": ({ text }) => !BOILERPLATE.test(text),
  "no three parts": ({ layout: { lines } }) => !lines.some(isReplyPart),
  "complete ending": ({ finishReason }) => finishReason === "stop",
  "no markdown": noMarkdown,
  "invites a thread": ({ text }) => INVITES_A_THREAD.test(text),
  "at most 600 words": ({ text }) => wordCount(text) <= RUNAWAY_WORDS,
};

const RUNAWAY_WORDS = 600;

const wordCount = (text: string): number => text.split(/\s+/).filter(Boolean).length;

const isReplyPart = (line: string): boolean => line === EVENTS_HEADING || line === WORDS_HEADING || isQuestion(line);

const BOILERPLATE =
  /\bI(?:['’]m| am) (?:here to help|for \w+ing|(?:a )?DDD Coach)\b|\bas (?:a|your) DDD coach\b|(?:^|[.!?]\s+)I help\b/im;

const NOT_NEGATED = String.raw`(?<!\b(?:don['’]t|do not|never)\s+)`;
const NEAR_A_THREAD_NOUN = String.raw`(?:\W+\w+){0,6}?\W+(?:threads?|notes|messages|chats?|conversations?|material|code)\b`;
const TO_A_PLACE = String.raw`(?:\s+(?:it|them|this|that))?\s+(?:here|below|in the box)\b`;
const HANDS_OVER = String.raw`(?:share|drop|send|bring)\b(?:${NEAR_A_THREAD_NOUN}|${TO_A_PLACE})`;

const INVITES_A_THREAD = new RegExp(String.raw`${NOT_NEGATED}\b(?:paste\b|${HANDS_OVER})`, "i");

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
  return Object.entries(fixture.key.expect.nonThread ? NON_THREAD_CHECKS : HARD_CHECKS)
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
    split: hasSplit(meanings, reply, fixture.key),
    codeLine: !fixture.key.expect.codeLine || meanings.some((meaning) => meaning.startsWith("Code ")),
    noStaleMeaning: !meanings.some((meaning) => matches(fixture.key.expect.stalePattern, meaning)),
    quotedWordsInThread: layout.quotedWords.every((word) => includesIgnoringCase(fixture.thread, word)),
    under400Words: wordCount(reply) < 400,
    questionSpansThread: spansThread(question?.text ?? "", fixture.key.expect.questionEvidence),
    jointRoles: fixture.key.expect.nonThread === true || / (and|with) /.test(question?.roles ?? ""),
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

function hasSplit(meanings: string[], reply: string, { teams, expect: { splitTeam, splitTerms = [] } }: FixtureKey): boolean {
  if (splitTeam === undefined) return true;
  return viewsOf(splitTeam, meanings, teams).size >= 2 && splitTerms.every((term) => reply.includes(term));
}

function viewsOf(team: string, meanings: string[], teams: string[]): Set<string> {
  const holders = meanings.flatMap((meaning) => holderOf(meaning, teams) ?? []);
  return new Set(holders.flatMap(({ team: holder, view }) => (holder === team && view !== null ? [view] : [])));
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
