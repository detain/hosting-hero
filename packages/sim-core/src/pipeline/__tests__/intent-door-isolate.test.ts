/**
 * ISOLATE-NODE — the 16th door verb (ADR-0015 session-6 roster extension:
 * the twelfth type's card verb §1.3 dbaas "**Verb: isolate and throttle.**",
 * and the §7.16 Act-row law — "drain, restart, isolate, shed" — finally
 * catching the spec).
 *
 * Refusal-census honesty (amends the 42-code count carried by the
 * negotiate-terms landing, in the intent-door.test.ts "32-code" census's
 * own disclosed-stale-by-design tradition): isolate adds TWO new phrases —
 * `bad-release-minute` and `release-before-effective` (42 → 44); its other
 * three refusals (`empty-node-id`, `bad-effective-minute`, `unknown-node`)
 * reuse the shield/scale census entries verbatim — what is new is only
 * which verbs can raise them.
 *
 * Pins (the shield contract-#10 pattern, mirrored deliberately):
 *  - the ONLY state effect is one frozen entry in the OPTIONAL
 *    `GameState.isolate` book — the door never touches units, slots,
 *    rosters, queues, or RNG (the fence lands at step 5 through
 *    pipeline/isolation.ts + defaults.ts §(c), proven in
 *    isolation-consume.test.ts);
 *  - occupancy class: COMMIT (1 hand / 1 tick) — the one-click Act-row law;
 *    a taste drift is a red test;
 *  - M2 wire wall: all three arg keys are STRUCTURAL (missing/wrong type
 *    throws IntentDoorError); explicit `null` is the only "now"/"indefinite"
 *    form; the value domain is the five-code refusal space;
 *  - half-open window law: `release <= effective` (both non-null) refuses —
 *    the EQUAL boundary is the empty fence and cannot exist; a null
 *    effective with release 0 ACCEPTS as already-expired inert history
 *    (the maintain close-0 posture, lane L-DM2 @5987ef1);
 *  - last-write-wins COW: same node twice ⇒ version 2 with ONE entry (the
 *    amendment IS the lift — no dedicated un-isolate verb in v0);
 *  - digest-switch law: absent book ⇒ every digest byte-identical; present
 *    book ⇒ digest moves, insertion-order-independent, every field
 *    (incl. BOTH -1 null-sentinels) participates.
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  IsolateArgs,
  IsolateBook,
  PlayerVerbArgs,
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
  createIsolateBook,
  IntentDoorError,
  DEFAULT_INTENT_HAND_COST,
  DEFAULT_INTENT_OCCUPANCY_TICKS,
} from "../intent-door";
import { createDefaultSlots } from "../defaults";
import { shieldBusinessMinuteOf } from "../corruption";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

const MIN = MICROS_PER_MIN;

/* ═══════════════════════════ fixtures (intent-door-shield pattern) ═══════════════════════════ */

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
    engineVersion: "test-isolate",
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

