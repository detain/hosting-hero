/**
 * unattended/__tests__/upkeep-fold.test.ts — the owner-commissioned
 * UPKEEP-BILLING FOLD (wave-29 spine, ruling 2026-10-19 RATIFIED; the DP
 * (i) wall of wave-28): the Policy Book pays for itself. The fold derives
 * ONE `rule-upkeep:mN` draft per business-month roll — Σ card.upkeepMicroUsd
 * (µ$/sim-minute, types.ts:775) × the window's sim-minutes — reading the
 * FULL PolicyCard docs already persisted in `GameState.ruleBook`
 * (types.ts:2672; no new persistence, no forwarding leg, no digest-schema
 * change). Floor-first: the draft rides the ordinary opex loop, posting
 * when the bankroll covers it and BOUNCING when it doesn't (witness
 * identity `<topic>:opex:rule-upkeep:mN`, the existing OPEX-REFUSED ×N
 * census and freeCashDepleted→death chain for free).
 *
 * Load-bearing arms mirrored from the Scale-warmth twin
 * (internal/__tests__/warmth-cost.test.ts @L-N3 — this leg is its shape
 * with the amount law swapped from slots×rate to upkeep×minutes):
 *  1. THE ZERO PATH — every shipped run carries an empty- or zero-upkeep
 *     book, the derivation returns null, `opexDrafts` rides BY IDENTITY,
 *     and the captured-at-`0da14b8` fastForward witnesses replay byte-ident
 *     (the zero-golden proof — replayed below at host level, not recalled).
 *  2. THE CALENDAR LAW — the roll grid is the fold's own business-month
 *     floor, NOT `econ.monthIndex` (which freezes at terminal death; the
 *     attention seam's pinned law @eff5694 mirrored — falsifier below).
 *  3. RETROACTIVE v0 — a card committed mid-month bills from the LAST
 *     ROLL, not from its commit minute (docblock names the deferred
 *     forward-charging refinement).
 *
 * Zero dice: the leg casts NO roll — the whole file's determinism is
 * arithmetic (the warmth zero-streamFor source law at
 * internal/__tests__/warmth-cost.test.ts holds over the edited file).
 *
 * Serial-safe: pure seeded engine, zero timers, IO only through the
 * drift-pin source reads (node-fs.d.ts ambient stub).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import type {
  ClockState,
  EntityId,
  GameState,
  PolicyAction,
  PolicyCard,
  Predicate,
  RunSeed,
  ScaleBook,
  ScaleEntry,
} from "../../types.ts";
import { asEntityId, asMetricId, asMoney, asRuleId, asRunSeed } from "../../types.ts";
import { fromInt } from "../../kernel/fixed.ts";
import { MICROS_PER_MIN, initialClocks } from "../../kernel/time.ts";
import { createInitialState, digestState } from "../../pipeline/index.ts";
import type { EconomyState, RefusedSettlement } from "../../economy/index.ts";
import { defaultEconomyConfig, emptyEconomyState, postEntry } from "../../economy/index.ts";
import {
  buildSample,
  collectFacts,
  createUpkeepCursor,
  createWarmthCursor,
  foldMoneyLaneTick,
  openingDraftFor,
  withCashMirror,
  type MoneyLaneTickResult,
  type MoneyLaneUpkeepCursor,
} from "../../internal/tickFold.ts";
import { runUnattended } from "../fastForward.ts";
import { DRIP_MONEY, smallContract, uaConfig } from "./fixtures.ts";

/* ═══════════════════════════ fixtures ═══════════════════════════ */

const SEED: RunSeed = asRunSeed(777n);
const TOPIC = "upkeep-test";
/** Real host cadence (the warmth fixture's law): 43,200 business minutes
 *  per month roll, first roll EXACTLY t420, expressed as exact bigint
 *  floor division so month identities land on the same grid. */
const BUSINESS_US_PER_TICK = 43_200_000_000n;
/** The forged card's rate: µ$/sim-minute (types.ts:775 doc unit). */
const UPKEEP = 25_000n;
/** One month window at host cadence = 420 sim-minutes ⇒ the witness bill
 *  is exactly 25_000n × 420n = 10_500_000n µ$. */
const BILL = UPKEEP * 420n;

