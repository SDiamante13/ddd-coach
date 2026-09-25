import { useState } from "react";

export type ClearStep = "offered" | "confirming" | "kept";

export type ClearConfirmation = {
  step: ClearStep;
  ask: () => void;
  keep: () => void;
  clear: () => void;
};

export function useClearConfirmation(onClear: () => void): ClearConfirmation {
  const [step, setStep] = useState<ClearStep>("offered");

  return {
    step,
    ask: () => setStep("confirming"),
    keep: () => setStep("kept"),
    clear: () => {
      setStep("offered");
      onClear();
    },
  };
}
