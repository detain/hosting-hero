/**
 * ADJUST-PRICE — the 9th door verb (OD-24(a) FULL PRICING SURFACE, part 1:
 * owner ruling 2026-10-09b; the verb-set amendment to the ADR-0005 posture is
 * recorded in the landing commit message — ADR-0005 itself carries only the
 * WS-2 coarse per-tier verb sets, not the door enum census).
 *
 * Pins, contract #10 law:
 *  - the ONLY state effect is one frozen record in the OPTIONAL
 *    `GameState.pricing` book — STATE-NEUTRAL part 1: no revenue, no
 *    elasticity, no invoice math in the door (parts 2/3 read the book);
 *  - occupancy class: COMMIT (1 tick / 1 hand, same window as
 *    policy-card-commit) — pinned below so a taste drift is a red test;
 *  - five new refusal codes (bad-target-kind, empty-target-id, invalid-price,
 *    bad-effective-minute, unknown-plan via the host callback — the exact
 *    `canPlaceDevice` decoupling pattern), each refusal-pinned here;
 *  - M2 wire law extended: `bigint` and `number-or-null` arg types — a
 *    fractional/string price is STRUCTURAL garbage (throws), positivity is
 *    the refusal space (Law 2: non-integers unrepresentable);
 *  - digest-switch law: pricing ABSENT keeps every digest byte-identical
 *    (the serial golden suites — digest-golden, gate-g4 receipts, drain
 *    chain — are the zero-golden-movement proof); pricing PRESENT moves the
 *    digest, insertion-order-independent (keys sort code-unit).
 */

import { describe, expect, it } from "vitest";
import type {
  AdjustPriceArgs,
  EntityId,
  ExternalIntent,
  GameState,
  PlayerVerbArgs,
  PriceOverrideBook,
  PriceOverrideRecord,
  SimTick,
  TickContext,
} from "../../types";
import { asEntityId, asMoney, asRunSeed, PlayerVerb } from "../../types";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { createInitialState } from "../driver";
import { digestState } from "../digest";
import {
  applyIntentDoor,
  createBoardState,
  createPriceOverrideBook,
  IntentDoorError,
  parsePriceOverrideKey,
  priceOverrideKey,
  DEFAULT_INTENT_HAND_COST,
  DEFAULT_INTENT_OCCUPANCY_TICKS,
  type AdjustPriceQuery,
  type IntentDoorConfig,
} from "../intent-door";
import { IDS, node } from "./helpers";

const MIN = MICROS_PER_MIN;

/* ═══════════════════════════ fixtures (intent-door.test.ts pattern) ═══════════════════════════ */

function ctx(tick: SimTick): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
}

function ext(tick: SimTick, seq: number, args: PlayerVerbArgs): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

function baseState(handCapacity = 2): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-price",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [
      node(IDS.edge, { slots: 2, serviceUs: MIN }),
      node(IDS.origin, { slots: 1, serviceUs: MIN }),
    ],
    handCapacity,
    board: createBoardState(),
  });
}

const PRO: AdjustPriceArgs = {
  verb: PlayerVerb.AdjustPrice,
  targetKind: "plan",
  targetId: asEntityId("pro"),
  newPriceMicroUsd: asMoney(4_900_000n),
  effectiveAtBusinessMinute: null,
};

function refused(result: ReturnType<typeof applyIntentDoor>, seq: number): string {
  const receipt = result.receipts.find((r) => r.seq === seq);
  if (receipt === undefined || receipt.outcome !== "refused" || receipt.reason === null) {
    throw new Error(`expected a refusal for seq ${seq}`);
  }
  return receipt.reason;
}

function outcomeOf(result: ReturnType<typeof applyIntentDoor>, seq: number): string {
  const receipt = result.receipts.find((r) => r.seq === seq);
  if (receipt === undefined) throw new Error(`no receipt for seq ${seq}`);
  return receipt.outcome;
}

/* ═══════════════════════ happy path — the book writes ═══════════════════════ */

