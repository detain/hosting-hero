/**
 * unattended/__tests__/fixtures.ts — planted scenarios for the Long Weekend
 * lane. Boards are deliberately IDLE-CALM except where a catastrophe is
 * planted (the §1.5 "nothing dramatic" baseline vs planted failures); the
 * wave table is authored legal (waves/table.ts parse laws) so the error
 * budget integrates through the REAL landing path.
 */
import type { Contract, Fixed, PolicyAction, PolicyCard, Predicate, RunSeed, SlaTerms } from "../../types.ts";
import { asEntityId, asMetricId, asMoney, asRunSeed, asRuleId } from "../../types.ts";
import { fromInt } from "../../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../../kernel/time.ts";
import type { PressureParams } from "../../waves/pressure.ts";
import type { RunUnattendedConfig, UnattendedNodeSpec } from "../fastForward.ts";

export const UA_SEED: RunSeed = asRunSeed(777n);
export function uaSeed(value: bigint): RunSeed {
  return asRunSeed(value);
}

export const SHEETS_HASH = "ua-test-sheets";
export const RULE_BOOK_HASH = "ua-test-book";

/* ─────────────────────────── boards ─────────────────────────── */

/** Calm: one node, ρ ≈ 0.1 at the default baseline (40/min × 2 ms). */
export const CALM_BOARD = Object.freeze({
  nodes: Object.freeze([
    Object.freeze({ id: "web-1", slots: 400, serviceTimeUs: 2_000_000n }),
  ] satisfies readonly UnattendedNodeSpec[]),
});

/** Saturated: web-1 can serve NOTHING (1 slot, 120 s service) while
 *  spare-1 stays calm — whatIf's load-bearing-vs-spare pair. */
export const SATURATED_BOARD = Object.freeze({
  nodes: Object.freeze([
    Object.freeze({ id: "web-1", slots: 1, serviceTimeUs: 120_000_000_000n }),
    Object.freeze({ id: "spare-1", slots: 400, serviceTimeUs: 2_000_000n }),
  ] satisfies readonly UnattendedNodeSpec[]),
});

/** The saturated node ALONE — a total outage by saturation (default
 *  patience 120 min keeps units queued, not bounced, so servedRate rides 0). */
export const SATURATED_ONLY_BOARD = Object.freeze({
  nodes: Object.freeze([
    Object.freeze({ id: "web-1", slots: 1, serviceTimeUs: 120_000_000_000n }),
  ] satisfies readonly UnattendedNodeSpec[]),
});

/** One slow node saturates alone → 100% degraded → cascadeCollapse. */
export const SLOW_BOARD = Object.freeze({
  nodes: Object.freeze([
    Object.freeze({ id: "web-1", slots: 1, serviceTimeUs: 300_000_000n }),
  ] satisfies readonly UnattendedNodeSpec[]),
});

/* ─────────────────────────── doctrine ─────────────────────────── */

/** N gauge cards on the runner's arrival gauge (fire once each per crossing
 *  — 30 of them = a 30-firing burst on the first hot tick, planted runaway). */
export function gaugeCards(count: number, threshold: Fixed = fromInt(20)): readonly PolicyCard[] {
  const cards: PolicyCard[] = [];
  for (let i = 0; i < count; i++) {
    const predicate: Predicate = Object.freeze({
      metric: asMetricId("unattended-arrivals"),
      comparator: ">",
      threshold: Object.freeze({ kind: "value" as const, amount: threshold, unit: "count" as const }),
    });
    const action: PolicyAction = Object.freeze({ id: "scale-out", runbookName: null, value: fromInt(2) });
    cards.push(Object.freeze({
      id: asRuleId(`r-ua-gauge-${String(i).padStart(2, "0")}`),
      scope: Object.freeze({ kind: "object" as const, ref: "web-1" }),
      when: Object.freeze([predicate]),
      for: Object.freeze({ durationUs: 1n * MICROS_PER_MIN }),
      then: Object.freeze([action]),
      band: "execute" as const,
      upkeepMicroUsd: asMoney(10n),
    } satisfies PolicyCard));
  }
  return Object.freeze(cards);
}

