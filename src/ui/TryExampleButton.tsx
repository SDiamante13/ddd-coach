export function TryExampleButton({ onTry }: { onTry: () => void }) {
  return (
    <button type="button" className="example" onClick={onTry}>
      Try an example thread
    </button>
  );
}
