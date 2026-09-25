import { useState } from "react";
import { addSwap, type SwapList, type SwapResult } from "../domain/swaps.ts";

export type Swaps = {
  swaps: SwapList;
  add: (from: string, to: string) => SwapResult;
};

export function useSwaps(): Swaps {
  const [swaps, setSwaps] = useState<SwapList>([]);

  return {
    swaps,
    add: (from, to) => {
      const result = addSwap(swaps, from, to);
      if (result.ok) setSwaps(result.list);
      return result;
    },
  };
}