describe("adjust-price — execution and the override book", () => {
  it("executes: one frozen record, canonical detail, book materialized lazily", () => {
    const before = baseState();
    expect(before.pricing).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, PRO)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.pricing;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.overrides.size).toBe(1);
    const rec = book?.overrides.get(priceOverrideKey("plan", asEntityId("pro")));
    expect(rec).toEqual({
      targetKind: "plan",
      targetId: "pro",
      newPriceMicroUsd: 4_900_000n,
      effectiveAtBusinessMinute: null,
      setAtTick: 3n,
    });
    expect(Object.isFrozen(rec)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe("target=plan:pro,price=4900000");
  });

  it("effectiveAtBusinessMinute rides the record verbatim and extends the detail", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...PRO, effectiveAtBusinessMinute: 43_200 }),
    ]);
    const rec = result.state.pricing?.overrides.get("plan:pro");
    expect(rec?.effectiveAtBusinessMinute).toBe(43_200);
    expect(rec?.setAtTick).toBe(1n);
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "target=plan:pro,price=4900000,at=43200",
    );
  });

  it("commit-class occupancy ladder: 1 hand, 1 tick, busyUntil = tick + 1 (pinned taste)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.AdjustPrice]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.AdjustPrice]).toBe(1);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, PRO)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(6n);
  });

  it("re-pricing the same target overwrites (last-write-wins), version bumps per write", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, PRO)]);
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...PRO, newPriceMicroUsd: asMoney(5_900_000n) }),
    ]);
    const book = second.state.pricing;
    expect(book?.version).toBe(2);
    expect(book?.overrides.size).toBe(1);
    expect(book?.overrides.get("plan:pro")?.newPriceMicroUsd).toBe(5_900_000n);
    expect(book?.overrides.get("plan:pro")?.setAtTick).toBe(2n);
  });

  it("distinct kinds coexist; colon-namespaced ids round-trip the composite key", () => {
    const sku: AdjustPriceArgs = {
      verb: PlayerVerb.AdjustPrice,
      targetKind: "sku",
      targetId: asEntityId("cb:bandwidth"),
      newPriceMicroUsd: asMoney(12n),
      effectiveAtBusinessMinute: null,
    };
    const klass: AdjustPriceArgs = {
      verb: PlayerVerb.AdjustPrice,
      targetKind: "contract-class",
      targetId: asEntityId("legacy-2001"),
      newPriceMicroUsd: asMoney(990_000n),
      effectiveAtBusinessMinute: null,
    };
    const result = applyIntentDoor(baseState(4), ctx(1n), [ext(1n, 1, PRO), ext(1n, 2, sku), ext(1n, 3, klass)]);
    expect(result.state.pricing?.overrides.size).toBe(3);
    expect(parsePriceOverrideKey(priceOverrideKey("sku", asEntityId("cb:bandwidth")))).toEqual({
      targetKind: "sku",
      targetId: "cb:bandwidth",
    });
    expect(result.state.pricing?.overrides.has("contract-class:legacy-2001")).toBe(true);
  });

  it("scope audit: nodes/lanes/observed/cash keep ORIGIN identity — only pricing+hands materialize", () => {
    const before = baseState();
    const result = applyIntentDoor(before, ctx(1n), [ext(1n, 1, PRO)]);
    expect(result.state.nodes).toBe(before.nodes);
    expect(result.state.lanes).toBe(before.lanes);
    expect(result.state.observed).toBe(before.observed);
    expect(result.state.cash).toBe(before.cash);
    expect(result.state.contracts).toBe(before.contracts);
    expect(result.state.pricing).not.toBe(before.pricing);
  });
});

/* ═══════════════════════ refusal census — the five new codes ═══════════════════════ */

