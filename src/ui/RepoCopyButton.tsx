import type { ReplyBlock } from "../domain/replyBlocks.ts";
import { repoCopiedMessage, repoMarkdown } from "../domain/repoExport.ts";
import { replyGlossary, unsettledTerms } from "../domain/repoGlossary.ts";
import { rfcDocument, type RowFacts } from "../domain/rfcExport.ts";
import { CopyButton } from "./CopyButton.tsx";

export function RepoCopyButton({ blocks, facts }: { blocks: ReplyBlock[]; facts: RowFacts }) {
  const copy = async () => {
    const glossary = replyGlossary(rfcDocument(blocks, facts));
    await navigator.clipboard.writeText(repoMarkdown(glossary, new Date()));
    return repoCopiedMessage(unsettledTerms(glossary));
  };
  return <CopyButton label="Copy for your repo" name="repo" copy={copy} />;
}
