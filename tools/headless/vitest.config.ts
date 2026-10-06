import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Parity spawns plain-Node arms; give child_process room.
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
  server: {
    fs: {
      // sim-core sources live two levels above this package root.
      allow: ["../.."],
    },
  },
});