describe("adjust-price — refusals (nothing consumed, book never touched)", () => {
  const feed = (args: unknown, config: IntentDoorConfig = {}) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)], config);

  it("bad-target-kind: outside the closed {plan,contract-class,sku} vocabulary", () => {
    expect(refused(feed({ ...PRO, targetKind: "coupon" }), 1)).toBe(
      'bad-target-kind: "coupon" not in {plan,contract-class,sku}',
    );
  });

  it("empty-target-id is a bare-code guard (empty-node-id family)", () => {
    // forged WIRE (bypasses asEntityId's boundary law — a host could JSON-feed
    // it): the door's value-domain guard is what must refuse, not a throw.
    expect(refused(feed({ ...PRO, targetId: "" as EntityId }), 1)).toBe("empty-target-id");
  });

  it("invalid-price: zero and negative refuse, positivity is the whole value domain", () => {
    expect(refused(feed({ ...PRO, newPriceMicroUsd: asMoney(0n) }), 1)).toBe("invalid-price: 0 µ$ must be > 0");
    expect(refused(feed({ ...PRO, newPriceMicroUsd: asMoney(-500n) }), 1)).toMatch(/^invalid-price: -500/);
  });

  it("bad-effective-minute: negative, fractional and NaN refuse; 0 is a legal business minute", () => {
    expect(refused(feed({ ...PRO, effectiveAtBusinessMinute: -3 }), 1)).toMatch(/^bad-effective-minute: -3/);
    expect(refused(feed({ ...PRO, effectiveAtBusinessMinute: 1.5 }), 1)).toMatch(/^bad-effective-minute: 1\.5/);
    expect(refused(feed({ ...PRO, effectiveAtBusinessMinute: NaN }), 1)).toMatch(/^bad-effective-minute: NaN/);
    expect(outcomeOf(feed({ ...PRO, effectiveAtBusinessMinute: 0 }), 1)).toBe("executed");
  });

  it("unknown-plan: the canAdjustPrice callback's reason lands VERBATIM (canPlaceDevice pattern)", () => {
    const config: IntentDoorConfig = {
      canAdjustPrice: () => ({ reason: 'no plan "ghost" in catalog' }),
    };
    expect(refused(feed(PRO, config), 1)).toBe("unknown-plan: no plan \"ghost\" in catalog");
    // accepting callback (null) executes; absent callback skips resolution entirely:
    expect(outcomeOf(feed(PRO, { canAdjustPrice: () => null }), 1)).toBe("executed");
    expect(outcomeOf(feed(PRO), 1)).toBe("executed");
  });

  it("a refusal after a live book leaves the book UNTOUCHED (identity) and spends no hand", () => {
    const seeded = applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, PRO)]);
    const book = seeded.state.pricing as PriceOverrideBook;
    const next = applyIntentDoor(seeded.state, ctx(4n), [
      ext(4n, 2, { ...PRO, newPriceMicroUsd: asMoney(0n) }),
    ]);
    expect(next.state.pricing).toBe(book);
    expect(next.state.pricing?.overrides.size).toBe(1);
  });

  it("payment order is canonical: hands-exhausted outranks an invalid payload", () => {
    const busy = applyIntentDoor(baseState(1), ctx(1n), [ext(1n, 1, PRO)]);
    const second = applyIntentDoor(busy.state, ctx(1n), [
      ext(1n, 2, { ...PRO, newPriceMicroUsd: asMoney(0n) }),
    ]);
    expect(refused(second, 2)).toMatch(/^hands-exhausted:/);
    // and the invalid payload never reached the handler — the book is the SAME object:
    expect(second.state.pricing).toBe(busy.state.pricing);
  });

  it("stamped-in-future rides the existing law (adjust-price included)", () => {
    const result = applyIntentDoor(baseState(2), ctx(1n), [ext(9n, 1, PRO)]);
    expect(refused(result, 1)).toMatch(/^stamped-in-future: entry tick 9 > current 1$/);
    expect(result.state.pricing).toBeUndefined();
  });
});

/* ═══════════════════════ M2 extension: bigint + number-or-null wires ═══════════════════════ */

