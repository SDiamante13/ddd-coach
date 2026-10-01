import { useMemo, useState } from "react";
import { whoIsWhoOf, type WhoIsWhoEntry } from "../domain/whosWho.ts";
import { forgetWhosWho, keepWhosWho, keptWhosWho } from "./whosWhoStore.ts";

export function useWhosWho() {
  const [entries, setEntries] = useState<readonly WhoIsWhoEntry[]>(keptWhosWho);
  const whoIsWho = useMemo(() => whoIsWhoOf(entries), [entries]);
  const clear = () => {
    forgetWhosWho();
    setEntries([]);
  };
  const keep = (next: readonly WhoIsWhoEntry[]) => {
    keepWhosWho(next);
    setEntries(next);
  };
  return { entries, whoIsWho, keep, clear };
}

export type WhosWho = ReturnType<typeof useWhosWho>;
