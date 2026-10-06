/**
 * SWAP POINT #2 — the single slot-composition adapter (see README §Adapter).
 *
 * `createSlots(seed)` is the ONLY way the CLI, harness, bench and tests get a
 * PipelineSlots composition. Today it returns the STUB world (stub-slots.ts).
 * When the real modules land (pipeline/defaults.ts#createDefaultSlots with
 * economy/ + policy/ + observed/ steps), this file changes to:
 *
 *   import { createDefaultSlots } from "./sim-core.ts"; // once subpath-exported
 *   export function createSlots(cfg: AdapterConfig): PipelineSlots {
 *     return createDefaultSlots(cfg.sheet);             // + policy/economy wiring
 *   }
 *
 * …and NOTHING else in tools/headless moves. The parity harness then
 * automatically certifies the real composition across both runtimes.
 *
 * Contract the adapter must always preserve:
 *  - pure construction (no I/O, no timers, no platform access);
 *  - deterministic given (config, seed) — same input → same behavior;
 *  - full PipelineSlots (all 13 keys, types.ts).
 */

import type { PipelineSlots } from "./sim-core.ts";
import { createStubSlots, stubConfigFromBundle, type StubSlotsConfig } from "./stub-slots.ts";

export interface AdapterConfig {
  readonly bundleId: string;
  /** Bundle-parsed overrides merged onto the canonical stub config. */
  readonly patienceUs?: bigint;
  readonly unitTerm?: string;
  readonly baselineRatePerMin?: import("./sim-core.ts").Fixed;
}

export type CompositionFlavor = "stub-v1";

/** Current flavor — flip to "default-v1" here when real modules land. */
export const ACTIVE_COMPOSITION: CompositionFlavor = "stub-v1";

export function createSlots(config: AdapterConfig): { readonly slots: PipelineSlots; readonly flavor: CompositionFlavor } {
  const overrides = {
    ...(config.patienceUs === undefined ? {} : { patienceUs: config.patienceUs }),
    ...(config.unitTerm === undefined ? {} : { unitTerm: config.unitTerm }),
    ...(config.baselineRatePerMin === undefined ? {} : { baselineRatePerMin: config.baselineRatePerMin }),
  };
  const stubConfig: StubSlotsConfig = stubConfigFromBundle(overrides);
  void config.bundleId; // real composition will hash-pin sheets per bundle
  return { slots: createStubSlots(stubConfig), flavor: ACTIVE_COMPOSITION };
}

/** Re-export so tests can build a bare stub without the adapter surface. */
export { createStubSlots };
