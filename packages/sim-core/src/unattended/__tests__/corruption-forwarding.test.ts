/**
 * unattended/__tests__/corruption-forwarding.test.ts — the §1.7 host-wiring
 * debt review recorded at 16c6add: `corruptionOutageSecs` shipped as a
 * public pipeline adapter with ZERO production callers. This file pins the
 * two legs of the closure:
 *
 *  1. THE ARITHMETIC (foldMoneyLaneTick, the shared money-lane fold both
 *     hosts drive): the corruption fan and the landed fan burn the SAME
 *     EconomyTickIn.outageSecs channel, seconds ADDING per contract; an
 *     absent/null fan merges to the landed fan BY IDENTITY (the
 *     default-off byte-identity law).
 *
 *  2. THE WIRING (runUnattended end-to-end): a planted `corrupts` board
 *     actually burns the error budget through the host — witnessed by the
 *     sparse `report.finalErrorBudgetMinSec` and an error-budget guard that
 *     can ONLY fire once the drain reaches the economy. The unplanted twin
 *     (same config, seam key omitted vs explicitly undefined) must produce
 *     byte-identical digests and never move the budget — the identity
 *     proof the brief demands.
 *
 * Serial-safe: pure seeded engine, zero timers, zero IO.
 */
import { describe, expect, it } from "vitest";
import { asCauseId, asEntityId, type Contract, type EntityId } from "../../types.ts";
import { FIXED_ONE, fromInt } from "../../kernel/fixed.ts";
import { MICROS_PER_MIN, initialClocks } from "../../kernel/time.ts";
import { createInitialState, corruptionOutageSecs } from "../../pipeline/index.ts";
import {
  defaultEconomyConfig,
  emptyEconomyState,
  postEntry,
  registerContractEconomy,
  remainingSec,
} from "../../economy/index.ts";
import { DEFAULT_REVENUE_TAGS, foldMoneyLaneTick, openingDraftFor } from "../../internal/tickFold.ts";
import { runUnattended, type RunUnattendedConfig } from "../fastForward.ts";
import { smallContract, UA_SEED } from "./fixtures.ts";

/* ═══════════════════ 1. fold arithmetic (shared money lane) ═══════════════════ */

const CORRUPT_CONTRACT: Contract = smallContract("c-corr", 100_000_000n, 100_000);

function mintFoldFixture(): {
  game: ReturnType<typeof createInitialState>;
  econ: ReturnType<typeof registerContractEconomy>;
  book: Map<EntityId, Contract>;
  cfg: ReturnType<typeof defaultEconomyConfig>;
} {
  const base = createInitialState({
    runSeed: UA_SEED,
    engineVersion: "corruption-forwarding-test",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "ua-test-sheets", ruleBookHash: "ua-test-book" },
    clocks: initialClocks(),
  });
  // Mirror the host loop's cadence: the fold runs AFTER driver.advance, on a
  // state whose minute has moved (economy guards monotonic ticks).
  const game = Object.freeze({ ...base, context: Object.freeze({ ...base.context, minute: 1 }) });
  const cfg = defaultEconomyConfig();
  const book = new Map<EntityId, Contract>([[CORRUPT_CONTRACT.id, CORRUPT_CONTRACT]]);
  let econ = registerContractEconomy(
    emptyEconomyState(),
    {
      contract: CORRUPT_CONTRACT,
      atBusinessMin: 0,
      clauseRefs: [],
      grandfather: null,
      revenueTags: DEFAULT_REVENUE_TAGS,
      commitmentBps: 9_990n,
    },
    cfg,
  );
  // Funded like every host money lane (opening entry) — an unfunded fold
  // voids on the F4 negative-bucket law and would hide the drain.
  const posted = postEntry(econ.journal, econ.cash, openingDraftFor("corr-test", 50_000_000_000n));
  econ = Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
  return { game, econ, book, cfg };
}

function foldWith(opts: {
  corruptionOutageSecs?: ReadonlyMap<EntityId, bigint> | null;
  landed?: number;
}): { drained: bigint; remaining: bigint } {
  const { game, econ, book, cfg } = mintFoldFixture();
  const outcomes = Array.from({ length: opts.landed ?? 0 }, () => ({ terminal: "landed" as const }));
  const lane = foldMoneyLaneTick({
    game,
    econ,
    minute: 1,
    runSeed: UA_SEED,
    cfg,
    contracts: book,
    opexDrafts: [],
    topic: "corr-test",
    dunningEngineOwned: false,
    witness: [],
    outcomes,
    ...(opts.corruptionOutageSecs !== undefined
      ? { corruptionOutageSecs: opts.corruptionOutageSecs }
      : {}),
  });
  const budget = lane.econ.errorBudgets.get(asEntityId("c-corr"));
  if (budget === undefined) throw new Error("fixture lost its budget");
  return { drained: budget.drainedSec, remaining: remainingSec(budget) };
}

