/**
 * unattended/fastForward.ts — the two host-forwarded seams wave-3 lanes
 * shipped engine-side and left THIS host to wire:
 *
 *   1. ATTENTION MONTH-ROLL (pipeline/attention.ts @eff5694): the seam is
 *      explicitly host-forwarded because pipeline owns no month clock. The
 *      roll grid is the business CALENDAR itself — economy's 43,200-minute
 *      monthIndexOf law applied to the host clock (kernel tick 420 lands
 *      EXACTLY on minute 43,200) — deliberately NOT `econ.monthIndex`,
 *      which a dissolved terminal no-op freezes; the calendar does not
 *      stop for a dead ledger. Each roll services the seeded pool's
 *      oldest loan via replenishAtBusinessMonth, and the host NEVER mints
 *      attention state itself. ABSENT pool ⇒ the key never materialises
 *      and the weekend is byte-identical — the full existing suite (zero
 *      re-pinned witnesses) is that proof; the report-shape proof is the
 *      absent `finalAttention` key pinned here.
 *
 *   2. PRICING OVERRIDE BOOK (economy/elasticity.ts @5781335 consuming the
 *      door book @0032a21): `GameState.pricing.overrides` rides every
 *      economy input as `EconomyTickIn.priceOverrides`; `money.priceKeys`
 *      classifies signings sparsely at registration. Absent book ⇒ the key
 *      is OMITTED per fold — the empty⇒omitted law of `refusedSettlements`
 *      (@984759b) — so quiet weekends stay byte-identical.
 *
 * Pin philosophy: the attention assertions compare PURE attention data
 * (loan ledger, debt, crossing minute) — engine-independent and drift-
 * proof. The cash literals are probe-derived (captured against this
 * engine build); the byte-identity arms are relative pairs computed IN
 * TEST, so they hold under any engine whose billing math is unchanged.
 */
import { describe, expect, it } from "vitest";
import { defaultEconomyConfig } from "../../economy/index.ts";
import {
  attentionWindowEntry,
  createAttentionState,
  replenishAtBusinessMonth,
} from "../../pipeline/index.ts";
import { encodeTaggedTree } from "../../internal/canonical.ts";
import {
  asEntityId,
  asMoney,
  type AttentionState,
  type EntityId,
  type PriceOverrideBook,
  type PriceTargetKind,
} from "../../types.ts";
import { runUnattended } from "../index.ts";
import type { UnattendedReport, RunUnattendedConfig } from "../index.ts";
import { CALM_BOARD, RULE_BOOK_HASH, UA_SEED, smallContract } from "./fixtures.ts";

/* ─────────────────────────── plants ─────────────────────────── */

/** Death dials raised past any test horizon: the calm plants carry ZERO
 *  contracts (an empty book arms the churn watch at tick 1 — see the
 *  death-forwarding lane's note), and a 430/840-tick run must witness ONLY
 *  the attention roll, never a canonical death. */
function raisedDials() {
  const base = defaultEconomyConfig();
  return Object.freeze({
    ...base,
    death: Object.freeze({
      ...base.death,
      churnCollapseSustainedDays: 1_000_000,
      floatInsolvencySustainedDays: 1_000_000,
    }),
  });
}

type MoneyCfg = NonNullable<RunUnattendedConfig["money"]>;
type Overrides = Partial<RunUnattendedConfig> & { money: MoneyCfg };