function stateAt(
  minute: number,
  ruleBook?: readonly PolicyCard[],
  scale?: ScaleBook | undefined,
): GameState {
  const base = createInitialState({
    runSeed: SEED,
    engineVersion: "upkeep-fold-test",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "w29-sheets", ruleBookHash: "w29-book" },
    clocks: initialClocks(),
    ...(ruleBook === undefined ? {} : { ruleBook }),
  });
  const clocks: ClockState = Object.freeze({
    realUs: BigInt(minute) * MICROS_PER_MIN,
    simUs: BigInt(minute) * MICROS_PER_MIN,
    businessUs: (BigInt(minute) * BUSINESS_US_PER_TICK) / 7n,
    wallUs: BigInt(minute) * MICROS_PER_MIN,
  });
  return Object.freeze({
    ...base,
    context: Object.freeze({ tick: BigInt(minute), minute, clocks }),
    ...(scale !== undefined ? { scale } : {}),
  });
}

/** A minimal legal card — the gaugeCards shape (fixtures.ts) with the
 *  `for` leg optional; only `upkeepMicroUsd` matters to this leg. */
function upkeepCard(id: string, upkeepMicroUsd: bigint): PolicyCard {
  const predicate: Predicate = Object.freeze({
    metric: asMetricId("unattended-arrivals"),
    comparator: ">",
    threshold: Object.freeze({ kind: "value" as const, amount: fromInt(20), unit: "count" as const }),
  });
  const action: PolicyAction = Object.freeze({ id: "scale-out", runbookName: null, value: fromInt(2) });
  return Object.freeze({
    id: asRuleId(id),
    scope: Object.freeze({ kind: "object" as const, ref: "web-1" }),
    when: Object.freeze([predicate]),
    then: Object.freeze([action]),
    band: "execute" as const,
    upkeepMicroUsd: asMoney(upkeepMicroUsd),
  } satisfies PolicyCard);
}

function entry(reservedSlots: number, effectiveAtBusinessMinute: number | null): ScaleEntry {
  return Object.freeze({ reservedSlots, baseRosterSlots: 4, shippedAtTick: 1n, effectiveAtBusinessMinute });
}

function scaleBookOf(rows: readonly (readonly [string, ScaleEntry])[]): ScaleBook {
  return Object.freeze({ version: 1, entries: new Map<EntityId, ScaleEntry>(rows.map(([id, e]) => [asEntityId(id), e])) });
}

function fundedEcon(amountMicroUsd: bigint): EconomyState {
  const econ = emptyEconomyState();
  const posted = postEntry(econ.journal, econ.cash, openingDraftFor(TOPIC, amountMicroUsd));
  return Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
}

/** One fold call at `minute` over a hand-built cursor — the unit probe. */
function foldOnce(opts: {
  readonly minute: number;
  readonly book?: readonly PolicyCard[];
  readonly freeMicroUsd: bigint;
  readonly cursor: MoneyLaneUpkeepCursor;
  /** Forge a frozen/terminal-looking ledger month counter to prove the
   *  fold never reads it (calendar-vs-monthIndex falsifier). */
  readonly frozenMonthIndex?: number;
}): { readonly lane: MoneyLaneTickResult; readonly econ: EconomyState; readonly witness: RefusedSettlement[] } {
  const witness: RefusedSettlement[] = [];
  let econ = fundedEcon(opts.freeMicroUsd);
  if (opts.frozenMonthIndex !== undefined) {
    econ = Object.freeze({ ...econ, monthIndex: opts.frozenMonthIndex });
  }
  const lane = foldMoneyLaneTick({
    game: stateAt(opts.minute, opts.book ?? []),
    econ,
    minute: opts.minute,
    runSeed: SEED,
    cfg: defaultEconomyConfig(),
    contracts: new Map<EntityId, never>(),
    opexDrafts: [],
    upkeep: opts.cursor,
    topic: TOPIC,
    dunningEngineOwned: false,
    witness,
    outcomes: [],
  });
  return { lane, econ: lane.econ, witness };
}

interface LoopOutcome {
  readonly game: GameState;
  readonly econ: EconomyState;
  readonly upkeepEntries: readonly { readonly causeId: string; readonly deltaFree: bigint }[];
  readonly bounceTicks: number;
  readonly refusedBurnsTotal: number;
  readonly lastBounceLane: MoneyLaneTickResult | null;
  readonly cursor: MoneyLaneUpkeepCursor;
}

