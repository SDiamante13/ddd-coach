import type { NewEvents } from "./usePanToChanges.ts";

export function NewEventsChip({ events }: { events: NewEvents }) {
  if (events === null) return null;
  const { count, reveal } = events;
  return (
    <button type="button" className="new-events-chip" aria-label={`Show ${count} new event${count === 1 ? "" : "s"} on the right`} onClick={reveal}>
      {count} new ▸
    </button>
  );
}
