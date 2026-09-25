import type { ReactNode } from "react";
import { MAX_MESSAGE_CHARS } from "../shared/chatContract.ts";
import { formatCount, type DraftLimit } from "./draftLimit.ts";

const KEY_HINT = "Enter sends · Shift+Enter adds a line";

type DraftFootProps = {
  length: number;
  limit: DraftLimit;
  keyHint: boolean;
  hintId: string;
  limitId: string;
  children?: ReactNode;
};

export function DraftFoot({ length, limit, keyHint, hintId, limitId, children }: DraftFootProps) {
  return (
    <>
      {limit === "over" && <OverLimitAlert length={length} />}
      <div className="formfoot">
        {children}
        {keyHint && (
          <span id={hintId} className="keyhint">
            {KEY_HINT}
          </span>
        )}
        {limit !== "ok" && <DraftCount length={length} limit={limit} />}
        <span id={limitId} className="visually-hidden">
          Up to {formatCount(MAX_MESSAGE_CHARS)} characters.
        </span>
      </div>
    </>
  );
}

function OverLimitAlert({ length }: { length: number }) {
  return (
    <p role="alert" className="overbox">
      {charactersOf(length - MAX_MESSAGE_CHARS)} over the {formatCount(MAX_MESSAGE_CHARS)} limit. Your text stays
      here. Trim it to send.
    </p>
  );
}

function charactersOf(count: number): string {
  return `${formatCount(count)} ${count === 1 ? "character" : "characters"}`;
}

function DraftCount({ length, limit }: { length: number; limit: DraftLimit }) {
  return (
    <span className={`count ${limit}`}>
      {formatCount(length)} / {formatCount(MAX_MESSAGE_CHARS)} characters
    </span>
  );
}
