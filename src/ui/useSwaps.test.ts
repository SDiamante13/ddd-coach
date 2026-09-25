import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSwaps } from "./useSwaps.ts";

const KEY = "ddd-coach.swaps.v1";
const blocked = () => {
  throw new DOMException("The operation is insecure.", "SecurityError");
};

afterEach(() => vi.restoreAllMocks());

describe("useSwaps", () => {
  it("keeps an added swap in this browser", () => {
    const { result } = renderHook(() => useSwaps());

    act(() => {
      result.current.add("Acme", "Customer A");
    });

    expect(JSON.parse(localStorage.getItem(KEY) ?? "null")).toEqual([{ from: "Acme", to: "Customer A" }]);
  });

  it("starts from the swaps kept in this browser", () => {
    localStorage.setItem(KEY, JSON.stringify([{ from: "Acme", to: "Customer A" }]));

    const { result } = renderHook(() => useSwaps());

    expect(result.current.swaps).toEqual([{ from: "Acme", to: "Customer A" }]);
  });

  it("starts empty when the kept swaps are not JSON", () => {
    localStorage.setItem(KEY, "{not json");

    const { result } = renderHook(() => useSwaps());

    expect(result.current.swaps).toEqual([]);
  });

  it.each([
    ["an object", { from: "Acme", to: "Customer A" }],
    ["a list with a number", [{ from: "Acme", to: 1 }]],
    ["a list with null", [null]],
  ])("starts empty when the kept swaps are %s", (_, kept) => {
    localStorage.setItem(KEY, JSON.stringify(kept));

    const { result } = renderHook(() => useSwaps());

    expect(result.current.swaps).toEqual([]);
  });

  it("keeps swaps for this visit when the browser refuses to store them", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    const { result } = renderHook(() => useSwaps());

    act(() => {
      result.current.add("Acme", "Customer A");
    });

    expect(result.current.swaps).toEqual([{ from: "Acme", to: "Customer A" }]);
  });

  it("starts empty when the browser refuses to read stored swaps", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);

    const { result } = renderHook(() => useSwaps());

    expect(result.current.swaps).toEqual([]);
  });

  it("drops kept swaps that would be refused on add", () => {
    const kept = [
      { from: "", to: "Customer A" },
      { from: "A", to: "Customer A" },
      { from: " Acme ", to: "Customer A" },
      { from: "acme", to: "Customer B" },
    ];
    localStorage.setItem(KEY, JSON.stringify(kept));

    const { result } = renderHook(() => useSwaps());

    expect(result.current.swaps).toEqual([{ from: "acme", to: "Customer B" }]);
  });
});