const ARM: IsolateArgs = {
  verb: PlayerVerb.IsolateNode,
  targetNodeId: IDS.edge,
  effectiveAtBusinessMinute: null,
  releaseAtBusinessMinute: null,
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

/* ═══════════════════════════ happy path — the fence book writes ═══════════════════════════ */

describe("isolate-node — execution and the fence book", () => {
  it("executes: one frozen entry, canonical detail, book materialized lazily", () => {
    const before = baseState();
    expect(before.isolate).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.isolate;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    const entry = book?.entries.get(IDS.edge);
    expect(entry).toEqual({
      shippedAtTick: 3n,
      effectiveAtBusinessMinute: null,
      releaseAtBusinessMinute: null,
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe("target=edge,eff=now,rel=indefinite");
  });

  it("a future business-minute stamp rides the entry verbatim and extends the detail", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, effectiveAtBusinessMinute: 43_200 }),
    ]);
    expect(result.state.isolate?.entries.get(IDS.edge)).toEqual({
      shippedAtTick: 1n,
      effectiveAtBusinessMinute: 43_200,
      releaseAtBusinessMinute: null,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "target=edge,eff=43200,rel=indefinite",
    );
  });

  it("a release stamp rides verbatim: eff=100, rel=200 ⇒ the half-open [100,200) window", () => {
    const result = applyIntentDoor(baseState(), ctx(2n), [
      ext(2n, 1, { ...ARM, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 200 }),
    ]);
    expect(result.state.isolate?.entries.get(IDS.edge)).toEqual({
      shippedAtTick: 2n,
      effectiveAtBusinessMinute: 100,
      releaseAtBusinessMinute: 200,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "target=edge,eff=100,rel=200",
    );
  });

  it("commit-class occupancy ladder: 1 hand, 1 tick, busyUntil = tick + 1 (the one-click Act-row pin)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.IsolateNode]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.IsolateNode]).toBe(1);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(6n);
  });

  it("re-arming the SAME node is last-write-wins COW: version 2, one entry, first book untouched", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.isolate as IsolateBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, releaseAtBusinessMinute: 500 }),
    ]);
    const book2 = second.state.isolate as IsolateBook;
    expect(book2.version).toBe(2);
    expect(book2.entries.size).toBe(1);
    expect(book2.entries.get(IDS.edge)).toEqual({
      shippedAtTick: 2n,
      effectiveAtBusinessMinute: null,
      releaseAtBusinessMinute: 500,
    });
    // the earlier book is a frozen snapshot — identity AND shape intact:
    expect(book1.version).toBe(1);
    expect(book1.entries.get(IDS.edge)?.releaseAtBusinessMinute).toBeNull();
    expect(book2.entries).not.toBe(book1.entries);
  });

  it("distinct nodes accumulate (two entries, version 2); scope audit keeps origin slices identical", () => {
    const before = baseState();
    const first = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    const second = applyIntentDoor(first.state, ctx(1n), [
      ext(1n, 2, { ...ARM, targetNodeId: IDS.origin }),
    ]);
    expect(second.state.isolate?.version).toBe(2);
    expect(second.state.isolate?.entries.size).toBe(2);
    expect(second.state.nodes).toBe(before.nodes);
    expect(second.state.lanes).toBe(before.lanes);
    expect(second.state.observed).toBe(before.observed);
    expect(second.state.cash).toBe(before.cash);
    expect(second.state.corruption).toBe(before.corruption); // the door never marks
  });

  it("createIsolateBook is the empty frozen book (version 0, zero entries)", () => {
    const empty = createIsolateBook();
    expect(empty.version).toBe(0);
    expect(empty.entries.size).toBe(0);
    expect(Object.isFrozen(empty)).toBe(true);
    expect(Object.isFrozen(empty.entries)).toBe(true);
  });
});

/* ═══════════════════ refusals — TWO new codes + three reused ═══════════════════ */

