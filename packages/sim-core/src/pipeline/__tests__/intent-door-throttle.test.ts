/**
 * THROTTLE-NODE — the 17th door verb (ADR-0016 successor program, lane
 * L-TR: the dbaas card's OWN second verb, verbatim §1.3 "The Managed
 * Database" "**Verb: isolate and throttle.**", and the §7.16 Act-row
 * one-click law the isolate landing cited — the cut dials the fence's
 * total case down to a player-authored PARTIAL capacity loss).
 *
 * Refusal-census honesty (amends the 44-code count carried by the
 * isolate-node landing, in the intent-door.test.ts "32-code" census's own
 * disclosed-stale-by-design tradition): throttle adds exactly ONE new
 * phrase — `bad-cut-slots` (44 → 45); its other five refusals
 * (`empty-node-id`, `bad-effective-minute`, `bad-release-minute`,
 * `release-before-effective`, `unknown-node`) reuse the isolate census
 * entries verbatim — what is new is only which verbs can raise them. The
 * `bad-cut-slots` RANGE leg (cut ≥ roster) is the door's promise that the
 * fence stays the total case: the refusal itself points the player at
 * `isolate-node`.
 *
 * Pins (the isolate contract pattern, mirrored deliberately):
 *  - the ONLY state effect is one frozen entry in the OPTIONAL
 *    `GameState.throttle` book — the door never touches units, slots,
 *    rosters, queues, or RNG (the cut lands at step 5 as an
 *    ADMISSION-CEILING discount through pipeline/throttle.ts + defaults.ts
 *    §(c), proven in throttle-consume.test.ts);
 *  - occupancy class: COMMIT (1 hand / 1 tick) — the one-click Act-row
 *    law; a taste drift is a red test;
 *  - M2 wire wall: all four arg keys are STRUCTURAL (missing/wrong type
 *    throws IntentDoorError; `cutSlots` is a plain `number` — null cut is
 *    STRUCTURAL garbage, the opposite of the nullable minute legs); the
 *    value domain is the six-code refusal space; a FLOAT cut passes the
 *    wire (typeof number) and refuses at `bad-cut-slots` — the scale
 *    reservedSlots family position;
 *  - half-open window law VERBATIM from the fence: `release <= effective`
 *    (both non-null) refuses — the EQUAL boundary is the empty cut; a
 *    null effective with release 0 ACCEPTS as already-expired inert
 *    history (the maintain close-0 posture, lane L-DM2 @5987ef1);
 *  - cut 0 is the explicit LIFT amendment — booked, executed, and inert to
 *    the fold (`nodeThrottleCut` answers null; pinned consume-side);
 *  - last-write-wins COW: same node twice ⇒ version 2 with ONE entry (the
 *    cut-0 amendment IS the lift — no dedicated un-throttle verb in v0);
 *  - digest-switch law: absent book ⇒ every digest byte-identical; present
 *    book ⇒ digest moves, insertion-order-independent, every field (incl.
 *    cutSlots and BOTH -1 null-sentinels) participates.
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  PlayerVerbArgs,
  SimTick,
  ThrottleArgs,
  ThrottleBook,
  TickContext,
} from "../../types";
import { asEntityId, asRunSeed, PlayerVerb } from "../../types";
import { MICROS_PER_MIN } from "../../kernel/time";
import { initialClocks } from "../../kernel/time";
import { createInitialState } from "../driver";
import { digestState } from "../digest";
import {
  applyIntentDoor,
  createBoardState,
  createThrottleBook,
  IntentDoorError,
  DEFAULT_INTENT_HAND_COST,
  DEFAULT_INTENT_OCCUPANCY_TICKS,
} from "../intent-door";
import { IDS, node } from "./helpers";

const MIN = MICROS_PER_MIN;

/* ═══════════════════════ fixtures (intent-door-isolate pattern) ═══════════════════════ */

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
    engineVersion: "test-throttle",
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

