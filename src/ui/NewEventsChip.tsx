import type { ChangeCounts, NewEvents } from "./usePanToChanges.ts";

export function NewEventsChip({ events }: { events: NewEvents }) {
  if (events === null) return null;
  return (
    <button type="button" className="new-events-chip" aria-label={chipNameOf(events)} onClick={events.reveal}>
      {chipTextOf(events)}
    </button>
  );
}

const plural = (count: number) => (count === 1 ? "event" : "events");

const partsOf = ({ added, updated }: ChangeCounts): string[] =>
  [added > 0 ? `${added} new` : "", updated > 0 ? `${updated} updated` : ""].filter((part) => part !== "");

export const chipTextOf = (counts: ChangeCounts): string => `${partsOf(counts).join(" · ")} ▸`;

export const chipNameOf = (counts: ChangeCounts): string => `Show the ${partsOf(counts).join(" and ")} ${plural(counts.added + counts.updated)}`;