describe("foldMoneyLaneTick — corruption fan merges onto the landed fan (@16c6add host debt)", () => {
  it("no fan, no landed ⇒ the budget is untouched (2592 s at 99.9 %)", () => {
    expect(foldWith({}).remaining).toBe(2592n);
    expect(foldWith({}).drained).toBe(0n);
  });

  it("explicit null fan folds byte-equivalent to the key being absent", () => {
    expect(foldWith({ corruptionOutageSecs: null }).drained).toBe(0n);
  });

  it("the corruption adapter output burns exactly 60 s × corruptions", () => {
    const fan = corruptionOutageSecs(
      [1, 2].map((i) => ({
        unitId: asEntityId(`u-${String(i)}`),
        atUs: 0n,
        causeId: asCauseId(`corr:u-${String(i)}`),
      })),
      new Map([[CORRUPT_CONTRACT.id, CORRUPT_CONTRACT]]),
    );
    expect(fan).not.toBeNull();
    const fold = foldWith({ corruptionOutageSecs: fan });
    expect(fold.drained).toBe(120n);
    expect(fold.remaining).toBe(2592n - 120n);
  });

  it("landed AND corrupted ticks ADD on the same channel", () => {
    const fan = new Map<EntityId, bigint>([[CORRUPT_CONTRACT.id, 120n]]);
    expect(foldWith({ corruptionOutageSecs: fan, landed: 1 }).drained).toBe(180n);
    expect(foldWith({ landed: 1 }).drained).toBe(60n);
  });
});

/* ══════════════════════ 2. runUnattended end-to-end ══════════════════════════ */

/** One-slot, 60 s-service node at 6 arrivals/min: the corruption.test.ts
 *  saturation shape — every queued unit exhausts its 3-minute patience
 *  budget while the pipe serves one unit per minute. */
const CONGESTED_BOARD = {
  nodes: [
    { id: "web-1", slots: 1, serviceTimeUs: MICROS_PER_MIN, inspectionDepth: "inspect" as const },
  ],
};

const BASELINE_TABLE_ID = "unattended-baseline";

function corrConfig(overrides: Partial<RunUnattendedConfig> = {}): RunUnattendedConfig {
  return {
    runSeed: UA_SEED,
    ticks: 30n,
    board: CONGESTED_BOARD,
    ruleBook: [],
    ruleBookHash: "ua-test-book",
    guards: [],
    traffic: { baselineRatePerMin: fromInt(6), tableId: BASELINE_TABLE_ID },
    defaultPatienceMin: 3,
    money: {
      contracts: [smallContract("c-corr", 100_000_000n, 100_000)],
      initialFreeMicroUsd: 50_000_000_000n,
    },
    ...overrides,
  } as RunUnattendedConfig;
}

function corruptedCellCount(report: ReturnType<typeof runUnattended>): number {
  let cells = 0;
  for (const key of report.finalObserved.keys()) {
    if (key.endsWith("::corruptedCount")) cells += 1;
  }
  return cells;
}

/** Full Fixed sample of the pristine budget: 2592 s × 65536 — a `lt` guard
 *  at this value breaches the instant ANY outage second lands. */
const ANY_DRAIN_FIXED = 2592n * FIXED_ONE;

describe("runUnattended — corruption outages reach the error budget (host wiring)", () => {
  it("planted `corrupts`: cells burn, budget drains, the guard halts", () => {
    const report = runUnattended(corrConfig({
      patienceModeByType: { [BASELINE_TABLE_ID]: "corrupts" },
      guards: [{ type: "threshold", metric: "errorBudgetSec", comparator: "lt", value: ANY_DRAIN_FIXED, sustainedMin: 1 }],
    }));
    const cells = corruptedCellCount(report);
    expect(cells).toBeGreaterThan(0);
    // inspect depth keeps this board landing-free, but the identity test
    // below counts BOTH fans, so no assumption rides on it.
    expect(report.finalErrorBudgetMinSec).toBeDefined();
    const burned = 2592n - (report.finalErrorBudgetMinSec ?? 2592n);
    expect(burned).toBeGreaterThan(0n);
    // The guard can only fire once the drain reaches the ECONOMY — the
    // proof the adapter's output is consumed, not just computed.
    expect(report.stop).not.toBeNull();
    expect(report.stop?.triggered[0]?.verdict).toBe("triggered");
  });

  it("the burned seconds equal 60 × (corruptions + landings) exactly", () => {
    const report = runUnattended(corrConfig({
      patienceModeByType: { [BASELINE_TABLE_ID]: "corrupts" },
    }));
    const burned = 2592n - (report.finalErrorBudgetMinSec ?? 2592n);
    expect(burned).toBe(60n * (BigInt(corruptedCellCount(report)) + BigInt(report.summary.landed)));
  });

  it("unplanted twin: no cells, budget untouched, no halt — and omitted vs explicit-undefined are byte-identical", () => {
    const twinAbsent = runUnattended(corrConfig());
    const twinUndefined = runUnattended(corrConfig({ patienceModeByType: undefined }));
    const cells = corruptedCellCount(twinAbsent);
    expect(cells).toBe(0);
    // Unarmed board: only the landed fan can move the budget (the pre-@16c6add
    // law, now stated as an identity instead of a lucky zero).
    expect(twinAbsent.finalErrorBudgetMinSec).toBe(2592n - 60n * BigInt(twinAbsent.summary.landed));
    expect(twinAbsent.stop).toBeNull();
    expect(twinUndefined.finalDigest).toBe(twinAbsent.finalDigest);
    // The armed board WITHOUT the guard still runs the full 30 ticks.
    const planted = runUnattended(corrConfig({
      patienceModeByType: { [BASELINE_TABLE_ID]: "corrupts" },
    }));
    expect(planted.stop).toBeNull(); // no guards armed ⇒ no halt, honest
    expect(planted.finalErrorBudgetMinSec).toBeLessThan(2592n);
  });

  it("the seam is inert when it names no arriving type", () => {
    const inert = runUnattended(corrConfig({ patienceModeByType: { "no-such-type": "corrupts" } }));
    expect(corruptedCellCount(inert)).toBe(0);
    expect(inert.finalErrorBudgetMinSec).toBe(2592n - 60n * BigInt(inert.summary.landed));
  });
});