const ARM: ThrottleArgs = {
  verb: PlayerVerb.ThrottleNode,
  targetNodeId: IDS.edge,
  cutSlots: 1,
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

/* ═══════════════════════════ happy path — the cut book writes ═══════════════════════════ */

describe("throttle-node — execution and the cut book", () => {
  it("executes: one frozen entry, canonical detail, book materialized lazily", () => {
    const before = baseState();
    expect(before.throttle).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.throttle;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    const entry = book?.entries.get(IDS.edge);
    expect(entry).toEqual({
      shippedAtTick: 3n,
      cutSlots: 1,
      effectiveAtBusinessMinute: null,
      releaseAtBusinessMinute: null,
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const event = result.events[0];
    expect(event?.kind).toBe("intent-executed");
    expect(event?.kind === "intent-executed" && event.detail).toBe("target=edge,cut=1,eff=now,rel=indefinite");
  });

  it("a future business-minute stamp rides the entry verbatim and extends the detail", () => {
    const result = applyIntentDoor(baseState(), ctx(1n), [
      ext(1n, 1, { ...ARM, effectiveAtBusinessMinute: 43_200 }),
    ]);
    expect(result.state.throttle?.entries.get(IDS.edge)).toEqual({
      shippedAtTick: 1n,
      cutSlots: 1,
      effectiveAtBusinessMinute: 43_200,
      releaseAtBusinessMinute: null,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "target=edge,cut=1,eff=43200,rel=indefinite",
    );
  });

  it("a release stamp rides verbatim: eff=100, rel=200 ⇒ the half-open [100,200) window", () => {
    const result = applyIntentDoor(baseState(), ctx(2n), [
      ext(2n, 1, { ...ARM, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 200 }),
    ]);
    expect(result.state.throttle?.entries.get(IDS.edge)).toEqual({
      shippedAtTick: 2n,
      cutSlots: 1,
      effectiveAtBusinessMinute: 100,
      releaseAtBusinessMinute: 200,
    });
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "target=edge,cut=1,eff=100,rel=200",
    );
  });

  it("cut 0 executes — the explicit LIFT amendment is booked, not elided", () => {
    // Booking the lift keeps the amendment as history (digest raw); the
    // READER answers null for cut < 1 (pinned consume-side). The door
    // refuses nothing here: 0 ∈ [0, roster).
    const result = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, { ...ARM, cutSlots: 0 })]);
    expect(outcomeOf(result, 1)).toBe("executed");
    expect(result.state.throttle?.entries.get(IDS.edge)?.cutSlots).toBe(0);
    expect(result.events[0]?.kind === "intent-executed" && result.events[0].detail).toBe(
      "target=edge,cut=0,eff=now,rel=indefinite",
    );
  });

  it("commit-class occupancy ladder: 1 hand, 1 tick, busyUntil = tick + 1 (the one-click Act-row pin)", () => {
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.ThrottleNode]).toBe(1);
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.ThrottleNode]).toBe(1);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM)]);
    const event = result.events[0];
    expect(event?.kind === "intent-executed" && event.handIndexes).toEqual([0]);
    expect(event?.kind === "intent-executed" && event.busyUntilTick).toBe(6n);
  });

  it("re-arming the SAME node is last-write-wins COW: version 2, one entry, first book untouched", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.throttle as ThrottleBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, cutSlots: 0 }), // the lift amendment replaces the cut
    ]);
    const book2 = second.state.throttle as ThrottleBook;
    expect(book2.version).toBe(2);
    expect(book2.entries.size).toBe(1);
    expect(book2.entries.get(IDS.edge)).toEqual({
      shippedAtTick: 2n,
      cutSlots: 0,
      effectiveAtBusinessMinute: null,
      releaseAtBusinessMinute: null,
    });
    // the earlier book is a frozen snapshot — identity AND shape intact:
    expect(book1.version).toBe(1);
    expect(book1.entries.get(IDS.edge)?.cutSlots).toBe(1);
    expect(book2.entries).not.toBe(book1.entries);
  });

  it("distinct nodes accumulate (two entries, version 2); scope audit keeps origin slices identical", () => {
    const before = baseState();
    const first = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM)]);
    const second = applyIntentDoor(first.state, ctx(1n), [
      ext(1n, 2, { ...ARM, targetNodeId: IDS.origin, cutSlots: 0 }), // origin roster 1 ⇒ cut 0 is its only legal value
    ]);
    expect(second.state.throttle?.version).toBe(2);
    expect(second.state.throttle?.entries.size).toBe(2);
    expect(second.state.nodes).toBe(before.nodes);
    expect(second.state.lanes).toBe(before.lanes);
    expect(second.state.observed).toBe(before.observed);
    expect(second.state.cash).toBe(before.cash);
    expect(second.state.corruption).toBe(before.corruption); // the door never marks
    expect(second.state.units).toBe(before.units); // the cut writes NO roster
  });

  it("createThrottleBook is the empty frozen book (version 0, zero entries)", () => {
    const empty = createThrottleBook();
    expect(empty.version).toBe(0);
    expect(empty.entries.size).toBe(0);
    expect(Object.isFrozen(empty)).toBe(true);
    expect(Object.isFrozen(empty.entries)).toBe(true);
  });
});

