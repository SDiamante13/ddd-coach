import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { giveMouseEventsAView, mockReactFlowLayout } from "./reactFlowMocks.ts";

afterEach(() => {
  cleanup();
  if (typeof window !== "undefined") window.localStorage.clear();
});

if (typeof Element !== "undefined") Element.prototype.scrollIntoView ??= function scrollIntoView() {};

if (typeof window !== "undefined") mockReactFlowLayout();

let restoreDefineProperty = () => {};
beforeAll(() => {
  if (typeof window !== "undefined") restoreDefineProperty = giveMouseEventsAView();
});
afterAll(() => restoreDefineProperty());
