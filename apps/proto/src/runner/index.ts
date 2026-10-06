/**
 * Runner factory — THE swap point. Today it hands back the mock; the wave that
 * wires the real 12-step driver changes exactly one line here, and the worker,
 * bridge, store, renderer and chrome all keep compiling untouched.
 */
import type { SimRunner } from "./simRunner";
import { MockSimRunner } from "./mockSimRunner";
import { SimCoreRunner } from "./simCoreRunner";

export type RunnerKind = "mock" | "sim-core";

export function createRunner(kind: RunnerKind, seed: number): SimRunner {
  if (kind === "mock") return new MockSimRunner(seed);
  // Real @hh/sim-core pipeline + observed store, behind the same protocol.
  return new SimCoreRunner({ seed });
}

export type { SimRunner } from "./simRunner";
export { MockSimRunner } from "./mockSimRunner";
export { SimCoreRunner } from "./simCoreRunner";
