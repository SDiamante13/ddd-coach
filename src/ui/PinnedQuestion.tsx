import { useRef, useState } from "react";
import type { LatestQuestion } from "../domain/latestQuestion.ts";
import { useFlashOnChange } from "./useFlashOnChange.ts";
import { usePinnedReserve } from "./usePinnedReserve.ts";
import { useQuestionLead } from "./useQuestionLead.ts";
import { QuestionCard } from "./QuestionCard.tsx";

export const PINNED_QUESTION_ID = "current-question";

export type QuestionOnBoard = { linked: number; reveal: () => void };

export function PinnedQuestion({ question, onBoard = null }: { question: LatestQuestion | null; onBoard?: QuestionOnBoard | null }) {
  const ref = useRef<HTMLElement>(null);
  const [opened, setOpened] = useState(false);
  const flash = useFlashOnChange(question?.exchangeId ?? null);
  const expanded = opened || flash.flashing;
  const toggle = () => {
    setOpened(!expanded);
    flash.stop();
  };
  usePinnedReserve(ref, question !== null);
  useQuestionLead(ref, expanded, question?.exchangeId ?? null);
  if (question === null) return null;
  return (
    <aside ref={ref} id={PINNED_QUESTION_ID} className="pinned-question" aria-label="Current question" tabIndex={-1} data-expanded={expanded || undefined}>
      <QuestionStrip question={question} expanded={expanded} onToggle={toggle} />
      <QuestionCard roles={question.roles} text={question.text} sources={question.sources} />
      {onBoard && <OnTheBoardChip {...onBoard} />}
    </aside>
  );
}

type QuestionStripProps = { question: LatestQuestion; expanded: boolean; onToggle: () => void };

function QuestionStrip({ question, expanded, onToggle }: QuestionStripProps) {
  return (
    <div className="question-strip">
      <p className="question-strip-roles">Question · {question.roles}</p>
      <p className="question-strip-text">{question.text}</p>
      <button type="button" className="question-strip-toggle" aria-label="Whole question" aria-expanded={expanded} onClick={onToggle}>
        ▾
      </button>
    </div>
  );
}

function OnTheBoardChip({ linked, reveal }: QuestionOnBoard) {
  const events = linked === 0 ? "" : ` linked to ${linked} event${linked === 1 ? "" : "s"}`;
  return (
    <button type="button" className="board-chip on-the-board" onClick={reveal}>
      {`On the board ↖${events}`}
    </button>
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
