import { type FormEvent, useState } from "react";
import { shortDay } from "../domain/dates.ts";
import type { SettleBy } from "../domain/session.ts";
import type { RestoreNames } from "./ReplyView.tsx";

type SettleByLineProps = { settleBy: SettleBy | null; onKeep: (settleBy: SettleBy) => void; restoreNames: RestoreNames };

export function SettleByLine({ settleBy, onKeep, restoreNames }: SettleByLineProps) {
  const [adding, setAdding] = useState(false);
  if (settleBy) return <p className="settle-by">{`Settle by: ${settleByText(settleBy, restoreNames)} · typed by you`}</p>;
  if (!adding)
    return (
      <button type="button" className="settle-by-add" onClick={() => setAdding(true)}>
        + Add a settle-by date (only if you have one)
      </button>
    );
  return <SettleByForm onKeep={onKeep} onCancel={() => setAdding(false)} />;
}

function SettleByForm({ onKeep, onCancel }: { onKeep: (settleBy: SettleBy) => void; onCancel: () => void }) {
  const [forum, setForum] = useState("");
  const [on, setOn] = useState("");
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
