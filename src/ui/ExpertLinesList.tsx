import type { ExpertLines } from "./expertLines.ts";

const countOf = (lines: number, who: string, open: boolean): string => `${lines} ${lines === 1 ? "line" : "lines"} for ${who} ${open ? "▾" : "▸"}`;

type ExpertLinesListProps = { expert: ExpertLines; rung: boolean; before: string | null; open: boolean; onOpen: (open: boolean) => void };

export function ExpertLinesList({ expert, rung, before, open, onOpen }: ExpertLinesListProps) {
  return (
    <div className="expert-lines" data-rung={rung || undefined}>
      <button type="button" className="expert-lines-toggle" aria-expanded={open} onClick={() => onOpen(!open)}>
        {countOf(expert.lines.length, expert.who, open)}
      </button>
      <p className="expert-lines-sub">from your table · only what's open</p>
      {open && (
        <ol aria-label={`Lines for ${expert.who}`}>
          {expert.lines.map(({ term, text }) => (
            <li key={term}>{text}</li>
          ))}
        </ol>
      )}
      {before && <p className="expert-lines-before">{before}</p>}
    </div>
  );
}
