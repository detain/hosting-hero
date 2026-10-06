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
 * speed 1/2/4 + incident flips, full REAL-composition engine run — the
 * pipeline/defaults.ts slots since the 2026-10-06 swap — with canonical state
 * digests) must produce BYTE-IDENTICAL canonical reports across arms.
 * ×10 stability proves zero hidden runtime state.
 *
 * The stub composition stays alive as a REGRESSION arm (--flavor stub-v1):
 * its engineRun digests must remain byte-identical to the stub-era goldens
 * pinned below, proving the swap touched only the composition, never the
 * engine threading. The combined digests differ from the hh-parity-v1 era
 * because the v2 report shape stamps `slotsFlavor` onto Arm D.
 */

import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

import { PARITY_FIXTURE, parityFixtureCanonical, runParityFixture } from "../src/harness.ts";
import type { CompositionFlavor } from "../src/slots.ts";
import { canonicalize, serializeCanonical } from "../src/canonical.ts";
import type { ParityReport } from "../src/harness.ts";

const run = promisify(execFile);
const CLI = fileURLToPath(new URL("../src/cli.ts", import.meta.url));
const PKG_ROOT = fileURLToPath(new URL("..", import.meta.url));
const SEED = 7n;
const TICKS = 1_000;

/* ─────────────── pinned fixture goldens (regenerated 2026-10-06) ─────────────── */

/** real-v1 (ACTIVE_COMPOSITION) — the default arms below. */
const REAL_V1_COMBINED = "b0162ab554c4665a18892f2139d7fee8";
const REAL_V1_ENGINE_CHAIN = "3d749386b41a71dc4b388641d957070e";
const REAL_V1_ENGINE_FINAL = "0c6cf3d32180a1f3e700cb3cd9c6cc85";

/** stub-v1 — engine bytes are the FROZEN stub-era goldens (identical to the
 *  hh-parity-v1 report: chain f753121d…, final be86ce13…). The combined value
 *  differs from v1 only because the report gained slotsFlavor + the new id. */
const STUB_V1_COMBINED = "a9b4b7b81c2fbedd7d50246936a458d1";
const STUB_ERA_ENGINE_CHAIN = "f753121d4dc24e32f97eceb9628e5068";
const STUB_ERA_ENGINE_FINAL = "be86ce13375db0db370fcc7535b34785";

/** Kernel arms — untouched by the composition swap; same values in the stub
 *  and real eras (fixture runs at seed 7 / 1k ticks regardless of flavor). */
const KERNEL_ARM_DIGESTS = {
  fixedArithmetic: "2641ffc9c3d4afde9994f98e13d20bac",
  rngStreams: "249c60d7cf4b109b7d164537bb0cdbf1",
  clockScales: "41db9036fc434582cfda2bc35f74de43",
} as const;

function canonicalReport(report: ParityReport): string {
  return serializeCanonical(canonicalize(report, "$"));
}

async function nodeArmCanonical(flavor?: CompositionFlavor): Promise<string> {
  const args = [
    "--experimental-transform-types",
    CLI,
    "parity",
    "--seed",
    SEED.toString(),
    "--ticks",
    String(TICKS),
  ];
  if (flavor !== undefined) args.push("--flavor", flavor);
  const { stdout, stderr } = await run(process.execPath, args, {
    cwd: PKG_ROOT,
    maxBuffer: 16 * 1024 * 1024,
  });
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

  it("stub-v1 arm matches across runtimes too (regression arms are parity-gated)", async () => {
    const vitestArm = canonicalReport(runParityFixture(SEED, TICKS, "stub-v1"));
    const nodeArm = await nodeArmCanonical("stub-v1");
    expect(nodeArm).toBe(vitestArm);
  }, 180_000);

  it("real-v1 default matches the pinned 2026-10-06 goldens", () => {
    const report = runParityFixture(SEED, TICKS);
    expect(report.arms.engineRun.slotsFlavor).toBe("real-v1");
    expect(report.arms.engineRun.chainDigest).toBe(REAL_V1_ENGINE_CHAIN);
    expect(report.arms.engineRun.finalStateHash).toBe(REAL_V1_ENGINE_FINAL);
    expect(report.combined).toBe(REAL_V1_COMBINED);
  });

  it("stub-v1 regression arm preserves the frozen stub-era engine bytes", () => {
    const report = runParityFixture(SEED, TICKS, "stub-v1");
    expect(report.arms.engineRun.slotsFlavor).toBe("stub-v1");
    expect(report.arms.engineRun.chainDigest).toBe(STUB_ERA_ENGINE_CHAIN);
    expect(report.arms.engineRun.finalStateHash).toBe(STUB_ERA_ENGINE_FINAL);
    expect(report.combined).toBe(STUB_V1_COMBINED);
    // The two compositions genuinely differ — the swap is a behavior change,
    // not a relabeling (engine arms must not collide).
    expect(report.arms.engineRun.chainDigest).not.toBe(REAL_V1_ENGINE_CHAIN);
  });

  it("kernel arms are invariant under the composition swap", () => {
    for (const flavor of ["real-v1", "stub-v1"] as const) {
      const report = runParityFixture(SEED, TICKS, flavor);
      expect(report.arms.fixedArithmetic).toBe(KERNEL_ARM_DIGESTS.fixedArithmetic);
      expect(report.arms.rngStreams).toBe(KERNEL_ARM_DIGESTS.rngStreams);
      expect(report.arms.clockScales).toBe(KERNEL_ARM_DIGESTS.clockScales);
    }
  });

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
