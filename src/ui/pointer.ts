export function hasTouchPointer(): boolean {
  return window.matchMedia?.("(pointer: coarse)").matches ?? false;
}