describe("adjust-price — wire types parse at the boundary (throw); values refuse", () => {
  const feed = (args: unknown) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)]);

  function expectStructural(args: unknown, messagePart: string): void {
    expect(() => feed(args)).toThrow(IntentDoorError);
    expect(() => feed(args)).toThrow(messagePart);
  }

  it("a fractional or string price is STRUCTURAL garbage — non-integers are unrepresentable (Law 2)", () => {
    expectStructural({ ...PRO, newPriceMicroUsd: 49.5 }, "args.newPriceMicroUsd: expected bigint, got number");
    expectStructural({ ...PRO, newPriceMicroUsd: "4900" }, "args.newPriceMicroUsd: expected bigint, got string");
    expectStructural({ ...PRO, newPriceMicroUsd: null }, "args.newPriceMicroUsd: expected bigint, got object");
  });

  it("effectiveAtBusinessMinute is number-or-null: null sentinel parses, string throws, missing key throws", () => {
    expect(outcomeOf(feed({ ...PRO, effectiveAtBusinessMinute: null }), 1)).toBe("executed");
    expectStructural({ ...PRO, effectiveAtBusinessMinute: "120" }, "args.effectiveAtBusinessMinute: expected number, got string");
    const { effectiveAtBusinessMinute: _gone, ...noEffective } = PRO;
    expectStructural(noEffective, "args.effectiveAtBusinessMinute: expected number, got undefined");
  });

  it("junk host callback reason throws (callback output stays validated, never coerced)", () => {
    const config: IntentDoorConfig = { canAdjustPrice: () => ({ reason: 42 as unknown as string }) };
    expect(() => applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, PRO)], config)).toThrow(
      "canAdjustPrice result.reason: expected string, got number",
    );
  });
});

/* ═══════════════════════ W1 pattern for the pricing validator ═══════════════════════ */

describe("canAdjustPrice — snapshot law mirrors canPlaceDevice (W1 + draft visibility)", () => {
  it("query.state.context is THIS pass; a same-tick earlier write is visible in the snapshot", () => {
    const queries: AdjustPriceQuery[] = [];
    const config: IntentDoorConfig = {
      canAdjustPrice: (q) => {
        queries.push(q);
        return null;
      },
    };
    const pass = ctx(6n);
    const pro: AdjustPriceArgs = { ...PRO, targetId: asEntityId("pro") };
    const basic: AdjustPriceArgs = { ...PRO, targetId: asEntityId("basic"), newPriceMicroUsd: asMoney(900n) };
    const result = applyIntentDoor(baseState(3), pass, [ext(6n, 1, pro), ext(6n, 2, basic)], config);
    expect(queries.length).toBe(2);
    const [firstQuery, secondQuery] = queries as [AdjustPriceQuery, AdjustPriceQuery];
    expect(firstQuery.state.context).toBe(pass);
    expect(firstQuery.state.pricing).toBeUndefined(); // nothing written yet at the first resolve
    expect(secondQuery.state.pricing?.overrides.has("plan:pro")).toBe(true); // draft visible
    expect(result.state.pricing?.overrides.size).toBe(2);
    expect(result.state.context).toBe(pass);
  });
});

/* ═══════════════════════ digest-switch law (zero-golden guarantee) ═══════════════════════ */