/** The fold-driven mini-host weekend (the warmth twin's loop): months 1–3
 *  roll at t420/t840/t1260, book injected per tick through `bookFor` (the
 *  door's `policy-card-commit` state write, mirrored), BOTH cursors minted
 *  from `game0` exactly like fastForward/scenario do. `skipUpkeep` omits
 *  the param entirely — the pre-edit twin arm (key-free absence). */
function runFoldLoop(opts: {
  readonly bookFor?: (minute: number) => readonly PolicyCard[];
  readonly scaleFor?: (minute: number) => ScaleBook | undefined;
  readonly initialFreeMicroUsd?: bigint;
  readonly authoredAt420?: { readonly amountMicroUsd: bigint; readonly memo: string };
  readonly skipUpkeep?: boolean;
  readonly totalTicks?: number;
  readonly withWarmth?: boolean;
}): LoopOutcome {
  const bookFor = opts.bookFor ?? (() => []);
  const scaleFor = opts.scaleFor ?? (() => undefined);
  const total = opts.totalTicks ?? 1300;
  const game0 = stateAt(0, bookFor(0), scaleFor(0));
  const cursor = createUpkeepCursor(game0);
  const warmth = opts.withWarmth === true ? createWarmthCursor(game0) : undefined;
  let econ = fundedEcon(opts.initialFreeMicroUsd ?? 1_000_000_000n);
  const witness: RefusedSettlement[] = [];
  let game = game0;
  let bounceTicks = 0;
  let refusedBurnsTotal = 0;
  let lastBounceLane: MoneyLaneTickResult | null = null;
  for (let m = 1; m <= total; m++) {
    game = stateAt(m, bookFor(m), scaleFor(m));
    const lane = foldMoneyLaneTick({
      game,
      econ,
      minute: m,
      runSeed: SEED,
      cfg: defaultEconomyConfig(),
      contracts: new Map<EntityId, never>(),
      opexDrafts: m === 420 && opts.authoredAt420 !== undefined
        ? [Object.freeze({ atMinute: 420, ...opts.authoredAt420 })]
        : [],
      ...(warmth === undefined ? {} : { warmth }),
      ...(opts.skipUpkeep === true ? {} : { upkeep: cursor }),
      topic: TOPIC,
      dunningEngineOwned: false,
      witness,
      outcomes: [],
    });
    econ = lane.econ;
    refusedBurnsTotal += lane.refusedBurnsThisTick;
    if (lane.opexBounces > 0) {
      bounceTicks += 1;
      lastBounceLane = lane;
    }
  }
  const upkeepEntries = econ.journal.entries
    .filter((e) => String(e.causeId).includes("rule-upkeep"))
    .map((e) => ({ causeId: String(e.causeId), deltaFree: e.delta.free ?? 0n }));
  return { game: withCashMirror(game, econ), econ, upkeepEntries, bounceTicks, refusedBurnsTotal, lastBounceLane, cursor };
}

/* ═══════════════ A. mint law — unconditional, unlike warmth ═══════════════ */

describe("createUpkeepCursor — minted unconditionally (the mid-run-book law)", () => {
  it("an EMPTY book at run start still mints the cursor; warmth stays presence-gated (the contrast)", () => {
    const game0 = stateAt(0, []);
    expect(createUpkeepCursor(game0)).toEqual({ monthCursor: 0, lastBillMinute: 0 });
    // A presence-gated upkeep mint (the warmth shape) would strand every
    // mid-run `policy-card-commit` forever — the cursor must exist BEFORE
    // the first card does:
    expect(createWarmthCursor(game0)).toBeUndefined();
  });

  it("a primed mid-quarter mint seeds the CURRENT calendar month + minute", () => {
    // m=500 rides floor(500×43200/7) = 51,428 business minutes — month 1:
    const cursor = createUpkeepCursor(stateAt(500, [upkeepCard("r-a", UPKEEP)]));
    expect(cursor.monthCursor).toBe(1);
    expect(cursor.lastBillMinute).toBe(500);
  });
});

