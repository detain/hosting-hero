/**
 * campaign/carry.ts — deterministic carry projection (§2.5 "carry-over thin").
 *
 * Pure function of (settled CompanyNode, CampaignCarryRules): decides what the
 * NEXT chapter opens with. It reads ONLY ledger facts the save module already
 * owns — capped cash slice, active named customers, staff roster, scars — and
 * mints them as INPUT overrides onto a clone-projected ScenarioDoc. The doc
 * itself is never mutated (it is frozen authored data; the state-freeze law).
 *
 * - Cash bridge law: a company that ends a chapter below the floor opens the
 *   next one on the bridge (poorer, not paid); above the floor it carries its
 *   own cash. Either way the number lands in limits.initialFreeMicroUsd.
 * - Cast law: active, paying customer books ride into the next chapter as
 *   contract casts (grudge-bearers first, then code-unit-sorted) and capped; churned ghosts do NOT ride
 *   (they haunt the museum, not the balance sheet).
 * - Staff facts ride as data (≤ CARRY_STAFF_CAP); v0 has no engine consumer —
 *   honest gap, kept as ledger input for the L-CP2 perspective lane.
 */

import type { EntityId, MoneyUnit } from "../types.ts";
import { asEntityId, asMoney } from "../types.ts";
import { FIXED_ZERO, fromInt } from "../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";
import type { CompanyNode, CustomerBookRecord } from "../save/index.ts";
import type { ScenarioContractSpec, ScenarioDoc } from "../scenario/index.ts";
import type { CampaignCarryRules } from "./doc.ts";
import { CARRY_CAST_CAP, CARRY_STAFF_CAP } from "./doc.ts";

/** One ledger staff fact riding across the chapter boundary. */
export interface CarryStaffFact {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly arcStage: string;
  readonly skillNodesHeld: readonly EntityId[];
}

/** What the next chapter opens with — derived, never authored. */
export interface CampaignCarryProjection {
  readonly openingCashMicroUsd: bigint;
  readonly contractCasts: readonly ScenarioContractSpec[];
  readonly staffCast: readonly CarryStaffFact[];
  readonly scarCount: number;
}

const CAST_TERM_END_MIN = 1_000_000;

function castSlug(customerId: string): string {
  return `cast-${customerId.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}`;
}

/**
 * The bridge law, machine-visible: strictly below the floor ⇒ bridge;
 * at or above ⇒ carry the company's own cash.
 */
export function projectChapterCarry(node: CompanyNode, rules: CampaignCarryRules): CampaignCarryProjection {
  const cash = node.finances.cashMicroUsd;
  const openingCashMicroUsd = cash < rules.cashFloor.thresholdMicroUsd ? rules.cashFloor.bridgeMicroUsd : cash;

  const staffCap = Math.min(rules.staffCap, CARRY_STAFF_CAP);
  const staffCast: CarryStaffFact[] = node.staff.slice(0, staffCap).map((row) => ({
    id: row.id,
    name: row.name,
    role: row.role,
    arcStage: row.arcStage,
    skillNodesHeld: row.skillNodesHeld,
  }));

  const castCap = Math.min(rules.castCap, CARRY_CAST_CAP);
  const paying = node.customerBooks
    .filter((row) => row.status === "active" && row.mrrMicroUsd > 0n)
    .slice()
    .sort((a, b) => {
      // Grudge-cast law: a hurt customer gets their say in the next chapter —
      // grudge-bearers claim cast slots BEFORE the code-unit ladder fills up.
      const bearing = (row: CustomerBookRecord): 0 | 1 => (row.grudgeScore > 0n ? 1 : 0);
      if (bearing(a) !== bearing(b)) return bearing(b) - bearing(a);
      return a.id === b.id ? 0 : a.id < b.id ? -1 : 1;
    });
  const contractCasts: ScenarioContractSpec[] = paying.slice(0, castCap).map((row) => {
    const id = castSlug(row.id);
    const mrc = row.mrrMicroUsd as MoneyUnit;
    return Object.freeze({
      id,
      contract: Object.freeze({
        id: asEntityId(id),
        customerEntityId: asEntityId(row.id),
        bundleId: "shared-web",
        mrcMicroUsd: mrc,
        tcvMicroUsd: asMoney(mrc * 12n),
        acvMicroUsd: asMoney(mrc * 12n),
        termStartMin: 0,
        termEndMin: CAST_TERM_END_MIN,
        billingCycle: "monthly" as const,
        sla: Object.freeze({
          uptimeTarget: fromInt(1),
          responseBudgetUs: 1_000_000n,
          creditRate: FIXED_ZERO,
          creditCap: asMoney(0n),
          claimWindowUs: 60n * MICROS_PER_MIN,
          autoRenew: false,
          noticePeriodMin: 0,
          threeBreachExitRight: false,
        }),
        routingLocks: [],
        shedImmunityClassId: null,
        allocations: [],
      }),
      termMonths: 12,
      commitmentBps: 10_000n,
    });
  });

  return Object.freeze({
    openingCashMicroUsd,
    contractCasts: Object.freeze(contractCasts),
    staffCast: Object.freeze(staffCast),
    scarCount: node.scars.length,
  });
}

/**
 * Clone-project a chapter doc with carry inputs layered on. Returns the SAME
 * doc (identity) when the projection changes nothing — the byte-identity law
 * that keeps no-carry runs digest-identical to plain scenario runs.
 */
export function applyCarryToDoc(doc: ScenarioDoc, projection: CampaignCarryProjection): ScenarioDoc {
  const opening = projection.openingCashMicroUsd;
  if (projection.contractCasts.length === 0 && opening === doc.limits.initialFreeMicroUsd) {
    return doc;
  }
  return Object.freeze({
    ...doc,
    contracts: [...doc.contracts, ...projection.contractCasts],
    limits: Object.freeze({ ...doc.limits, initialFreeMicroUsd: opening }),
  });
}
