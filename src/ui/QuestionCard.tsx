import type { ReactNode } from "react";

type QuestionCardProps = { roles: string; text: string; sources: string[]; action?: ReactNode; lines?: ReactNode };

export function QuestionCard({ roles, text, sources, action, lines }: QuestionCardProps) {
  return (
    <section className="question-card" aria-label="Question">
      <p className="question-for">Question for {roles}</p>
      <p className="question-text">{text}</p>
      {action && <div className="question-action">{action}</div>}
      {sources.length > 0 && (
        <ul className="question-sources" aria-label="The thread lines it joins">
          {sources.map((source, index) => (
            <li key={index}>“{source}”</li>
          ))}
        </ul>
      )}
      {lines}
    </section>
  );
}
