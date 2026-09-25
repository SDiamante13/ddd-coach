export function NewReplyButton({ onReveal }: { onReveal: () => void }) {
  return (
    <button type="button" className="new-reply" onClick={onReveal}>
      New reply ↓
    </button>
  );
}
