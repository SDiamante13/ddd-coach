import { useId } from "react";
import type { Claim } from "../domain/replyBlocks.ts";
import { EVENTS_HEADING } from "../shared/replyLayout.ts";
import { SourceChip } from "./SourceChip.tsx";

export function EventList({ items }: { items: Claim[] }) {
  const titleId = useId();
  return (
    <>
      <p className="part-title" id={titleId}>
        {EVENTS_HEADING}
      </p>
      <ol className="events" aria-labelledby={titleId}>
        {items.map(({ source, text }, index) => (
          <li key={index}>
            <SourceChip source={source} />
            {text}
          </li>
        ))}
      </ol>
    </>
  );
}
