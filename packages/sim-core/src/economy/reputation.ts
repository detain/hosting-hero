/**
 * Reputation ledger — the PRODUCER for the `company::reputation` observed
 * cell (audit g17 #2: chrome TopBar @faf81a7 and save @9e701a0 have read
 * this cell forever; nothing ever wrote it).
 *
 * Spec anchors:
 *  - §2.10 — reputation is lost by public failures (outages, chargebacks,
 *    angry reviews) and earned back by recoveries and honest post-mortems;
 *    "scored not judged" (types.ts OriginSource doc: a 0..1 Fixed).
 *  - §5.10 — a published honest post-mortem leaves a PERMANENT floor that
 *    softens future incident damage ("transparency insurance").
 *
 * Representation: the authoritative value is an INTEGER bps reading in
 * [0, 10_000] (Fixed at the observed boundary via `fromRatio(bps, 10_000)`),
 * so a fold of deltas is exact integer math — no float, no drift, replay-
 * stable (Law 3). Every delta comes from cfg.reputation (house law: no
 * inline rates in this directory); the constants there are PROVISIONAL.
 *
 * The ledger NEVER moves money. Money-adjacent reputation events (the
 * chargeback fee) post through the ledger's own write path in tick.ts; this
 * file only scores.
 */

import {
  asCauseId,
  asEntityId,
  observedKey,
  ResolutionBand,
  type CauseId,
  type EntityId,
  type Fixed,
  type ObservedCell,
  type ObservedWrite,
} from "../types.ts";
import { FIXED_UNIT, fromRatio } from "../kernel/fixed.ts";
import { BPS_DEN } from "./money.ts";
import type { EconomyConfig } from "./config.ts";

/** Full-scale denominator for the bps reading (0..10_000 bps ⇒ 0..1 Fixed). */
export const REPUTATION_BPS_SCALE: bigint = BPS_DEN;

/** Neutral opening score (§2.10 "scored not judged" — nobody has proven
 *  anything yet). Single source: `emptyEconomyState()` seeds with this and
 *  docs/tests cite it; PROVISIONAL (no doc figure). */
export const REPUTATION_INITIAL_BPS: bigint = 5_000n;

/** The entity the company-wide reputation hangs off — the same id the
 *  runway/lose-slowly notices already use. */
export const REPUTATION_ENTITY: EntityId = asEntityId("company");

/** The observed property chrome reads (apps/proto/src/chrome/metrics.ts
 *  HUD_PERMANENT_METRICS → lookup(projection, "company", "reputation")). */
export const REPUTATION_PROPERTY = "reputation";

export interface ReputationLedger {
  /** Authoritative score, whole bps, always within [0, REPUTATION_BPS_SCALE]. */
  readonly overallBps: bigint;
  /** §5.10: once an honest post-mortem is published it is PERMANENT —
   *  future incident damage is halved. Nothing ever clears this flag. */
  readonly honestHostFloor: boolean;
  /** Count of folded signals (audit readout; also the change witness). */
  readonly lifetimeEvents: number;
}

/** Closed vocabulary of things that move reputation. The tick derives the
 *  first five from its own notices/inputs; hosts report incidents and
 *  post-mortems the economy cannot see on its own. */
export type ReputationSignalKind =
  | "written-off"
  | "voluntary-churn"
  | "dunning-recovered"
  | "chargeback"
  | "major-incident"
  | "honest-postmortem";

export interface ReputationSignal {
  readonly kind: ReputationSignalKind;
  readonly causeId: CauseId;
  readonly contractId?: EntityId;
}

function guardBps(value: bigint, where: string): void {
  if (value < 0n || value > REPUTATION_BPS_SCALE) {
    throw new RangeError(
      `economy/reputation: ${where} ${value} bps outside [0, ${REPUTATION_BPS_SCALE}]`,
    );
  }
}

export function initialReputationLedger(
  initialBps: bigint = REPUTATION_INITIAL_BPS,
): ReputationLedger {
  guardBps(initialBps, "initialBps");
  return { overallBps: initialBps, honestHostFloor: false, lifetimeEvents: 0 };
}

/** One config-cited delta per signal kind (Law 1: exhaustive switch, the
 *  compiler is the guard — an unmapped kind cannot exist). */
export function reputationDeltaBps(kind: ReputationSignalKind, cfg: EconomyConfig): bigint {
  const r = cfg.reputation;
  switch (kind) {
    case "written-off":
      return r.writtenOffChurnBps;
    case "voluntary-churn":
      return r.voluntaryChurnBps;
    case "dunning-recovered":
      return r.dunningRecoveredBps;
    case "chargeback":
      return r.chargebackBps;
    case "major-incident":
      return r.majorIncidentBps;
    case "honest-postmortem":
      return r.honestPostmortemBps;
  }
}

/** Fold signals in list order (Law 3: pure — returns a new ledger; an empty
 *  signal list returns the input ledger BY IDENTITY, which is exactly what
 *  lets the tick's publish-on-change pin "nothing published when no
 *  events"). */
export function applyReputationSignals(
  ledger: ReputationLedger,
  signals: readonly ReputationSignal[],
  cfg: EconomyConfig,
): ReputationLedger {
  if (signals.length === 0) return ledger;
  let overallBps = ledger.overallBps;
  let honestHostFloor = ledger.honestHostFloor;
  for (const signal of signals) {
    let delta = reputationDeltaBps(signal.kind, cfg);
    // §5.10 transparency insurance: the honest-host floor halves INCIDENT
    // damage only (churn/chargebacks stay at full price — the floor buys
    // forgiveness for bad days, not for bad customers). Floor division on
    // the magnitude keeps it exact and deterministic for negative deltas.
    if (honestHostFloor && signal.kind === "major-incident" && delta < 0n) {
      delta = -((-delta) / 2n);
    }
    const next = overallBps + delta;
    overallBps = next < 0n ? 0n : next > REPUTATION_BPS_SCALE ? REPUTATION_BPS_SCALE : next;
    if (signal.kind === "honest-postmortem") honestHostFloor = true;
  }
  return { overallBps, honestHostFloor, lifetimeEvents: ledger.lifetimeEvents + signals.length };
}

/** The Fixed (0..1) presentation of the score — the value the observed cell
 *  carries and chrome's fixedToDisplay formats. */
export function reputationFixed(ledger: ReputationLedger): Fixed {
  return fromRatio(ledger.overallBps, REPUTATION_BPS_SCALE);
}

/** The step-12 write for `company::reputation`, shaped exactly like the
 *  house publish pattern (pipeline/defaults.ts exactCell: literal freshness
 *  0n, Exact/coverage/certainty unit, live). */
export function reputationObservedWrite(
  ledger: ReputationLedger,
  causeId: CauseId = asCauseId(`economy:reputation`),
): ObservedWrite {
  const cell: ObservedCell<unknown> = Object.freeze({
    value: reputationFixed(ledger),
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: FIXED_UNIT,
    certainty: FIXED_UNIT,
    status: "live" as const,
  });
  return Object.freeze({
    key: observedKey(REPUTATION_ENTITY, REPUTATION_PROPERTY),
    cell,
    causeId,
  });
}
