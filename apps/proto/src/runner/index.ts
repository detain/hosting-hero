/**
 * Runner factory — THE swap point. Today it hands back the mock; the wave that
 * wires the real 12-step driver changes exactly one line here, and the worker,
 * bridge, store, renderer and chrome all keep compiling untouched.
 */
import type { SimRunner } from "./simRunner";
import { MockSimRunner } from "./mockSimRunner";
import { SimCoreRunner, type CorpusDriveOptions } from "./simCoreRunner";

export type RunnerKind = "mock" | "sim-core";

/** `corpus` (WORKER-CORPUS leg @shared/corpusHost): forwarded verbatim into
 *  SimCoreRunner's public drive-mode option; ABSENT ⇒ the plain runner,
 *  byte-ident. Asking the MOCK to cite a wave table it does not consult is a
 *  wiring bug — refuse loud (both worker hosts surface this as a boot fault),
 *  never boot a mock that pretends the citation exists. */
export function createRunner(kind: RunnerKind, seed: number, corpus?: CorpusDriveOptions): SimRunner {
  if (kind === "mock") {
    if (corpus !== undefined) {
      throw new Error('createRunner: corpus citation requires runnerKind "sim-core"');
    }
    return new MockSimRunner(seed);
  }
  // Real @hh/sim-core pipeline + observed store, behind the same protocol.
  return new SimCoreRunner({ seed, ...(corpus === undefined ? {} : { corpus }) });
}

export type { SimRunner } from "./simRunner";
export { MockSimRunner } from "./mockSimRunner";
export { SimCoreRunner } from "./simCoreRunner";
