/**
 * SWAP POINT #2 — the single slot-composition adapter (see README §Adapter).
 *
 * `createSlots(cfg)` is the ONLY way the CLI, harness, bench and tests get a
 * PipelineSlots composition. STATUS 2026-10-06: the real modules landed
 * (pipeline/defaults.ts#createDefaultSlots), so ACTIVE_COMPOSITION flipped to
 * "real-v1". The stub stays selectable — pass `{ flavor: "stub-v1" }` (or CLI
 * `--flavor stub-v1`) for regression comparison against the pinned stub-era
 * goldens (test/parity.test.ts, test/cli.test.ts).
 *
 * Composition contract (unchanged by the flip):
 *  - pure construction (no I/O, no timers, no platform access);
 *  - deterministic given (config, seed) — same input → same behavior;
 *  - full PipelineSlots (all 13 keys, types.ts).
 *
 * What the real flavor adds over the raw createDefaultSlots bundle — and why
 * it still belongs HERE (this file is the composition root for the headless
 * world, not just a pass-through):
 *  1. Default arrival has no synthetic-traffic fallback (the stub injected a
 *     baseline envelope when `envelopes` was empty). The headless driver feeds
 *     no wave tables, so the adapter supplies the world's baseline traffic as
 *     two envelopes whose rates sum EXACTLY to cfg.baselineRatePerMin:
 *     organic 3/4 + malicious 1/4 — mirroring the stub world's uniform-intent
 *     draw, which made ~25% of units hostile (malicious/abuser of 8 intents).
 *     External envelopes always win verbatim (the wrapper only fires on empty).
 *  2. DefaultPipelineConfig fields the harness has no knob for are pinned to
 *     the documented v0 readings (each choice justified inline below).
 */

import { DEMO_EDGE_ID, DEMO_ORIGIN_ID } from "./bundle.ts";
import {
  fx,
  pipeline,
  type ArrivalIn,
  type ArrivalOut,
  type Fixed,
  type PipelineSlots,
  type RunSeed,
  type WaveEnvelope,
} from "./sim-core.ts";
import { createStubSlots, stubConfigFromBundle, type StubSlotsConfig } from "./stub-slots.ts";

export interface AdapterConfig {
  readonly bundleId: string;
  /** Run seed — the real composition closes over it (PatienceCheckIn carries
   *  no rng handle; defaults.ts keys bounce draws off config.runSeed). */
  readonly seed: RunSeed;
  /** Bundle-parsed overrides merged onto the canonical stub config. */
  readonly patienceUs?: bigint;
  readonly unitTerm?: string;
  readonly baselineRatePerMin?: import("./sim-core.ts").Fixed;
  /** Selectable composition for regression comparison; defaults to
   *  ACTIVE_COMPOSITION. Unknown flavors are a compile error (closed union). */
  readonly flavor?: CompositionFlavor;
}

export type CompositionFlavor = "stub-v1" | "real-v1";

/** Boundary guard (Law 2): artifact readers narrow a stored string into the
 *  closed flavor union; anything else names the offender and halts. */
export function isCompositionFlavor(value: unknown): value is CompositionFlavor {
  return value === "stub-v1" || value === "real-v1";
}

export interface Composition {
  readonly slots: PipelineSlots;
  readonly flavor: CompositionFlavor;
}

/** Current flavor — the parity fixture, CLI default and bench run this. */
export const ACTIVE_COMPOSITION: CompositionFlavor = "real-v1";

export function createSlots(config: AdapterConfig): Composition {
  const flavor = config.flavor ?? ACTIVE_COMPOSITION;
  if (flavor === "stub-v1") return createStubComposition(config);
  return createRealComposition(config);
}

/* ─────────────────────────── stub-v1 (regression arm) ─────────────────────────── */

function createStubComposition(config: AdapterConfig): Composition {
  const overrides = {
    ...(config.patienceUs === undefined ? {} : { patienceUs: config.patienceUs }),
    ...(config.unitTerm === undefined ? {} : { unitTerm: config.unitTerm }),
    ...(config.baselineRatePerMin === undefined ? {} : { baselineRatePerMin: config.baselineRatePerMin }),
  };
  const stubConfig: StubSlotsConfig = stubConfigFromBundle(overrides);
  void config.bundleId; // real composition hash-pins sheets per bundle; the stub never did
  return { slots: createStubSlots(stubConfig), flavor: "stub-v1" };
}

/* ─────────────────────────── real-v1 (createDefaultSlots) ─────────────────────────── */

/** Stub-era patience default (defaultStubConfig.patienceUsBase) — used when
 *  the bundle carries no patienceModel budget. */
