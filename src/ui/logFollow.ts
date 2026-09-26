export type LogGeometry = { newestEntryBottom: number; composerTop: number };

const FOLLOW_TOLERANCE_PX = 48;

export function revealOptions({ reducedMotion, fits = true }: { reducedMotion: boolean; fits?: boolean }): ScrollIntoViewOptions {
  return { block: fits ? "end" : "start", behavior: reducedMotion ? "auto" : "smooth" };
}

export function isFollowing({ newestEntryBottom, composerTop }: LogGeometry): boolean {
  return newestEntryBottom - composerTop <= FOLLOW_TOLERANCE_PX;
}

const TOP_GAP_PX = 16;

type Band = { composerTop: number; topInset?: number };

export function fitsAbove({ height, composerTop, topInset = 0 }: Band & { height: number }): boolean {
  return height <= composerTop - topInset - TOP_GAP_PX;
}

export function inView({ top, bottom, composerTop, topInset = 0 }: Band & { top: number; bottom: number }): boolean {
  return top >= topInset && bottom <= composerTop;
}
