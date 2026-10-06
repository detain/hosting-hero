/**
 * gates/g6 — TWO TYPES, ONE ENGINE (§9.13 gate #6, the generality proof).
 * The shell integrator mounts GATE_MOUNTS entries; App.vue is owned by the
 * shell lane — this barrel is the ONLY door.
 */
import type { Component } from "vue";
import G6GatePanel from "./G6GatePanel.vue";

export interface GateMount {
  readonly gateId: "G6";
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
    gateId: "G6" as const,
    mountId: "gate-g6-panel",
    title: "Two Types, One Engine",
    subtitle: "Shared Web vs Game Servers — same code path, only loaded data differs.",
    slot: "stage" as const,
    component: G6GatePanel,
    description:
      "THE generality proof: one composed pipeline runs both shipped hosting types with ZERO type-specific " +
      "branches. The type toggle hot-swaps only the loaded bundle profile (patience budget, wave slice, " +
      "diurnal curve, tempo flag, meter widget name) into the identical runner and render path; the palette " +
      "and gauge re-skin from bundle data. Dual-run mode puts both types on one seed and one clock — the " +
      "screenshot minute where shared-web bounces while game-servers serves pulses in each side's accent. " +
      "Headless proof: packages/sim-core/src/__tests__/gate-g6.test.ts (9 tests: emergence cohort, grep " +
      "audit of engine sources, ×100 digests, cross-swap controls, 0.25× tempo-flag identity).",
  }),
]);

export { default as G6GatePanel } from "./G6GatePanel.vue";
export { default as G6Side } from "./G6Side.vue";
export { G6_PROFILES, G6_DEFAULT_SEED, loadG6Profile, meterFace, type G6Profile, type G6TypeId } from "./g6Data.ts";
export { createG6Runner, G6Runner, TOTAL_TICKS, G6_NODE_EDGE, G6_NODE_ORIGIN, G6_LANE_ID } from "./g6Runner.ts";
