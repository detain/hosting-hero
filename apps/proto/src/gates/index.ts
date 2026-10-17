/**
 * gates — the aggregate mount barrel (shell lane, J1).
 *
 * Single source the App shell imports: every gate dir ships a frozen
 * GATE_MOUNTS array; this barrel concatenates them in gate order, then the
 * chrome barrel's stage mounts. A future gate adds its directory here and
 * appears in the selector with zero shell edits beyond this one line.
 *
 * CHROME ADOPTION (owner ruling 2026-10-17, wave-23): `...CHROME` joins the
 * aggregate — HUD-LAB and COOP reach the rail and the app import graph
 * through this spread (the wave-22 review F-1 gap: the chrome barrel had
 * zero app-graph importers, "test-mount-only"). The §9.13 six are still the
 * six — the chrome entries carry their own non-gate ids and trail the gates
 * in the selector.
 *
 * The `GateMount` shape is declared once (g1..g6 barrels each mirror it
 * structurally; the chrome barrel imports it as a TYPE, so this runtime
 * import of the chrome barrel closes no cycle); `description` is optional
 * because g5 ships without one.
 */
import type { Component } from "vue";
import { GATE_MOUNTS as G1 } from "./g1/index.ts";
import { GATE_MOUNTS as G2 } from "./g2/index.ts";
import { GATE_MOUNTS as G3 } from "./g3/index.ts";
import { GATE_MOUNTS as G4 } from "./g4/index.ts";
import { GATE_MOUNTS as G5 } from "./g5/index.ts";
import { GATE_MOUNTS as G6 } from "./g6/index.ts";
import { GATE_MOUNTS as CHROME } from "../chrome/index.ts";

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

/** All stage-mountable panels: the §9.13 six in gate order (G1 first = shell
 *  default), then the chrome stage mounts (HUD-LAB, COOP — wave-23 ruling). */
export const ALL_GATE_MOUNTS: readonly GateMount[] = Object.freeze([
  ...G1,
  ...G2,
  ...G3,
  ...G4,
  ...G5,
  ...G6,
  ...CHROME,
] satisfies readonly GateMount[]);

export { G1, G2, G3, G4, G5, G6, CHROME };
