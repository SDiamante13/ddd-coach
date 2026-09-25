import { MAX_MESSAGE_CHARS } from "../shared/chatContract.ts";
import { draftLimit, formatCount } from "./draftLimit.ts";

const KEY_HINT = "Enter sends · Shift+Enter adds a line";

type DraftFootProps = { length: number; keyHint: boolean; hintId: string; limitId: string };

export function DraftFoot({ length, keyHint, hintId, limitId }: DraftFootProps) {
  return (
    <div className="formfoot">
      {keyHint && (
        <span id={hintId} className="keyhint">
          {KEY_HINT}
        </span>
      )}
      <DraftCount length={length} />
      <span id={limitId} className="visually-hidden">
        Up to {formatCount(MAX_MESSAGE_CHARS)} characters.
      </span>
    </div>
  );
}

function DraftCount({ length }: { length: number }) {
  const limit = draftLimit(length, MAX_MESSAGE_CHARS);
  if (limit === "ok") return null;
  return (
    <span className={`count ${limit}`}>
      {formatCount(length)} / {formatCount(MAX_MESSAGE_CHARS)} characters
    </span>
  );
}
