/**
 * RECLAIM-NODE — the 19th door verb (ADR-0017 #1/#3: the THIRD verb of the
 * §1.4 CI/build-farm card "~:2679 `Verb: isolate, expire, reclaim.`" — the
 * word `reclaim` finally lands, and the spot-economy corpus backs its
 * semantics: "reclaimable at any moment" (~:24851)).
 *
 * Refusal-census honesty (HEADLINE): reclaim adds ZERO new phrases. Its
 * three refusals (`empty-node-id`, `bad-effective-minute`, `unknown-node`)
 * reuse the shield/scale/isolate/throttle/restart census entries VERBATIM —
 * the first tier-extension verb to amend no code at all. The machine-pinned
 * census (the intent-door-restart.test.ts pattern, copied below) asserts the
 * total stays EXACTLY 46 with `nothing-to-collect` absent: collecting an
 * unbooked node is a LEGAL no-op — the tombstone records the sweep either
 * way (the void predicate keys off shippedAtTick, so a late sweep over an
 * empty node still books history).
 *
 * Pins (the shield/isolate contract-#10 pattern, mirrored deliberately):
 *  - the ONLY state effect is one frozen entry in the OPTIONAL
 *    `GameState.reclaim` book — the door never touches units, slots,
 *    rosters, queues, cash, or RNG (the void lands at SIX capacity reads —
 *    steps 5/9 through pipeline/reclaim.ts — proven in
 *    reclaim-consume.test.ts);
 *  - occupancy class: COMMIT (1 hand / 1 tick) — the one-click Act-row law;
 *    PROVISIONAL (post-ratify new numeric, 2026-10-17): the ADR-0016 #11
 *    register CLOSED (e2a1bba) before this verb existed, so house law ships
 *    the pair PROVISIONAL like the original eight did before the sweep;
 *  - M2 wire wall: both arg keys are STRUCTURAL (missing/wrong type throws
 *    IntentDoorError); explicit `null` is the only "now" form; the value
 *    domain is the three reused phrases;
 *  - NO release leg: a tombstone never expires — amendments (LWW re-book)
 *    are the only motion (the destroy is permanent; the rebuild is what a
 *    strictly-later `shippedAtTick` booking IS);
 *  - last-write-wins COW: same node twice ⇒ version 2 with ONE entry (the
 *    newer sweep is the newer authority);
 *  - digest-switch law: absent book ⇒ every digest byte-identical; present
 *    book ⇒ digest moves, insertion-order-independent, every field
 *    (incl. the -1 null-sentinel AND shippedAtTick, which is the load-
 *    bearing void boundary) participates.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  PlayerVerbArgs,
  ReclaimArgs,
  ReclaimBook,
  ReclaimEntry,
  SimTick,
  TickContext,
} from "../../types";
import { asEntityId, asRunSeed, PlayerVerb } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { digestState } from "../digest";
import {
  applyIntentDoor,
  createBoardState,
  createReclaimBook,
  IntentDoorError,
  DEFAULT_INTENT_HAND_COST,
  DEFAULT_INTENT_OCCUPANCY_TICKS,
} from "../intent-door";
import { createDefaultSlots } from "../defaults";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

const MIN = MICROS_PER_MIN;

/* ═══════════════════════════ fixtures (intent-door-isolate pattern) ═══════════════════════════ */

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
    engineVersion: "test-reclaim",
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

