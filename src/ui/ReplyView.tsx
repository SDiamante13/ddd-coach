import { parseReply, type ReplyBlock } from "../domain/replyBlocks.ts";
import type { SwappedText } from "../domain/swaps.ts";
import { CUT_SHORT_NOTE } from "../shared/chatContract.ts";
import { EventList } from "./EventList.tsx";
import { QuestionCard } from "./QuestionCard.tsx";
import { WordTable } from "./WordTable.tsx";

export type RestoreNames = (text: string) => SwappedText;

export const RESTORED_NOTE = "Names restored in this browser from your swaps.";

export function ReplyView({ reply, restoreNames }: { reply: string; restoreNames: RestoreNames }) {
  const restored = restoreNames(reply);
  return (
    <div className="reply">
      {displayOrder(parseReply(restored.text)).map((block, index) => (
        <ReplyPart key={index} block={block} />
      ))}
      {restored.spans.length > 0 && <p className="restored-note">{RESTORED_NOTE}</p>}
    </div>
  );
}

const LAST_KINDS: readonly ReplyBlock["kind"][] = ["question", "cut"];

function displayOrder(blocks: ReplyBlock[]): ReplyBlock[] {
  const lastOf = (kind: ReplyBlock["kind"]) => blocks.filter((block) => block.kind === kind);
  return [...blocks.filter((block) => !LAST_KINDS.includes(block.kind)), ...LAST_KINDS.flatMap(lastOf)];
}

function ReplyPart({ block }: { block: ReplyBlock }) {
  switch (block.kind) {
    case "events":
      return <EventList items={block.items} />;
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
    case "text":
      return <p>{block.text}</p>;
  }
}
