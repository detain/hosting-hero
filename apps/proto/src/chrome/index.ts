/**
 * Chrome barrel — the load-bearing HUD kit (§8.8 furniture + §8.15 laws).
 *
 * Exports the pure logic modules, the SFCs, and the HUD-LAB mount manifest
 * in the shell's GATE_MOUNTS shape. THE INTEGRATOR WIRES, CHROME WAITS:
 * gates/index.ts and App.vue are NOT this lane's to edit — splice
 * `...HUD_LAB_MOUNTS` into ALL_GATE_MOUNTS when ready.
 */
import type { GateMount } from "../gates/index";
import HudLabPanel from "./HudLabPanel.vue";

/* ── pure logic ── */
export * from "./numberLaw";
export * from "./promotion";
export * from "./clockRibbon";
export * from "./explainRegistry";
export * from "./statusChip";
export * from "./alertStack";
export * from "./panic";
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

/**
 * HUD-LAB mount — same frozen shape as every gates/gX/index.ts manifest
 * ({gateId, mountId, title, subtitle, slot, component, description}).
 * slot "stage" like the gates; the lab is a stage citizen, not chrome
 * furniture, until the integrator dissolves it into the shell.
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
]);