const DEFAULT_PATIENCE_US = 800_000n;

function realPipelineConfig(config: AdapterConfig): pipeline.DefaultPipelineConfig {
  return Object.freeze({
    // Bounce draws key off this seed inside the steps (same R-16 tuple the
    // driver opens per step — the seed is the run's seed, threaded via cfg).
    runSeed: config.seed,
    // Headless demo estate (stub-slots.startingNodes): edge-1 → origin-1.
    dnsNodeId: null,
    // Express and deep lanes are the same two-node path here. The headless
    // driver never feeds scoring evidence, so confidence stays 0 and every
    // unit takes the express branch; a divergent deepPath would only add
    // unroutable-if-hot ids, so we keep them identical (honest, not decorative).
    expressPath: Object.freeze([DEMO_EDGE_ID, DEMO_ORIGIN_ID]),
    deepPath: Object.freeze([DEMO_EDGE_ID, DEMO_ORIGIN_ID]),
    // Bundle knob (visitor.patienceModel.params.budgetMs → µs) — stub parity:
    // the stub's patienceUsBase default is the fallback.
    defaultPatienceUs: config.patienceUs ?? DEFAULT_PATIENCE_US,
    // One slot per unit — mirrors the stub's sizeCost = FIXED_ONE world.
    defaultSizeCost: fx.FIXED_ONE,
    // No patience-jitter knob in the bundle surface → exact budget.
    patienceJitterPct: 0,
    // R-08 latency stamps, stub-era scale: the stub charged 50 ms floor at
    // "inspect" (50_000 µs + rng jitter up to 49 ms — the jitter has no
    // default-step analog, which charges a fixed per-depth stamp). The
    // sample-1-in-20 stamp is the same 50 ms base; the step applies its own
    // ×1/20 sampling discount. "challenge" (2× inspect) is declared for
    // record completeness — no board node runs that depth in this world.
    inspectionCostUs: Object.freeze({
      "pass-through": 0n,
      "sample-1-in-20": 50_000n,
      inspect: 50_000n,
      challenge: 100_000n,
    }),
    // R-52 ROC: the stub blocked hostiles with P = aggression exactly
    // (`rng < aggression%`), i.e. detectionRatio = 1.0. falsePositiveRatio is
    // INERT at "inspect" depth (defaults only roll FPs under "challenge");
    // pinned to 1.0 so any future challenge board scales with the slider.
    detectionRatio: fx.FIXED_ONE,
    falsePositiveRatio: fx.FIXED_ONE,
    // The stub world had no viral loop (documented omission), so both stay
    // zero — the per-unit "viral:" fork + rolls still run for every served
    // customer (stream paths exercised, drafts suppressed by rollUnder(0)).
    referralProbability: fx.FIXED_ZERO,
    returnProbability: fx.FIXED_ZERO,
  });
}

/** World baseline traffic — see module header §1. Whole + fraction rates sum
 *  back to `total` exactly (the hostile rate is the subtraction remainder, so
 *  no Q16.16 rounding can create or destroy arrivals). */
function syntheticBaselineEnvelopes(total: Fixed, unitTerm: string): readonly WaveEnvelope[] {
  const organic = fx.mul(total, fx.fromRatio(75n, 100n));
  return Object.freeze([
    Object.freeze({
      tableId: `baseline:${unitTerm}`,
      role: "baseline" as const,
      shape: "plateau" as const,
      ratePerMin: organic,
      telegraphed: false,
      dominantFamily: "organic" as const,
    }),
    Object.freeze({
      tableId: "probe:malicious",
      role: "baseline" as const,
      shape: "plateau" as const,
      ratePerMin: total - organic,
      telegraphed: false,
      dominantFamily: "malicious" as const,
    }),
  ]);
}

function createRealComposition(config: AdapterConfig): Composition {
  const inner = pipeline.createDefaultSlots(realPipelineConfig(config));
  void config.bundleId; // per-bundle sheet hash-pinning belongs to the loader wave, not this fixture
  const envelopes = syntheticBaselineEnvelopes(
    config.baselineRatePerMin ?? fx.fromRatio(6n, 1n), // stub-era default when the bundle is silent
    config.unitTerm ?? "visitor",
  );
  const slots: PipelineSlots = Object.freeze({
    ...inner,
    arrival(input: ArrivalIn): ArrivalOut {
      return inner.arrival(input.envelopes.length > 0 ? input : { ...input, envelopes });
    },
  });
  return { slots, flavor: "real-v1" };
}

/** Re-export so tests can build a bare stub without the adapter surface. */
export { createStubSlots };
