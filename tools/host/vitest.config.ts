import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    // Loopback WebSocket carrier tests: real sockets, awaited deliveries,
    // serial run (--no-file-parallelism via the package script) — timers
    // exist only in the settle helpers and the manual-mode tick proof,
    // never inside a frame law. See test/wsConformance.test.ts header.
    testTimeout: 60_000,
  },
});
