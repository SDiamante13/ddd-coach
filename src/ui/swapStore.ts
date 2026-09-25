import type { Swap, SwapList } from "../domain/swaps.ts";
import { stringField } from "../shared/json.ts";

const KEY = "ddd-coach.swaps.v1";

export function keepSwaps(list: SwapList): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    return;
  }
}

export function keptSwaps(): SwapList {
  try {
    const kept: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(kept) && kept.every(isSwap) ? kept : [];
  } catch {
    return [];
  }
}

function isSwap(value: unknown): value is Swap {
  return stringField(value, "from") !== undefined && stringField(value, "to") !== undefined;
}
