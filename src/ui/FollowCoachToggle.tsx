export function FollowCoachToggle({ following, onChange }: { following: boolean; onChange: (following: boolean) => void }) {
  return (
    <div className="board-controls">
      <button type="button" className="follow-coach" aria-pressed={following} onClick={() => onChange(!following)}>
        Follow coach
      </button>
    </div>
  );
}