const ARM: ReclaimArgs = {
  verb: PlayerVerb.ReclaimNode,
  targetNodeId: IDS.edge,
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

function entryOf(e: { shippedAtTick?: bigint; eff?: number | null } = {}): ReclaimEntry {
  return Object.freeze({
    shippedAtTick: e.shippedAtTick ?? 1n,
    effectiveAtBusinessMinute: e.eff === undefined ? null : e.eff,
  });
}

function bookOf(entries: readonly (readonly [EntityId, ReclaimEntry])[], version = 1): ReclaimBook {
  return Object.freeze({ version, entries: Object.freeze(new Map<EntityId, ReclaimEntry>(entries)) });
}

/* ═══════════════════════ happy path — the tombstone book writes ═══════════════════════ */

describe("reclaim-node — execution and the tombstone book", () => {
  it("executes: one frozen entry, canonical detail, book materialized lazily", () => {
    const before = baseState();
    expect(before.reclaim).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.reclaim;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    const entry = book?.entries.get(IDS.edge);
    expect(entry).toEqual({ shippedAtTick: 3n, effectiveAtBusinessMinute: null });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe("target=edge,eff=now");
  });

  it("a future business-minute stamp rides the entry verbatim and extends the detail", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, effectiveAtBusinessMinute: 43_200 }),
    ]);
    expect(result.state.reclaim?.entries.get(IDS.edge)).toEqual({
      shippedAtTick: 1n,
      effectiveAtBusinessMinute: 43_200,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "target=edge,eff=43200",
    );
  });

  it("collecting an UNBOOKED node is a legal no-op — no nothing-to-collect refusal exists", () => {
    // The sweep is the player's authority exercise; whether the node carried
    // anything is a READ-time fact the fold decides (voidedByTombstone). The
    // door books the tombstone either way (history witness).
    const result = applyIntentDoor(baseState(5), ctx(2n), [ext(2n, 7, ARM)]);
    expect(outcomeOf(result, 7)).toBe("executed");
    expect(result.state.reclaim?.entries.get(IDS.edge)?.shippedAtTick).toBe(2n);
  });

  it("commit-class occupancy ladder: 1 hand, 1 tick, busyUntil = tick + 1 (the one-click Act-row pin)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.ReclaimNode]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.ReclaimNode]).toBe(1);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(6n);
  });

  it("re-sweeping the SAME node is last-write-wins COW: version 2, one entry, first book untouched", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.reclaim as ReclaimBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, effectiveAtBusinessMinute: 500 }),
    ]);
    const book2 = second.state.reclaim as ReclaimBook;
    expect(book2.version).toBe(2);
    expect(book2.entries.size).toBe(1);
    expect(book2.entries.get(IDS.edge)).toEqual({ shippedAtTick: 2n, effectiveAtBusinessMinute: 500 });
    // the earlier book is a frozen snapshot — identity AND shape intact:
    expect(book1.version).toBe(1);
    expect(book1.entries.get(IDS.edge)?.effectiveAtBusinessMinute).toBeNull();
    expect(book2.entries).not.toBe(book1.entries);
  });

  it("distinct nodes accumulate (two entries, version 2); scope audit keeps origin slices identical", () => {
    const before = baseState();
    const first = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    const second = applyIntentDoor(first.state, ctx(1n), [
      ext(1n, 2, { ...ARM, targetNodeId: IDS.origin }),
    ]);
    expect(second.state.reclaim?.version).toBe(2);
    expect(second.state.reclaim?.entries.size).toBe(2);
    expect(second.state.nodes).toBe(before.nodes);
    expect(second.state.lanes).toBe(before.lanes);
    expect(second.state.observed).toBe(before.observed);
    expect(second.state.cash).toBe(before.cash);
    expect(second.state.corruption).toBe(before.corruption); // the door never marks
    expect(second.state.board).toBe(first.state.board); // the board never moves
  });

  it("createReclaimBook is the empty frozen book (version 0, zero entries)", () => {
    const empty = createReclaimBook();
    expect(empty.version).toBe(0);
    expect(empty.entries.size).toBe(0);
    expect(Object.isFrozen(empty)).toBe(true);
    expect(Object.isFrozen(empty.entries)).toBe(true);
  });
});

/* ═══════════════════ refusals — THREE reused phrases, ZERO new ═══════════════════ */

