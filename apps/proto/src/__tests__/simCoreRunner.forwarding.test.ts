/**
 * apps/proto/src/runner/simCoreRunner.ts — the two host-forwarded seams,
 * proto side (mirrors unattended/host-forwarding.test.ts on fastForward):
 *
 *   1. ATTENTION MONTH-ROLL (@eff5694): options.attention seeds the pool
 *      through createInitialState's own gate; every business-month roll the
 *      economy fold advances services the oldest loan via
 *      replenishAtBusinessMonth. Default runners NEVER mint (accessor
 *      stays undefined through the roll) — the byte-identity law the
 *      existing determinism suite already witnesses.
 *
 *   2. PRICING OVERRIDE BOOK (@5781335 + door @0032a21): options.priceKeys
 *      classifies signings sparsely; the book rides GameState.pricing —
 *      seeded via options OR materialized by the REAL adjust-price door
 *      verb — and forwards as EconomyTickIn.priceOverrides every fold.
 *      Absent ⇒ key omitted (empty⇒omitted law @984759b); the shipped
 *      cash goldens in simCoreRunner.test.ts are the absent-state proof.
 *
 * Pin philosophy: attention comparisons use PURE attention data (engine-
 * independent); the pricing arms are relative pairs (inert twins must emit
 * identical frames) plus probe-derived cash literals for the live arm.
 */
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import {
  attentionWindowEntry,
  createAttentionState,
} from "@hh/sim-core/pipeline";
import {
  asEntityId,
  asMoney,
  type AttentionState,
  type EntityId,
  type PlayerIntent,
  type PlayerVerbArgs,
  type PriceOverrideBook,
} from "@hh/sim-core/types";
import { encodeProjection, type SimProjection } from "../shared/protocol";
import { SimCoreRunner } from "../runner/index";

/* ─────────────────────────── plants ─────────────────────────── */

function plantLoans(count: number): AttentionState {
  let state = createAttentionState(2);
  for (let i = 0; i < count; i += 1) {
    state = attentionWindowEntry(state, "triage-window", 0).state;
  }
  return state;
}

/** The runner's hourly contract classified under the sku namespace. */
const HOURLY_KEYS = new Map<EntityId, string>([
  [asEntityId("ctr-hourly-1"), "sku:hourly-smb"],
]);

function bookFromDoorStyle(priceMicroUsd: bigint, kind: "plan" | "contract-class" | "sku", id: string): PriceOverrideBook {
  return Object.freeze({
    version: 1,
    overrides: Object.freeze(new Map([[`${kind}:${id}`, Object.freeze({
      targetKind: kind,
      targetId: asEntityId(id),
      newPriceMicroUsd: asMoney(priceMicroUsd),
      effectiveAtBusinessMinute: null,
      setAtTick: 0n,
    })]])),
  });
}

function verbIntent(seq: number, args: Readonly<Record<string, string | number | bigint | null>>): PlayerIntent {
  return {
    seq,
    clock: "sim",
    atUs: 0n,
    origin: "player",
    payload: { kind: "player-verb", args: args as unknown as PlayerVerbArgs },
  };
}

/** Step a fresh runner N times, returning every frame digest. */
function runFrames(options: ConstructorParameters<typeof SimCoreRunner>[0], ticks: number): SimProjection[] {
  const runner = new SimCoreRunner(options);
  const frames: SimProjection[] = [];
  for (let i = 0; i < ticks; i += 1) frames.push(runner.headlessStep(10));
  runner.stop();
  return frames;
}

function frame(projection: SimProjection): string {
  return canonicalDigest(encodeProjection(projection));
}

/* Business clock (kernel/time.ts): one 43,200-minute month crosses at tick
   420 exactly; tick 419 floors to 43,097 (no roll). Frozen arithmetic —
   engine-drift-proof pins for the attention arms. */
const PRE_ROLL_STEPS = 419;
const POST_ROLL_STEPS = 421;
const CROSSING_MINUTE = 43200;

/* ─────────────────────── seam 1: attention ─────────────────────── */

