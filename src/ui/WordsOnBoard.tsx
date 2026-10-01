import type { WordRow } from "../domain/replyBlocks.ts";
import { entityId } from "../domain/entityId.ts";
import { WordTable } from "./WordTable.tsx";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export function WordsOnBoard({ rows }: { rows: WordRow[] }) {
  const terms = new Set(rows.map(({ word }) => entityId("term", word))).size;
  const meanings = new Set(rows.flatMap(({ word, meanings: held }) => held.map(({ holder }) => entityId("meaning", `${word}|${holder}`)))).size;
  const name = `Term “${rows[0]?.word}”`;
  const focusFirstTerm = () => [...document.querySelectorAll<HTMLElement>('[data-lane="words"]')].find((card) => card.getAttribute("aria-label") === name)?.focus();
  return (
    <>
      <button type="button" className="board-chip" onClick={focusFirstTerm}>
        {`← ${plural(terms, "term", "terms")} on the board · ${plural(meanings, "row", "rows")}`}
      </button>
      <details className="word-table-details">
        <summary>Show as table</summary>
        <WordTable rows={rows} />
      </details>
    </>
  );
}
