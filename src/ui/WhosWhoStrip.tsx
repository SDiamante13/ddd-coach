import { useState } from "react";
import type { Speaker } from "../domain/pasteSpeakers.ts";
import { spokenLinesOf } from "../domain/pasteSpeakers.ts";
import { suggestedTeam, type Suggestion, whoIsWhoOf, type WhoIsWhoEntry } from "../domain/whosWho.ts";
import type { WhosWhoOfferProps } from "./WhosWhoOffer.tsx";

export const CODE_HINT = "Code: for people describing what the code does";
const NOT_SURE = "Not sure";
const FOOTER = "Stays in this browser. Never sent: names are swapped before anything leaves.";

type StripProps = WhosWhoOfferProps & { head?: string; onApply: (entries: WhoIsWhoEntry[]) => void; onSkip: () => void };
type Choices = ReadonlyMap<string, string>;

export function WhosWhoStrip({ gap, speakers, paste, entries, shown, outgoing, head, onApply, onSkip }: StripProps) {
  const [choices, setChoices] = useState<Choices>(() => chosenBefore(speakers, entries));
  const teams = [...gap.holders.filter((holder) => holder !== "Code"), "Code", NOT_SURE];
  const choose = (speaker: string, team: string) => setChoices(new Map(choices).set(speaker, team));
  const apply = () => onApply(merged(entries, speakers, choices));
  const set = speakers.filter(({ speaker }) => choices.has(speaker)).length;
  return (
    <>
      <p className="whos-who-head">{head ?? `Who's who · ${set} of ${speakers.length} set`}</p>
      <p className="whos-who-hint">{CODE_HINT}</p>
      {speakers.map((speaker) => (
        <SpeakerPicker key={speaker.speaker} speaker={speaker} teams={teams} chosen={choices.get(speaker.speaker)} suggestion={suggestedTeam(linesBy(paste, speaker.speaker), teams)} shown={shown} onChoose={(team) => choose(speaker.speaker, team)} outgoing={outgoing} />
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

type PickerProps = { speaker: Speaker; teams: string[]; chosen: string | undefined; suggestion: Suggestion | null; shown: (text: string) => string; onChoose: (team: string) => void; outgoing: (text: string) => string };

function SpeakerPicker({ speaker: { speaker, lines }, teams, chosen, suggestion, shown, onChoose, outgoing }: PickerProps) {
  const name = shown(speaker);
  const suggested = chosen === undefined ? suggestion : null;
  return (
    <div className="whos-who-row" role="group" aria-label={name}>
      <p className="whos-who-name">
        {name} <span>{`${lines} ${lines === 1 ? "line" : "lines"}`}</span>
      </p>
      {teams.map((team) => (
        <TeamChip key={team} team={team} chosen={chosen === team} suggested={suggested?.team === team} shown={shown} onChoose={onChoose} />
      ))}
      {suggested && <p className="whos-who-suggested">{`Suggested from “${shown(suggested.quote)}”; tap to confirm`}</p>}
      <input aria-label={`${name}'s team`} placeholder="Or type their team" onKeyDown={(event) => event.key === "Enter" && onChoose(outgoing(event.currentTarget.value.trim()))} />
    </div>
  );
}

type ChipProps = { team: string; chosen: boolean; suggested: boolean; shown: (text: string) => string; onChoose: (team: string) => void };

function TeamChip({ team, chosen, suggested, shown, onChoose }: ChipProps) {
  const kind = [team === "Code" ? "code" : "", suggested ? "suggested" : ""].filter(Boolean).join(" ");
  return (
    <button type="button" className={`team-chip ${kind}`.trim()} aria-pressed={chosen} onClick={() => onChoose(team)}>
      {suggested ? `${shown(team)}?` : shown(team)}
    </button>
  );
}

const linesBy = (paste: string, speaker: string): string[] => spokenLinesOf(paste).filter((line) => line.speaker === speaker).map(({ start, end }) => paste.slice(start, end));

function chosenBefore(speakers: Speaker[], entries: readonly WhoIsWhoEntry[]): Choices {
  const known = whoIsWhoOf(entries);
  return new Map(speakers.flatMap(({ speaker }) => (known.has(speaker.toLowerCase()) ? [[speaker, known.get(speaker.toLowerCase())!]] : [])));
}

function merged(entries: readonly WhoIsWhoEntry[], speakers: Speaker[], choices: Choices): WhoIsWhoEntry[] {
  const here = new Set(speakers.map(({ speaker }) => speaker.toLowerCase()));
  const chosen = [...choices].filter(([, team]) => team !== NOT_SURE && team !== "").map(([speaker, team]) => ({ speaker, team }));
  return [...entries.filter(({ speaker }) => !here.has(speaker.toLowerCase())), ...chosen];
}
