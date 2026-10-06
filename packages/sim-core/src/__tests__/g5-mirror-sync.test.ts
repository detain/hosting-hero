/**
 * G5 SYNC LAW — machine guard for the quarter.ts mirror pair.
 *
 * `src/__tests__/g5-quarter-fixture.ts` is a TEST FIXTURE MIRROR of
 * `apps/proto/src/gates/g5/quarter.ts` (both sides owned by the GATE-G5 lane;
 * the mirror exists because sim-core's rootDir forbids the cross-package
 * import — TS6059). Until the round-3 review the byte-identity was TRUE but
 * enforced only by the header comment. This file enforces it: any edit to
 * either side without the matching re-copy turns CI red.
 *
 * Style note: follows the established sim-core cross-lane fs pattern
 * (gate-g6.test.ts / gate-g2.test.ts — `node:fs` + `process.cwd()` resolved
 * from packages/sim-core; ambient stubs live in loader//waves/ __tests__).
 */

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const FIXTURE = join(process.cwd(), "src", "__tests__", "g5-quarter-fixture.ts");
const UPSTREAM = join(process.cwd(), "..", "..", "apps", "proto", "src", "gates", "g5", "quarter.ts");

/** The TEST FIXTURE MIRROR frame: 13 block lines + 1 blank separator. */
const HEADER_LINES = 14;

function read(label: string, path: string): string {
  if (!existsSync(path)) {
    throw new Error(`g5-mirror-sync: ${label} not found at ${path} — run from packages/sim-core`);
  }
  return readFileSync(path, "utf8");
}

describe("G5 mirror — SYNC LAW machine-enforced (fixture ≡ apps/proto quarter.ts)", () => {
  it("the pinned TEST FIXTURE MIRROR header is intact and exactly 14 lines", () => {
    const lines = read("fixture", FIXTURE).split("\n");
    const frame = lines.slice(0, HEADER_LINES - 1).join("\n");
    expect(lines[0]).toBe("/**");
    expect(frame).toContain("TEST FIXTURE MIRROR");
    expect(frame).toContain("SYNC LAW");
    expect(lines[HEADER_LINES - 1]).toBe(""); // blank separator
    expect(lines[HEADER_LINES]).toBe("/**"); // the upstream docblock starts here
  });

  it("everything below the header is BYTE-IDENTICAL to upstream quarter.ts", () => {
    const below = read("fixture", FIXTURE).split("\n").slice(HEADER_LINES).join("\n");
    expect(below).toBe(read("upstream", UPSTREAM));
  });

  it("line-count arithmetic holds (the fixture is upstream + exactly the pinned header)", () => {
    const fixtureLines = read("fixture", FIXTURE).split("\n").length;
    const upstreamLines = read("upstream", UPSTREAM).split("\n").length;
    // If this ever fails, the SYNC LAW was violated: edit quarter.ts upstream
    // FIRST, then re-copy everything below the 14-line header onto the fixture.
    expect(fixtureLines - upstreamLines).toBe(HEADER_LINES);
  });
});
