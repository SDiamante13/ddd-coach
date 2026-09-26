import { useState } from "react";
import { isoDay } from "../domain/dates.ts";
import { keep, keepMessage, keptRowsOf, removeRow, sourceLabelOf, type Glossary } from "../domain/glossary.ts";
import type { EntityId } from "../domain/entityId.ts";
import { parseReply } from "../domain/replyBlocks.ts";
import { keepGlossary, keptGlossary } from "./glossaryStore.ts";

export type KeepReply = (reply: string) => string;

export function useGlossary() {
  const [rows, setState] = useState<Glossary>(keptGlossary);
  const setRows = (next: Glossary) => {
    setState(next);
    keepGlossary(next);
  };

  const keepReply: KeepReply = (reply) => {
    const blocks = parseReply(reply);
    const today = new Date();
    const from = sourceLabelOf(blocks.find((block) => block.kind === "question")?.text, today);
    const result = keep(rows, keptRowsOf(blocks, isoDay(today), from));
    if (result.ok) setRows(result.glossary);
    return keepMessage(result, from);
  };

  const remove = (id: EntityId) => setRows(removeRow(rows, id));

  return { rows, keepReply, remove, clear: () => setRows([]) };
}
