import { useEffect, useState } from "react";

export function useShownFor(key: unknown, ms: number): boolean {
  const [doneFor, setDoneFor] = useState<unknown>(undefined);
  useEffect(() => {
    const timer = setTimeout(() => setDoneFor(key), ms);
    return () => clearTimeout(timer);
  }, [key]);
  return doneFor !== key;
}
