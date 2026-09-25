export type LogGeometry = { newestEntryBottom: number; composerTop: number };

const FOLLOW_TOLERANCE_PX = 48;

export function revealOptions({ reducedMotion, fits = true }: { reducedMotion: boolean; fits?: boolean }): ScrollIntoViewOptions {
  return { block: fits ? "end" : "start", behavior: reducedMotion ? "auto" : "smooth" };
}

export function isFollowing({ newestEntryBottom, composerTop }: LogGeometry): boolean {
  return newestEntryBottom - composerTop <= FOLLOW_TOLERANCE_PX;
}

const TOP_GAP_PX = 16;

export function fitsAbove({ height, composerTop }: { height: number; composerTop: number }): boolean {
  return height <= composerTop - TOP_GAP_PX;
}
