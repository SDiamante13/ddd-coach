import { useState } from "react";
import type { Speaker } from "../domain/pasteSpeakers.ts";
import { whoIsWhoOf, type WhoIsWhoEntry } from "../domain/whosWho.ts";
import type { WhosWhoOfferProps } from "./WhosWhoOffer.tsx";

export const CODE_HINT = "Code: for people describing what the code does";
const NOT_SURE = "Not sure";
const FOOTER = "Stays in this browser. Never sent: names are swapped before anything leaves.";

type StripProps = WhosWhoOfferProps & { onApply: (entries: WhoIsWhoEntry[]) => void; onSkip: () => void };
type Choices = ReadonlyMap<string, string>;

export function WhosWhoStrip({ gap, speakers, entries, shown, outgoing, onApply, onSkip }: StripProps) {
  const [choices, setChoices] = useState<Choices>(() => chosenBefore(speakers, entries));
  const teams = [...gap.holders.filter((holder) => holder !== "Code"), "Code", NOT_SURE];
  const choose = (speaker: string, team: string) => setChoices(new Map(choices).set(speaker, team));
  const apply = () => onApply(merged(entries, speakers, choices));
  const set = speakers.filter(({ speaker }) => choices.has(speaker)).length;
  return (
    <>
      <p className="whos-who-head">{`Who's who · ${set} of ${speakers.length} set`}</p>
      <p className="whos-who-hint">{CODE_HINT}</p>
      {speakers.map((speaker) => (
        <SpeakerPicker key={speaker.speaker} speaker={speaker} teams={teams} chosen={choices.get(speaker.speaker)} shown={shown} onChoose={(team) => choose(speaker.speaker, team)} outgoing={outgoing} />
      ))}
      <p className="whos-who-foot">{FOOTER}</p>
      <button type="button" className="whos-who-apply" onClick={apply}>
        Apply · find source lines
      </button>{" "}
      <button type="button" onClick={onSkip}>
        Skip
      </button>
    </>
  );
}

type PickerProps = { speaker: Speaker; teams: string[]; chosen: string | undefined; shown: (text: string) => string; onChoose: (team: string) => void; outgoing: (text: string) => string };

function SpeakerPicker({ speaker: { speaker, lines }, teams, chosen, shown, onChoose, outgoing }: PickerProps) {
  const name = shown(speaker);
  return (
    <div className="whos-who-row" role="group" aria-label={name}>
      <p className="whos-who-name">
        {name} <span>{`${lines} ${lines === 1 ? "line" : "lines"}`}</span>
      </p>
      {teams.map((team) => (
        <button key={team} type="button" className={team === "Code" ? "team-chip code" : "team-chip"} aria-pressed={chosen === team} onClick={() => onChoose(team)}>
          {shown(team)}
        </button>
      ))}
      <input aria-label={`${name}'s team`} placeholder="Or type their team" onKeyDown={(event) => event.key === "Enter" && onChoose(outgoing(event.currentTarget.value.trim()))} />
    </div>
  );
}

function chosenBefore(speakers: Speaker[], entries: readonly WhoIsWhoEntry[]): Choices {
  const known = whoIsWhoOf(entries);
  return new Map(speakers.flatMap(({ speaker }) => (known.has(speaker.toLowerCase()) ? [[speaker, known.get(speaker.toLowerCase())!]] : [])));
}

function merged(entries: readonly WhoIsWhoEntry[], speakers: Speaker[], choices: Choices): WhoIsWhoEntry[] {
  const here = new Set(speakers.map(({ speaker }) => speaker.toLowerCase()));
  const chosen = [...choices].filter(([, team]) => team !== NOT_SURE && team !== "").map(([speaker, team]) => ({ speaker, team }));
  return [...entries.filter(({ speaker }) => !here.has(speaker.toLowerCase())), ...chosen];
}
