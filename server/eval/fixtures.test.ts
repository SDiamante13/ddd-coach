// @vitest-environment node
import { describe, expect, it } from "vitest";
import { EXAMPLE_THREAD } from "../../src/shared/exampleThread.ts";
import { loadFixture } from "./fixtures.ts";

describe("eval fixtures", () => {
  it("check the example thread visitors can try, from its one shared source", () => {
    expect(loadFixture("example-thread").thread).toBe(EXAMPLE_THREAD);
  });
});