describe("isolate-node — refusals (census amended: 42 → 44, disclosed)", () => {
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

  it("bad-release-minute is the NEW sibling phrase; 0 with null effective is the inert-history ACCEPT", () => {
    expect(refused(feed({ ...ARM, releaseAtBusinessMinute: -3 }), 1)).toMatch(
      /^bad-release-minute: -3 must be a safe integer >= 0 \(or null = indefinite\)$/,
    );
    expect(refused(feed({ ...ARM, releaseAtBusinessMinute: 2.5 }), 1)).toMatch(/^bad-release-minute: 2\.5/);
    expect(refused(feed({ ...ARM, releaseAtBusinessMinute: NaN }), 1)).toMatch(/^bad-release-minute: NaN/);
    // maintain close-0 posture (L-DM2): already-expired at every future
    // minute, kept as raw history witness — the fence NEVER enforces.
    expect(outcomeOf(feed({ ...ARM, releaseAtBusinessMinute: 0 }), 1)).toBe("executed");
    expect(feed({ ...ARM, releaseAtBusinessMinute: 0 }).state.isolate?.entries.get(IDS.edge))
      .toMatchObject({ effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 0 });
  });

  it("release-before-effective refuses with the half-open law; the EQUAL boundary refuses too", () => {
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 100 }), 1)).toBe(
      "release-before-effective: release 100 must be > effective 100 (the fence window is half-open [effective, release))",
    );
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 99 }), 1)).toMatch(
      /^release-before-effective: release 99 must be > effective 100/,
    );
    expect(outcomeOf(feed({ ...ARM, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 101 }), 1)).toBe(
      "executed",
    );
  });

  it("the cross-compare runs ONLY when both minutes are non-null (shield as-of exemption)", () => {
    // null effective + release 5: no integer minute compares against "now"
    // at the door — the FOLD decides whether it is already expired.
    expect(outcomeOf(feed({ ...ARM, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 5 }), 1)).toBe(
      "executed",
    );
  });

  it('unknown-node: "ghost" reuses the shed/configure phrase exactly', () => {
    expect(refused(feed({ ...ARM, targetNodeId: asEntityId("ghost") }), 1)).toBe('unknown-node: "ghost"');
  });

  it("a refusal after a live book leaves the book UNTOUCHED (identity) and spends no hand", () => {
    const seeded = applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, ARM)]);
    const book = seeded.state.isolate as IsolateBook;
    const next = applyIntentDoor(seeded.state, ctx(4n), [
      ext(4n, 2, { ...ARM, targetNodeId: asEntityId("ghost") }),
    ]);
    expect(next.state.isolate).toBe(book);
    expect(next.state.isolate?.entries.size).toBe(1);
    // undo law: the refused entry's hand refund leaves BOTH tokens free again:
    const busy = (next.state.hands?.tokens ?? []).filter(
      (t) => t.busyUntilTick !== null && t.busyUntilTick > 4n,
    );
    expect(busy.length).toBe(0);
  });
});

/* ═══════════════════════════ M2 wire wall ═══════════════════════════ */

describe("isolate-node — M2 structural wall (throws, never refuses)", () => {
  const forge = (args: Record<string, unknown>) =>
    applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, args as unknown as PlayerVerbArgs)]);

  it("every missing arg key is structural garbage — the door THROWS", () => {
    expect(() => forge({ verb: PlayerVerb.IsolateNode, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null })).toThrow(
      IntentDoorError,
    );
    expect(() => forge({ verb: PlayerVerb.IsolateNode, targetNodeId: "edge", releaseAtBusinessMinute: null })).toThrow(
      IntentDoorError,
    );
    expect(() => forge({ verb: PlayerVerb.IsolateNode, targetNodeId: "edge", effectiveAtBusinessMinute: null })).toThrow(
      IntentDoorError,
    );
  });

  it("wrong wire TYPES throw: number node id, string minute, undefined-as-null, array release", () => {
    expect(() => forge({ ...ARM, targetNodeId: 42 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: "5" })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, releaseAtBusinessMinute: "5" })).toThrow(IntentDoorError);
    // exactOptionalPropertyTypes: an explicit `undefined` is the same garbage:
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: undefined })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, releaseAtBusinessMinute: [480] })).toThrow(IntentDoorError);
  });

  it("the explicit null sentinels are the ONLY now/indefinite forms", () => {
    expect(outcomeOf(forge({ ...ARM, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null }), 1)).toBe(
      "executed",
    );
    expect(outcomeOf(forge({ ...ARM, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 480 }), 1)).toBe(
      "executed",
    );
  });
});

/* ═══════════════════════════ digest-switch law ═══════════════════════════ */

function bookOf(entries: readonly (readonly [EntityId, { shippedAtTick: bigint; eff: number | null; rel: number | null }])[]): IsolateBook {
  return Object.freeze({
    version: 1,
    entries: Object.freeze(
      new Map<EntityId, { shippedAtTick: bigint; effectiveAtBusinessMinute: number | null; releaseAtBusinessMinute: number | null }>(
        entries.map(([id, e]) => [
          id,
          Object.freeze({
            shippedAtTick: e.shippedAtTick,
            effectiveAtBusinessMinute: e.eff,
            releaseAtBusinessMinute: e.rel,
          }),
        ]),
      ),
    ),
  }) as IsolateBook;
}

