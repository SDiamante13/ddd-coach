import type { EntityId } from "../domain/entityId.ts";
import { byWord, keptLabel, type Glossary, type KeptRow } from "../domain/glossary.ts";

const COLUMNS = ["Word", "Team", "Meaning", "Source", "Kept"];

type Shown = (text: string) => string;
type Remove = (id: EntityId) => void;
type PanelProps = { rows: Glossary; shown: Shown; remove: Remove };

export const EMPTY_GLOSSARY = "Nothing kept yet. Use Keep these words under a reply.";

export function GlossaryPanel({ rows, shown, remove, clear }: PanelProps & { clear: () => void }) {
  return (
    <details className="glossary">
      <summary>Glossary ({rows.length})</summary>
      {rows.length === 0 ? (
        <p>{EMPTY_GLOSSARY}</p>
      ) : (
        <>
          <GlossaryTable rows={rows} shown={shown} remove={remove} />
          <button type="button" className="clearglossary" onClick={clear}>
            Clear glossary
          </button>
        </>
      )}
    </details>
  );
}

function GlossaryTable({ rows, shown, remove }: PanelProps) {
  return (
    <table className="words">
      <caption className="visually-hidden">Kept glossary</caption>
      <GlossaryHead />
      {byWord(rows).map(({ word, rows: kept }) => (
        <tbody key={word}>
          {kept.map((row, index) => (
            <KeptRowLine key={row.id} row={row} word={index === 0 ? shown(word) : null} span={kept.length} shown={shown} remove={remove} />
          ))}
        </tbody>
      ))}
    </table>
  );
}

function GlossaryHead() {
  return (
    <thead>
      <tr>
        {COLUMNS.map((column) => (
          <th key={column} scope="col">
            {column}
          </th>
        ))}
        <th scope="col">
          <span className="visually-hidden">Remove</span>
        </th>
      </tr>
    </thead>
  );
}

type RowProps = { row: KeptRow; word: string | null; span: number; shown: Shown; remove: Remove };

function KeptRowLine({ row, word, span, shown, remove }: RowProps) {
  return (
    <tr>
      {word !== null && (
        <th scope="rowgroup" rowSpan={span}>
          {word}
        </th>
      )}
      <td>{shown(row.holder)}</td>
      <td>{shown(row.meaning)}</td>
      <td>{row.source}</td>
      <td>{shown(keptLabel(row))}</td>
      <td>
        <button type="button" aria-label={`Remove ${shown(row.word)}, ${shown(row.holder)}`} onClick={() => remove(row.id)}>
          ×
        </button>
      </td>
    </tr>
  );
}
