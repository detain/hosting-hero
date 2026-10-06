/**
 * Perf bench — ticks/sec + kernel micro-rates vs a PROVISIONAL budget.
 *
 * PROVISIONAL BUDGET (see README §Budget): the engine (seed 7, 20k ticks,
 * PARITY_CLOCK workout, bundle weight 40 ≈ 4 units/tick) must sustain
 * ≥ 7,000 ticks/s. Re-derived from MEASUREMENT (this box, 2026-10-06, ×3 runs
 * per flavor via `bench --flavor …`):
 *   - real-v1 (createDefaultSlots composition): 9,175–11,711 t/s;
 *   - stub-v1 (frozen regression arm): 18,833–20,942 t/s — the real steps
 *     cost ≈ 2× the stub (per-unit rng forks, frozen record allocation,
 *     Map copies, observed-cell writes per hop);
 *   - the hot path remains sim-core kernel bigint work shared by both
 *     flavors plus those allocation costs — not stub sloppiness;
 *   - 7,000 is ~30 % under the measured REAL floor: low enough to pass on
 *     slower CI runners, high enough that any accidental O(n²) (e.g. per-tick
 *     full state walks that grow unbounded) trips it immediately. The old
 *     10k stub-era budget MISSED the real composition's worst sample —
 *     keeping it would have manufactured red CI, not measured a regression.
 * It is a placeholder to catch catastrophes, NOT a ratified performance
 * contract. Override with --target; select flavor with --flavor.
 *
 * Wall-clock here is measurement scaffolding OUTSIDE sim state (hrtime is
 * permitted in tooling; it never enters a digest — CONVENTIONS §4 binds the
 * engine, and this package's digests stay clean).
 */

import { clocks, fx, streams, asRunSeed } from "./sim-core.ts";
import { PARITY_CLOCK, runFromBundle } from "./engine.ts";
import { parseBundleValue, type ParsedBundle } from "./bundle.ts";
import { HARNESS_BUNDLE } from "./engine.ts";
import type { CompositionFlavor } from "./slots.ts";

export const PROVISIONAL_TARGET_TICKS_PER_SEC = 7_000;

export interface BenchResult {
  readonly seed: string;
  readonly engineTicks: number;
  readonly engineMs: number;
  readonly ticksPerSec: number;
  readonly kernel: {
    readonly fixedOps: number;
    readonly fixedOpsPerSec: number;
    readonly rngDraws: number;
    readonly rngDrawsPerSec: number;
    readonly clockAdvances: number;
    readonly clockAdvancesPerSec: number;
  };
  readonly target: { readonly ticksPerSec: number; readonly met: boolean };
}

function hrMs(start: bigint, end: bigint): number {
  return Number(end - start) / 1_000_000;
}

export function runBench(
  seedValue: bigint,
  ticks: number,
  targetTicksPerSec: number = PROVISIONAL_TARGET_TICKS_PER_SEC,
  flavor?: CompositionFlavor,
): BenchResult {
  if (!Number.isSafeInteger(ticks) || ticks < 1) throw new Error(`bench: ticks must be ≥ 1, got ${String(ticks)}`);

  const parsed: ParsedBundle = parseBundleValue(HARNESS_BUNDLE, "bench:embedded");
  // Warm-up so JIT shapes exist before timing (measurement hygiene only).
  runFromBundle(parsed, seedValue, Math.min(200, ticks), 100, PARITY_CLOCK, flavor);

  const start = process.hrtime.bigint();
  runFromBundle(parsed, seedValue, ticks, 100, PARITY_CLOCK, flavor);
  const engineMs = hrMs(start, process.hrtime.bigint());

  const seed = asRunSeed(seedValue);

  // Kernel: fixed-point chain — 40 ops per iteration.
  const fixedIterations = Math.max(100_000, ticks * 50);
  const fStart = process.hrtime.bigint();
  let sink = fx.FIXED_ONE;
  for (let i = 0; i < fixedIterations; i += 1) {
    const rho = fx.fromRatio(BigInt((i * 7919) % 900 + 1), 1_000n);
    sink = fx.add(sink, fx.mul(rho, rho));
    sink = fx.clampUnit(sink);
    // Floor the denominator at 1/10: div(1.0, ≥0.1) stays well inside Q16.16
    // range, so the bench never trips fixed.ts's fail-loud overflow guard.
    const floor = fx.fromRatio(1n, 10n);
    sink = fx.div(fx.FIXED_ONE, fx.compare(sink, floor) < 0 ? floor : sink);
  }
  const fixedMs = hrMs(fStart, process.hrtime.bigint());
  const fixedOps = BigInt(fixedIterations) * 5n;
  void sink;

  // Kernel: rng draws — 2 per iteration.
  const rngIterations = Math.max(200_000, ticks * 100);
  const rStart = process.hrtime.bigint();
  let rSink = 0;
  for (let i = 0; i < rngIterations; i += 1) {
    const stream = streams.streamFor(seed, "bench", i % 100_000);
    rSink = (rSink + stream.nextU32() + stream.range(1_000)) | 0;
  }
  const rngMs = hrMs(rStart, process.hrtime.bigint());
  void rSink;

  // Kernel: clock advances.
  const clockIterations = Math.max(200_000, ticks * 100);
  const cStart = process.hrtime.bigint();
  let state = clocks.initialClocks();
  for (let i = 0; i < clockIterations; i += 1) {
    state = clocks.advanceClocks(state, { realElapsedUs: 1_000_000n, speed: 2, incident: i % 97 === 0 });
  }
  const clockMs = hrMs(cStart, process.hrtime.bigint());
  void state;

  const rate = (work: number, ms: number): number => (ms > 0 ? work / (ms / 1_000) : Number.POSITIVE_INFINITY);

  return {
    seed: seedValue.toString(),
    engineTicks: ticks,
    engineMs,
    ticksPerSec: rate(ticks, engineMs),
    kernel: {
      fixedOps: Number(fixedOps),
      fixedOpsPerSec: rate(Number(fixedOps), fixedMs),
      rngDraws: rngIterations * 2,
      rngDrawsPerSec: rate(rngIterations * 2, rngMs),
      clockAdvances: clockIterations,
      clockAdvancesPerSec: rate(clockIterations, clockMs),
    },
    target: { ticksPerSec: targetTicksPerSec, met: rate(ticks, engineMs) >= targetTicksPerSec },
  };
}

export function formatBench(result: BenchResult): string {
  const line = (label: string, value: number): string =>
    `${label.padEnd(22)} ${formatNumber(Math.round(value)).padStart(14)}/s`;
  const status = result.target.met ? "MET" : "MISSED";
  return [
    `bench: seed=${result.seed} ticks=${String(result.engineTicks)} engine=${result.engineMs.toFixed(1)}ms`,
    line("engine ticks", result.ticksPerSec),
    line("fixed-point ops", result.kernel.fixedOpsPerSec),
    line("rng draws", result.kernel.rngDrawsPerSec),
    line("clock advances", result.kernel.clockAdvancesPerSec),
    `target: ≥ ${formatNumber(result.target.ticksPerSec)} ticks/s (PROVISIONAL, README §Budget) → ${status}`,
  ].join("\n");
}

function formatNumber(value: number): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
