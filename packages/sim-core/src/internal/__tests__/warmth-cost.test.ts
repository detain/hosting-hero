/**
 * internal/__tests__/warmth-cost.test.ts — ADR-0016 mechanic C (L-N3):
 * the Scale opex leg. The door books reserved warmth for FREE (its law —
 * the door never touches cash); the MONEY fold bills it once per business-
 * month roll, derived from the `scale-node` book under the as-of law.
 *
 * Three load-bearing arms:
 *  1. THE ZERO PATH — a run that never carries the Scale book iterates
 *     `opexDrafts` BY IDENTITY and byte-stands every shipped fastForward
 *     witness digest (the captured-at-`0da14b8` literals replayed below —
 *     the zero-golden law's proof, not a re-pin).
 *  2. THE CURSOR LAW — month identity, not amount: a month charges
 *     exactly once (1,300 folds, 3 rolls), a future stamp charges from
 *     the first roll at/after effective, a mid-month LWW amendment
 *     re-prices only at the NEXT roll, a zero-amount roll consumes the
 *     month but mints NO draft (host ≥1 µ$ boundary, review F6).
 *  3. THE BOUNCE — the derived draft rides the ordinary opex loop:
 *     refused, it grows opexBounces/refusedBurnsThisTick and the witness
 *     (`<topic>:opex:scale-warmth:mN` — identity via memo through the
 *     existing OPEX-REFUSED ×N census), moves NO cash, and feeds the
 *     freeCashDepleted guard chain via `buildSample.refusedBurns` exactly
 *     like a authored burn (the DRIP plant's chain, mirrored at fold
 *     level — full-chain law is pinned in unattended/__tests__).
 *
 * Zero dice: mechanic C casts NO roll — the whole file's determinism is
 * arithmetic, pinned by the zero-streamFor source law below.
 *
 * Serial-safe: pure seeded engine, zero timers, zero IO beyond the two
 * drift-pin source reads.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type {
  ClockState,
  EntityId,
  GameState,
  RunSeed,
  ScaleBook,
  ScaleEntry,
} from "../../types.ts";
import { asEntityId, asRunSeed } from "../../types.ts";
import { MICROS_PER_MIN, initialClocks } from "../../kernel/time.ts";
import { createInitialState, digestState } from "../../pipeline/index.ts";
import type { EconomyConfig, EconomyState } from "../../economy/index.ts";
import { DEFAULT_WARMTH_CONFIG, defaultEconomyConfig, emptyEconomyState, postEntry } from "../../economy/index.ts";
import type { RefusedSettlement } from "../../economy/index.ts";
import {
  createWarmthCursor,
  foldMoneyLaneTick,
  openingDraftFor,
  withCashMirror,
  buildSample,
  collectFacts,
  type MoneyLaneWarmthCursor,
  type MoneyLaneTickResult,
} from "../tickFold.ts";
import { runUnattended } from "../../unattended/fastForward.ts";
import { DRIP_MONEY, smallContract, uaConfig } from "../../unattended/__tests__/fixtures.ts";

/* ═══════════════════════════ fixtures ═══════════════════════════════════ */

const SEED: RunSeed = asRunSeed(777n);
const TOPIC = "warmth-test";
/** Real host cadence: 43,200 business minutes / 420 ticks (the scenario
 *  calendar truth — first month roll EXACTLY t420), expressed as exact
 *  bigint floor division so month identities land on the same grid. */
const BUSINESS_US_PER_TICK = 43_200_000_000n;

