export type ReplyCounts = { added: number; updated: number; already: number };

export function chipLabel({ added, updated, already }: ReplyCounts): string {
  if (added === 0 && updated === 0) return `← ${already} already on the board`;
  const [first, ...rest] = [added > 0 && `${added} new`, updated > 0 && `${updated} updated`, already > 0 && `${already} already there`].filter(
    (part): part is string => part !== false,
  );
  return [`← ${first} on the board`, ...rest].join(" · ");
}