/* ═══════════════ B. post law — Σ upkeep × the window's minutes ═══════════════ */

describe("post law — the book bills its upkeep per sim-minute", () => {
  it("25_000 µ$/min × 420 min ⇒ EXACTLY 10_500_000 µ$ at t420, opex-family causeId", () => {
    const { lane, econ } = foldOnce({
      minute: 420,
      book: [upkeepCard("r-upk", UPKEEP)],
      freeMicroUsd: 100_000_000n,
      cursor: { monthCursor: 0, lastBillMinute: 0 },
    });
    expect(lane.opexBounces).toBe(0);
    expect(lane.refusedBurnsThisTick).toBe(0);
    const causes = econ.journal.entries.map((e) => String(e.causeId));
    expect(causes).toContain(`${TOPIC}:opex:420:rule-upkeep:m1`);
    // house consistency: the opex family (`<topic>:opex:…`), NOT an
    // `economy:upkeep:` invention —
    expect(causes.filter((c) => c.includes("rule-upkeep"))).toEqual([`${TOPIC}:opex:420:rule-upkeep:m1`]);
    const bill = econ.journal.entries.find((e) => String(e.causeId).includes("rule-upkeep"));
    expect(bill?.delta.free).toBe(-BILL);
    expect(econ.cash.free).toBe(100_000_000n - BILL);
  });

  it("sums upkeepMicroUsd over EVERY card (25_000 + 750 ⇒ 25_750 × 420)", () => {
    const { econ } = foldOnce({
      minute: 420,
      book: [upkeepCard("r-a", UPKEEP), upkeepCard("r-b", 750n)],
      freeMicroUsd: 100_000_000n,
      cursor: { monthCursor: 0, lastBillMinute: 0 },
    });
    const bill = econ.journal.entries.find((e) => String(e.causeId).includes("rule-upkeep"));
    expect(bill?.delta.free).toBe(-25_750n * 420n);
  });

  it("the shipped-decks shape (0n upkeep PROVISIONAL @9948681) bills NOTHING — but the roll is still consumed", () => {
    const out = runFoldLoop({ bookFor: () => [upkeepCard("r-zero", 0n)] });
    expect(out.upkeepEntries).toEqual([]);
    // month identity AND window consumed on every roll (the warmth law):
    // zero-book months still reset the meter —
    expect(out.cursor.monthCursor).toBe(3);
    expect(out.cursor.lastBillMinute).toBe(1260);
  });
});

/* ═══════════════ C. cursor law — one charge per roll, retroactive v0 ═══════════════ */

describe("cursor law — one charge per roll; retroactive accrual from the LAST ROLL", () => {
  it("three rolls charge exactly three bills (m1/m2/m3), each the full 420-minute window", () => {
    const out = runFoldLoop({ bookFor: () => [upkeepCard("r-upk", UPKEEP)] });
    expect(out.upkeepEntries.map((e) => e.causeId)).toEqual([
      `${TOPIC}:opex:420:rule-upkeep:m1`,
      `${TOPIC}:opex:840:rule-upkeep:m2`,
      `${TOPIC}:opex:1260:rule-upkeep:m3`,
    ]);
    for (const e of out.upkeepEntries) expect(e.deltaFree).toBe(-BILL);
    expect(out.econ.cash.free).toBe(1_000_000_000n - 3n * BILL);
    expect(out.cursor.monthCursor).toBe(3);
    expect(out.bounceTicks).toBe(0);
  });

  it("commit MID-MONTH ⇒ the m2 bill covers the whole 420→840 window (retroactive to the last roll — the v0 approximation; the m1 zero-roll closed its window honestly)", () => {
    const out = runFoldLoop({ bookFor: (m) => (m >= 500 ? [upkeepCard("r-late", UPKEEP)] : []), totalTicks: 850 });
    expect(out.upkeepEntries.map((e) => e.causeId)).toEqual([`${TOPIC}:opex:840:rule-upkeep:m2`]);
    // NOT 25_000 × 340 (from commit t500) and NOT × 840 (across the passed
    // m1 window): the docblock's deferred forward-charging refinement is
    // exactly this leg, named.
    expect(out.upkeepEntries[0]?.deltaFree).toBe(-BILL);
  });
});

/* ═══════════════ D. the bounce — floor-first, refuse-not-overdraft ═══════════════ */

