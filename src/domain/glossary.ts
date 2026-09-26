import { entityId, type EntityId } from "./entityId.ts";
import type { ReplyBlock, Source } from "./replyBlocks.ts";

export type KeptGlossaryRow = {
  readonly word: string;
  readonly holder: string;
  readonly meaning: string;
  readonly source: Source;
  readonly keptOn: string;
  readonly from: string;
};

export type KeptRow = KeptGlossaryRow & { readonly id: EntityId; readonly termId: EntityId };
export type Glossary = readonly KeptRow[];

export function keptRowsOf(blocks: readonly ReplyBlock[], keptOn: string, from: string): KeptRow[] {
  return blocks.flatMap((block) =>
    block.kind !== "words"
      ? []
      : block.rows.flatMap(({ word, meanings }) =>
          meanings.map(({ holder, meaning, source }) => ({
            id: entityId("meaning", `${word}|${holder}`),
            termId: entityId("term", word),
            word,
            holder,
            meaning,
            source,
            keptOn,
            from,
          })),
        ),
  );
}
