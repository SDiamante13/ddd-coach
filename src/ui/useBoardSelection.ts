import { useEffect, useState } from "react";
import type { EntityId } from "../domain/entityId.ts";

export function useBoardSelection() {
  const [selected, setSelected] = useState<EntityId | null>(null);
  useEffect(() => {
    if (selected === null) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setSelected(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);
  const toggle = (id: EntityId) => setSelected((current) => (current === id ? null : id));
  return { selected, toggle };
}
