import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  worker: {
    format: "es",
  },
  appType: "spa",
  test: {
    // Default environment: node — every headless test (budget gate, promotion,
    // instrument binding, protocol round-trip, screen-space math) is pure TS.
    // Component-mount files opt into jsdom per-file via @vitest-environment.
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
  },
});
