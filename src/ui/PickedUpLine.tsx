import { useEffect, useState } from "react";
import { clockTime, shortDate } from "../domain/dates.ts";

const SHOWN_FOR_MS = 5000;

export function PickedUpLine({ savedAt }: { savedAt: string | null }) {
  const [shown, setShown] = useState(savedAt !== null);
  useEffect(() => {
    const timer = setTimeout(() => setShown(false), SHOWN_FOR_MS);
    return () => clearTimeout(timer);
  }, []);
  if (!shown || savedAt === null) return null;
  const date = new Date(savedAt);
  return <p className="picked-up">{`Picked up where you left off · ${shortDate(date)}, ${clockTime(date)}`}</p>;
}
