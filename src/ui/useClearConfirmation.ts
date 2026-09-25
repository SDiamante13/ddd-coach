import { useState } from "react";

export type ClearStep = "offered" | "confirming" | "kept";

export type ClearConfirmation = {
  step: ClearStep;
  askCount: number;
  ask: () => void;
  keep: () => void;
  clear: () => void;
};

export function useClearConfirmation(onClear: () => void): ClearConfirmation {
  const [step, setStep] = useState<ClearStep>("offered");
  const [askCount, setAskCount] = useState(0);

  return {
    step,
    askCount,
    ask: () => {
      setStep("confirming");
      setAskCount((count) => count + 1);
    },
    keep: () => setStep("kept"),
    clear: () => {
      setStep("offered");
      onClear();
    },
  };
}