/* ═══════════════════ refusals — ONE new code (two legs) + five reused ═══════════════════ */

describe("throttle-node — refusals (census amended: 44 → 45, disclosed)", () => {
  const feed = (args: unknown) =>
    applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, args as ThrottleArgs)]);

  it("empty-node-id is the bare-code guard (shield/scale/isolate family, reused verbatim)", () => {
    expect(refused(feed({ ...ARM, targetNodeId: "" }), 1)).toBe("empty-node-id");
  });

  it("bad-cut-slots SHAPE leg: negative, float, NaN, Infinity refuse (value domain, never throws)", () => {
    for (const bad of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const reason = refused(feed({ ...ARM, cutSlots: bad }), 1);
      expect(reason, String(bad)).toMatch(/^bad-cut-slots: /);
      expect(reason).toContain("must be a safe integer in [0, roster)");
      expect(reason).toContain("for a total fence use isolate-node");
    }
  });

  it("bad-cut-slots RANGE leg: cut == roster refuses with the concrete bound and points at isolate-node", () => {
    // edge roster = 2 ⇒ [0, 2):  the dbaas card's "throttle everything"
    // is NOT a cut of 2 — it is the fence, and the refusal says so.
    const equal = refused(feed({ ...ARM, cutSlots: 2 }), 1);
    expect(equal).toBe(
      "bad-cut-slots: 2 must be a safe integer in [0, 2) (0 = explicit lift amendment; for a total fence use isolate-node)",
    );
    expect(refused(feed({ ...ARM, cutSlots: 5 }), 1)).toContain("in [0, 2)");
    // origin roster = 1 ⇒ only cut 0 is legal there:
    expect(refused(feed({ ...ARM, targetNodeId: IDS.origin, cutSlots: 1 }), 1)).toContain("in [0, 1)");
  });

  it("the roster leg runs AFTER unknown-node (the roster is only known once the node exists)", () => {
    // cut 99 on a ghost names the GHOST, not the cut — refusal order pin:
    expect(refused(feed({ ...ARM, targetNodeId: "ghost", cutSlots: 99 }), 1)).toBe('unknown-node: "ghost"');
  });

  it("bad-effective-minute keeps the shield phrasing VERBATIM; 0 is legal", () => {
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: -1 }), 1)).toMatch(
      /^bad-effective-minute: -1 must be a safe integer >= 0 \(or null = now\)$/,
    );
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: 1.5 }), 1)).toMatch(/^bad-effective-minute: /);
    expect(outcomeOf(feed({ ...ARM, effectiveAtBusinessMinute: 0 }), 1)).toBe("executed");
  });

  it("bad-release-minute is the fence phrase reused VERBATIM; 0 with null effective is the inert-history ACCEPT", () => {
    expect(refused(feed({ ...ARM, releaseAtBusinessMinute: -3 }), 1)).toMatch(
      /^bad-release-minute: -3 must be a safe integer >= 0 \(or null = indefinite\)$/,
    );
    expect(outcomeOf(feed({ ...ARM, releaseAtBusinessMinute: 0 }), 1)).toBe("executed");
  });

  it("release-before-effective refuses with the half-open law; the EQUAL boundary refuses too", () => {
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 50 }), 1)).toMatch(
      /^release-before-effective: release 50 must be > effective 100/,
    );
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 100 }), 1)).toMatch(
      /^release-before-effective: release 100 must be > effective 100/,
    );
    expect(refused(feed({ ...ARM, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 50 }), 1)).toContain(
      "(the cut window is half-open [effective, release))",
    );
  });

  it("the cross-compare runs ONLY when both minutes are non-null (shield as-of exemption)", () => {
    expect(outcomeOf(feed({ ...ARM, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 0 }), 1)).toBe(
      "executed",
    );
    expect(outcomeOf(feed({ ...ARM, effectiveAtBusinessMinute: 43_200, releaseAtBusinessMinute: null }), 1)).toBe(
      "executed",
    );
  });

  it('unknown-node: "ghost" reuses the shed/configure/isolate phrase exactly', () => {
    expect(refused(feed({ ...ARM, targetNodeId: "ghost" }), 1)).toBe('unknown-node: "ghost"');
  });

  it("a refusal after a live book leaves the book UNTOUCHED (identity) and spends no hand", () => {
    const first = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, ARM)]);
    const book1 = first.state.throttle as ThrottleBook;
    const second = applyIntentDoor(first.state, ctx(2n), [
      ext(2n, 2, { ...ARM, cutSlots: 7 }), // out of range → refusal
    ]);
    expect(second.state.throttle).toBe(book1); // same object, not a copy
    const hands = second.state.hands;
    expect(hands?.tokens.filter((t) => t.busyCauseId === "intent:2")).toHaveLength(0);
    // seq 1's occupation from the FIRST pass has matured by tick 2 (busyUntil
    // 2n ≤ 2n), so the only tokens booked this pass are none at all:
    expect(hands?.tokens.every((t) => t.busyCauseId === null)).toBe(true);
  });

  it("the six-code refusal space is complete (order: hands, id, cut-shape, minutes, cross, world, cut-range)", () => {
    const feedAt = (args: unknown, capacityState = baseState()) =>
      applyIntentDoor(capacityState, ctx(1n), [ext(1n, 1, args as ThrottleArgs)]);
    // exhausted hands outrank everything (payment precedes interpretation):
    const drained = baseState(1);
    const spent = applyIntentDoor(drained, ctx(1n), [
      ext(1n, 1, ARM), // takes the only hand (cut 1, roster 2 — legal)
      ext(1n, 9, { ...ARM, cutSlots: 99 }), // seq 9: no free hand → not even parsed-domain checked
    ]);
    expect(refused(spent, 9)).toMatch(/^hands-exhausted/);
    // (the cut-shape leg beats the minute legs; the ghost node beats the
    // range leg — pinned above; the fence's five legs are pinned verbatim):
    expect(refused(feedAt({ ...ARM, cutSlots: -2, effectiveAtBusinessMinute: -1 }), 1)).toMatch(/^bad-cut-slots/);
    expect(refused(feedAt({ ...ARM, effectiveAtBusinessMinute: -1, releaseAtBusinessMinute: -2 }), 1)).toMatch(
      /^bad-effective-minute/,
    );
  });
});

