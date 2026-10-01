import { describe, expect, it } from "vitest";
import { fittedViewport } from "./boardLayout.ts";

const LIMITS = { min: 0.5, max: 1.5 };

describe("fittedViewport", () => {
  it("top-aligns at the zoom floor, centred across, when the board is too tall to fit", () => {
    expect(fittedViewport({ x: 0, y: 0, width: 940, height: 540 }, { width: 600, height: 250 }, LIMITS)).toEqual({ x: 65, y: 16, zoom: 0.5 });
  });

  it("centres a board that fits, at the zoom that fits it", () => {
    expect(fittedViewport({ x: 0, y: 0, width: 568, height: 184 }, { width: 600, height: 400 }, LIMITS)).toEqual({ x: 16, y: 108, zoom: 1 });
  });

  it("starts at the left edge when even the floor can't fit the board across", () => {
    expect(fittedViewport({ x: 100, y: 0, width: 2000, height: 100 }, { width: 600, height: 400 }, LIMITS)).toMatchObject({ x: -34, zoom: 0.5 });
  });
});
