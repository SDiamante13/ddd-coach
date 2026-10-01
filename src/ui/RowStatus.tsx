import { type FocusEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
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
  const trigger = useRef<HTMLButtonElement>(null);
  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };
  const closeOnEscape = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Escape" || !open) return;
    event.stopPropagation();
    close(true);
  };
  const closeOnLeave = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  };
  return (
    <span className="row-check-wrap" onKeyDown={closeOnEscape} onBlur={closeOnLeave}>
      <button ref={trigger} type="button" className="row-check" aria-expanded={open} aria-label="I checked" onClick={() => setOpen(!open)}>
        I checked ▾
      </button>
      {open && <CheckMenuPanel onCheck={onCheck} onClear={onClear} onClose={close} />}
    </span>
  );
}

function CheckMenuPanel({ onCheck, onClear, onClose }: CheckMenuProps & { onClose: (refocus: boolean) => void }) {
  const [where, setWhere] = useState("");
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => first.current?.focus(), []);
  const then = (act: () => void) => () => {
    onClose(false);
    act();
  };
  return (
    <div className="row-check-menu">
      <input aria-label="Where? (optional)" placeholder="Where? e.g. app/models/booking.rb:212" value={where} onChange={(event) => setWhere(event.target.value)} />
      {CHOICES.map(([verdict, label], index) => (
        <button key={verdict} ref={index === 0 ? first : undefined} type="button" onClick={then(() => onCheck(verdict, where.trim()))}>
          {label}
        </button>
      ))}
      {onClear && (
        <button type="button" className="row-clear" onClick={then(onClear)}>
          Clear check
        </button>
      )}
    </div>
  );
}
