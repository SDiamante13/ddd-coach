import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fixtureApi } from "./dev/fixtureApi.ts";

export default defineConfig({
  plugins: [react(), ...(process.env.COACH_FIXTURES === "1" ? [fixtureApi()] : [])],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    exclude: [...configDefaults.exclude, ".claude/**"],
    testTimeout: 15_000,
  },
});