describe("reclaim-node — refusals (census UNMOVED: all three phrases reused verbatim)", () => {
  const feed = (args: unknown) =>
    applyIntentDoor(baseState(5), ctx(1n), [ext(1n, 1, args as PlayerVerbArgs)]);

  it("empty-node-id is the bare-code guard (shield/scale family, reused verbatim)", () => {
    // forged WIRE (bypasses asEntityId's boundary law): refusal, not a throw.
    expect(refused(feed({ ...ARM, targetNodeId: "" as EntityId }), 1)).toBe("empty-node-id");
  });

  it("bad-effective-minute keeps the shield phrasing VERBATIM; 0 is legal", () => {
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: -3 }), 1)).toMatch(
      /^bad-effective-minute: -3 must be a safe integer >= 0 \(or null = now\)$/,
    );
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: 1.5 }), 1)).toMatch(/^bad-effective-minute: 1\.5/);
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: NaN }), 1)).toMatch(/^bad-effective-minute: NaN/);
    expect(outcomeOf(feed({ ...ARM, effectiveAtBusinessMinute: 0 }), 1)).toBe("executed");
  });

  it('unknown-node: "ghost" reuses the shed/configure phrase exactly', () => {
    expect(refused(feed({ ...ARM, targetNodeId: asEntityId("ghost") }), 1)).toBe('unknown-node: "ghost"');
  });

  it("a refusal after a live book leaves the book UNTOUCHED (identity) and spends no hand", () => {
    const seeded = applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, ARM)]);
    const book = seeded.state.reclaim as ReclaimBook;
    const next = applyIntentDoor(seeded.state, ctx(4n), [
      ext(4n, 2, { ...ARM, targetNodeId: asEntityId("ghost") }),
    ]);
    expect(next.state.reclaim).toBe(book);
    expect(next.state.reclaim?.entries.size).toBe(1);
    // undo law: the refused entry's hand refund leaves BOTH tokens free again:
    const busy = (next.state.hands?.tokens ?? []).filter(
      (t) => t.busyUntilTick !== null && t.busyUntilTick > 4n,
    );
    expect(busy.length).toBe(0);
  });

  it("the sweep never touches the other books (pricing/sell/negotiate identity on a seeded state)", () => {
    // priceKey-space books are EXCLUDED v0 (reclaim.ts header law): the door
    // writes ONLY draft.reclaim, so a state carrying nothing else keeps every
    // other slice by reference identity through a reclaim pass.
    const before = baseState();
    const result = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    expect(result.state.pricing).toBeUndefined();
    expect(result.state.sell).toBeUndefined();
    expect(result.state.negotiate).toBeUndefined();
    expect(result.state.hands).not.toBe(before.hands); // the ONE rail that moves (payment)
  });
});

/* ═══════════════════════════ M2 wire wall ═══════════════════════════ */

describe("reclaim-node — M2 structural wall (throws, never refuses)", () => {
  const forge = (args: Record<string, unknown>) =>
    applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, args as unknown as PlayerVerbArgs)]);

  it("every missing arg key is structural garbage — the door THROWS", () => {
    expect(() => forge({ verb: PlayerVerb.ReclaimNode, effectiveAtBusinessMinute: null })).toThrow(
      IntentDoorError,
    );
    expect(() => forge({ verb: PlayerVerb.ReclaimNode, targetNodeId: "edge" })).toThrow(IntentDoorError);
  });

  it("wrong wire TYPES throw: number node id, string minute, undefined-as-null", () => {
    expect(() => forge({ ...ARM, targetNodeId: 42 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: "5" })).toThrow(IntentDoorError);
    // exactOptionalPropertyTypes: an explicit `undefined` is the same garbage:
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: undefined })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: [480] })).toThrow(IntentDoorError);
  });

  it("the explicit null is the ONLY now-form", () => {
    expect(outcomeOf(forge({ ...ARM, effectiveAtBusinessMinute: null }), 1)).toBe("executed");
  });
});

/* ═══════════════════════════ digest-switch law ═══════════════════════════ */

