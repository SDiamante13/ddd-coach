import type { ExpertLines } from "./expertLines.ts";

const countOf = (lines: number, who: string): string => `${lines} ${lines === 1 ? "line" : "lines"} for ${who} ▸`;

type ExpertLinesListProps = { expert: ExpertLines; rung: boolean; before: string | null; open: boolean; onOpen: (open: boolean) => void };

export function ExpertLinesList({ expert, rung, before, open, onOpen }: ExpertLinesListProps) {
  const name = `Lines for ${expert.who}`;
  return (
    <div className="expert-lines" data-rung={rung || undefined}>
      {open ? (
        <>
          <p className="expert-lines-head">
            <span>{`${name} · only what's open`}</span> <span className="from-table">from your table</span>{" "}
            <button type="button" className="expert-lines-hide" aria-expanded={true} aria-label="Hide the lines" onClick={() => onOpen(false)}>
              ▾
            </button>
          </p>
          <ol aria-label={name}>
            {expert.lines.map(({ term, text }) => (
              <li key={term}>{text}</li>
            ))}
          </ol>
        </>
      ) : (
        <button type="button" className="expert-lines-toggle" aria-expanded={false} onClick={() => onOpen(true)}>
          {countOf(expert.lines.length, expert.who)}
        </button>
      )}
      {before && <p className="expert-lines-before">{before}</p>}
    </div>
  );
}
