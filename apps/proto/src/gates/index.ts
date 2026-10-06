/**
 * gates — the aggregate mount barrel (shell lane, J1).
 *
 * Single source the App shell imports: every gate dir ships a frozen
 * GATE_MOUNTS array; this barrel concatenates them in gate order. A future
 * gate adds its directory here and appears in the selector with zero shell
 * edits beyond this one line.
 *
 * The `GateMount` shape is declared once (g1..g6 barrels each mirror it
 * structurally); `description` is optional because g5 ships without one.
 */
import type { Component } from "vue";
import { GATE_MOUNTS as G1 } from "./g1/index.ts";
import { GATE_MOUNTS as G2 } from "./g2/index.ts";
import { GATE_MOUNTS as G3 } from "./g3/index.ts";
import { GATE_MOUNTS as G4 } from "./g4/index.ts";
import { GATE_MOUNTS as G5 } from "./g5/index.ts";
import { GATE_MOUNTS as G6 } from "./g6/index.ts";

/** One mountable panel: what to show, where, and why (manifest per §9.13). */
export interface GateMount {
  readonly gateId: string;
  readonly mountId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly slot: "drawer" | "stage";
  readonly component: Component;
  readonly description?: string;
}

/** All stage-mountable gate panels, in gate order (G1 first = shell default). */
export const ALL_GATE_MOUNTS: readonly GateMount[] = Object.freeze([
  ...G1,
  ...G2,
  ...G3,
  ...G4,
  ...G5,
  ...G6,
] satisfies readonly GateMount[]);

export { G1, G2, G3, G4, G5, G6 };
