export type ReplyCounts = { added: number; updated: number; already: number; kept?: number };

const KEPT = " · your wording kept";

export function chipLabel(counts: ReplyCounts): string {
  return `${countsLabel(counts)}${(counts.kept ?? 0) > 0 ? KEPT : ""}`;
}

function countsLabel({ added, updated, already }: ReplyCounts): string {
  if (added === 0 && updated === 0) return `← ${already} already on the board`;
  const [first, ...rest] = [added > 0 && `${added} new`, updated > 0 && `${updated} updated`, already > 0 && `${already} already there`].filter(
    (part): part is string => part !== false,
  );
  return [`← ${first} on the board`, ...rest].join(" · ");
}
