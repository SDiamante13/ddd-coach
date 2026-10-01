import type { WordRow } from "../domain/replyBlocks.ts";
import { WordTable } from "./WordTable.tsx";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function WordsOnBoard({ rows }: { rows: WordRow[] }) {
  const meanings = rows.reduce((sum, row) => sum + row.meanings.length, 0);
  const focusFirstTerm = () => document.querySelector<HTMLElement>(`[role="group"][aria-label="Term “${rows[0]?.word}”"]`)?.focus();
  return (
    <>
      <button type="button" className="board-chip" onClick={focusFirstTerm}>
        {`← ${plural(rows.length, "term", "terms")} on the board · ${plural(meanings, "row", "rows")}`}
      </button>
      <details className="word-table-details">
        <summary>Show as table</summary>
        <WordTable rows={rows} />
      </details>
    </>
  );
}