function cfg(overrides: Overrides): RunUnattendedConfig {
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

/** Funded, contract-free weekend — the economy lane still folds (roll
 *  authority) but bills nothing, so the attention lane is the ONLY thing
 *  the seeded pool can change. */
function calmMoney(): MoneyCfg {
  return Object.freeze({
    contracts: Object.freeze([]),
    initialFreeMicroUsd: 50_000_000_000n,
    cfg: raisedDials(),
  });
}

/** One hourly $0.60-net contract (mrc 720_000_000 µ$ → a cycle bills every
 *  60 business minutes ≈ every tick): the observable billedMrc channel for
 *  the pricing arms. priceKeys is SPARSE by law — absent ⇒ zero spread. */
function hourlyMoney(priceKeys?: ReadonlyMap<EntityId, string>): MoneyCfg {
  return Object.freeze({
    contracts: Object.freeze([smallContract("ctr-fwd-1", 720_000_000n, 432_000)]),
    initialFreeMicroUsd: 50_000_000n,
    ...(priceKeys === undefined ? {} : { priceKeys }),
  });
}

/** Two triage-window loans on a capacity-2 pool, minted at minute 0. The
 *  TWO-loan shape is the falsifier against EVERY roll-servicing bug: zero
 *  servicing keeps debt 2; a single service lands debt 1 with row 0 repaid
 *  (oldest-first); over-servicing (both in one roll) lands debt 0. */
function plantLoans(count: number): AttentionState {
  let state = createAttentionState(2);
  for (let i = 0; i < count; i += 1) {
    state = attentionWindowEntry(state, "triage-window", 0).state;
  }
  return state;
}

/** An in-force override book under `key` ("<kind>:<id>"). */
function book(priceMicroUsd: bigint, kind: PriceTargetKind, id: string): PriceOverrideBook {
  return Object.freeze({
    version: 1,
    overrides: Object.freeze(new Map([[`${kind}:${id}`, Object.freeze({
      targetKind: kind,
      targetId: asEntityId(id),
      newPriceMicroUsd: asMoney(priceMicroUsd),
      effectiveAtBusinessMinute: null, // null sentinel = in force now
      setAtTick: 0n,
    })]])),
  });
}

/* Mirrors death-forwarding.test.ts reportIdentity: the whole report as a
   canonical JSON string — digest, census, warns, stop, attention included. */
function reportIdentity(report: UnattendedReport): string {
  const plain = {
    runSeed: report.runSeed,
    ticksRun: report.ticksRun,
    stop: report.stop,
    finalDigest: report.finalDigest,
    perCheckpoint: report.perCheckpoint,
    summary: { ...report.summary, invoiceEvents: [...report.summary.invoiceEvents] },
    hourlyBuckets: report.hourlyBuckets,
    warns: report.warns,
    finalAttention: report.finalAttention,
  };
  return JSON.stringify(encodeTaggedTree(plain, (problem) => {
    throw new Error(`unattended report not canonical: ${String(problem.kind)}`);
  }), (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v));
}

function cashEnd(report: UnattendedReport): bigint {
  return report.summary.cashEndMicroUsd;
}

/* Business-clock math (kernel/time.ts: 43,200 business-min per 420 ticks):
   the FIRST month roll crosses at tick 420 exactly — minute floor 43200;
   tick 419 floors to 43097 (no roll). SECOND roll: tick 840 = minute 86400.
   These crossings are frozen clock arithmetic, independent of engine churn. */
const ROLL_ONE_TICKS = 430n;
const ROLL_ONE_MINUTE = 43200;
const ROLL_TWO_TICKS = 840n;
const ROLL_TWO_MINUTE = 86400;
const NO_ROLL_TICKS = 419n;

/* ─────────────────────── seam 1: attention ─────────────────────── */

describe("attention month-roll forwarding (lane @eff5694 host seam)", () => {
  it("one roll services the OLDEST loan once, stamped at the crossing minute", () => {
    const report = runUnattended(cfg({ ticks: ROLL_ONE_TICKS, money: calmMoney(), attention: plantLoans(2) }));
    expect(report.finalAttention).toEqual({
      capacity: 2,
      tokens: [
        { index: 0, busyUntilTick: 0n, busyCauseId: null },
        { index: 1, busyUntilTick: 0n, busyCauseId: null },
      ],
      debt: 1,
      loanLedger: [
        { createdAtMinute: 0, kind: "triage-window", repayAtWindow: 1, repaid: true },
        { createdAtMinute: 0, kind: "triage-window", repayAtWindow: 2, repaid: false },
      ],
      window: 2,
      lastReplenishBusinessMinute: ROLL_ONE_MINUTE,
    });
  });

  it("two rolls service both loans, oldest first, final stamp at the second crossing", () => {
    const report = runUnattended(cfg({ ticks: ROLL_TWO_TICKS, money: calmMoney(), attention: plantLoans(2) }));
    const attention = report.finalAttention;
    expect(attention).toBeDefined();
    expect(attention?.debt).toBe(0);
    expect(attention?.loanLedger.map((row) => row.repaid)).toEqual([true, true]);
    expect(attention?.lastReplenishBusinessMinute).toBe(ROLL_TWO_MINUTE);
  });

  it("off-roll weekends never touch the pool: 419 ticks leaves it byte-identical to the plant", () => {
    const planted = plantLoans(2);
    const report = runUnattended(cfg({ ticks: NO_ROLL_TICKS, money: calmMoney(), attention: planted }));
    expect(report.finalAttention).toEqual(planted);
    /* Zero replenish calls happened: the host kept the very record it was
       handed (replenishAtBusinessMonth's own false-arm is identity, but the
       lane skips calling it at all off-roll). */
    expect(report.finalAttention).toBe(planted);
    /* And the same twin PLANTED at the roll horizon differs from the
       pre-serviced shape — the servicing above was real, not a no-op: */
    expect(planted.debt).toBe(2);
    expect(replenishAtBusinessMonth(planted, ROLL_ONE_MINUTE, true).debt).toBe(1);
  });

  it("dead ledger, live calendar: a dissolved company still services its loan at the roll", () => {
    /* DEFAULT death dials + a broke, contract-free book: churn-collapse
       dissolves the company around tick ~42, and the terminal fold no-op
       PRESERVES state (econ.monthIndex freezes at 0 — exactly why a
       monthIndex-coupled lane was the bug). The business CALENDAR keeps
       rolling, so the loan is still repaid at minute 43,200. */
    const deadMoney = Object.freeze({
      contracts: Object.freeze([]),
      initialFreeMicroUsd: 0n,
    });
    const report = runUnattended(
      cfg({ ticks: ROLL_ONE_TICKS, money: deadMoney, attention: plantLoans(1) }),
    );
    expect(report.summary.invoiceEvents.get("company-dissolved")).toBe(1);
    const attention = report.finalAttention;
    expect(attention?.loanLedger.map((row) => row.repaid)).toEqual([true]);
    expect(attention?.debt).toBe(0);
    expect(attention?.lastReplenishBusinessMinute).toBe(ROLL_ONE_MINUTE);
  });

  it("absent pool ⇒ no finalAttention key and deterministic twin reports (never-minted law)", () => {
    const a = runUnattended(cfg({ ticks: ROLL_ONE_TICKS, money: calmMoney() }));
    const b = runUnattended(cfg({ ticks: ROLL_ONE_TICKS, money: calmMoney() }));
    expect("finalAttention" in a).toBe(false);
    expect(reportIdentity(a)).toBe(reportIdentity(b));
    /* digestSwitch control: a SEEDED pool moves the final digest while the
       absent pool keeps the pre-attention shape (digest.ts absorbs the
       attention block only when present). */
    const seeded = runUnattended(cfg({ ticks: ROLL_ONE_TICKS, money: calmMoney(), attention: plantLoans(2) }));
    expect(seeded.finalDigest).not.toBe(a.finalDigest);
  });
});

/* ──────────────────────── seam 2: pricing ──────────────────────── */

describe("pricing override book forwarding (lane @5781335 host seam)", () => {
  const KEYED = new Map<EntityId, string>([[asEntityId("ctr-fwd-1"), "plan:basic"]]);

  it("price keys without a book are inert: report identity equals the bare signing", () => {
    const keyed = runUnattended(cfg({ money: hourlyMoney(KEYED) }));
    const bare = runUnattended(cfg({ money: hourlyMoney() }));
    expect(reportIdentity(keyed)).toBe(reportIdentity(bare));
  });

  it("a book without keyed contracts resolves to neutral: same cash, same census", () => {
    const priced = runUnattended(cfg({ money: hourlyMoney(), pricing: book(1_440_000_000n, "plan", "basic") }));
    const bare = runUnattended(cfg({ money: hourlyMoney() }));
    expect(cashEnd(priced)).toBe(cashEnd(bare));
    expect([...priced.summary.invoiceEvents]).toEqual([...bare.summary.invoiceEvents]);
  });

  it("a keyed book with no matching contract key stays neutral", () => {
    const mismatched = runUnattended(cfg({
      money: hourlyMoney(KEYED),
      pricing: book(1_440_000_000n, "plan", "none"),
    }));
    const bare = runUnattended(cfg({ money: hourlyMoney() }));
    expect(cashEnd(mismatched)).toBe(cashEnd(bare));
  });

  it("an in-force override reaches billedMrc: cash moves, cycle census holds", () => {
    const priced = runUnattended(cfg({
      money: hourlyMoney(KEYED),
      pricing: book(1_440_000_000n, "plan", "basic"),
    }));
    const bare = runUnattended(cfg({ money: hourlyMoney() }));
    /* Settlement timing is untouched ⇒ identical event census, larger cash.
       (Cash is NOT a clean ×2: the 720M → 1.44G base doubles the GROSS,
       while per-invoice credits/fees ride their own legs — probe figures.) */
    expect([...priced.summary.invoiceEvents]).toEqual(
      [["invoice-failed", 1], ["invoice-issued", 21], ["invoice-paid", 20]],
    );
    expect(priced.summary.cashDeltaMicroUsd).toBeGreaterThan(bare.summary.cashDeltaMicroUsd);
    /* Probe-derived literals (this engine build): */
    expect(cashEnd(priced)).toBe(79556000n);
    expect(cashEnd(bare)).toBe(62078000n);
    expect(priced.finalDigest).not.toBe(bare.finalDigest);
  });
});
