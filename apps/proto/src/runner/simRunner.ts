/**
 * The seam between message plumbing and the engine. Today the only
 * implementation is `MockSimRunner`; the real driver (the 12-step pipeline
 * from @hh/sim-core + observed projection) wires in behind this SAME interface
 * in a later wave — the worker, bridge, store, and renderer never learn the
 * difference (one seam, one swap point).
 */
import type { PlayerIntent } from "@hh/sim-core";
import type { SimProjection } from "../shared/protocol";

export interface SimRunner {
  /** Label for the `ready` handshake ("mock" vs "sim-core"). */
  readonly runnerId: "mock" | "sim-core";
  readonly engineVersion: string;
  /** Begin emitting projections at the protocol cadence (≤10 Hz, §7.0). */
  start(emit: (projection: SimProjection) => void): void;
  /** A clock-typed player/rule intent (goes to the input log in the real
   *  driver; the mock only honours the aggression slider + pause verb). */
  submit(intent: PlayerIntent): void;
  /** Speed gates OBSERVATION detail, never physics (§4.1) — the mock treats
   *  it as its toy-model tempo, the real driver will ignore it for the tick. */
  setSpeed(speedX: 1 | 2 | 4): void;
  /** Advance exactly one macro-tick and return the fresh projection — the
   *  loop calls it on its cadence, tests and the fake worker call it by hand
   *  (one seam for both drivers, and a determinism gift for replay tests). */
  headlessStep(dtRealMs: number): SimProjection;
  stop(): void;
}
