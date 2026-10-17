/**
 * Chrome barrel — the load-bearing HUD kit (§8.8 furniture + §8.15 laws).
 *
 * Exports the pure logic modules, the SFCs, and the mount manifests in the
 * shell's GATE_MOUNTS shape. THE INTEGRATOR WIRES, CHROME WAITS — and the
 * wire-in LANDED (owner ruling 2026-10-17, wave-23: "adopt the chrome into
 * the built app"): gates/index.ts now spreads `CHROME_GATE_MOUNTS` into
 * ALL_GATE_MOUNTS, so every surface below is reachable from App.vue's import
 * graph. The §9.13 six stay the six — HUD-LAB and COOP enter the rail with
 * their own non-gate ids, exactly the sandbox/Sim-Lab posture.
 */
import type { GateMount } from "../gates/index";
import HudLabPanel from "./HudLabPanel.vue";
import CoopRoom from "./CoopRoom.vue";

/* ── pure logic ── */
export * from "./numberLaw";
export * from "./textLaw";
export * from "./hueVars";
export * from "./promotion";
export * from "./clockRibbon";
export * from "./explainRegistry";
export * from "./statusChip";
export * from "./alertStack";
export * from "./panic";
export * from "./deathWatch";
export * from "./pricingDial";
export * from "./recoveryWatch";
export * from "./flavourFeed";
export * from "./actRow";
export * from "./coopRoom";
export * from "./coopRoomWire";
export {
  buildCandidates,
  buildHudCandidates,
  hudPermanentRows,
  isSpiking,
  readingsFor,
  rhoDisplayOf,
  worstState,
  formatMicroUsd,
  formatRunClock,
  HUD_PERMANENT_METRICS,
  type HudMetricDef,
  type HudPermanentRow,
} from "./metrics";

/* ── components ── */
export { default as TopBar } from "./TopBar.vue";
export { default as ClockRibbon } from "./ClockRibbon.vue";
export { default as ExplainValue } from "./ExplainValue.vue";
export { default as ExplainPopover } from "./ExplainPopover.vue";
export { default as StatusChip } from "./StatusChip.vue";
export { default as AlertStack } from "./AlertStack.vue";
export { default as PanicLayout } from "./PanicLayout.vue";
export { default as HudLabPanel } from "./HudLabPanel.vue";
export { default as LossCard } from "./LossCard.vue";
export { default as PricingDial } from "./PricingDial.vue";
export { default as RecoveryWatch } from "./RecoveryWatch.vue";
export { default as FlavourFeed } from "./FlavourFeed.vue";
export { default as NodeActRow } from "./NodeActRow.vue";
export { default as CoopRoom } from "./CoopRoom.vue";

/**
 * Chrome stage mounts — same frozen shape as every gates/gX/index.ts
 * manifest ({gateId, mountId, title, subtitle, slot, component, description}).
 * slot "stage": these are stage citizens, not chrome furniture. HUD-LAB is
 * the chrome law suite on the live runner (first position — the
 * `GATE_MOUNTS[0]` integrator-contract pin); COOP is the §9.1 Co-op NOC
 * incident room (§9.13 gates do not own it, so it enters the rail under its
 * own non-gate id like sandbox/sim-lab). Default posture: Local demo —
 * zero timers at mount (coopRoom.mount.test.ts), the Wire socket/pump start
 * only on user click (ADR-0017 #4).
 */
export const GATE_MOUNTS: readonly GateMount[] = Object.freeze([
  Object.freeze({
    gateId: "HUD-LAB" as const,
    mountId: "hud-lab-panel",
    title: "Chrome Lab — the load-bearing HUD",
    subtitle: "ribbon · explain · promotion · panic · alerts · chips, live",
    slot: "stage" as const,
    component: HudLabPanel,
    description:
      "Every §8.8/§8.15 chrome component mounted against the real SimCoreRunner stream through the observed-store singletons. Demonstrates the three-pip clock ribbon (§7.9), recursive Explain-This-Number (§8.8), threshold promotion with manual pin override (§1.4), the Big Number Rule under the klaxon (§8.15), the fatigue-aware alert stack, and the 12-value status vocabulary (§8.2).",
  }),
  Object.freeze({
    gateId: "COOP" as const,
    mountId: "coop-room",
    title: "Incident Room — co-op seats, one log",
    subtitle: "OD-9 seat ledger · OD-17 shared timeline · Local demo / Wire seat",
    slot: "stage" as const,
    component: CoopRoom,
    description:
      "The §9.1 Co-op NOC incident room made playable: two simulated seats share one append-only timeline; every refusal is the engine's own sentence quoted verbatim (save/coop + replay/coopTimeline). Local demo is single-browser play with zero timers at mount; Wire mode mounts the ADR-0017 #4 browser seat over the hh-coop-transport@1 dev carrier, socket and pump starting only on user click.",
  }),
]);
