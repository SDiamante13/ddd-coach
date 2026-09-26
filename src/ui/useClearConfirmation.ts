import { useState } from "react";

export type ClearStep = "offered" | "confirming" | "kept";

export type ClearConfirmation = {
  step: ClearStep;
  askCount: number;
  ask: () => void;
  keep: () => void;
  clear: (startWith?: string) => void;
};

export function useClearConfirmation(onClear: (startWith?: string) => void): ClearConfirmation {
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
    clear: (startWith) => {
      setStep("offered");
      onClear(startWith);
    },
  };
}
