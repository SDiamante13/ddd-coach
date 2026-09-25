import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useComposerReserve } from "./useComposerReserve.ts";

type Report = (height: number) => void;

function stubResizeObserver(): Report[] {
  const reports: Report[] = [];
  class FakeResizeObserver {
    constructor(private readonly callback: ResizeObserverCallback) {}
    observe() {
      reports.push((height) => this.callback([{ borderBoxSize: [{ blockSize: height }] } as unknown as ResizeObserverEntry], this as unknown as ResizeObserver));
    }
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", FakeResizeObserver);
  return reports;
}

const reserve = () => document.documentElement.style.getPropertyValue("--composer-reserve");

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.style.removeProperty("--composer-reserve");
});

describe("useComposerReserve", () => {
  it("reserves the composer's measured height plus a gap", () => {
    const reports = stubResizeObserver();
    const form = document.createElement("form");

    renderHook(() => useComposerReserve(() => form));
    reports[0]!(300);

    expect(reserve()).toBe("calc(300px + var(--space-4))");
  });

  it("follows the composer as it grows or shrinks", () => {
    const reports = stubResizeObserver();
    renderHook(() => useComposerReserve(() => document.createElement("form")));

    reports[0]!(200);
    reports[0]!(460);

    expect(reserve()).toBe("calc(460px + var(--space-4))");
  });

  it("hands the reserve back to the stylesheet when the composer goes", () => {
    const reports = stubResizeObserver();
    const { unmount } = renderHook(() => useComposerReserve(() => document.createElement("form")));
    reports[0]!(300);

    unmount();

    expect(reserve()).toBe("");
  });
});
