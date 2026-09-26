import { useRef } from "react";
import type { LatestQuestion } from "../domain/latestQuestion.ts";
import { usePinnedReserve } from "./usePinnedReserve.ts";
import { QuestionCard } from "./QuestionCard.tsx";

export const PINNED_QUESTION_ID = "current-question";

export function PinnedQuestion({ question }: { question: LatestQuestion | null }) {
  const ref = useRef<HTMLElement>(null);
  usePinnedReserve(ref, question !== null);
  if (question === null) return null;
  return (
    <aside ref={ref} id={PINNED_QUESTION_ID} className="pinned-question" aria-label="Current question" tabIndex={-1}>
      <QuestionCard roles={question.roles} text={question.text} sources={question.sources} />
    </aside>
  );
}

export function PinnedAboveChip() {
  const focusPinned = () => document.getElementById(PINNED_QUESTION_ID)?.focus();
  return (
    <button type="button" className="board-chip" onClick={focusPinned}>
      ↑ pinned above
    </button>
  );
}
