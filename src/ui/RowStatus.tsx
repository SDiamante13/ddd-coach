import { type KeyboardEvent, useState } from "react";
import type { Verdict } from "../domain/boardFromReplies.ts";
import { shortDay } from "../domain/dates.ts";
import type { RowCheck } from "../domain/rowChecks.ts";

const BADGE: Record<Verdict, string> = { holds: "CHECKED BY YOU", unknown: "COULDN'T TELL", wrong: "MARKED WRONG BY YOU" };
const CHOICES: readonly [Verdict, string][] = [
  ["holds", "Yes, it holds"],
  ["wrong", "No, it's wrong"],
  ["unknown", "Couldn't tell"],
];

type RowStatusProps = {
  check: RowCheck | undefined;
  meaning: string;
  shown: (text: string) => string;
  onCheck: (verdict: Verdict, where: string) => void;
  onCorrect: (text: string) => void;
  onClear: () => void;
};

export function RowStatus({ check, meaning, shown, onCheck, onCorrect, onClear }: RowStatusProps) {
  const [correcting, setCorrecting] = useState(false);
  const checked = (verdict: Verdict, where: string) => {
    onCheck(verdict, where);
    setCorrecting(verdict === "wrong");
  };
  const keep = (text: string) => {
    setCorrecting(false);
    if (text !== "" && text !== meaning) onCorrect(text);
  };
  return (
    <div className="row-status nodrag nopan">
      {check ? <CheckedBadge check={check} shown={shown} /> : <span className="row-open">OPEN</span>}
      <CheckMenu onCheck={checked} onClear={check ? onClear : undefined} />
      {correcting && <MeaningEditor initial={meaning} onKeep={keep} onCancel={() => setCorrecting(false)} />}
    </div>
  );
}

function MeaningEditor({ initial, onKeep, onCancel }: { initial: string; onKeep: (text: string) => void; onCancel: () => void }) {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") onCancel();
    if (event.key !== "Enter") return;
    event.preventDefault();
    onKeep(event.currentTarget.value.trim());
  };
  return <input className="row-correct" aria-label="Correct this meaning" defaultValue={initial} autoFocus onKeyDown={onKeyDown} />;
}

function CheckedBadge({ check, shown }: { check: RowCheck; shown: (text: string) => string }) {
  return (
    <>
      <span className="row-checked" data-verdict={check.verdict}>{`${BADGE[check.verdict]} · ${shortDay(check.at)}`}</span>
      {check.where && <span className="row-where">{`Where: ${shown(check.where)}`}</span>}
    </>
  );
}

type CheckMenuProps = { onCheck: (verdict: Verdict, where: string) => void; onClear: (() => void) | undefined };

function CheckMenu({ onCheck, onClear }: CheckMenuProps) {
  const [open, setOpen] = useState(false);
  const [where, setWhere] = useState("");
  const choose = (verdict: Verdict) => {
    onCheck(verdict, where.trim());
    setOpen(false);
    setWhere("");
  };
  return (
    <>
      <button type="button" className="row-check" aria-expanded={open} aria-label="I checked" onClick={() => setOpen(!open)}>
        I checked ▾
      </button>
      {open && (
        <div className="row-check-menu">
          <input aria-label="Where? (optional)" placeholder="Where? e.g. app/models/booking.rb:212" value={where} onChange={(event) => setWhere(event.target.value)} />
          {CHOICES.map(([verdict, label]) => (
            <button key={verdict} type="button" onClick={() => choose(verdict)}>
              {label}
            </button>
          ))}
          {onClear && (
            <button
              type="button"
              className="row-clear"
              onClick={() => {
                setOpen(false);
                onClear();
              }}
            >
              Clear check
            </button>
          )}
        </div>
      )}
    </>
  );
}
