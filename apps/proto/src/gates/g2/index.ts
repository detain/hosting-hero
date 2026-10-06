/**
 * gates/g2 — ATTACK SURFACE LEDGER prototype gate (§9.13 #2).
 * The shell integrator mounts GATE_MOUNTS entries; App.vue is owned by the
 * shell lane — this barrel is the ONLY door.
 */
import type { Component } from "vue";
import G2GatePanel from "./G2GatePanel.vue";

export interface GateMount {
  readonly gateId: "G2";
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
    gateId: "G2" as const,
    mountId: "gate-g2-panel",
    title: "Attack Surface Ledger",
    subtitle: "Building things adds attack surface — watch the threat pool grow as you build.",
    slot: "stage" as const,
    component: G2GatePanel,
    description:
      "Purchase-time capability↔surface tradeoff (P2 at point of purchase, WS-7 §48): palette tiles " +
      "preview the exact invitation delta before you buy, the ledger panel lists the live spawnable " +
      "pool by family with mastery demotion, and the construction log keeps removals honest " +
      "(retirement lag: attackers don't get the memo). Headless proof: " +
      "packages/sim-core/src/__tests__/gate-g2.test.ts (13 tests, 5 seeds, real corpus).",
  }),
]);

export { default as G2GatePanel } from "./G2GatePanel.vue";
export { createG2Session } from "./g2Session.ts";
export type { G2Session, G2View, PoolRow, HauntingRow, LogRow } from "./g2Session.ts";
export { deriveThreatInvitations, invitedThreatIds, spawnablePool, activeInvitersOf } from "./deriveInvitations.ts";
export type { InvitationPreview } from "./deriveInvitations.ts";
export { G2_BUNDLES, THREAT_CATALOG } from "./corpus.ts";
export type { ComponentTemplate, G2Bundle, G2BundleId, ThreatFact, ThreatId } from "./corpus.ts";
