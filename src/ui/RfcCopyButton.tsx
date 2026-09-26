import type { ReplyBlock } from "../domain/replyBlocks.ts";
import { copiedMessage, guessRows, rfcDocument, toHtml, toMarkdown } from "../domain/rfcExport.ts";
import { CopyButton } from "./CopyButton.tsx";
import { copyRich } from "./copyRich.ts";

export function RfcCopyButton({ blocks }: { blocks: ReplyBlock[] }) {
  const copy = async () => {
    const document = rfcDocument(blocks);
    const asOf = new Date();
    await copyRich(toHtml(document, asOf), toMarkdown(document, asOf));
    return copiedMessage(guessRows(document));
  };
  return <CopyButton label="Copy for your RFC" name="rfc" copy={copy} />;
}
