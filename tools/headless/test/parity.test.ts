/**
 * DUAL-RUNTIME PARITY GATE — RISK-1 (MASTER_REPORT §3.4; docs/ARCHITECTURE.md §6).
 *
 * Arm 1 (this file, vitest/esbuild pipeline): imports harness.ts directly.
 * Arm 2 (child process, plain Node): `node --experimental-transform-types
 * src/cli.ts parity …` — V8's native type-STIPPING pipeline, a different
 * TS→JS compiler than esbuild.
 *
 * Same scripted 1k-tick fixture (fixed-point chains incl. overflow-throw
 * counts, six keyed rng domains + fork + counter re-open, clock scales under
 * speed 1/2/4 + incident flips, full stub-composition engine run with
 * canonical state digests) must produce BYTE-IDENTICAL canonical reports.
 * ×10 stability proves zero hidden runtime state.
 */

import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

import { PARITY_FIXTURE, parityFixtureCanonical, runParityFixture } from "../src/harness.ts";
import { canonicalize, serializeCanonical } from "../src/canonical.ts";
import type { ParityReport } from "../src/harness.ts";

const run = promisify(execFile);
const CLI = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const PKG_ROOT = fileURLToPath(new URL("..", import.meta.url));
const SEED = 7n;
const TICKS = 1_000;

function canonicalReport(report: ParityReport): string {
  return serializeCanonical(canonicalize(report, "$"));
}

async function nodeArmCanonical(): Promise<string> {
  const { stdout, stderr } = await run(
    process.execPath,
    ["--experimental-transform-types", CLI, "parity", "--seed", SEED.toString(), "--ticks", String(TICKS)],
    { cwd: PKG_ROOT, maxBuffer: 16 * 1024 * 1024 },
  );
  // stderr carries only the ExperimentalWarning banner — never an error.
  expect(stderr.toLowerCase()).not.toContain("error");
  const report = JSON.parse(stdout.trim()) as ParityReport;
  expect(report.fixture).toBe(PARITY_FIXTURE);
  return canonicalReport(report);
}

describe("dual-runtime parity harness", () => {
  it(`vitest arm is byte-stable across ×10 runs (ticks=${TICKS})`, () => {
    const digests = new Set<string>();
    for (let i = 0; i < 10; i += 1) {
      digests.add(parityFixtureCanonical(SEED, TICKS));
    }
    expect(digests.size).toBe(1);
    const only = [...digests][0] ?? "";
    expect(only.length).toBeGreaterThan(0);
    expect(only).toContain(PARITY_FIXTURE);
  });

  it("plain-Node arm matches the vitest arm byte-for-byte (and is itself stable ×2)", async () => {
    const vitestArm = canonicalReport(runParityFixture(SEED, TICKS));
    const nodeArm1 = await nodeArmCanonical();
    const nodeArm2 = await nodeArmCanonical();
    expect(nodeArm1).toBe(nodeArm2);
    expect(nodeArm1).toBe(vitestArm);
  }, 180_000);

  it("report internals: every arm digest is 32 lowercase hex; engine arms exercised", () => {
    const report = runParityFixture(SEED, TICKS);
    const hex32 = /^[0-9a-f]{32}$/;
    expect(report.arms.fixedArithmetic).toMatch(hex32);
    expect(report.arms.rngStreams).toMatch(hex32);
    expect(report.arms.clockScales).toMatch(hex32);
    expect(report.arms.engineRun.chainDigest).toMatch(hex32);
    expect(report.arms.engineRun.finalStateHash).toMatch(hex32);
    expect(report.combined).toMatch(hex32);
    expect(report.arms.engineRun.checkpointCount).toBe(Math.floor(TICKS / 100));
    expect(report.arms.engineRun.chainDigest).not.toBe("0".repeat(32));
  });

  it("different seeds diverge (fixture is seed-sensitive, not a constant)", () => {
    expect(runParityFixture(1n, 50).combined).not.toBe(runParityFixture(2n, 50).combined);
  });
});
