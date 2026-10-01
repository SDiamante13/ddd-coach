import type { RestoreNames } from "./ReplyView.tsx";
import type { WhosWho } from "./useWhosWho.ts";

export function WhosWhoPanel({ whosWho, restoreNames }: { whosWho: WhosWho; restoreNames: RestoreNames }) {
  const shown = (text: string) => restoreNames(text).text;
  if (whosWho.entries.length === 0) return null;
  return (
    <details className="swaps whos-who-panel" role="group" aria-label="Saved who's who">
      <summary>{`Who's who (${whosWho.entries.length})`}</summary>
      <ul>
        {whosWho.entries.map(({ speaker, team }) => (
          <li key={speaker}>{`${shown(speaker)} → ${shown(team)}`}</li>
        ))}
      </ul>
      <button type="button" className="clearswaps" onClick={whosWho.clear}>
        Clear who's who
      </button>
    </details>
  );
}
