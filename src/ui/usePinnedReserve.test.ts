import { describe, expect, it } from "vitest";
import { reservedHeight } from "./usePinnedReserve.ts";

const cardOf = (height: number) => ({ getBoundingClientRect: () => ({ height }) }) as unknown as Element;

describe("reservedHeight", () => {
  it("takes the border-box height a ResizeObserver reports", () => {
    const entry = { borderBoxSize: [{ blockSize: 184.6 }], target: cardOf(999) } as unknown as ResizeObserverEntry;

    expect(reservedHeight(entry)).toBe(184.6);
  });

  it("measures the card itself when an older browser reports no border-box size, never falling to 0", () => {
    const entry = { target: cardOf(231) } as unknown as ResizeObserverEntry;

    expect(reservedHeight(entry)).toBe(231);
  });
});