describe("reclaim-node — the digest switch", () => {
  it("absent book ⇒ digest byte-identical to the untouched state (zero movement)", () => {
    const before = baseState();
    expect(digestState(before)).toBe(digestState(baseState()));
    // and a refusal keeps the ORIGINAL digest (state identity):
    const result = applyIntentDoor(before, ctx(1n), [
      ext(1n, 1, { ...ARM, targetNodeId: asEntityId("ghost") }),
    ]);
    expect(digestState(result.state)).toBe(digestState(before));
  });

  it("present book moves the digest; empty book counts as present (embed law)", () => {
    const before = baseState();
    const planted = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    expect(digestState(planted.state)).not.toBe(digestState(before));
    const emptyBook: GameState = Object.freeze({ ...before, reclaim: createReclaimBook() });
    expect(digestState(emptyBook)).not.toBe(digestState(before));
    expect(digestState(emptyBook)).not.toBe(digestState(planted.state));
  });

  it("insertion-order-independent: same entries, different Map order, SAME digest", () => {
    const forward = bookOf([
      [IDS.edge, entryOf({ shippedAtTick: 1n })],
      [IDS.origin, entryOf({ shippedAtTick: 1n, eff: 500 })],
    ]);
    const reverse = bookOf([
      [IDS.origin, entryOf({ shippedAtTick: 1n, eff: 500 })],
      [IDS.edge, entryOf({ shippedAtTick: 1n })],
    ]);
    const before = baseState();
    expect(digestState(Object.freeze({ ...before, reclaim: forward }))).toBe(
      digestState(Object.freeze({ ...before, reclaim: reverse })),
    );
  });

  it("field-participation twins: every sentinel distinction moves the digest", () => {
    const before = baseState();
    const dig = (e: { shippedAtTick?: bigint; eff?: number | null }): string =>
      digestState(Object.freeze({ ...before, reclaim: bookOf([[IDS.edge, entryOf(e)]]) }));
    // null ≠ 0 on the minute leg (the sentinel is unambiguous by door law):
    expect(dig({})).not.toBe(dig({ eff: 0 }));
    // shippedAtTick PARTICIPATES: it is the void boundary — equal-eff tombstones
    // shipped at different ticks void DIFFERENT booking sets, so digests must differ:
    expect(dig({ shippedAtTick: 1n })).not.toBe(dig({ shippedAtTick: 2n }));
    // write order and version ride the fold:
    const v1 = bookOf([[IDS.edge, entryOf()]]);
    const v2: ReclaimBook = Object.freeze({ ...v1, version: 2 });
    expect(digestState(Object.freeze({ ...before, reclaim: v1 }))).not.toBe(
      digestState(Object.freeze({ ...before, reclaim: v2 })),
    );
    // per-node COUNT participates (one sweep vs two nodes):
    expect(dig({})).not.toBe(
      digestState(
        Object.freeze({
          ...before,
          reclaim: bookOf([
            [IDS.edge, entryOf()],
            [IDS.origin, entryOf()],
          ]),
        }),
      ),
    );
  });

  it("reclaim, isolate and throttle digest APART (distinct fold namespaces, not a shared shape)", () => {
    const before = baseState();
    const rec: GameState = Object.freeze({ ...before, reclaim: bookOf([[IDS.edge, entryOf()]]) });
    const iso: GameState = Object.freeze({
      ...before,
      isolate: Object.freeze({
        version: 1,
        entries: Object.freeze(
          new Map([[IDS.edge, Object.freeze({ shippedAtTick: 1n, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null })]]),
        ),
      }),
    });
    const thr: GameState = Object.freeze({
      ...before,
      throttle: Object.freeze({
        version: 1,
        entries: Object.freeze(
          new Map([[IDS.edge, Object.freeze({ shippedAtTick: 1n, cutSlots: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null })]]),
        ),
      }),
    });
    const digests = new Set([digestState(rec), digestState(iso), digestState(thr)]);
    expect(digests.size).toBe(3);
  });

  it("×100 determinism: the SAME door feed re-applied on fresh states yields ONE digest", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const run = applyIntentDoor(baseState(), ctx(2n), [
        ext(2n, 1, ARM),
        ext(2n, 2, { ...ARM, targetNodeId: IDS.origin, effectiveAtBusinessMinute: 77 }),
      ]);
      digests.add(digestState(run.state));
    }
    expect(digests.size).toBe(1);
  });
});

/* ═══════════════ MACHINE-PINNED refusal census (reclaim adds ZERO) ═══════════════ */

