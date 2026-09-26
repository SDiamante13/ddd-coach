import { keptLabel, MAX_SENT_ROWS, outgoingGlossary, type Glossary, type KeptGlossaryRow, type KeptRow } from "../domain/glossary.ts";
import type { SwapList } from "../domain/swaps.ts";

export function SentGlossary({ glossary, swaps }: { glossary: Glossary; swaps: SwapList }) {
  const { sent, left } = outgoingGlossary(glossary, swaps);
  if (sent.length === 0) return <p>No kept glossary</p>;
  return (
    <>
      <ul className="sent-glossary" aria-label="Kept glossary sent with this message">
        {sent.map((row, index) => (
          <li key={index}>{sentLine(row)}</li>
        ))}
      </ul>
      {left.length > 0 && <p role="note">{leftOutNote(left)}</p>}
    </>
  );
}

function leftOutNote(left: readonly KeptRow[]): string {
  const rows = left.map((row) => `"${row.word}" (${row.holder}, kept ${keptLabel(row)})`).join(", ");
  const count = left.length === 1 ? "1 kept row isn't sent" : `${left.length} kept rows aren't sent`;
  return `${count}: ${rows}. Only the newest ${MAX_SENT_ROWS} kept rows are sent.`;
}

const sentLine = (row: KeptGlossaryRow): string => `"${row.word}": ${row.holder} means ${row.meaning} (kept ${keptLabel(row)})`;
