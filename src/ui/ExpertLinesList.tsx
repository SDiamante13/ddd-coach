import type { ExpertLines } from "./expertLines.ts";

export function ExpertLinesList({ expert, rung }: { expert: ExpertLines; rung: boolean }) {
  const name = `Lines for ${expert.who}`;
  return (
    <div className="expert-lines" data-rung={rung || undefined}>
      <p className="expert-lines-head">
        <span>{`${name} · only what's open`}</span> <span className="from-table">from your table</span>
      </p>
      <ol aria-label={name}>
        {expert.lines.map(({ row, text }) => (
          <li key={row}>{text}</li>
        ))}
      </ol>
    </div>
  );
}
