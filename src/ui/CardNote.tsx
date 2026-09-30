import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import type { Provenance } from "../domain/board.ts";
import type { EntityId } from "../domain/entityId.ts";

export type LinkOption = { id: EntityId; title: string };
type CardNoteProps = { id: string; provenance: Provenance; line: string | null; onCorrect: () => void; others: readonly LinkOption[]; onLink: (to: EntityId) => void };

export function CardNote({ id, provenance, line, onCorrect, others, onLink }: CardNoteProps) {
  const noteRef = useRef<HTMLDivElement>(null);
  const align = useAlignInsideBoard(noteRef);
  return (
    <div ref={noteRef} id={id} role="note" className="card-note" data-align={align}>
      {provenance === "guess" ? (
        <p>The coach's guess: no line in your paste says this.</p>
      ) : line === null ? (
        <p>No line in your paste matches closely.</p>
      ) : (
        <>
          <p className="card-note-label">CLOSEST LINE IN YOUR PASTE</p>
          <p className="card-note-line">{line}</p>
          <p className="card-note-hint">Shown in your paste on the right →</p>
        </>
      )}
      <button type="button" className="card-correct" onClick={onCorrect}>
        Correct this card
      </button>
      <LinkChooser others={others} onLink={onLink} />
    </div>
  );
}

function LinkChooser({ others, onLink }: { others: readonly LinkOption[]; onLink: (to: EntityId) => void }) {
  const [open, setOpen] = useState(false);
  if (others.length === 0) return null;
  return (
    <>
      <button type="button" className="card-correct" aria-expanded={open} onClick={() => setOpen(!open)}>
        Connect to…
      </button>
      {open && (
        <ul className="link-options" aria-label="Link this card to">
          {others.map(({ id, title }) => (
            <li key={id}>
              <button type="button" aria-label={`Link to “${title}”`} onClick={() => onLink(id)}>
                “{title}”
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function useAlignInsideBoard(ref: RefObject<HTMLElement | null>): "end" | undefined {
  const [align, setAlign] = useState<"end">();
  useLayoutEffect(() => {
    const lane = ref.current?.closest(".board-lane");
    if (ref.current && lane && ref.current.getBoundingClientRect().right > lane.getBoundingClientRect().right) setAlign("end");
  }, [ref]);
  return align;
}
