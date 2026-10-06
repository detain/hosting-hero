/**
 * gates/g3 — THE SUSPICION DIAL prototype gate (§9.13 gate #3).
 * The shell integrator mounts GATE_MOUNTS entries; App.vue is owned by the
 * shell lane — this barrel is the ONLY door.
 */
import type { Component } from "vue";
import G3GatePanel from "./G3GatePanel.vue";

export interface GateMount {
  readonly gateId: "G3";
  readonly mountId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly slot: "drawer" | "stage";
  readonly component: Component;
  readonly description: string;
}

/** Manifest for the shell integrator: what to mount, where, and why. */
export const GATE_MOUNTS: readonly GateMount[] = Object.freeze([
  Object.freeze({
    gateId: "G3" as const,
    mountId: "gate-g3-panel",
    title: "The Suspicion Dial",
    subtitle: "One dial splits the same traffic two ways — express vs deep inspection.",
    slot: "stage" as const,
    component: G3GatePanel,
    description:
      "Two-lane routing made visible: the dial is TickInputs.expressMaxConfidence, wire evidence " +
      "folds Π(1−cᵢ) in canonical (unitId, metric) order (FIX-3 — permutation can't dodge it), " + "high-confidence units are yanked MID-PATH to the deep lane, and false positives spike a sticky " +
      "per-lineage suspicion ledger that decays ×0.9/min past a 12-minute horizon. " +
      "Defense upgrade is a real intent-door verb (configure-node) that moves the ROC curve, not " +
      "the damage. Shape-First pips: circle = express, triangle = demoted, dot = sticky lineage. " +
      "Headless proof: packages/sim-core/src/__tests__/gate-g3.test.ts (7 tests: dial splits, " +
      "canonical fold pin, mid-path yank, sticky/decay law, ROC-shift damage-invariance, ×100 replay).",
  }),
]);

export { default as G3GatePanel } from "./G3GatePanel.vue";
export { createG3Runner, G3Runner, G3_PIP_THRESHOLD } from "./g3Runner.ts";
export type { G3RunnerOptions, G3RunnerStats } from "./g3Runner.ts";
export { deriveLaneSplit, derivePips, pipLabel, FIXED_SCALE } from "./pips.ts";
export type { G3Pip, G3LaneSplit } from "./pips.ts";
export {
  G3_ENVELOPES,
  G3_IDS,
  G3_RETRY,
  G3_TRIPLE_FOLD,
  LEDGER_HORIZON_TICKS,
  SUSPICION_DECAY,
  SUSPICION_SPIKE,
  SUSPICION_THRESHOLD,
  createGateOutcomeStep,
  createGateRouteStep,
  createSuspicionLedger,
  decayedSuspicion,
  g3Config,
  g3ToggleIntent,
  lineageStem,
  wireSignalEvidence,
} from "./g3Scenario.ts";
export type { G3Depth, SuspicionLedger } from "./g3Scenario.ts";