export const RUNAWAY_BOOK = gaugeCards(30);

/* ─────────────────────────── configs ─────────────────────────── */

export interface ConfigOverrides extends Partial<Omit<RunUnattendedConfig, "board">> {
  readonly board?: RunUnattendedConfig["board"];
}

export function uaConfig(overrides: ConfigOverrides = {}): RunUnattendedConfig {
  return Object.freeze({
    runSeed: UA_SEED,
    ticks: 12n,
    board: CALM_BOARD,
    ruleBook: Object.freeze([]),
    ruleBookHash: RULE_BOOK_HASH,
    guards: Object.freeze([]),
    ...overrides,
  });
}

/* ─────────────────────────── money ─────────────────────────── */

const TEST_SLA: SlaTerms = Object.freeze({
  uptimeTarget: fromInt(1),
  responseBudgetUs: 1_000_000n,
  creditRate: fromInt(0),
  creditCap: asMoney(0n),
  claimWindowUs: 60n * MICROS_PER_MIN,
  autoRenew: false,
  noticePeriodMin: 0,
  threeBreachExitRight: false,
});

export function smallContract(id: string, mrcMicroUsd: bigint, termEndMin: number): Contract {
  return Object.freeze({
    id: asEntityId(id),
    customerEntityId: asEntityId(`customer:${id}`),
    bundleId: "shared-web",
    mrcMicroUsd: asMoney(mrcMicroUsd),
    tcvMicroUsd: asMoney(mrcMicroUsd * 12n),
    acvMicroUsd: asMoney(mrcMicroUsd * 12n),
    termStartMin: 0,
    termEndMin,
    billingCycle: "hourly",
    sla: TEST_SLA,
    routingLocks: Object.freeze([]),
    shedImmunityClassId: null,
    allocations: Object.freeze([]),
  });
}

/** Payroll-drip plant: 5 µ$·M opening drained by 30 × 1 µ$·M per-minute
 *  burns — free cash hits exactly 0 at minute 5, sustained guard fires at
 *  minute 14 (sustainedMin 10 builtin). Contract-free on purpose: the
 *  ledger's negative-settle FAIL-FAST (buckets.ts) means an insolvent
 *  invoice THROW is the honest economy answer — the drip plant isolates
 *  the CASH guard from invoice settlement (covered separately by the
 *  error-budget plant with a funded balance). */
export const DRIP_MONEY = Object.freeze({
  contracts: Object.freeze([] as readonly Contract[]),
  initialFreeMicroUsd: 5_000_000n,
  opex: Object.freeze(
    Array.from({ length: 30 }, (_unused, m) => Object.freeze({
      atMinute: m + 1,
      amountMicroUsd: 1_000_000n,
      memo: `payroll-${String(m + 1).padStart(2, "0")}`,
    })),
  ),
  dunningEngineOwned: true,
});

/* ─────────────────────── waves (error-budget leg) ─────────────────────── */

export const UA_PRESSURE: PressureParams = Object.freeze({
  baseMicro: 8_000_000n,
  growthNum: 223n,
  growthDen: 200n,
  sawtoothMicro: Object.freeze([1_000_000n]),
});

/** One legal wave (waves/table.ts parse laws: n sequential from 1, shares
 *  sum 100, denominations ≤2, band ∈ vocabulary). Deep-band malicious —
 *  the only units that can LAND are the ones the deep path lets through. */
export function uaWaveTable(threatId: string): unknown {
  return Object.freeze({
    id: "ua-table",
    typeBundleId: "shared-web",
    tuningSheet: "A",
    unitsPerPressurePoint: 2,
    waves: Object.freeze([
      Object.freeze({
        n: 1,
        windowMinutes: 60,
        rampMin: 10,
        plateauMin: 30,
        decayMin: 10,
        parPct: 40,
        hard: false,
        entries: Object.freeze([
          Object.freeze({
            threatId,
            role: "swarm",
            family: "malicious",
            band: "storm",
            sharePct: 100,
            denominations: Object.freeze(["concurrency"]),
            targets: Object.freeze(["web-1"]),
          }),
        ]),
      }),
    ]),
  });
}
