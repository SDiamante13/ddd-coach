import { useState } from "react";
import type { Unlock } from "./useAccess.ts";

export function useAccessRecovery(unlock: Unlock, onRecovered: () => void) {
  const [accessLost, setAccessLost] = useState(false);
  const unlockAgain: Unlock = async (password) => {
    const result = await unlock(password);
    if (result.ok) {
      setAccessLost(false);
      onRecovered();
    }
    return result;
  };
  return { accessLost, loseAccess: () => setAccessLost(true), unlockAgain };
}
