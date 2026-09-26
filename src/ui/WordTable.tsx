import type { Meaning, WordRow } from "../domain/replyBlocks.ts";
import { SourceChip } from "./SourceChip.tsx";

const COLUMNS = ["Word", "Team", "Meaning", "Source"];

export function WordTable({ rows }: { rows: WordRow[] }) {
  return (
    <div className="table-scroll">
      <table className="words">
        <caption className="visually-hidden">Words that don't match</caption>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        {rows.map((row, index) => (
          <WordGroup key={index} row={row} />
        ))}
      </table>
    </div>
  );
}

function WordGroup({ row: { word, meanings } }: { row: WordRow }) {
  if (meanings.length === 0) return <WordOnly word={word} />;
  return (
    <tbody>
      {meanings.map((meaning, index) => (
        <tr key={index}>
          {index === 0 && (
            <th scope="rowgroup" rowSpan={meanings.length}>
              {word}
            </th>
          )}
          <MeaningCells meaning={meaning} />
        </tr>
      ))}
    </tbody>
  );
}

function WordOnly({ word }: { word: string }) {
  return (
    <tbody>
      <tr>
        <th scope="rowgroup">{word}</th>
        <td colSpan={3} />
      </tr>
    </tbody>
  );
}

function MeaningCells({
  meaning: { holder, meaning, source },
}: {
  meaning: Meaning;
}) {
  return (
    <>
      <td>{holder}</td>
      <td className="meaning-cell">
        {meaning}
        {source === "Guess" && <span className="guess-tag">GUESS</span>}
      </td>
      <td className="source-cell">
        <SourceChip source={source} />
      </td>
    </>
  );
}