describe("runner attention month-roll forwarding (host seam @eff5694)", () => {
  it("a default runner never mints the pool — undefined through the roll", () => {
    const runner = new SimCoreRunner({ seed: 42 });
    expect(runner.attentionState()).toBeUndefined();
    for (let i = 0; i < POST_ROLL_STEPS + 10; i += 1) runner.headlessStep(10);
    expect(runner.attentionState()).toBeUndefined(); // never, even after a real roll
    runner.stop();
  });

  it("off-roll: 419 steps leave the planted pool byte-identical", () => {
    const planted = plantLoans(2);
    const runner = new SimCoreRunner({ seed: 42, attention: planted });
    for (let i = 0; i < PRE_ROLL_STEPS; i += 1) runner.headlessStep(10);
    expect(runner.attentionState()).toEqual(planted);
    runner.stop();
  });

  it("the roll services the OLDEST loan once, stamped at the crossing minute", () => {
    const runner = new SimCoreRunner({ seed: 42, attention: plantLoans(2) });
    for (let i = 0; i < POST_ROLL_STEPS; i += 1) runner.headlessStep(10);
    expect(runner.attentionState()).toEqual({
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
      lastReplenishBusinessMinute: CROSSING_MINUTE,
    });
    runner.stop();
  });
});

/* ──────────────── seam 3 (E2b): attention on the wire ──────────────── */

describe("runner attention roll-up rides the projection (E2b readback)", () => {
  it("planted pool: every frame carries {capacity, debt, window, loanCount}", () => {
    const frames = runFrames({ seed: 42, attention: plantLoans(2) }, 3);
    for (const f of frames) {
      expect(f.attention).toEqual({ capacity: 2, debt: 2, window: 2, loanCount: 2 });
    }
    // Wire truth: the key is present and JSON-safe (plain numbers, no bigint).
    const raw = JSON.parse(JSON.stringify(encodeProjection(frames[0] as SimProjection))) as {
      attention?: unknown;
    };
    expect(raw.attention).toEqual({ capacity: 2, debt: 2, window: 2, loanCount: 2 });
  });

  it("the month roll moves the roll-up: the oldest loan repays on the wire", () => {
    const frames = runFrames({ seed: 42, attention: plantLoans(2) }, POST_ROLL_STEPS + 1);
    // frames[i] is the OUTPUT of step i+1; the roll crosses at tick 420, so
    // step 419's frame (index 418) is the last strictly pre-roll witness.
    const before = frames[PRE_ROLL_STEPS - 1]?.attention;
    const after = frames[frames.length - 1]?.attention;
    expect(before).toEqual({ capacity: 2, debt: 2, window: 2, loanCount: 2 });
    expect(after).toEqual({ capacity: 2, debt: 1, window: 2, loanCount: 2 });
  });

  it("default runners mint NOTHING — key absent from projection AND wire", () => {
    const frames = runFrames({ seed: 42 }, 5);
    for (const f of frames) expect("attention" in f).toBe(false);
    const raw = JSON.parse(JSON.stringify(encodeProjection(frames[0] as SimProjection))) as Record<string, unknown>;
    expect("attention" in raw).toBe(false);
  });
});

/* ──────────────────────── seam 2: pricing ──────────────────────── */

describe("runner pricing override forwarding (host seam @5781335)", () => {
  it("price keys without a book are inert: frames match the bare runner", () => {
    const keyed = runFrames({ seed: 5, priceKeys: HOURLY_KEYS }, 20);
    const bare = runFrames({ seed: 5 }, 20);
    expect(keyed.map(frame)).toEqual(bare.map(frame));
  });

  it("the adjust-price door verb reaches billedMrc: cash diverges from the bare twin", () => {
    const priced = new SimCoreRunner({ seed: 5, priceKeys: HOURLY_KEYS });
    priced.submit(verbIntent(1, {
      verb: "adjust-price",
      targetKind: "sku",
      targetId: "hourly-smb",
      newPriceMicroUsd: 1_440_000_000n,
      effectiveAtBusinessMinute: null,
    }));
    const frames: SimProjection[] = [];
    for (let i = 0; i < 20; i += 1) frames.push(priced.headlessStep(10));
    priced.stop();
    /* Receipt: the verb EXECUTED on the FIRST step (submit before any step
       stamps tick+1 = 1, and the door runs ahead of the money lane). */
    const receipts = frames[0]?.notices.filter((n) => n.kind.startsWith("intent-")) ?? [];
    expect(receipts).toHaveLength(1);
    expect(receipts[0]?.kind).toBe("intent-executed");
    // E2b: executed receipts carry the handler detail — target + booked price.
    expect(receipts[0]?.detail).toBe("adjust-price: target=sku:hourly-smb,price=1440000000");
    /* The doubling override lifted the hourly settlements: probe literal +
       strict inequality against the bare twin (25_034_848_900 µ$). */
    expect(frames[19]?.freeCashMicroUsd).toBe(25_064_561_500n);
    const bare = runFrames({ seed: 5 }, 20);
    expect(frames[19]?.freeCashMicroUsd).not.toBe(bare[19]?.freeCashMicroUsd);
  });

  it("a book whose key no contract carries stays neutral: frames match the bare twin", () => {
    const mismatched = runFrames(
      { seed: 5, pricing: bookFromDoorStyle(1_440_000_000n, "sku", "nope") },
      20,
    );
    const bare = runFrames({ seed: 5 }, 20);
    expect(mismatched.map(frame)).toEqual(bare.map(frame));
  });

  it("a SEEDED book (save-restore shape) moves cash EXACTLY like the door-materialized one", () => {
    const seeded = runFrames(
      { seed: 5, priceKeys: HOURLY_KEYS, pricing: bookFromDoorStyle(1_440_000_000n, "sku", "hourly-smb") },
      20,
    );
    /* The door executes BEFORE the money lane on its tick, so a book
       seeded at mint and a book materialized by the tick-1 verb reach the
       first economy fold in the same shape — cash is byte-equal, and the
       bare twin stays behind. */
    expect(seeded[19]?.freeCashMicroUsd).toBe(25_064_561_500n);
    const bare = runFrames({ seed: 5 }, 20);
    expect(seeded[19]?.freeCashMicroUsd).not.toBe(bare[19]?.freeCashMicroUsd);
  });
});

