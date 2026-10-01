export type WhoIsWho = ReadonlyMap<string, string>;

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
