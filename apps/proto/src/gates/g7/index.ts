/**
 * gates/g7 — TWO BOARDS, ONE POOL (§9.13 gate #7, owner-commissioned,
 * ADR-0018): the Iron Board and The Book executing through ONE hands rail and
 * ONE attention denomination, live in one screen. The engine proof is
 * packages/sim-core/src/__tests__/gate-g7.test.ts; this is its playable form.
 *
 * The shell integrator mounts GATE_MOUNTS entries; App.vue is owned by the
 * shell lane — this barrel is the ONLY door (g2/g4 shape).
 */
import type { Component } from "vue";
import G7GatePanel from "./G7GatePanel.vue";

export interface GateMount {
  readonly gateId: "G7";
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
    gateId: "G7" as const,
    mountId: "gate-g7-panel",
    title: "Two Boards, One Pool",
    subtitle: "The Iron Board and The Book share one hand rail — the unwatched board runs on its standing policies.",
    slot: "stage" as const,
    component: G7GatePanel,
    description:
      "Split screen with ONE hands rail spanning both halves (tokens segment-colored player-vs-rule from " +
      "receipt attribution), six authored PolicyCards riding the real grammar and the door's lookupPolicyCard " +
      "seam, rule carriers executing through the same occupancy rail under ruleCarriers:\"mapped\" (ADR-0018), " +
      "the failover card as the bought-verb wall (ticker-yes, board-no), inform/consult bands as advisory rows " +
      "minting zero intents (§7.14), the owner's attention tax on commit+communicate with the Book exempt " +
      "(§7.12/ADR-0013 #12(v)), a Dry-Run Toggle (shadowEvaluationConfig — firings visible, zero intents), and " +
      "a watch toggle that hides a column WITHOUT pausing it. Headless proof: " +
      "packages/sim-core/src/__tests__/gate-g7.test.ts (receipts golden d727cdda5fde0250, firings golden " +
      "1622412ac78d585a, ×100 replay identity, off-arm byte-identity).",
  }),
]);

export { default as G7GatePanel } from "./G7GatePanel.vue";
export { G7Session, G7_ENGINE_VERSION } from "./g7Runner.ts";
export type {
  G7AttentionView,
  G7CardView,
  G7EdgeView,
  G7FiringView,
  G7HandView,
  G7NodeView,
  G7ReceiptView,
  G7Snapshot,
  G7TapeEntry,
  G7WindowResult,
  HandOrigin as G7HandOrigin,
} from "./g7Runner.ts";
export {
  G7_CARDS,
  G7_CABLE,
  G7_CARD_BLURB,
  G7_DB,
  G7_EDGE,
  G7_ORIGIN,
  G7_WALL_CARD_ID,
  g7CardHash,
  g7LookupPolicyCard,
} from "./g7Deck.ts";
