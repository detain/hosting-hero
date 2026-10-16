import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Deterministic in-process relay tests only — no timing, no network.
    testTimeout: 60_000,
  },
});
