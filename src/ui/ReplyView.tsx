import { parseReply, type ReplyBlock } from "../domain/replyBlocks.ts";
import type { SwappedText } from "../domain/swaps.ts";
import { CUT_SHORT_NOTE } from "../shared/chatContract.ts";
import { GLOSSARY_ENABLED } from "../shared/features.ts";
import { UNSOURCED } from "../shared/replyLayout.ts";
import { EventsOnBoard } from "./EventsOnBoard.tsx";
import { QuestionCard } from "./QuestionCard.tsx";
import { KeepButton } from "./KeepButton.tsx";
import { RfcCopyButton } from "./RfcCopyButton.tsx";
import type { KeepReply } from "./useGlossary.ts";
import { WordTable } from "./WordTable.tsx";

export type RestoreNames = (text: string) => SwappedText;

export const RESTORED_NOTE = "Names restored in this browser from your swaps.";

export function ReplyView({ reply, restoreNames, onKeep }: { reply: string; restoreNames: RestoreNames; onKeep: KeepReply }) {
  const restored = restoreNames(reply);
  const blocks = displayOrder(parseReply(restored.text));
  return (
    <div className="reply">
      {blocks.map((block, index) => (
        <ReplyPart key={index} block={block} />
      ))}
      {restored.spans.length > 0 && <p className="restored-note">{RESTORED_NOTE}</p>}
      {blocks.some(isAnalysis) && <RfcCopyButton blocks={blocks} />}
      {GLOSSARY_ENABLED && blocks.some((block) => block.kind === "words") && <KeepButton reply={reply} onKeep={onKeep} />}
    </div>
  );
}

const LAST_KINDS: readonly ReplyBlock["kind"][] = ["citation", "unsourced", "question", "cut"];

const isAnalysis = (block: ReplyBlock): boolean => block.kind === "words" || block.kind === "question";

function displayOrder(blocks: ReplyBlock[]): ReplyBlock[] {
  const lastOf = (kind: ReplyBlock["kind"]) => blocks.filter((block) => block.kind === kind);
  return [...blocks.filter((block) => !LAST_KINDS.includes(block.kind)), ...LAST_KINDS.flatMap(lastOf)];
}

function ReplyPart({ block }: { block: ReplyBlock }) {
  switch (block.kind) {
    case "events":
      return <EventsOnBoard count={block.items.length} />;
    case "words":
      return <WordTable rows={block.rows} />;
    case "question":
      return <QuestionCard roles={block.roles} text={block.text} sources={block.sources} />;
    case "cut":
      return (
        <p className="cut-note" role="note">
          {CUT_SHORT_NOTE}
        </p>
      );
    case "citation":
      return <Citation title={block.title} />;
    case "unsourced":
      return <p className="citation">{UNSOURCED}</p>;
    case "text":
      return <p>{block.text}</p>;
  }
}

function Citation({ title }: { title: string }) {
  return (
    <p className="citation">
      <span className="citation-label">Source</span> <cite>Evans, Domain-Driven Design Reference (2015), "{title}"</cite>
    </p>
  );
}
