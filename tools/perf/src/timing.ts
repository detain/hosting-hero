/** Timing statistics + machine telemetry for the bench CLIs.
 *  LAW (README §Contention): this box and CI runners are SHARED. A single
 *  sample is never a number — every reported figure is best-of-N or median,
 *  and env meta carries the load average so readers can sanity-check the run. */

import { cpus, loadavg, totalmem } from "node:os";

export function hrMs(start: bigint, end: bigint): number {
  return Number(end - start) / 1e6;
}

export interface RunStats {
  readonly meanMs: number;
  readonly medianMs: number;
  readonly minMs: number;
  readonly maxMs: number;
}

/** samples must be >0 entries; atomic + predictable, no mutation. */
export function statsOf(samples: readonly number[]): RunStats {
  if (samples.length === 0) throw new Error("statsOf: no samples");
  const sorted = [...samples].sort((a, b) => a - b);
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 1 ? (sorted[mid] as number) : ((sorted[mid - 1] as number) + (sorted[mid] as number)) / 2;
  return { meanMs: mean, medianMs: median, minMs: sorted[0] as number, maxMs: sorted[sorted.length - 1] as number };
}

export interface EnvMeta {
  readonly node: string;
  readonly platform: string;
  readonly arch: string;
  readonly cpuCount: number;
  readonly totalMemMb: number;
  readonly loadAvg1: number;
  readonly measuredAt: string;
}

/** Snapshot the machine state at run start — the contention fingerprint. */
export function envMeta(): EnvMeta {
  const [load1 = 0] = loadavg();
  return {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    cpuCount: cpus().length,
    totalMemMb: Math.round(totalmem() / 1048576),
    loadAvg1: Math.round(load1 * 100) / 100,
    measuredAt: new Date().toISOString(),
  };
}
