/**
 * gates/g4 — THE DRAG-A-CABLE prototype gate (§9.13 gate #4): making a
 * connection must FEEL like committing to a dependency. Live latency-ladder
 * delta DURING the drag, a TERMS CARD before the commit, and — per the
 * accessibility law — a click-to-link path that mints the IDENTICAL cable.
 *
 * The shell integrator mounts GATE_MOUNTS entries; App.vue is owned by the
 * shell lane — this barrel is the ONLY door.
 */
import type { Component } from "vue";
import G4GatePanel from "./G4GatePanel.vue";

export interface GateMount {
  readonly gateId: "G4";
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
    gateId: "G4" as const,
    mountId: "gate-g4-panel",
    title: "Drag a Cable",
    subtitle: "Every connection is a dependency — price the milliseconds, read the terms, pay the hands.",
    slot: "stage" as const,
    component: G4GatePanel,
    description:
      "Z2 board, typed ports with redundant channels (R32: trapezoid/kettle/circle/slot + hue + dash), " +
      "wiring mode that dims the world and lights only legal sockets, a live latency ladder (hockey-stick " +
      "service÷(1−ρ)) during the drag, a terms card with SLA squeeze math and thin attack-surface deltas " +
      "before ANY commit, Shift-to-remember, and drag ≡ click-to-link identical cables. Refusals bounce " +
      "and name themselves. Headless proof: packages/sim-core/src/__tests__/gate-g4.test.ts (19 tests: " +
      "17-intent door session with the full refusal-receipt golden 13ba145f76c1799a, hands-occupancy " +
      "windows in digests, ×100 replay identity, drag≡click parity, socket-grammar preflight).",
  }),
]);

export { default as G4GatePanel } from "./G4GatePanel.vue";
export { G4Session, profileFor, powerEdgeId, G4_ENGINE_VERSION } from "./g4Session.ts";
export type {
  CablePreview,
  DeviceProfile,
  EdgeView,
  G4Snapshot,
  HandView,
  NodeView,
  PreviewVerdict,
  ReceiptView,
} from "./g4Session.ts";
export { effectiveHopUs, latencyDeltaUs, pathLatencyUs, latencyLadderRows, RHO_SATURATION } from "./latencyDelta.ts";
export type { HopLoad, LatencyDelta, LadderRow } from "./latencyDelta.ts";
export { buildTermsCard } from "./termsCard.ts";
export type { AttackSurfaceDelta, SlaVerdict, TermRow, TermsBuild, TermsCard } from "./termsCard.ts";
export { PORT_GLYPHS, portsPluggable, isValidTarget } from "./portShapes.ts";
export type { GlyphKind, PlugVerdict, PortGlyph, PortSpec } from "./portShapes.ts";
