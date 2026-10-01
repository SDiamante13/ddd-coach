export type WhoIsWho = ReadonlyMap<string, string>;
export type WhoIsWhoEntry = { speaker: string; team: string };

export const whoIsWhoOf = (entries: readonly WhoIsWhoEntry[]): WhoIsWho => new Map(entries.map(({ speaker, team }) => [speaker.toLowerCase(), team]));

const stemsOf = (text: string): string[] => (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).map((word) => (word.length > 3 ? word.replace(/s$/, "") : word));

const QUALIFIER = /\(([^)]*)\)/g;

export function teamOfHolder(holder: string, teams: readonly string[]): string | null {
  const base = stemsOf(holder.replace(QUALIFIER, " "));
  const qualifier = stemsOf([...holder.matchAll(QUALIFIER)].map((match) => match[1]).join(" "));
  const named = teams.filter((team) => base.length > 0 && base.every((word) => stemsOf(team).includes(word)));
  const narrowed = named.length > 1 ? closest(named, qualifier) : named;
  return narrowed.length === 1 ? narrowed[0]! : null;
}

function closest(teams: string[], qualifier: string[]): string[] {
  const shared = (team: string) => qualifier.filter((word) => stemsOf(team).includes(word)).length;
  const most = Math.max(...teams.map(shared));
  return most === 0 ? [] : teams.filter((team) => shared(team) === most);
}

export type Suggestion = { team: string; quote: string };

const SELF = /\b(we|we're|our|us|i'm|here)\b/i;
const QUOTE_CHARS = 60;

const ownWordsOf = (team: string): string[] => {
  const qualifier = stemsOf([...team.matchAll(QUALIFIER)].map((match) => match[1]).join(" "));
  return qualifier.length > 0 ? qualifier : stemsOf(team);
};

export function suggestedTeam(lines: readonly string[], teams: readonly string[]): Suggestion | null {
  for (const line of lines.filter((text) => SELF.test(text))) {
    const said = stemsOf(line);
    const named = teams.filter((team) => ownWordsOf(team).every((word) => said.includes(word)));
    if (named.length === 1) return { team: named[0]!, quote: line.trim().slice(0, QUOTE_CHARS) };
  }
  return null;
}
