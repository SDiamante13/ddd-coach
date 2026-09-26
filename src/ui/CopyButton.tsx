import { useState } from "react";

const COPY_FAILED = "Couldn't copy. Select the reply and copy it instead.";

type CopyButtonProps = { label: string; name: string; copy: () => Promise<string> };

export function CopyButton({ label, name, copy }: CopyButtonProps) {
  const [status, setStatus] = useState("");
  const copyAndSay = async () => {
    try {
      setStatus(await copy());
    } catch {
      setStatus(COPY_FAILED);
    }
  };
  return (
    <>
      <button type="button" className={`copy ${name}-copy`} onClick={() => void copyAndSay()}>
        {label}
      </button>
      <span role="status" className={`${name}-status`}>
        {status}
      </span>
    </>
  );
}
