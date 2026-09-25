import { useId, useRef, useState, type FormEvent, type RefObject } from "react";
import type { Unlock } from "./useAccess.ts";

export function AccessGate({ onUnlock }: { onUnlock: Unlock }) {
  const id = useId();
  const [password, setPassword] = useState("");
  const fieldRef = useRef<HTMLInputElement>(null);
  const { pending, error, submit } = useUnlockAttempt(onUnlock, fieldRef);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void submit(password);
  }

  return (
    <form className="gate" onSubmit={handleSubmit}>
      <label htmlFor={`${id}-password`}>Conference password</label>
      <div className="row">
        <PasswordField id={id} fieldRef={fieldRef} value={password} onChange={setPassword} error={error} />
        <button type="submit" disabled={pending}>
          {pending ? "Checking…" : "Enter"}
        </button>
      </div>
      {error !== null && (
        <p role="alert" id={`${id}-error`}>
          {error}
        </p>
      )}
    </form>
  );
}

function useUnlockAttempt(onUnlock: Unlock, fieldRef: RefObject<HTMLInputElement | null>) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(password: string) {
    setPending(true);
    const result = await onUnlock(password);
    if (result.ok) return;
    setPending(false);
    setError(result.error);
    fieldRef.current?.focus();
  }

  return { pending, error, submit };
}

type PasswordFieldProps = {
  id: string;
  fieldRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  error: string | null;
};

function PasswordField({ id, fieldRef, value, onChange, error }: PasswordFieldProps) {
  const invalid = error !== null;
  return (
    <input
      ref={fieldRef}
      id={`${id}-password`}
      type="password"
      name="password"
      autoComplete="current-password"
      required
      autoFocus
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
    />
  );
}
