import type { LinkLine } from "./linkLines.ts";

export function LinkLines({ lines, onUndo }: { lines: readonly LinkLine[]; onUndo: () => void }) {
  return lines.map((line, index) => (
    <p key={index} className="correction-line">
      <span>{`You connected “${line.from}” → “${line.to}”`}</span>
      {line.undoable && (
        <button type="button" className="link-undo" onClick={onUndo}>
          Undo
        </button>
      )}
    </p>
  ));
}