describe("isolate-node — the digest switch", () => {
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
    const emptyBook: GameState = Object.freeze({ ...before, isolate: createIsolateBook() });
    expect(digestState(emptyBook)).not.toBe(digestState(before));
    expect(digestState(emptyBook)).not.toBe(digestState(planted.state));
  });

  it("insertion-order-independent: same entries, different Map order, SAME digest", () => {
    const forward = bookOf([
      [IDS.edge, { shippedAtTick: 1n, eff: null, rel: null }],
      [IDS.origin, { shippedAtTick: 1n, eff: null, rel: 500 }],
    ]);
    const reverse = bookOf([
      [IDS.origin, { shippedAtTick: 1n, eff: null, rel: 500 }],
      [IDS.edge, { shippedAtTick: 1n, eff: null, rel: null }],
    ]);
    const before = baseState();
    expect(digestState(Object.freeze({ ...before, isolate: forward }))).toBe(
      digestState(Object.freeze({ ...before, isolate: reverse })),
    );
  });

  it("field-participation twins: every sentinel distinction moves the digest", () => {
    const before = baseState();
    const dig = (e: { shippedAtTick: bigint; eff: number | null; rel: number | null }): string =>
      digestState(Object.freeze({ ...before, isolate: bookOf([[IDS.edge, e]]) }));
    // null ≠ 0 on BOTH minute legs (the sentinel is unambiguous by door law):
    expect(dig({ shippedAtTick: 1n, eff: null, rel: null })).not.toBe(dig({ shippedAtTick: 1n, eff: null, rel: 0 }));
    expect(dig({ shippedAtTick: 1n, eff: null, rel: null })).not.toBe(dig({ shippedAtTick: 1n, eff: 0, rel: null }));
    // write order and version ride the fold:
    expect(dig({ shippedAtTick: 1n, eff: null, rel: null })).not.toBe(dig({ shippedAtTick: 2n, eff: null, rel: null }));
    const v1 = bookOf([[IDS.edge, { shippedAtTick: 1n, eff: null, rel: null }]]);
    const v2: IsolateBook = Object.freeze({ ...v1, version: 2 });
    expect(digestState(Object.freeze({ ...before, isolate: v1 }))).not.toBe(
      digestState(Object.freeze({ ...before, isolate: v2 })),
    );
  });
});

/* ═══════════════════════════ LIVE door-fed fence ═══════════════════════════ */

type LiveFrame = {
  bizMinute: number;
  edgeOccupied: readonly EntityId[];
  edgeQueue: readonly EntityId[];
  originOccupied: readonly EntityId[];
  served: readonly EntityId[];
  bounced: readonly EntityId[];
  digest: string;
};

/** Congested 1-slot edge + roomy origin, 6/min, patience 3 min — the
 *  corruption-shield board: admissions, ageing and bounces all fire. */
