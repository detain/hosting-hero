/**
 * gates/g1 — THE BOUNCE LOOP prototype gate (§9.13 gate #1).
 * The shell integrator mounts GATE_MOUNTS entries; App.vue is owned by the
 * shell lane — this barrel is the ONLY door.
 */
import type { Component } from "vue";
import G1GatePanel from "./G1GatePanel.vue";

export interface GateMount {
  readonly gateId: "G1";
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
    gateId: "G1" as const,
    mountId: "gate-g1-panel",
    title: "The Bounce Loop",
    subtitle: "Defense buys captures and costs customers — feel the triangle in 90 seconds.",
    slot: "stage" as const,
    component: G1GatePanel,
    description:
      "One lane, one WAF, the aggression slider (the one legal pre-door ROC control) and a defense " +
      "toggle that travels through the real intent door (configure-node pass-through ⇄ challenge). " +
      "Live triad — stopped / bounced customers / breaches landed — plus the friction tax in seconds " +
      "of WAF time, each with an Explain-This-Number causal sentence generated from the counters. " +
      "Headless proof: packages/sim-core/src/__tests__/gate-g1.test.ts (6 tests: monotone paranoia " +
      "ladder × 5 seeds, conservation laws, door split, slider-schedule replay ×100 byte-identical).",
  }),
]);

export { default as G1GatePanel } from "./G1GatePanel.vue";
export { createG1Runner, G1Runner } from "./g1Runner.ts";
export type { G1RunnerOptions, G1RunnerStats } from "./g1Runner.ts";
export { explainTriad, microUsToSeconds } from "./explain.ts";
export type { G1Explanation } from "./explain.ts";
export {
  G1_CLASSES,
  G1_CONTRACT,
  G1_ENVELOPES,
  G1_IDS,
  G1_PIPELINE_CONFIG,
  G1_RETRY,
  G1_ZERO_TRIAD,
  g1AttributeOutcome,
  g1Lane,
  g1ToggleIntent,
} from "./g1Scenario.ts";
export type { G1Triad } from "./g1Scenario.ts";
