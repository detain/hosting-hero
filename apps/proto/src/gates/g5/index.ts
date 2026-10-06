/**
 * GATE-G5 mount manifest — same contract as the G2 lane (GATE_MOUNTS array for
 * the shell integrator; App.vue wiring is NOT this lane's business).
 */
import type { Component } from "vue";
import Gate5QuarterView from "./Gate5QuarterView.vue";

export interface GateMount {
  readonly gateId: "G5";
  readonly mountId: string;
  readonly title: string;
  readonly subtitle: string;
  readonly slot: "stage";
  readonly component: Component;
}

export const GATE_MOUNTS: readonly GateMount[] = Object.freeze([
  Object.freeze({
    gateId: "G5" as const,
    mountId: "gate-g5-panel",
    title: "The Book — One Quarter",
    subtitle:
      "Sign, bill, dun, churn and cliff — one playable business quarter where every number shows its law.",
    slot: "stage" as const,
    component: Gate5QuarterView,
  }),
]);

export { Gate5QuarterView };
export { GATE5_SCRIPT, QUARTER_MINUTES, runQuarter, usd } from "./quarter.ts";
export { BUCKET_LAWS, projectFrame } from "./projection.ts";
export type {
  BucketRow,
  ExplainPayload,
  Gate5Frame,
  KanbanColumn,
  TapeRow,
} from "./projection.ts";