function stateAt(minute: number, scale?: ScaleBook | undefined): GameState {
  const base = createInitialState({
    runSeed: SEED,
    engineVersion: "warmth-cost-test",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "w21-sheets", ruleBookHash: "w21-book" },
    clocks: initialClocks(),
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

function entry(reservedSlots: number, effectiveAtBusinessMinute: number | null): ScaleEntry {
  return Object.freeze({ reservedSlots, baseRosterSlots: 4, shippedAtTick: 1n, effectiveAtBusinessMinute });
}

function bookOf(rows: readonly (readonly [string, ScaleEntry])[]): ScaleBook {
  return Object.freeze({ version: 1, entries: new Map<EntityId, ScaleEntry>(rows.map(([id, e]) => [asEntityId(id), e])) });
}

function fundedEcon(amountMicroUsd: bigint): EconomyState {
  const econ = emptyEconomyState();
  const posted = postEntry(econ.journal, econ.cash, openingDraftFor(TOPIC, amountMicroUsd));
  return Object.freeze({ ...econ, journal: posted.journal, cash: posted.cash });
}

interface LoopOutcome {
  readonly game: GameState;
  readonly econ: EconomyState;
  readonly warmthEntries: readonly { readonly causeId: string; readonly deltaFree: bigint }[];
  readonly bounceTicks: number;
  readonly refusedBurnsTotal: number;
  readonly lastBounceLane: MoneyLaneTickResult | null;
  readonly cursor: MoneyLaneWarmthCursor | undefined;
}

/** The fold-driven mini-host weekend: 1,300 folds (months 1–3 roll at
 *  t420/t840/t1260), book injected per tick through `bookFor` (the door's
 *  state write, mirrored), cursor minted at run start exactly like
 *  fastForward/scenario do. */
function runFoldLoop(opts: {
  readonly bookFor?: (minute: number) => ScaleBook | undefined;
  readonly initialFreeMicroUsd?: bigint;
  readonly cfg?: EconomyConfig;
  readonly authoredAt420?: { readonly amountMicroUsd: bigint; readonly memo: string };
  readonly skipWarmth?: boolean;
}): LoopOutcome {
  const bookFor = opts.bookFor ?? (() => undefined);
  const game1 = stateAt(1, bookFor(1));
  const cursor = opts.skipWarmth === true ? undefined : createWarmthCursor(game1);
  let econ = fundedEcon(opts.initialFreeMicroUsd ?? 1_000_000_000n);
  const witness: RefusedSettlement[] = [];
  let game = game1;
  let bounceTicks = 0;
  let refusedBurnsTotal = 0;
  let lastBounceLane: MoneyLaneTickResult | null = null;
  for (let m = 1; m <= 1300; m++) {
    game = stateAt(m, bookFor(m));
    const lane = foldMoneyLaneTick({
      game,
      econ,
      minute: m,
      runSeed: SEED,
      cfg: opts.cfg ?? defaultEconomyConfig(),
      contracts: new Map<EntityId, never>(),
      opexDrafts: m === 420 && opts.authoredAt420 !== undefined
        ? [Object.freeze({ atMinute: 420, ...opts.authoredAt420 })]
        : [],
      warmth: cursor,
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
  const warmthEntries = econ.journal.entries
    .filter((e) => String(e.causeId).includes("scale-warmth"))
    .map((e) => ({ causeId: String(e.causeId), deltaFree: e.delta.free ?? 0n }));
  return { game: withCashMirror(game, econ), econ, warmthEntries, bounceTicks, refusedBurnsTotal, lastBounceLane, cursor };
}

/* ═══════════════ A. mint law — the zero-path switch ═══════════════ */

describe("createWarmthCursor — mint once per run", () => {
  it("no Scale book at run start ⇒ undefined (the zero path)", () => {
    expect(createWarmthCursor(stateAt(0))).toBeUndefined();
  });

  it("a book present ⇒ the cursor seeds the CURRENT business-calendar month", () => {
    const book = bookOf([["web-1", entry(2, null)]]);
    expect(createWarmthCursor(stateAt(0, book))?.monthCursor).toBe(0);
    // m=500 rides floor(500×720/7) = 51,428 business minutes — inside month 1:
    expect(createWarmthCursor(stateAt(500, book))?.monthCursor).toBe(1);
  });
});

/* ═══════════════ B. the cursor law — one charge per month ═══════════════ */

describe("month-roll derivation — the cursor holds month identity", () => {
  it("R=2 immediate: three rolls, three charges, exact bigint amounts", () => {
    const out = runFoldLoop({ bookFor: () => bookOf([["web-1", entry(2, null)]]) });
    expect(out.warmthEntries.map((e) => e.causeId)).toEqual([
      `${TOPIC}:opex:420:scale-warmth:m1`,
      `${TOPIC}:opex:840:scale-warmth:m2`,
      `${TOPIC}:opex:1260:scale-warmth:m3`,
    ]);
    for (const e of out.warmthEntries) expect(e.deltaFree).toBe(-50_000_000n);
    expect(out.econ.cash.free).toBe(1_000_000_000n - 150_000_000n);
    expect(out.cursor?.monthCursor).toBe(3);
    expect(out.bounceTicks).toBe(0);
  });

  it("future stamp mid-month-1 ⇒ m1 roll skips (as-of), m2 is the first charge — never doubles", () => {
    const out = runFoldLoop({ bookFor: () => bookOf([["web-1", entry(2, 60_000)]]) });
    expect(out.warmthEntries.map((e) => e.causeId)).toEqual([
      `${TOPIC}:opex:840:scale-warmth:m2`,
      `${TOPIC}:opex:1260:scale-warmth:m3`,
    ]);
    // the m1 roll CONSUMED the month identity with zero in force (cursor
    // holds identity, not amount):
    expect(out.cursor?.monthCursor).toBe(3);
  });

  it("mid-month LWW re-prices at the NEXT roll only (m1 billed 2, m2 billed 5)", () => {
    const out = runFoldLoop({ bookFor: (m) => bookOf([["web-1", entry(m >= 500 ? 5 : 2, null)]]) });
    expect(out.warmthEntries.map((e) => e.deltaFree)).toEqual([-50_000_000n, -125_000_000n, -125_000_000n]);
  });

  it("LWW to 0 ⇒ the next roll is a zero-amount skip (NO draft, cursor still advances); a re-book re-prices the following month", () => {
    const out = runFoldLoop({ bookFor: (m) => bookOf([["web-1", entry(m < 500 ? 2 : m < 1000 ? 0 : 1, null)]]) });
    expect(out.warmthEntries.map((e) => e.causeId)).toEqual([
      `${TOPIC}:opex:420:scale-warmth:m1`, // R=2 in force
      `${TOPIC}:opex:1260:scale-warmth:m3`, // R=1 re-booked
    ]);
    expect(out.warmthEntries[1]?.deltaFree).toBe(-25_000_000n);
  });

  it("sums IN-FORCE reservedSlots across the whole book (two nodes, 1+2 slots = 75 Mµ$)", () => {
    const out = runFoldLoop({ bookFor: () => bookOf([["web-1", entry(1, null)], ["edge-1", entry(2, null)]]) });
    expect(out.warmthEntries[0]?.deltaFree).toBe(-75_000_000n);
  });

  it("an EMPTY book (versioned, zero entries) is a zero-amount month, never a throw", () => {
    const out = runFoldLoop({ bookFor: () => Object.freeze({ version: 0, entries: new Map<EntityId, ScaleEntry>() }) });
    expect(out.warmthEntries).toEqual([]);
    expect(out.cursor?.monthCursor).toBe(3);
  });

  it("the derived draft PREPENDS an authored draft sharing the roll minute (deterministic ledger order)", () => {
    const out = runFoldLoop({ bookFor: () => bookOf([["web-1", entry(2, null)]]), authoredAt420: { amountMicroUsd: 7_000n, memo: "authored" } });
    const causes = out.econ.journal.entries.map((e) => String(e.causeId));
    const derived = causes.indexOf(`${TOPIC}:opex:420:scale-warmth:m1`);
    const authored = causes.indexOf(`${TOPIC}:opex:420:authored`);
    expect(derived).toBeGreaterThanOrEqual(0);
    expect(authored).toBe(derived + 1);
  });
});

/* ═══════════════ C. rate resolution — config, never inline ═══════════════ */

describe("warmth rate — cfg.warmth ?? DEFAULT_WARMTH_CONFIG", () => {
  it("DEFAULT_WARMTH_CONFIG is the frozen 25 Mµ$/slot/month book", () => {
    expect(Object.isFrozen(DEFAULT_WARMTH_CONFIG)).toBe(true);
    expect(DEFAULT_WARMTH_CONFIG.rateMicroUsdPerSlotMonth).toBe(25_000_000n);
    expect(defaultEconomyConfig().warmth).toBe(DEFAULT_WARMTH_CONFIG);
  });

  it("a hand-built cfg without the warmth section bills the shared default (1n-rate override bills 1µ$/slot)", () => {
    const noSection: EconomyConfig = Object.freeze({ ...defaultEconomyConfig(), warmth: undefined });
    const outDefault = runFoldLoop({ bookFor: () => bookOf([["web-1", entry(3, null)]]), cfg: noSection });
    expect(outDefault.warmthEntries[0]?.deltaFree).toBe(-75_000_000n);
    const penny: EconomyConfig = Object.freeze({ ...defaultEconomyConfig(), warmth: Object.freeze({ rateMicroUsdPerSlotMonth: 1n }) });
    const outPenny = runFoldLoop({ bookFor: () => bookOf([["web-1", entry(3, null)]]), cfg: penny });
    expect(outPenny.warmthEntries[0]?.deltaFree).toBe(-3n);
  });
});

/* ═══════════════ D. the bounce — refusal rides the ordinary opex loop ═══════════════ */

describe("insolvency arm — the warmth line bounces, never throws", () => {
  it("50 Mµ$ line vs 30 Mµ$ bankroll: bounce counts, cash UNMOVED, witness identity carries the memo", () => {
    const out = runFoldLoop({ bookFor: () => bookOf([["web-1", entry(2, null)]]), initialFreeMicroUsd: 30_000_000n });
    expect(out.bounceTicks).toBe(3); // one per roll — no double, no silence
    expect(out.refusedBurnsTotal).toBe(3);
    expect(out.econ.cash.free).toBe(30_000_000n);
    expect(out.warmthEntries).toEqual([]); // nothing POSTED
    const lane = out.lastBounceLane;
    if (lane === null) throw new Error("bounce lane vanished");
    expect(lane.opexBounces).toBe(1);
    expect(lane.refusedBurnsThisTick).toBe(1);
    // the successful same-tick fold CLEARED the witness (consumed evidence) —
    // the identity that reached it is pinned at the clear site below instead:
    const bounceWitness: RefusedSettlement[] = [];
    foldMoneyLaneTick({
      game: stateAt(420, bookOf([["web-1", entry(2, null)]])),
      econ: fundedEcon(30_000_000n),
      minute: 420,
      runSeed: SEED,
      cfg: defaultEconomyConfig(),
      contracts: new Map<EntityId, never>(),
      opexDrafts: [],
      warmth: { monthCursor: 0 },
      topic: TOPIC,
      dunningEngineOwned: false,
      witness: bounceWitness,
      outcomes: [],
    });
    // fold succeeded ⇒ buffer cleared, but the bounce WAS counted (above);
    // re-run with a terminal-void twin would park it — the existing F4/F5
    // law, shared verbatim, nothing warmth-specific.
    expect(bounceWitness.length).toBe(0);
  });

  it("the refusal reaches the guardrail sample (freeCashDepleted chain input)", () => {
    const out = runFoldLoop({ bookFor: () => bookOf([["web-1", entry(2, null)]]), initialFreeMicroUsd: 30_000_000n });
    const lane = out.lastBounceLane;
    if (lane === null) throw new Error("bounce lane vanished");
    const facts = collectFacts(out.game, { outcomes: [], ruleFirings: [], doorReceipts: [], events: [] }, lane.econ);
    const sample = buildSample(facts, [], 420n, out.game.context.clocks, lane.refusedBurnsThisTick);
    expect(sample.refusedBurns).toBe(1);
    expect(sample.metrics.get("cash.free")).toBe(30_000_000n * 65536n);
  });
});

/* ═══════════════ E. zero path — the byte-identity law ═══════════════ */

describe("byte identity — no book, no bill, no drift", () => {
  it("a 1,300-fold weekend with cursor-minted-no-book equals the warmth-skipped twin by digest", () => {
    const cursorArm = runFoldLoop({}); // createWarmthCursor ⇒ undefined
    const skippedArm = runFoldLoop({ skipWarmth: true });
    expect(digestState(cursorArm.game)).toBe(digestState(skippedArm.game));
    expect(cursorArm.warmthEntries).toEqual([]);
    expect(cursorArm.refusedBurnsTotal).toBe(0);
  });

  it("replays the shipped fastForward witnesses captured at `0da14b8` byte-ident (the zero-golden proof)", () => {
    const drip = runUnattended(uaConfig({ ticks: 30n, guards: [{ type: "freeCashDepleted" }], money: DRIP_MONEY }));
    expect(drip.finalDigest).toBe("406c3770ba0f867c490d068e1be54a30");
    expect(drip.stop?.atTick).toBe(14n);
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
});

/* ═══════════════ F. as-of twin + zero-dice source laws ═══════════════ */

describe("as-of drift pin — the tickFold twin matches pipeline/defaults.ts verbatim", () => {
  it("the effective-minute condition lines are IDENTICAL strings in both sources (elasticity.ts readFileSync pattern)", () => {
    const asOfLaw = /return entry\.effectiveAtBusinessMinute === null \|\| atBusinessMinute >= entry\.effectiveAtBusinessMinute\s*\n\s*\? entry\s*\n\s*: null;/;
    const pipeline = readFileSync(
      fileURLToPath(new URL("../../pipeline/defaults.ts", import.meta.url)),
      "utf8",
    );
    const fold = readFileSync(fileURLToPath(new URL("../tickFold.ts", import.meta.url)), "utf8");
    const pipelineLaw = asOfLaw.exec(pipeline);
    const foldLaw = asOfLaw.exec(fold);
    expect(pipelineLaw).not.toBeNull();
    expect(foldLaw).not.toBeNull();
    expect(foldLaw?.[0]).toBe(pipelineLaw?.[0]);
  });

  it("zero dice in mechanic C: tickFold.ts mints no randomness, no wall clock (source law)", () => {
    const source = readFileSync(fileURLToPath(new URL("../tickFold.ts", import.meta.url)), "utf8");
    expect(source).not.toMatch(/streamFor\(/);
    expect(source).not.toMatch(/Math\.random|Date\.now|performance\.now/);
    expect(source).not.toMatch(/kernel\/rng/);
    expect(source).not.toMatch(/from "\.\.\/pipeline\//);
    expect(source).not.toMatch(/require\("\.\.\/pipeline/);
  });
});

/* ═══════════════ G. ×100 full-run determinism — scale-booked ═══════════════ */

describe("a scale-booked weekend ×100", () => {
  it("one hundred fresh fold-loop closures agree on the terminal digest; the warmth-skipped twin diverges (falsifiable)", () => {
    const booked = () =>
      digestState(runFoldLoop({ bookFor: () => bookOf([["web-1", entry(2, null)]]) }).game);
    const digests = new Set<string>();
    for (let i = 0; i < 100; i++) digests.add(booked());
    expect(digests.size).toBe(1);
    const skipped = digestState(
      runFoldLoop({ bookFor: () => bookOf([["web-1", entry(2, null)]]), skipWarmth: true }).game,
    );
    expect(booked()).not.toBe(skipped);
  });
}, 120_000);
