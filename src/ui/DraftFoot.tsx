import { MAX_MESSAGE_CHARS } from "../shared/chatContract.ts";
import { formatCount } from "./draftLimit.ts";

const KEY_HINT = "Enter sends · Shift+Enter adds a line";

type DraftFootProps = { hintId: string; limitId: string };

export function DraftFoot({ hintId, limitId }: DraftFootProps) {
  return (
    <div className="formfoot">
      <span id={hintId}>{KEY_HINT}</span>
      <span id={limitId} className="visually-hidden">
        Up to {formatCount(MAX_MESSAGE_CHARS)} characters.
      </span>
    </div>
  );
}
