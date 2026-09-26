import { useEffect, useRef, useState } from "react";

const FLASH_MS = 3_000;

export function useFlashOnChange(key: string | null) {
  const previous = useRef(key);
  const [flashing, setFlashing] = useState(false);
  useEffect(() => {
    const changed = key !== null && key !== previous.current;
    previous.current = key;
    if (!changed) return;
    setFlashing(true);
    const timer = setTimeout(() => setFlashing(false), FLASH_MS);
    return () => clearTimeout(timer);
  }, [key]);
  return { flashing, stop: () => setFlashing(false) };
}
