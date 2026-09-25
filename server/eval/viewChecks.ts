import type { FixtureKey, SameMeaning, ViewGroup } from "./replyChecks.ts";
import type { CoachReply } from "./replyLayout.ts";
import { withoutSourceLabel } from "./replyLayout.ts";

const ALWAYS_HELD_BY = ["Code", "Team unclear"];
const AFTER_HOLDER = /^(?: \(view ([AB])\))? (\p{Ll}+)/u;
const GROUP_WORDS = ["night", "day", "desk", "shift", "dispatch"];

export type Holder = { team: string; view: string | null };

export function hasKnownHolders(words: CoachReply["words"], { teams }: FixtureKey): boolean {
  const meanings = words.flatMap((word) => word.meanings);
  return meanings.every((meaning) => holderOf(meaning, teams) !== null);
}

export function hasCleanSplitLabels(words: CoachReply["words"], { teams }: FixtureKey): boolean {
  return words.every(({ meanings }) => {
    const holders = meanings.flatMap((meaning) => holderOf(meaning, teams) ?? []);
    const labels = holders.map(labelOf);
    return new Set(labels).size === labels.length && !holders.some((holder) => mixesPlainAndView(holder, holders));
  });
}

function mixesPlainAndView({ team, view }: Holder, holders: Holder[]): boolean {
  return view === null && holders.some((other) => other.team === team && other.view !== null);
}

const labelOf = ({ team, view }: Holder): string => `${team}|${view ?? "plain"}`;

type Views = NonNullable<FixtureKey["expect"]["views"]>;

export function hasStableViews(words: CoachReply["words"], { teams, expect: { views, sameMeaning = [] } }: FixtureKey): boolean {
  if (views === undefined) return true;
  const splittable = words.filter(({ word }) => !sameMeaning.some((entry) => isOneOf(word, entry)));
  const pairs = splittable.flatMap(({ meanings }) => meanings.flatMap((meaning) => viewGroupOf(meaning, teams, views)));
  const distinct = (values: string[]) => new Set(values).size;
  const pairCount = distinct(pairs.map(({ view, group }) => `${view}|${group}`));
  return pairCount === distinct(pairs.map(({ view }) => view)) && pairCount === distinct(pairs.map(({ group }) => group));
}

function viewGroupOf(meaning: string, teams: string[], { team, groups }: Views): { view: string; group: string }[] {
  const holder = holderOf(meaning, teams);
  const group = onlyGroupHit(meaning, groups);
  if (!isViewOf(holder, team) || group === null) return [];
  return [{ view: holder.view, group }];
}

function onlyGroupHit(meaning: string, groups: ViewGroup[]): string | null {
  const text = meaning.toLowerCase();
  const hits = groups.filter(({ markers }) => markers.some((marker) => text.includes(marker.toLowerCase())));
  return hits.length === 1 ? hits[0]!.name : null;
}

export function keepsSameMeaningWhole(words: CoachReply["words"], { teams, expect: { sameMeaning = [] } }: FixtureKey): boolean {
  return sameMeaning.every((entry) =>
    words.filter(({ word }) => isOneOf(word, entry)).every(({ meanings }) => !hasViewFor(entry.team, meanings, teams)),
  );
}

export function namesSameMeaning(words: CoachReply["words"], { expect: { sameMeaning = [] } }: FixtureKey): boolean {
  return sameMeaning.every((entry) =>
    words.filter(({ word }) => isOneOf(word, entry)).every(({ meanings }) => meanings.some((line) => namesEvery(line, entry))),
  );
}

function namesEvery(line: string, { words }: SameMeaning): boolean {
  const text = line.toLowerCase();
  return words.every((variants) => variants.some((variant) => text.includes(variant.toLowerCase())));
}

function isOneOf(word: string, { words }: SameMeaning): boolean {
  return words.flat().some((variant) => variant.toLowerCase() === word.toLowerCase());
}

function hasViewFor(team: string, meanings: string[], teams: string[]): boolean {
  return meanings.some((meaning) => isViewOf(holderOf(meaning, teams), team));
}

function isViewOf(holder: Holder | null, team: string): holder is Holder & { view: string } {
  return holder?.view != null && holder.team.toLowerCase() === team.toLowerCase();
}

export function holderOf(meaning: string, teams: string[]): Holder | null {
  const claim = withoutSourceLabel(meaning);
  const team = longestFirst([...teams, ...ALWAYS_HELD_BY]).find((t) => claim.toLowerCase().startsWith(t.toLowerCase()));
  const after = team === undefined ? null : AFTER_HOLDER.exec(claim.slice(team.length));
  if (team === undefined || after === null || GROUP_WORDS.includes(after[2]!)) return null;
  return { team, view: after[1] ?? null };
}

function longestFirst(teams: string[]): string[] {
  return [...teams].sort((a, b) => b.length - a.length);
}