describe("refusal census — reclaim-node raises NO new code (46 UNMOVED)", () => {
  it("intent-door.ts still raises EXACTLY 46 unique refusal codes after the 19th verb", () => {
    // The restart landing machine-pinned the census at 46 (the wave-20 review
    // retired prose-only pinning); the L-DM5 headline is that reclaim-node is
    // the FIRST tier-extension verb to add ZERO phrases — the count must ride
    // UNMOVED. Same extractor as intent-door-restart.test.ts (its falsifiability
    // against parent SHAs was proven there — this copy pins the delta).
    const source = readFileSync(fileURLToPath(new URL("../intent-door.ts", import.meta.url)), "utf8");
    const codes = new Set<string>();
    const re = /(?:reason:\s*|reject\([^,]+,\s*)["`]([a-z][a-z0-9-]*)/g;
    for (const match of source.matchAll(re)) codes.add(match[1] as string);
    expect(codes.size).toBe(46);
    // the THREE phrases reclaim reuses are present (they were before — this
    // pins the reuse set is real, not a typo the fold would never raise):
    for (const reused of ["empty-node-id", "bad-effective-minute", "unknown-node"]) {
      expect(codes.has(reused)).toBe(true);
    }
    // and the refusal the law FORBIDS is absent — no nothing-to-collect gate:
    expect(codes.has("nothing-to-collect")).toBe(false);
    expect(codes.has("empty-reclaim-book")).toBe(false);
  });
});

/* ═══════════════════════════ LIVE door-fed sweep ═══════════════════════════ */

type LiveFrame = {
  edgeOccupied: readonly EntityId[];
  edgeQueue: readonly EntityId[];
  served: readonly EntityId[];
  bounced: readonly EntityId[];
  digest: string;
};

/** The isolate-file congested board: 1-slot edge + roomy origin, 6/min.
 *  reclaim is a NO-OP COLLECTOR here — nothing else is booked — so the
 *  state-neutrality witness is the whole ledger riding BYTE-EQUAL while the
 *  embed + hands move. */
function live(opts: { ticks?: number; armAtTick?: number; rate?: number } = {}): LiveFrame[] {
  const config = testConfig({
    runSeed: asRunSeed(31n),
    defaultPatienceUs: 3n * MIN,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
  });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    purgeTargetedMinNodes: 0,
  });
  let state: GameState = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "reclaim-live-test",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "reclaim-live", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: Object.freeze([node(IDS.edge, { slots: 1, serviceUs: MIN }), node(IDS.origin, { slots: 8, serviceUs: MIN })]),
  });
  const frames: LiveFrame[] = [];
  for (let t = 0; t < (opts.ticks ?? 12); t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> & Pick<TickInputs, "envelopes"> & {
      externalIntents?: readonly ExternalIntent[];
    } = {
      envelopes: Object.freeze([envelope("reclaim:probe", fromInt(opts.rate ?? 6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (opts.armAtTick !== undefined && opts.armAtTick === t + 1) {
      const args: ReclaimArgs = {
        verb: PlayerVerb.ReclaimNode,
        targetNodeId: IDS.edge,
        effectiveAtBusinessMinute: null,
      };
      partial.externalIntents = Object.freeze([
        Object.freeze({
          tick: BigInt(t + 1),
          intent: Object.freeze({
            seq: 1,
            clock: "sim" as const,
            atUs: BigInt(t + 1) * MIN,
            origin: "player" as const,
            payload: Object.freeze({ kind: "player-verb" as const, args }),
          }),
        }),
      ]);
    }
    const result = driver.advance(state, tickInputs(partial));
    state = result.state;
    const edge = state.nodes.get(IDS.edge);
    frames.push({
      edgeOccupied: Object.freeze((edge?.slots ?? []).flatMap((s) => (s.occupied && s.unitId !== null ? [s.unitId] : []))),
      edgeQueue: edge?.queue ?? Object.freeze([]),
      served: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bounced: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
      digest: digestState(state),
    });
  }
  return frames;
}

const ledgers = (frames: LiveFrame[]): [EntityId[][], EntityId[][]] => [
  frames.map((f) => [...f.served]),
  frames.map((f) => [...f.bounced]),
];

describe("reclaim-node — LIVE door-fed sweep (the book pays through the real path)", () => {
  it("door-fed sweep at t2: book materializes (shippedAtTick = 2 = the EXECUTING tick), receipt executed", () => {
    // The frame where the door runs is tick 2 — the stamp is tick 2, not 1
    // (the isolate-file cadence law: payment precedes the handler, the book
    // records the executing tick).
    const frames = live({ armAtTick: 2, ticks: 4 });
    expect(frames.length).toBe(4);
    // the digest MOVES the tick the book lands (embed) and stays moved:
    const bare = live({ ticks: 4 });
    expect(frames[2]?.digest).not.toBe(bare[2]?.digest);
  });

  it("state-neutral on an unbooked board: served/bounced rosters BYTE-EQUAL the unarmed run", () => {
    // reclaim voids only player BOOKINGS; nothing is booked here, so every
    // capacity read rides unchanged — the tombstone is pure history.
    const armed = live({ armAtTick: 2 });
    const bare = live();
    expect(ledgers(armed)).toStrictEqual(ledgers(bare));
    // congested control: the board really ran hot (the equality is non-vacuous)
    const totalBounced = armed.reduce((n, f) => n + f.bounced.length, 0);
    expect(totalBounced).toBeGreaterThan(0);
  });

  it("the sweep pays normal hands: busy 1 tick after t2, both free again by t5", () => {
    const config = testConfig({
      runSeed: asRunSeed(31n),
      defaultPatienceUs: 3n * MIN,
      expressPath: Object.freeze([IDS.edge, IDS.origin]),
      deepPath: Object.freeze([IDS.edge, IDS.origin]),
    });
    const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
      purgeTargetedMinNodes: 0,
    });
    let state: GameState = Object.freeze({
      ...createInitialState({
        runSeed: config.runSeed,
        engineVersion: "reclaim-hands-test",
        contentHashes: { rulesetCardHashes: {}, sheetsHash: "reclaim-hands", ruleBookHash: "" },
        clocks: freshClocks(),
        nodes: Object.freeze([node(IDS.edge, { slots: 1, serviceUs: MIN }), node(IDS.origin, { slots: 8, serviceUs: MIN })]),
        handCapacity: 2,
      }),
    });
    const args: ReclaimArgs = { verb: PlayerVerb.ReclaimNode, targetNodeId: IDS.edge, effectiveAtBusinessMinute: null };
    const armed = driver.advance(state, tickInputs({
      envelopes: Object.freeze([envelope("reclaim:probe", fromInt(0))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
      externalIntents: Object.freeze([Object.freeze({
        tick: 1n,
        intent: Object.freeze({
          seq: 1, clock: "sim" as const, atUs: MIN, origin: "player" as const,
          payload: Object.freeze({ kind: "player-verb" as const, args }),
        }),
      })]),
    }));
    state = armed.state;
    // executed through the REAL driver feed:
    expect(armed.doorReceipts.some((r) => r.outcome === "executed" && r.verb === "reclaim-node")).toBe(true);
    expect(state.reclaim?.entries.get(IDS.edge)?.shippedAtTick).toBe(1n);
    // occupancy: every token… ONE of the two is busy until 2:
    const busy = (state.hands?.tokens ?? []).filter((t) => t.busyUntilTick !== null && t.busyUntilTick > 1n);
    expect(busy.length).toBe(1);
    const after = driver.advance(state, tickInputs({
      envelopes: Object.freeze([envelope("reclaim:probe", fromInt(0))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    }));
    const stillBusy = (after.state.hands?.tokens ?? []).filter((t) => t.busyUntilTick !== null && t.busyUntilTick > 2n);
    expect(stillBusy.length).toBe(0); // released at tick 2 — 1-tick COMMIT class
  });

  it("armed run is deterministic ×100 fresh driver closures (Set.size 1 — replay-gate substrate)", () => {
    const finals = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const frames = live({ armAtTick: 2, ticks: 12 });
      finals.add(frames[11]?.digest ?? "lost");
    }
    expect(finals.size).toBe(1);
  });
});