function live(opts: {
  ticks?: number;
  armAtTick?: number;
  eff?: number | null;
  rel?: number | null;
} = {}): LiveFrame[] {
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
    engineVersion: "isolate-live-test",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "isolate-live", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: Object.freeze([node(IDS.edge, { slots: 1, serviceUs: MIN }), node(IDS.origin, { slots: 8, serviceUs: MIN })]),
  });
  const frames: LiveFrame[] = [];
  for (let t = 0; t < (opts.ticks ?? 20); t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> & Pick<TickInputs, "envelopes"> & {
      externalIntents?: readonly ExternalIntent[];
    } = {
      envelopes: Object.freeze([envelope("isolate:probe", fromInt(6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (opts.armAtTick !== undefined && opts.armAtTick === t + 1) {
      const args: IsolateArgs = {
        verb: PlayerVerb.IsolateNode,
        targetNodeId: IDS.edge,
        effectiveAtBusinessMinute: opts.eff ?? null,
        releaseAtBusinessMinute: opts.rel ?? null,
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
    const origin = state.nodes.get(IDS.origin);
    frames.push({
      bizMinute: shieldBusinessMinuteOf(state.context.clocks),
      edgeOccupied: Object.freeze((edge?.slots ?? []).flatMap((s) => (s.occupied && s.unitId !== null ? [s.unitId] : []))),
      edgeQueue: edge?.queue ?? Object.freeze([]),
      originOccupied: Object.freeze((origin?.slots ?? []).flatMap((s) => (s.occupied && s.unitId !== null ? [s.unitId] : []))),
      served: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bounced: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
      digest: digestState(state),
    });
  }
  return frames;
}

const sumBy = (frames: LiveFrame[], pick: (f: LiveFrame) => readonly unknown[]): number =>
  frames.reduce((n, f) => n + pick(f).length, 0);

describe("isolate-node — LIVE door-fed fence (the book pays through the real path)", () => {
  it("baseline congests: the 1-slot edge keeps taking NEW occupants and some terminals serve", () => {
    const frames = live();
    expect(sumBy(frames, (f) => f.served)).toBeGreaterThan(0);
    // the edge saw more than two distinct occupants across the run:
    const distinct = new Set(frames.flatMap((f) => f.edgeOccupied));
    expect(distinct.size).toBeGreaterThan(2);
  });

  it("door-fed fence (arm t2, indefinite) ⇒ NO new edge occupants from t2 on; arrivals pile up and bounce", () => {
    const frames = live({ armAtTick: 2 });
    const t1Occupants = new Set(frames[0]?.edgeOccupied ?? []);
    // congested BEFORE the fence too — the t1 truth on this 1-slot board is
    // one admitted occupant and mint-stage bounce overflow (the queue cap
    // admits only its few waiting arms; the rest terminate bounced):
    expect((frames[0]?.edgeOccupied.length ?? 0)).toBe(1);
    expect((frames[0]?.bounced.length ?? 0)).toBeGreaterThan(0);
    // every occupant at t≥2 was already there at t1 — zero admissions:
    for (let t = 1; t < frames.length; t += 1) {
      for (const unitId of frames[t]?.edgeOccupied ?? []) {
        expect(t1Occupants.has(unitId), `tick ${t + 1}: fresh unit ${String(unitId)} admitted through the fence`).toBe(true);
      }
    }
    // the waiting arms stay parked under the fence (joins are NOT blocked —
    // the fence stops ADMISSIONS only) and the ledger proves the fence's
    // cost: at most the single t1 holder ever serves vs a serving baseline:
    const last = frames[frames.length - 1];
    expect((last?.edgeQueue.length ?? 0)).toBeGreaterThan(0);
    expect(sumBy(frames, (f) => f.bounced)).toBeGreaterThan(0);
    expect(sumBy(frames, (f) => f.served)).toBeLessThanOrEqual(t1Occupants.size); // only the t1 in-flight holder may serve through the fence
    // and the terminal ledger proves the fence COST serves vs baseline:
    expect(sumBy(frames, (f) => f.served)).toBeLessThan(sumBy(live(), (f) => f.served));
  });

  it("in-flight work COMPLETES through the fence: the t1 occupant walks off and moves downstream", () => {
    const frames = live({ armAtTick: 2, ticks: 8 });
    const first = frames[0]?.edgeOccupied[0];
    expect(first).toBeDefined();
    // serviceTime MIN ⇒ it releases at t2 (one tick), fenced or not:
    expect(frames[1]?.edgeOccupied.includes(first as EntityId)).toBe(false);
    // and it lands on the ORIGIN (in-flight completion, not an evict):
    const downstream = frames.slice(1).some((f) => f.originOccupied.includes(first as EntityId) || sumBy([f], (x) => x.served) > 0);
    expect(downstream).toBe(true);
  });

  it("release minute RE-ADMITTS: [now, rel) fences, at rel the gate opens — strict half-open boundary", () => {
    // business minute per tick = floor(t × 720/7): t1=102, t2=205, t3=308.
    // rel 206 fences ticks 1-2 and opens at tick 3:
    const gated = live({ armAtTick: 1, rel: 206, ticks: 10 });
    expect(gated[0]?.edgeOccupied.length).toBe(0); // t1 (102): fenced
    expect(gated[1]?.edgeOccupied.length).toBe(0); // t2 (205): fenced
    expect(gated[2]?.edgeOccupied.length).toBe(1); // t3 (308 ≥ 206): head walks in
    // the boundary is STRICT: rel 102 = released before tick 1 even serves —
    // at exactly `release` the fence is gone (half-open [eff, rel)):
    const atBoundary = live({ armAtTick: 1, rel: 102, ticks: 5 });
    expect(atBoundary[0]?.edgeOccupied.length).toBe(1);
    // rel 103 fences tick 1 ONLY (102 < 103 ≤ 205):
    const oneTick = live({ armAtTick: 1, rel: 103, ticks: 5 });
    expect(oneTick[0]?.edgeOccupied.length).toBe(0);
    expect(oneTick[1]?.edgeOccupied.length).toBe(1);
  });

  it("re-arm REPLACES: an open window re-armed indefinite closes the gate again (LWW across the window)", () => {
    const frames = liveTwoArm(); // arm t2 rel=206 (opens t3); re-arm t6 indefinite
    // the window really opened t3-t5 (distinct occupants cycling the slot):
    const window = new Set(frames.slice(2, 5).flatMap((f) => f.edgeOccupied));
    expect(window.size).toBeGreaterThan(1);
    // the t6 order REPLACES the row (LWW): from t6 on, nothing NEW walks in…
    for (let t = 5; t < frames.length; t += 1) {
      for (const unitId of frames[t]?.edgeOccupied ?? []) {
        expect(window.has(unitId), `tick ${t + 1} admitted through the re-armed fence`).toBe(true);
      }
    }
    // …and by the end even the last in-flight unit has walked off (the fence
    // holds ZERO — natural completion, never an eviction):
    expect(frames[frames.length - 1]?.edgeOccupied.length).toBe(0);
  });

  it("booked run is deterministic ×100 fresh driver closures (Set.size 1 — replay-gate substrate)", () => {
    const finals = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const frames = live({ armAtTick: 2, rel: 1_000_000, ticks: 12 });
      finals.add(frames[11]?.digest ?? "lost");
    }
    expect(finals.size).toBe(1);
  });
});

/** door-arms at t2 AND re-arms indefinite at t6 (LWW replacement across ticks). */
function liveTwoArm(): LiveFrame[] {
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
    engineVersion: "isolate-two-test",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "isolate-two", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: Object.freeze([node(IDS.edge, { slots: 1, serviceUs: MIN }), node(IDS.origin, { slots: 8, serviceUs: MIN })]),
  });
  const arm = (tick: number, rel: number | null): readonly ExternalIntent[] =>
    Object.freeze([
      Object.freeze({
        tick: BigInt(tick),
        intent: Object.freeze({
          seq: 1,
          clock: "sim" as const,
          atUs: BigInt(tick) * MIN,
          origin: "player" as const,
          payload: Object.freeze({
            kind: "player-verb" as const,
            args: Object.freeze({
              verb: PlayerVerb.IsolateNode,
              targetNodeId: IDS.edge,
              effectiveAtBusinessMinute: null,
              releaseAtBusinessMinute: rel,
            }) as IsolateArgs,
          }),
        }),
      }),
    ]);
  const frames: LiveFrame[] = [];
  for (let t = 0; t < 12; t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> & Pick<TickInputs, "envelopes"> & {
      externalIntents?: readonly ExternalIntent[];
    } = {
      envelopes: Object.freeze([envelope("isolate:probe", fromInt(6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (t === 1) partial.externalIntents = arm(2, 206);
    if (t === 5) partial.externalIntents = arm(6, null);
    const result = driver.advance(state, tickInputs(partial));
    state = result.state;
    const edge = state.nodes.get(IDS.edge);
    frames.push({
      bizMinute: shieldBusinessMinuteOf(state.context.clocks),
      edgeOccupied: Object.freeze((edge?.slots ?? []).flatMap((s) => (s.occupied && s.unitId !== null ? [s.unitId] : []))),
      edgeQueue: edge?.queue ?? Object.freeze([]),
      originOccupied: Object.freeze([]),
      served: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bounced: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
      digest: digestState(state),
    });
  }
  return frames;
}