describe("pricing digest switch — absent byte-ident, present order-independent", () => {
  function record(over: Partial<PriceOverrideRecord>): PriceOverrideRecord {
    return Object.freeze({
      targetKind: "plan",
      targetId: asEntityId("pro"),
      newPriceMicroUsd: asMoney(4_900_000n),
      effectiveAtBusinessMinute: null,
      setAtTick: 3n,
      ...over,
    });
  }

  it("NO intents through the door ⇒ state identity ⇒ digest unchanged", () => {
    const before = baseState();
    const result = applyIntentDoor(before, ctx(1n), []);
    expect(result.state).toBe(before);
    expect(digestState(result.state)).toBe(digestState(before));
  });

  it("a refused-only adjust-price pass leaves the digest EXACTLY at baseline", () => {
    const before = baseState();
    const baseline = digestState(before);
    const refusedPass = applyIntentDoor(before, ctx(1n), [
      ext(1n, 1, { ...PRO, newPriceMicroUsd: asMoney(0n) }),
    ]);
    expect(digestState(refusedPass.state)).toBe(baseline);
  });

  it("an executed adjust-price MOVES the digest (pricing is replay-visible)", () => {
    const before = baseState();
    const after = applyIntentDoor(before, ctx(1n), [ext(1n, 1, PRO)]);
    expect(digestState(after.state)).not.toBe(digestState(before));
  });

  it("Map insertion order NEVER leaks: same records inserted both ways digest identically", () => {
    const forward = new Map<string, PriceOverrideRecord>([
      ["plan:alpha", record({ targetId: asEntityId("alpha") })],
      ["plan:zulu", record({ targetId: asEntityId("zulu") })],
      ["sku:cb:x", record({ targetKind: "sku", targetId: asEntityId("cb:x") })],
    ]);
    const backward = new Map<string, PriceOverrideRecord>([...forward.entries()].reverse());
    const book = (overrides: Map<string, PriceOverrideRecord>): PriceOverrideBook =>
      Object.freeze({ version: 3, overrides: Object.freeze(overrides) });
    const a = baseState();
    const b = baseState();
    expect(digestState({ ...a, pricing: book(forward) })).toBe(digestState({ ...b, pricing: book(backward) }));
    // and a value change still moves it (falsifiable, not a constant fold):
    const bumped = new Map(forward);
    bumped.set("plan:alpha", record({ targetId: asEntityId("alpha"), newPriceMicroUsd: asMoney(4_900_001n) }));
    expect(digestState({ ...a, pricing: book(forward) })).not.toBe(digestState({ ...a, pricing: book(bumped) }));
  });

  it("×100 determinism: same schedule + same seed ⇒ identical book digests and receipts", () => {
    const config: IntentDoorConfig = { canAdjustPrice: () => null };
    const runOnce = (): string[] => {
      let state = baseState();
      const chain: string[] = [];
      for (let tick = 1; tick <= 10; tick += 1) {
        const pass = ctx(BigInt(tick));
        const result = applyIntentDoor(
          state,
          pass,
          tick % 2 === 0
            ? [ext(BigInt(tick), tick, { ...PRO, newPriceMicroUsd: asMoney(BigInt(tick * 100)) })]
            : [ext(BigInt(tick), tick, { ...PRO, targetKind: "sku", effectiveAtBusinessMinute: tick })],
          config,
        );
        state = result.state;
        chain.push(digestState(state));
      }
      return chain;
    };
    const first = runOnce();
    for (let i = 0; i < 100; i += 1) expect(runOnce()).toEqual(first);
  });
});

/* ═══════════════════════ book constructors ═══════════════════════ */

describe("price book constructors + key codec", () => {
  it("createPriceOverrideBook is empty, frozen, version 0", () => {
    const book = createPriceOverrideBook();
    expect(book.version).toBe(0);
    expect(book.overrides.size).toBe(0);
    expect(Object.isFrozen(book)).toBe(true);
    expect(Object.isFrozen(book.overrides)).toBe(true);
  });

  it("parsePriceOverrideKey rejects anything outside the closed kind vocabulary", () => {
    expect(parsePriceOverrideKey("frob:x")).toBeNull();
    expect(parsePriceOverrideKey("nocolon")).toBeNull();
    expect(parsePriceOverrideKey(":leading")).toBeNull();
    // empty ids decode to null too — the codec mirrors asEntityId's boundary law
    // (and the handler's `empty-target-id` guard is what refuses minting them):
    expect(parsePriceOverrideKey("plan:")).toBeNull();
    expect(parsePriceOverrideKey("plan:pro")).toEqual({ targetKind: "plan", targetId: "pro" });
  });

  it("a host-seeded book is absorbed by the FIRST executed write (version continues)", () => {
    const seeded = createPriceOverrideBook();
    const before = { ...baseState(), pricing: seeded };
    const result = applyIntentDoor(before, ctx(2n), [ext(2n, 1, PRO)]);
    expect(result.state.pricing?.version).toBe(1);
    expect(result.state.pricing?.overrides.size).toBe(1);
    expect(result.state.pricing).not.toBe(seeded);
  });
});
