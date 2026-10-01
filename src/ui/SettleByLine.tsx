import { type FormEvent, useState } from "react";
import { dayAndMonth, shortDay } from "../domain/dates.ts";
import type { SettleBy } from "../domain/session.ts";
import type { RestoreNames } from "./ReplyView.tsx";

type SettleByLineProps = { settleBy: SettleBy | null; onKeep: (settleBy: SettleBy) => void; restoreNames: RestoreNames };

export function SettleByLine({ settleBy, onKeep, restoreNames }: SettleByLineProps) {
  const [editing, setEditing] = useState(false);
  const keep = (next: SettleBy) => {
    setEditing(false);
    onKeep(next);
  };
  if (editing) return <SettleByForm initial={settleBy && { forum: restoreNames(settleBy.forum).text, on: settleBy.on }} onKeep={keep} onCancel={() => setEditing(false)} />;
  if (settleBy) return <SettledBy settleBy={settleBy} restoreNames={restoreNames} onEdit={() => setEditing(true)} />;
  return (
    <button type="button" className="settle-by-add" onClick={() => setEditing(true)}>
      + Add a settle-by date (only if you have one)
    </button>
  );
}

function SettledBy({ settleBy, restoreNames, onEdit }: { settleBy: SettleBy; restoreNames: RestoreNames; onEdit: () => void }) {
  return (
    <p className="settle-by">
      <span className="settle-by-text" title={`Settle by: ${settleByText(settleBy, restoreNames)} · typed by you`}>
        {`Settle by ${dayAndMonth(settleBy.on)} · ${restoreNames(settleBy.forum).text}`}
      </span>
      <button type="button" className="settle-by-edit" aria-label="Change the settle-by" onClick={onEdit}>
        ✎
      </button>
    </p>
  );
}

function SettleByForm({ initial, onKeep, onCancel }: { initial: SettleBy | null; onKeep: (settleBy: SettleBy) => void; onCancel: () => void }) {
  const [forum, setForum] = useState(initial?.forum ?? "");
  const [on, setOn] = useState(initial?.on ?? "");
  const keep = (event: FormEvent) => {
    event.preventDefault();
    if (forum.trim() !== "" && on !== "") onKeep({ forum: forum.trim(), on });
  };
  return (
    <form className="settle-by-form" onSubmit={keep}>
      <input aria-label="Where it gets settled" placeholder="e.g. Finance review" value={forum} onChange={(event) => setForum(event.target.value)} />
      <input type="date" aria-label="By when" value={on} onChange={(event) => setOn(event.target.value)} />
      <button type="submit">Keep settle-by</button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

export function settleByText({ forum, on }: SettleBy, restoreNames: RestoreNames): string {
  return `${restoreNames(forum).text}, ${shortDay(on)}`;
}