/* ═══════════════════ M2 structural wall (throws, never refuses) ═══════════════════ */

describe("throttle-node — M2 structural wall (throws, never refuses)", () => {
  const forge = (args: Record<string, unknown>) =>
    applyIntentDoor(baseState(2), ctx(1n), [ext(1n, 1, args as unknown as PlayerVerbArgs)]);

  it("every missing arg key is structural garbage — the door THROWS", () => {
    expect(() =>
      forge({ verb: PlayerVerb.ThrottleNode, cutSlots: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null }),
    ).toThrow(IntentDoorError);
    expect(() =>
      forge({ verb: PlayerVerb.ThrottleNode, targetNodeId: "edge", effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null }),
    ).toThrow(IntentDoorError);
    expect(() =>
      forge({ verb: PlayerVerb.ThrottleNode, targetNodeId: "edge", cutSlots: 1, releaseAtBusinessMinute: null }),
    ).toThrow(IntentDoorError);
    expect(() =>
      forge({ verb: PlayerVerb.ThrottleNode, targetNodeId: "edge", cutSlots: 1, effectiveAtBusinessMinute: null }),
    ).toThrow(IntentDoorError);
  });

  it("wrong wire TYPES throw: number node id, STRING and NULL cut (non-nullable), string minute, array release", () => {
    expect(() => forge({ ...ARM, targetNodeId: 42 })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, cutSlots: "1" })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, cutSlots: null })).toThrow(IntentDoorError); // the key difference from the minute legs
    expect(() => forge({ ...ARM, effectiveAtBusinessMinute: "5" })).toThrow(IntentDoorError);
    expect(() => forge({ ...ARM, releaseAtBusinessMinute: [480] })).toThrow(IntentDoorError);
    // exactOptionalPropertyTypes: an explicit `undefined` is the same garbage:
    expect(() => forge({ ...ARM, cutSlots: undefined })).toThrow(IntentDoorError);
  });

  it("the error names the offending field path", () => {
    try {
      forge({ ...ARM, cutSlots: "1" });
      throw new Error("expected IntentDoorError");
    } catch (error) {
      expect(error).toBeInstanceOf(IntentDoorError);
      expect((error as IntentDoorError).message).toContain("externalIntents[0].intent.payload.args.cutSlots");
    }
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

function bookOf(
  entries: readonly (readonly [EntityId, { shippedAtTick: bigint; cut: number; eff: number | null; rel: number | null }])[],
  version = 1,
): ThrottleBook {
  return Object.freeze({
    version,
    entries: Object.freeze(
      new Map<EntityId, { shippedAtTick: bigint; cutSlots: number; effectiveAtBusinessMinute: number | null; releaseAtBusinessMinute: number | null }>(
        entries.map(([id, e]) => [
          id,
          Object.freeze({
            shippedAtTick: e.shippedAtTick,
            cutSlots: e.cut,
            effectiveAtBusinessMinute: e.eff,
            releaseAtBusinessMinute: e.rel,
          }),
        ]),
      ),
    ),
  }) as ThrottleBook;
}

describe("throttle-node — the digest switch", () => {
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
    const emptyBook: GameState = Object.freeze({ ...before, throttle: createThrottleBook() });
    expect(digestState(emptyBook)).not.toBe(digestState(before));
    expect(digestState(emptyBook)).not.toBe(digestState(planted.state));
  });

  it("insertion-order-independent: same entries, different Map order, SAME digest", () => {
    const forward = bookOf([
      [IDS.edge, { shippedAtTick: 1n, cut: 1, eff: null, rel: null }],
      [IDS.origin, { shippedAtTick: 1n, cut: 0, eff: null, rel: 500 }],
    ]);
    const reverse = bookOf([
      [IDS.origin, { shippedAtTick: 1n, cut: 0, eff: null, rel: 500 }],
      [IDS.edge, { shippedAtTick: 1n, cut: 1, eff: null, rel: null }],
    ]);
    const before = baseState();
    expect(digestState(Object.freeze({ ...before, throttle: forward }))).toBe(
      digestState(Object.freeze({ ...before, throttle: reverse })),
    );
  });

  it("field-participation twins: every sentinel and the cut itself move the digest", () => {
    const before = baseState();
    const dig = (e: { shippedAtTick: bigint; cut: number; eff: number | null; rel: number | null }): string =>
      digestState(Object.freeze({ ...before, throttle: bookOf([[IDS.edge, e]]) }));
    // the CUT participates (cut 0 ≠ cut 1 — the lift amendment is history):
    expect(dig({ shippedAtTick: 1n, cut: 0, eff: null, rel: null })).not.toBe(
      dig({ shippedAtTick: 1n, cut: 1, eff: null, rel: null }),
    );
    // null ≠ 0 on BOTH minute legs (the sentinel is unambiguous by door law):
    expect(dig({ shippedAtTick: 1n, cut: 1, eff: null, rel: null })).not.toBe(dig({ shippedAtTick: 1n, cut: 1, eff: null, rel: 0 }));
    expect(dig({ shippedAtTick: 1n, cut: 1, eff: null, rel: null })).not.toBe(dig({ shippedAtTick: 1n, cut: 1, eff: 0, rel: null }));
    // write order and version ride the fold:
    expect(dig({ shippedAtTick: 1n, cut: 1, eff: null, rel: null })).not.toBe(dig({ shippedAtTick: 2n, cut: 1, eff: null, rel: null }));
    const v1 = bookOf([[IDS.edge, { shippedAtTick: 1n, cut: 1, eff: null, rel: null }]]);
    const v2: ThrottleBook = Object.freeze({ ...v1, version: 2 });
    expect(digestState(Object.freeze({ ...before, throttle: v1 }))).not.toBe(
      digestState(Object.freeze({ ...before, throttle: v2 })),
    );
  });

  it("throttle and isolate books digest apart (distinct fold namespaces, not a shared shape)", () => {
    const before = baseState();
    const iso: GameState = Object.freeze({
      ...before,
      isolate: Object.freeze({
        version: 1,
        entries: Object.freeze(
          new Map([[IDS.edge, Object.freeze({ shippedAtTick: 1n, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null })]]),
        ),
      }),
    });
    const thr: GameState = Object.freeze({ ...before, throttle: bookOf([[IDS.edge, { shippedAtTick: 1n, cut: 1, eff: null, rel: null }]]) });
    expect(digestState(iso)).not.toBe(digestState(thr));
  });
});
