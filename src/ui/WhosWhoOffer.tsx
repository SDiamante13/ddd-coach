import { useState } from "react";
import type { Speaker } from "../domain/pasteSpeakers.ts";
import type { SourceGap } from "../domain/sourceGap.ts";
import type { WhoIsWhoEntry } from "../domain/whosWho.ts";
import { WhosWhoStrip } from "./WhosWhoStrip.tsx";

export type WhosWhoOfferProps = {
  gap: SourceGap;
  speakers: Speaker[];
  entries: readonly WhoIsWhoEntry[];
  onKeep: (entries: WhoIsWhoEntry[]) => void;
  shown: (text: string) => string;
  outgoing: (text: string) => string;
};

type Phase = "callout" | "strip" | "applied" | "dismissed";

const people = (count: number) => `${count} ${count === 1 ? "person" : "people"}`;
const mostlyUnsourced = ({ rows, none }: SourceGap) => rows > 0 && none * 2 > rows;

export function WhosWhoOffer(props: WhosWhoOfferProps) {
  const [phase, setPhase] = useState<Phase>("callout");
  const [noneBefore, setNoneBefore] = useState(0);
  const { gap, speakers } = props;
  if (phase === "dismissed" || speakers.length === 0 || (phase === "callout" && !mostlyUnsourced(gap))) return null;
  const apply = (entries: WhoIsWhoEntry[]) => {
    setNoneBefore(gap.none);
    props.onKeep(entries);
    setPhase("applied");
  };
  return (
    <div className="whos-who" role="group" aria-label="Who's who">
      {phase === "callout" && <Callout gap={gap} speakers={speakers.length} onOpen={() => setPhase("strip")} onDismiss={() => setPhase("dismissed")} />}
      {phase === "strip" && <WhosWhoStrip {...props} onApply={apply} onSkip={() => setPhase("dismissed")} />}
      {phase === "applied" && <Applied found={noneBefore - gap.none} none={gap.none} speakers={speakers.length} onEdit={() => setPhase("strip")} />}
    </div>
  );
}

function Callout({ gap, speakers, onOpen, onDismiss }: { gap: SourceGap; speakers: number; onOpen: () => void; onDismiss: () => void }) {
  return (
    <>
      <p>{`${gap.none} of ${gap.rows} rows have no source line. Your thread is written by people, and the rows are by team. Say who's on which team (about 30 s) and the rows find their lines.`}</p>
      <button type="button" className="whos-who-open" onClick={onOpen}>{`Who's who · ${people(speakers)}`}</button>{" "}
      <button type="button" onClick={onDismiss}>
        Not now
      </button>
    </>
  );
}

function Applied({ found, none, speakers, onEdit }: { found: number; none: number; speakers: number; onEdit: () => void }) {
  return (
    <>
      <p className="board-chip whos-who-found">{`${found} more source ${found === 1 ? "line" : "lines"} found · ${none} still none`}</p>
      <p className="whos-who-summary">
        {`Who's who · ${people(speakers)}`}{" "}
        <button type="button" onClick={onEdit}>
          Edit
        </button>
      </p>
    </>
  );
}
