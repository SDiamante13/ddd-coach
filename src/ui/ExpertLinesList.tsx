import { useState } from "react";
import type { ExpertLines } from "./expertLines.ts";

const SHOWN = 3;

export function ExpertLinesList({ expert, rung, before }: { expert: ExpertLines; rung: boolean; before: string | null }) {
  const [all, setAll] = useState(false);
  const name = `Lines for ${expert.who}`;
  const hidden = all ? 0 : Math.max(expert.lines.length - SHOWN, 0);
  return (
    <div className="expert-lines" data-rung={rung || undefined}>
      <p className="expert-lines-head">
        <span>{`${name} · only what's open`}</span> <span className="from-table">from your table</span>
      </p>
      <ol aria-label={name}>
        {expert.lines.slice(0, expert.lines.length - hidden).map(({ row, text }) => (
          <li key={row}>{text}</li>
        ))}
      </ol>
      {hidden > 0 && (
        <button type="button" className="expert-lines-more" onClick={() => setAll(true)}>
          {`${hidden} more`}
        </button>
      )}
      {before && <p className="expert-lines-before">{before}</p>}
    </div>
  );
}
