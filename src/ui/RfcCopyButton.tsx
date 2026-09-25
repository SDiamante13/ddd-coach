import { useState } from "react";
import type { ReplyBlock } from "../domain/replyBlocks.ts";
import { copiedMessage, guessRows, rfcDocument, toHtml, toMarkdown } from "../domain/rfcExport.ts";
import { copyRich } from "./copyRich.ts";

const COPY_FAILED = "Couldn't copy. Select the reply and copy it instead.";

export function RfcCopyButton({ blocks }: { blocks: ReplyBlock[] }) {
  const [status, setStatus] = useState("");
  const copy = async () => {
    const document = rfcDocument(blocks);
    const asOf = new Date();
    try {
      await copyRich(toHtml(document, asOf), toMarkdown(document, asOf));
      setStatus(copiedMessage(guessRows(document)));
    } catch {
      setStatus(COPY_FAILED);
    }
  };
  return (
    <>
      <button type="button" className="copy rfc-copy" onClick={() => void copy()}>
        Copy for your RFC
      </button>
      <span role="status" className="rfc-status">
        {status}
      </span>
    </>
  );
}
