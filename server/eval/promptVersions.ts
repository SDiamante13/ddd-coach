import { existsSync, readFileSync } from "node:fs";
import { COACH_INSTRUCTIONS_VERSION, coachInstructions } from "../coachInstructions.ts";

export const LIVE_INSTRUCTIONS_VERSION = 8;

export type SnapshotReader = (version: number) => string | undefined;

const SNAPSHOTS = new URL("../__snapshots__/", import.meta.url);

const readSnapshot: SnapshotReader = (version) => {
  const file = new URL(`coach-instructions.v${version}.txt`, SNAPSHOTS);
  return existsSync(file) ? readFileSync(file, "utf8") : undefined;
};

export function instructionsOf(version: number, read: SnapshotReader = readSnapshot): string {
  const snapshot = read(version);
  if (snapshot === undefined) throw new Error(`No snapshot of coach instructions v${version}`);
  if (version === COACH_INSTRUCTIONS_VERSION && snapshot !== coachInstructions()) {
    throw new Error(`The v${version} snapshot is stale; run npm test`);
  }
  return snapshot;
}
