export type LogGeometry = { newestEntryBottom: number; composerTop: number };

const FOLLOW_TOLERANCE_PX = 48;

export function revealOptions({ reducedMotion }: { reducedMotion: boolean }): ScrollIntoViewOptions {
  return { block: "end", behavior: reducedMotion ? "auto" : "smooth" };
}

export function isFollowing({ newestEntryBottom, composerTop }: LogGeometry): boolean {
  return newestEntryBottom - composerTop <= FOLLOW_TOLERANCE_PX;
}
