import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Smoke tests spawn plain-Node CLIs (--experimental-transform-types);
    // NO long benches run here — only --help / --dry-run surfaces.
    testTimeout: 120_000,
    hookTimeout: 30_000,
  },
});