/* ────────────── seam 1b: owner verb tax (ADR-0013 #12(v)) ────────────── */

function intentNotices(projection: SimProjection) {
  return projection.notices.filter((n) => n.kind === "intent-executed" || n.kind === "intent-refused");
}

describe("runner attention verb-tax opt-in (ADR-0013 #12(v) host wiring)", () => {
  it("planted EMPTY pool + communicate ⇒ attention-debt refusal — the tax is LIVE", () => {
    const runner = new SimCoreRunner({ seed: 5, attention: createAttentionState(2) });
    runner.submit(verbIntent(1, { verb: "communicate", note: "deal talk", target: null }));
    const receipts = intentNotices(runner.headlessStep(10));
    expect(receipts).toHaveLength(1);
    expect(receipts[0]?.kind).toBe("intent-refused");
    expect(receipts[0]?.detail).toMatch(/^communicate: attention-debt:/);
    // eff5694 absent-hand law: the pool stays EMPTY — a refusal mints nothing.
    expect(runner.attentionState()?.tokens.every((t) => t.busyCauseId === null)).toBe(true);
    runner.stop();
  });

  it("TWIN: the SAME submit on an UNPLANTED runner executes — default stays byte-identical", () => {
    // simCoreRunner.test.ts's shipped communicate pins ride exactly this arm:
    // no options.attention ⇒ no intents config spread ⇒ door default EMPTY.
    const runner = new SimCoreRunner({ seed: 5 });
    runner.submit(verbIntent(1, { verb: "communicate", note: "deal talk", target: null }));
    const receipts = intentNotices(runner.headlessStep(10));
    expect(receipts).toHaveLength(1);
    expect(receipts[0]?.kind).toBe("intent-executed");
    expect(runner.attentionState()).toBeUndefined();
    runner.stop();
  });

  it("planted LOAN + communicate ⇒ executed, and the focus hand books the intent", () => {
    const runner = new SimCoreRunner({ seed: 5, attention: plantLoans(1) });
    runner.submit(verbIntent(1, { verb: "communicate", note: "angry customer", target: null }));
    const receipts = intentNotices(runner.headlessStep(10));
    expect(receipts[0]?.kind).toBe("intent-executed");
    const pool = runner.attentionState();
    // The special rail paid for the SAME cause the everyday rail booked.
    expect(pool?.tokens.some((t) => t.busyCauseId !== null)).toBe(true);
    runner.stop();
  });

  it("a BUILD verb pays no tax under the owner map — place executes on a planted pool", () => {
    const runner = new SimCoreRunner({ seed: 5, attention: createAttentionState(2) });
    runner.submit(verbIntent(1, { verb: "place-device", nodeId: "web-9", deviceKind: "web", template: null }));
    const receipts = intentNotices(runner.headlessStep(10));
    expect(receipts).toHaveLength(1);
    expect(receipts[0]?.kind).toBe("intent-executed");
    expect(runner.attentionState()?.tokens.every((t) => t.busyCauseId === null)).toBe(true);
    runner.stop();
  });
});
