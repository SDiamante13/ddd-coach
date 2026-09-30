import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { mockReactFlowLayout } from "./reactFlowMocks.ts";

afterEach(() => {
  cleanup();
  if (typeof window !== "undefined") window.localStorage.clear();
});

if (typeof Element !== "undefined") Element.prototype.scrollIntoView ??= function scrollIntoView() {};

if (typeof window !== "undefined") mockReactFlowLayout();