describe("insolvency arm — the upkeep line bounces, never overdraws", () => {
  it("10_500_000 µ$ bill vs 10_000_000 µ$ bankroll: bounce counts, cash UNMOVED, nothing POSTED", () => {
    const { lane, econ, witness } = foldOnce({
      minute: 420,
      book: [upkeepCard("r-upk", UPKEEP)],
      freeMicroUsd: 10_000_000n,
      cursor: { monthCursor: 0, lastBillMinute: 0 },
    });
    expect(lane.opexBounces).toBe(1);
    expect(lane.refusedBurnsThisTick).toBe(1);
    expect(econ.cash.free).toBe(10_000_000n);
    expect(econ.journal.entries.filter((e) => String(e.causeId).includes("rule-upkeep"))).toEqual([]);
    // the bounce pushed witness `upkeep-test:opex:rule-upkeep:mN` INTO the
    // tick's economy fold and the successful fold consumed it (`witness.
    // length = 0` — the evidence is the refusedSettlements forwarding leg);
    // the refusal's census identity is pinned at host level in the E2E
    // arm below (`OPEX-REFUSED ×N from mK`).
    expect(witness.length).toBe(0);
  });

  it("three rolls vs one clipped bankroll: one bounce per roll — no double, no silence", () => {
    const out = runFoldLoop({ bookFor: () => [upkeepCard("r-upk", UPKEEP)], initialFreeMicroUsd: 1_000_000n });
    expect(out.bounceTicks).toBe(3);
    expect(out.refusedBurnsTotal).toBe(3);
    expect(out.econ.cash.free).toBe(1_000_000n);
    expect(out.upkeepEntries).toEqual([]);
  });

  it("the refusal reaches the guardrail sample (freeCashDepleted chain input, the warmth-D2 mirror)", () => {
    const out = runFoldLoop({ bookFor: () => [upkeepCard("r-upk", UPKEEP)], initialFreeMicroUsd: 1_000_000n });
    const lane = out.lastBounceLane;
    if (lane === null) throw new Error("bounce lane vanished");
    const facts = collectFacts(out.game, { outcomes: [], ruleFirings: [], doorReceipts: [], events: [] }, lane.econ);
    const sample = buildSample(facts, [], 420n, out.game.context.clocks, lane.refusedBurnsThisTick);
    expect(sample.refusedBurns).toBe(1);
    expect(sample.metrics.get("cash.free")).toBe(1_000_000n * 65536n);
  });

  it("the calendar never freezes for a dead ledger: bills keep rolling with monthIndex FROZEN at 0 (the @eff5694 attention law, mirrored; falsifier vs econ.monthIndex)", () => {
    // A terminal company-dissolved fold no-ops and its monthIndex would
    // strand — the upkeep draft reads ONLY the business clock, pinned by
    // charging normally against a ledger frozen at monthIndex 0 while the
    // calendar crosses two rolls.
    const cursor = { monthCursor: 0, lastBillMinute: 0 };
    const m1 = foldOnce({
      minute: 420,
      book: [upkeepCard("r-upk", UPKEEP)],
      freeMicroUsd: 100_000_000n,
      cursor,
      frozenMonthIndex: 0,
    });
    expect(m1.econ.journal.entries.some((e) => String(e.causeId).includes("rule-upkeep:m1"))).toBe(true);
    const m2 = foldOnce({
      minute: 840,
      book: [upkeepCard("r-upk", UPKEEP)],
      freeMicroUsd: 100_000_000n,
      cursor, // the SAME cursor — month identity survived the frozen ledger
      frozenMonthIndex: 0,
    });
    expect(m2.econ.journal.entries.some((e) => String(e.causeId).includes("rule-upkeep:m2"))).toBe(true);
    expect(cursor.monthCursor).toBe(2);
  });
});

/* ═══════════════ E. compose order — [warmth, upkeep, authored] is FIXED ═══════════════ */

