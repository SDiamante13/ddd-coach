import { useState } from "react";
import { addSwap, removeSwap, type SwapList, type SwapResult } from "../domain/swaps.ts";
import { forgetSwaps, keepSwaps, keptSwaps } from "./swapStore.ts";

export type Swaps = {
  swaps: SwapList;
  add: (from: string, to: string) => SwapResult;
  remove: (from: string) => void;
  clear: () => void;
};

export function useSwaps(): Swaps {
  const [swaps, setSwaps] = useState<SwapList>(keptSwaps);
  const change = (list: SwapList) => {
    setSwaps(list);
    keepSwaps(list);
  };

  return {
    swaps,
    add: (from, to) => {
      const result = addSwap(swaps, from, to);
      if (result.ok) change(result.list);
      return result;
    },
    remove: (from) => change(removeSwap(swaps, from)),
    clear: () => {
      setSwaps([]);
      forgetSwaps();
    },
  };
}
