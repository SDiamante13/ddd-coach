export const ACCESS_UNREACHABLE = "Can't reach the coach. Check your connection, then try again.";

export function AccessUnreachable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="unreachable">
      <p role="alert">{ACCESS_UNREACHABLE}</p>
      <button type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
