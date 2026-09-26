import { useState } from "react";
import type { KeepReply } from "./useGlossary.ts";

export function KeepButton({ reply, onKeep }: { reply: string; onKeep: KeepReply }) {
  const [status, setStatus] = useState("");
  return (
    <>
      <button type="button" className="copy keep" onClick={() => setStatus(onKeep(reply))}>
        Keep these words
      </button>
      <span role="status" className="keep-status">
        {status}
      </span>
    </>
  );
}