describe("compose order — the ledger's same-minute order is law", () => {
  it("source pin: warmth derives first, upkeep second, and the composition spreads warmth before upkeep before authored", () => {
    const source = readFileSync(join(process.cwd(), "src", "internal", "tickFold.ts"), "utf8");
    const i1 = source.indexOf("const warmthDraft = deriveWarmthDraft(p);");
    const i2 = source.indexOf("const upkeepDraft = deriveUpkeepDraft(p);");
    const i3 = source.indexOf("...(warmthDraft === null ? [] : [warmthDraft])");
    const i4 = source.indexOf("...(upkeepDraft === null ? [] : [upkeepDraft])");
    expect(i1).toBeGreaterThanOrEqual(0);
    expect(i2).toBeGreaterThan(i1);
    expect(i3).toBeGreaterThan(i2);
    expect(i4).toBeGreaterThan(i3);
  });

  it("behavior: warmth+m1, upkeep+m1, authored share t420 and land in THAT seq order (an order swap reddens this)", () => {
    const out = runFoldLoop({
      withWarmth: true,
      scaleFor: () => scaleBookOf([["web-1", entry(2, null)]]),
      bookFor: () => [upkeepCard("r-upk", UPKEEP)],
      authoredAt420: { amountMicroUsd: 7_000n, memo: "authored" },
      totalTicks: 430,
    });
    const causes = out.econ.journal.entries.map((e) => String(e.causeId));
    const warmthIdx = causes.indexOf(`${TOPIC}:opex:420:scale-warmth:m1`);
    const upkeepIdx = causes.indexOf(`${TOPIC}:opex:420:rule-upkeep:m1`);
    const authoredIdx = causes.indexOf(`${TOPIC}:opex:420:authored`);
    expect(warmthIdx).toBeGreaterThanOrEqual(0);
    expect(upkeepIdx).toBe(warmthIdx + 1);
    expect(authoredIdx).toBe(upkeepIdx + 1);
  });
});

/* ═══════════════ F. byte identity — the zero-golden arms ═══════════════ */

describe("byte identity — no book bill, no drift", () => {
  it("a 1,300-fold run with an EMPTY book + cursor equals the upkeep-omitted (pre-edit) twin by digest", () => {
    const cursorArm = runFoldLoop({}); // Σ0 ⇒ every roll null ⇒ identity path
    const skippedArm = runFoldLoop({ skipUpkeep: true }); // param key absent
    expect(digestState(cursorArm.game)).toBe(digestState(skippedArm.game));
    expect(cursorArm.upkeepEntries).toEqual([]);
    expect(cursorArm.refusedBurnsTotal).toBe(0);
  });

  it("a committed book is INERT until the first roll — every pre-t420 twin is digest-equal (the RUNAWAY_BOOK protection law)", () => {
    const booked = runFoldLoop({ bookFor: () => [upkeepCard("r-upk", UPKEEP)], totalTicks: 419 });
    const skipped = runFoldLoop({ bookFor: () => [upkeepCard("r-upk", UPKEEP)], totalTicks: 419, skipUpkeep: true });
    expect(digestState(booked.game)).toBe(digestState(skipped.game));
    expect(booked.upkeepEntries).toEqual([]);
  });

  it("replays the shipped fastForward witnesses captured at `0da14b8` byte-ident — the unconditional host mint changed NOTHING (the zero-golden proof)", () => {
    // Both arms ride `ruleBook: []` (uaConfig default) across the upkeep
    // cursor's live path (the funded one crosses t420/t840): the cursor
    // mutates, the fold emits nothing, the digests stand.
    const drip = runUnattended(uaConfig({ ticks: 30n, guards: [{ type: "freeCashDepleted" }], money: DRIP_MONEY }));
    expect(drip.finalDigest).toBe("406c3770ba0f867c490d068e1be54a30");
    expect(drip.summary.cashEndMicroUsd).toBe(0n);
    const funded = runUnattended(uaConfig({
      ticks: 1000n,
      money: {
        contracts: [smallContract("c-w", 100_000_000n, 100_000)],
        initialFreeMicroUsd: 50_000_000_000n,
        dunningEngineOwned: true,
      },
    }));
    expect(funded.finalDigest).toBe("f131fba4d09883f83911c031dcf40b2f");
    expect(funded.summary.cashEndMicroUsd).toBe(49920403002n);
  });

  it("the host seam LIGHTS end-to-end (fastForward mint + spread live): funded bills, broke arms OPEX-REFUSED, the zero-book twin byte-stands", () => {
    const lit = runUnattended(uaConfig({
      ticks: 500n,
      ruleBook: [upkeepCard("r-upk-e2e", UPKEEP)],
      money: { contracts: [], initialFreeMicroUsd: 50_000_000n, dunningEngineOwned: true },
    }));
    expect(lit.summary.cashEndMicroUsd).toBe(50_000_000n - BILL);
    expect(lit.warns.some((w) => w.startsWith("OPEX-REFUSED"))).toBe(false);
    const broke = runUnattended(uaConfig({
      ticks: 500n,
      ruleBook: [upkeepCard("r-upk-e2e", UPKEEP)],
      money: { contracts: [], initialFreeMicroUsd: 1_000n, dunningEngineOwned: true },
    }));
    expect(broke.summary.cashEndMicroUsd).toBe(1_000n); // refused, never overdrawn
    // the refusal census string is the ordinary opex family identity —
    // one bounce, first at the month-1 roll:
    expect(broke.warns).toContain(
      "OPEX-REFUSED ×1 from m420: the ledger refuses negative buckets — a scheduled burn could not be covered",
    );
    const zero = runUnattended(uaConfig({
      ticks: 500n,
      money: { contracts: [], initialFreeMicroUsd: 50_000_000n, dunningEngineOwned: true },
    }));
    expect(zero.finalDigest).not.toBe(lit.finalDigest); // the leg is real at the host level
  });
});

