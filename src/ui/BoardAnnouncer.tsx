export function BoardAnnouncer({ message }: { message: string }) {
  return (
    <p role="status" aria-label="Board changes" className="visually-hidden">
      {message}
    </p>
  );
}
