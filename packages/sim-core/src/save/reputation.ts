/**
 * Economy `ReputationLedger` → save `ReputationState` — the projection seam
 * fix-economy handed to the hosts (2026-10-09 handoff): the economy keeps
 * owning the bps ledger; the save file stores the Fixed-carrier snapshot.
 *
 * SHAPE LAW (v0, disclosed):
 *  - `overall` = the ledger's exact bps on the unit Fixed scale —
 *    `fromRatio(overallBps, 10_000n)`, byte-for-byte the same fold the
 *    observed publisher `reputationFixed` uses, so HUD cell and save row
 *    can never disagree.
 *  - `domains` — the four-way split (customerTrust / upstreamTrust /
 *    staffTrust / industry) has NO economy producer yet. Until one exists
 *    every domain ALIASES `overall`: honest single-domain reading, not an
 *    authored lie. When the economy grows per-domain ledgers, this function
 *    takes them — callers of ReputationState never notice.
 *  - `honestHostFloor` rides through verbatim (§5.10 permanence).
 *  - `breachHistoryTicks` maps the covenant log's business minutes
 *    (`CovenantBreachRecord.atBusinessMin`) — the v2 facet stamped with the
 *    time channel the economy actually speaks.
 *
 * The ledger/breach inputs are STRUCTURAL parameter mirrors (economy's real
 * types satisfy them): save/ imports ONLY ../types + ../kernel/* per the
 * module boundary law, so it must not import ../economy even for types.
 */

import type { Fixed } from "../types.ts";
import { fromRatio } from "../kernel/fixed.ts";
import type { ReputationState } from "./node.ts";
import { SaveError } from "./errors.ts";

/** The bps ceiling the economy clamps to (mirrors REPUTATION_BPS_SCALE). */
const REPUTATION_BPS_CEILING = 10_000n;

/** Structural mirror of economy ReputationLedger (kept local — see header). */
export interface ReputationLedgerView {
  readonly overallBps: bigint;
  readonly honestHostFloor: boolean;
  readonly lifetimeEvents: number;
}

/** Structural mirror of the rows in EconomyState.covenantBreachLog. */
export interface CovenantBreachView {
  readonly atBusinessMin: number;
}

/** Project the economy's reputation ledger into the save-file state. */
export function reputationStateFromLedger(
  ledger: ReputationLedgerView,
  breaches: readonly CovenantBreachView[] = [],
): ReputationState {
  if (typeof ledger.overallBps !== "bigint") {
    throw new SaveError(`reputation ledger overallBps must be bigint, got ${typeof ledger.overallBps}`);
  }
  if (ledger.overallBps < 0n || ledger.overallBps > REPUTATION_BPS_CEILING) {
    throw new SaveError(
      `reputation ledger overallBps out of [0, ${String(REPUTATION_BPS_CEILING)}]: ${String(ledger.overallBps)}`,
    );
  }
  const overall: Fixed = fromRatio(ledger.overallBps, REPUTATION_BPS_CEILING);
  return Object.freeze({
    overall,
    domains: Object.freeze({
      customerTrust: overall,
      upstreamTrust: overall,
      staffTrust: overall,
      industry: overall,
    }),
    honestHostFloor: ledger.honestHostFloor,
    breachHistoryTicks: Object.freeze(breaches.map((b) => b.atBusinessMin)),
  });
}
