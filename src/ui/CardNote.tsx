import type { Provenance } from "../domain/board.ts";

type CardNoteProps = { id: string; provenance: Provenance; line: string | null };

export function CardNote({ id, provenance, line }: CardNoteProps) {
  return (
    <div id={id} role="note" className="card-note">
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
    </div>
  );
}