/* ═══════════════ G. ×100 full-run determinism ═══════════════ */

describe("a booked weekend ×100", () => {
  it("one hundred fresh fold-loop closures agree on the terminal digest; the upkeep-omitted twin diverges (falsifiable)", () => {
    const booked = () => digestState(runFoldLoop({ bookFor: () => [upkeepCard("r-upk", UPKEEP)] }).game);
    const digests = new Set<string>();
    for (let i = 0; i < 100; i++) digests.add(booked());
    expect(digests.size).toBe(1);
    const skipped = digestState(
      runFoldLoop({ bookFor: () => [upkeepCard("r-upk", UPKEEP)], skipUpkeep: true }).game,
    );
    expect(booked()).not.toBe(skipped);
  });
}, 120_000);

/* ═══════════════ H. import direction — the fold is the ONE mint ═══════════════ */

describe("sole upkeep mint site — import direction (proto/g5/versus cannot reach the fold)", () => {
  /** Names-only walk (the gate-g6 pattern): `.ts` files ride, dot-less
   *  entries recurse, everything else (json, tsconfigs) is skipped. */
  function sourcesUnder(dir: string): string[] {
    const out: string[] = [];
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (name.endsWith(".ts")) out.push(path);
      else if (!name.includes(".")) out.push(...sourcesUnder(path));
    }
    return out;
  }

  it("the `rule-upkeep:m${` memo grammar exists in exactly ONE non-test source: internal/tickFold.ts", () => {
    const files = sourcesUnder(join(process.cwd(), "src")).filter((f) => !f.includes("__tests__"));
    const minters = files.filter((f) => readFileSync(f, "utf8").includes("rule-upkeep:m${"));
    expect(minters).toEqual([join(process.cwd(), "src", "internal", "tickFold.ts")]);
    // The fold is INTERNAL (no package.json exports entry): a host outside
    // packages/sim-core cannot import foldMoneyLaneTick or mint a second
    // upkeep site — apps/proto's runner economy lane is immunity by
    // import direction, and this census reddens the day anyone copies the
    // memo grammar into a third fold (the NO-THIRD-COPY header law).
  });

  it("both fold hosts mint the cursor from game0 and forward it plainly (exactly one mint + one spread each)", () => {
    const ff = readFileSync(join(process.cwd(), "src", "unattended", "fastForward.ts"), "utf8");
    const sc = readFileSync(join(process.cwd(), "src", "scenario", "runner.ts"), "utf8");
    expect(ff.match(/createUpkeepCursor\(game0\)/g)?.length).toBe(1);
    expect(sc.match(/createUpkeepCursor\(game0\)/g)?.length).toBe(1);
    expect(ff.match(/upkeep: upkeepCursor,/g)?.length).toBe(1);
    expect(sc.match(/upkeep: upkeepCursor,/g)?.length).toBe(1);
  });
});
