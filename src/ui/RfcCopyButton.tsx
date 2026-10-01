import type { ReplyBlock } from "../domain/replyBlocks.ts";
import { copiedMessage, guessRows, rfcDocument, type RowFacts, toHtml, toMarkdown } from "../domain/rfcExport.ts";
import { CopyButton } from "./CopyButton.tsx";
import { copyRich } from "./copyRich.ts";

export function RfcCopyButton({ blocks, facts }: { blocks: ReplyBlock[]; facts: RowFacts }) {
  const copy = async () => {
    const document = rfcDocument(blocks, facts);
    const asOf = new Date();
    await copyRich(toHtml(document, asOf), toMarkdown(document, asOf));
    return copiedMessage(guessRows(document));
  };
  return <CopyButton label="Copy for your RFC" name="rfc" copy={copy} />;
}
