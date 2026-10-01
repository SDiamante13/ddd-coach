import { type RefObject, useEffect, useState } from "react";

export type LaneSize = { width: number; height: number };

export function useLaneSize(root: RefObject<HTMLElement | null>): LaneSize {
  const [size, setSize] = useState<LaneSize>({ width: 0, height: 0 });
  useEffect(() => {
    const lane = root.current;
    if (lane === null) return;
    const measure = () => setSize({ width: lane.clientWidth, height: lane.clientHeight });
    const observer = new ResizeObserver(measure);
    observer.observe(lane);
    measure();
    return () => observer.disconnect();
  }, [root]);
  return size;
}
