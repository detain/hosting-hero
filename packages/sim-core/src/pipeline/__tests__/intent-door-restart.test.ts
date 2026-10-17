/**
 * RESTART-NODE — the 18th door verb (ADR-0016 successor program, lane
 * L-RS: the LAST unbuilt §7.16 Act-row verb — "drain, restart, isolate,
 * shed"; drain rides disconnect-drain, shed rides shed-load, isolate
 * landed @86cff89, throttle @81b0589 — Restart closes the row. §7.5's
 * reference durations (~:26741: "restart a service **20s**") price the
 * desk tap: COMMIT class, one hand / one tick).
 *
 * Refusal-census honesty (amends the 45-code count carried by the
 * throttle-node landing): restart adds exactly ONE new phrase —
 * `bad-drop-mode` (45 → 46); its other five refusals (`empty-node-id`,
 * `bad-effective-minute`, `bad-release-minute`, `release-before-effective`,
 * `unknown-node`) reuse the fence census entries verbatim — what is new is
 * only which verbs can raise them. `unknown-node` is now raised by ELEVEN
 * verbs. The census is additionally MACHINE-PINNED in this suite by a
 * source-read over intent-door.ts (the wave-20 review finding: the census
 * prose was pinned only by prose) — the count must equal 46 and the set
 * must contain `bad-drop-mode`.
 *
 * The BOUNDARY that keeps restart from being an isolate-in-disguise: the
 * release leg is a REQUIRED plain `number` on the wire. A null release is
 * STRUCTURAL garbage (M2 throws) — the door refuses to fork the fence
 * under another name. `dropQueued` is the closed-vocab STRING {drop,keep}
 * (ArgWireType has no boolean arm): a planted BOOLEAN `true` throws at the
 * wall naming the string law; off-vocab strings refuse `bad-drop-mode`.
 *
 * Pins (the throttle contract pattern, mirrored deliberately):
 *  - the ONLY state effect is one frozen entry in the OPTIONAL
 *    `GameState.restart` book — the door never touches units, slots,
 *    rosters, queues, or RNG (the reboot lands at step 5 as a FENCE and a
 *    QUEUE FLUSH through pipeline/restart.ts + defaults.ts §(c)/(c′),
 *    proven in restart-consume.test.ts);
 *  - occupancy class: COMMIT (1 hand / 1 tick) — the one-click Act-row
 *    law; a taste drift is a red test;
 *  - M2 wire wall: all four arg keys are STRUCTURAL (missing/wrong type
 *    throws IntentDoorError); the value domain is the six-code refusal
 *    space; a FLOAT release passes the wire (typeof number) and refuses
 *    at `bad-release-minute` — the throttle shape/range split position;
 *  - half-open window law VERBATIM from the fence: `release <= effective`
 *    (effective non-null) refuses — the EQUAL boundary is the empty
 *    reboot; a null effective with release 0 ACCEPTS as already-expired
 *    inert history (the maintain close-0 posture, lane L-DM2 @5987ef1);
 *  - last-write-wins COW: same node twice ⇒ version 2 with ONE entry (no
 *    dedicated un-restart verb in v0 — the REQUIRED release bounds every
 *    reboot by construction);
 *  - digest-switch law: absent book ⇒ every digest byte-identical; present
 *    book ⇒ digest moves, insertion-order-independent, every field
 *    participates — incl. the dropQueued BOOL (keep vs drop of the same
 *    window are DIFFERENT laws) and BOTH minute legs (the release leg has
 *    NO -1 sentinel: it is required).
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  PlayerVerbArgs,
  RestartArgs,
  RestartBook,
  RestartEntry,
  SimTick,
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
  createRestartBook,
  IntentDoorError,
  DEFAULT_INTENT_HAND_COST,
  DEFAULT_INTENT_OCCUPANCY_TICKS,
} from "../intent-door";
import { IDS, node } from "./helpers";

const MIN = MICROS_PER_MIN;

/* ═══════════════════════ fixtures (intent-door-throttle pattern) ═══════════════════════ */

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
    engineVersion: "test-restart",
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

const ARM_DROP: RestartArgs = {
  verb: PlayerVerb.RestartNode,
  targetNodeId: IDS.edge,
  dropQueued: "drop",
  effectiveAtBusinessMinute: null,
  releaseAtBusinessMinute: 480,
};

const ARM_KEEP: RestartArgs = { ...ARM_DROP, dropQueued: "keep" };

function entryOf(
  partial: Partial<RestartEntry> & { shippedAtTick?: bigint } = {},
): RestartEntry {
  return Object.freeze({
    shippedAtTick: partial.shippedAtTick ?? 1n,
    dropQueued: partial.dropQueued ?? true,
    effectiveAtBusinessMinute:
      partial.effectiveAtBusinessMinute === undefined ? null : partial.effectiveAtBusinessMinute,
    releaseAtBusinessMinute: partial.releaseAtBusinessMinute ?? 480,
  });
}

function bookOf(rows: readonly (readonly [EntityId, RestartEntry])[], version = 1): RestartBook {
  return Object.freeze({
    version,
    entries: Object.freeze(new Map<EntityId, RestartEntry>(rows)),
  });
}

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

/* ═══════════════════════ happy path — the reboot book writes ═══════════════════════ */

describe("restart-node — execution and the reboot book", () => {
  it("executes drop mode: one frozen entry, canonical detail, book materialized lazily", () => {
    const before = baseState();
    expect(before.restart).toBeUndefined();
    const result = applyIntentDoor(before, ctx(3n), [ext(3n, 1, ARM_DROP)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    const book = result.state.restart;
    expect(book).toBeDefined();
    expect(book?.version).toBe(1);
    expect(book?.entries.size).toBe(1);
    const entry = book?.entries.get(IDS.edge);
    expect(entry).toEqual({
      shippedAtTick: 3n,
      dropQueued: true,
      effectiveAtBusinessMinute: null,
      releaseAtBusinessMinute: 480,
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(book)).toBe(true);
    const receipt = result.receipts.find((r) => r.seq === 1);
    expect(receipt?.detail).toBe(
      `target=${IDS.edge},drop=drop,eff=now,rel=480`,
    );
  });

  it('executes keep mode: dropQueued=false, detail reads "keep" — the bounded-fence rung', () => {
    const result = applyIntentDoor(baseState(), ctx(2n), [ext(2n, 1, ARM_KEEP)]);
    expect(outcomeOf(result, 1)).toBe("executed");
    expect(result.state.restart?.entries.get(IDS.edge)?.dropQueued).toBe(false);
    expect(result.receipts.find((r) => r.seq === 1)?.detail).toBe(
      `target=${IDS.edge},drop=keep,eff=now,rel=480`,
    );
  });

  it("a future business-minute stamp rides the entry verbatim and extends the detail", () => {
    const result = applyIntentDoor(
      baseState(),
      ctx(4n),
      [ext(4n, 1, { ...ARM_DROP, effectiveAtBusinessMinute: 100 })],
    );
    expect(result.state.restart?.entries.get(IDS.edge)).toEqual(
      entryOf({ shippedAtTick: 4n, effectiveAtBusinessMinute: 100 }),
    );
    expect(result.receipts.find((r) => r.seq === 1)?.detail).toContain(",eff=100,rel=480");
  });

  it("eff=100, rel=200 executes — the half-open [100,200) window with BOTH stamps in the detail", () => {
    const result = applyIntentDoor(
      baseState(),
      ctx(2n),
      [ext(2n, 1, { ...ARM_DROP, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 200 })],
    );
    expect(outcomeOf(result, 1)).toBe("executed");
    expect(result.state.restart?.entries.get(IDS.edge)).toEqual(
      entryOf({ shippedAtTick: 2n, effectiveAtBusinessMinute: 100, releaseAtBusinessMinute: 200 }),
    );
  });

  it("commit-class occupancy ladder: 1 hand, 1 tick, busyUntil = tick + 1 (the one-click Act-row pin)", () => {
    expect(DEFAULT_INTENT_OCCUPANCY_TICKS[PlayerVerb.RestartNode]).toBe(1);
    expect(DEFAULT_INTENT_HAND_COST[PlayerVerb.RestartNode]).toBe(1);
    const result = applyIntentDoor(baseState(1), ctx(5n), [ext(5n, 1, ARM_DROP)]);
    const event = result.events[0];
    if (event?.kind !== "intent-executed") throw new Error("expected an executed event");
    expect(event.handIndexes).toEqual([0]);
    expect(event.busyUntilTick).toBe(6n);
  });

  it("re-arming the SAME node is last-write-wins COW: version 2, one entry, first book untouched", () => {
    const first = applyIntentDoor(baseState(), ctx(2n), [ext(2n, 1, ARM_DROP)]);
    const second = applyIntentDoor(
      first.state,
      ctx(6n),
      [ext(6n, 1, { ...ARM_KEEP, releaseAtBusinessMinute: 900 })],
    );
    expect(second.state.restart?.version).toBe(2);
    expect(second.state.restart?.entries.size).toBe(1);
    expect(second.state.restart?.entries.get(IDS.edge)).toEqual(
      entryOf({ shippedAtTick: 6n, dropQueued: false, releaseAtBusinessMinute: 900 }),
    );
    expect(first.state.restart?.version).toBe(1);
  });

  it("distinct nodes accumulate (two entries, version 2); scope audit keeps origin slices identical", () => {
    const before = baseState();
    const result = applyIntentDoor(
      before,
      ctx(2n),
      [ext(2n, 1, ARM_DROP), ext(2n, 2, { ...ARM_KEEP, targetNodeId: IDS.origin })],
    );
    expect(result.state.restart?.entries.size).toBe(2);
    expect(result.state.restart?.version).toBe(2);
    // the door writes ONLY the book:
    expect(result.state.units).toBe(before.units);
    expect(result.state.nodes).toBe(before.nodes);
    expect(result.state.observed).toBe(before.observed);
    expect(result.state.cash).toBe(before.cash);
  });

  it("createRestartBook is the empty frozen book (version 0, zero entries)", () => {
    const book = createRestartBook();
    expect(book.version).toBe(0);
    expect(book.entries.size).toBe(0);
    expect(Object.isFrozen(book)).toBe(true);
    expect(Object.isFrozen(book.entries)).toBe(true);
  });

  it("null effective + release 0 ACCEPTS — already-expired inert history (maintain close-0 posture)", () => {
    const result = applyIntentDoor(
      baseState(),
      ctx(3n),
      [ext(3n, 1, { ...ARM_DROP, releaseAtBusinessMinute: 0 })],
    );
    expect(outcomeOf(result, 1)).toBe("executed");
    expect(result.state.restart?.entries.get(IDS.edge)?.releaseAtBusinessMinute).toBe(0);
  });

  it("the door writes NO queue, NO roster, NO unit (state-neutral law — nodes deep-untouched)", () => {
    const before = baseState();
    const result = applyIntentDoor(before, ctx(2n), [ext(2n, 1, ARM_DROP)]);
    expect(result.state.nodes.get(IDS.edge)?.queue).toStrictEqual(
      before.nodes.get(IDS.edge)?.queue,
    );
    expect(result.state.nodes.get(IDS.edge)?.slots).toBe(before.nodes.get(IDS.edge)?.slots);
  });
});

/* ═══════════════════════════════ refusals ═══════════════════════════════ */

describe("restart-node — refusals (census amended: 45 → 46, disclosed)", () => {
  it("empty-node-id is the bare-code guard (fence family, reused verbatim)", () => {
    const result = applyIntentDoor(
      baseState(),
      ctx(1n),
      [ext(1n, 1, { ...ARM_DROP, targetNodeId: "" as EntityId })],
    );
    expect(refused(result, 1)).toBe("empty-node-id");
  });

  it('bad-drop-mode is the ONE new phrase: off-vocab strings refuse with the {drop,keep} law (bad-tone twin)', () => {
    for (const junk of ["", "DROP", "dr0p", "yes", "queue", "drop "]) {
      const result = applyIntentDoor(
        baseState(),
        ctx(1n),
        [ext(1n, 1, { ...ARM_DROP, dropQueued: junk as RestartArgs["dropQueued"] })],
      );
      expect(refused(result, 1)).toBe(`bad-drop-mode: "${junk}" not in {drop,keep}`);
    }
  });

  it("bad-effective-minute keeps the shield phrasing VERBATIM; 0 is legal", () => {
    const bad = applyIntentDoor(
      baseState(),
      ctx(1n),
      [ext(1n, 1, { ...ARM_DROP, effectiveAtBusinessMinute: -3 })],
    );
    expect(refused(bad, 1)).toBe(
      "bad-effective-minute: -3 must be a safe integer >= 0 (or null = now)",
    );
    const zero = applyIntentDoor(
      baseState(),
      ctx(1n),
      [ext(1n, 1, { ...ARM_DROP, effectiveAtBusinessMinute: 0, releaseAtBusinessMinute: 60 })],
    );
    expect(outcomeOf(zero, 1)).toBe("executed");
  });

  it("bad-release-minute guards the VALUE domain (float/NaN/Infinity/-1 refuse — the TYPE wall already ate null)", () => {
    for (const junk of [-1, 2.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const result = applyIntentDoor(
        baseState(),
        ctx(1n),
        [ext(1n, 1, { ...ARM_DROP, releaseAtBusinessMinute: junk })],
      );
      expect(refused(result, 1)).toContain("bad-release-minute");
    }
  });

  it("release-before-effective refuses with the half-open law; the EQUAL boundary refuses too", () => {
    const equal = applyIntentDoor(
      baseState(),
      ctx(1n),
      [ext(1n, 1, { ...ARM_DROP, effectiveAtBusinessMinute: 200, releaseAtBusinessMinute: 200 })],
    );
    expect(refused(equal, 1)).toContain("release-before-effective");
    expect(refused(equal, 1)).toContain("the reboot window is half-open [effective, release)");
    const past = applyIntentDoor(
      baseState(),
      ctx(1n),
      [ext(1n, 1, { ...ARM_DROP, effectiveAtBusinessMinute: 300, releaseAtBusinessMinute: 100 })],
    );
    expect(refused(past, 1)).toContain("release-before-effective");
  });

  it("the cross-compare runs ONLY when effective is non-null (shield as-of exemption; null eff + rel 0 stands)", () => {
    const result = applyIntentDoor(
      baseState(),
      ctx(1n),
      [ext(1n, 1, { ...ARM_DROP, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 0 })],
    );
    expect(outcomeOf(result, 1)).toBe("executed");
  });

  it('unknown-node: "ghost" reuses the fence phrase exactly (eleventh verb to raise it)', () => {
    const result = applyIntentDoor(
      baseState(),
      ctx(1n),
      [ext(1n, 1, { ...ARM_DROP, targetNodeId: asEntityId("ghost") })],
    );
    expect(refused(result, 1)).toBe('unknown-node: "ghost"');
  });

  it("a refusal after a live book leaves the book UNTOUCHED (identity) and spends no hand", () => {
    const armed = applyIntentDoor(baseState(1), ctx(2n), [ext(2n, 1, ARM_DROP)]);
    const refusedRun = applyIntentDoor(
      armed.state,
      ctx(2n),
      [ext(2n, 2, { ...ARM_DROP, targetNodeId: asEntityId("ghost") })],
    );
    expect(refusedRun.state.restart).toBe(armed.state.restart);
    // the single hand is still busy on the FIRST order (the refusal re-spent nothing):
    expect(refusedRun.state.hands?.tokens[0]?.busyUntilTick).toBe(3n);
  });

  it("the six-code refusal space is complete (order: id, drop-mode, eff, rel, cross, world)", () => {
    const cases: Array<[string, Partial<RestartArgs>]> = [
      ["empty-node-id", { targetNodeId: "" as EntityId }],
      ["bad-drop-mode", { dropQueued: "shred" as RestartArgs["dropQueued"] }],
      ["bad-effective-minute", { effectiveAtBusinessMinute: -1 }],
      ["bad-release-minute", { releaseAtBusinessMinute: -2 }],
      ["release-before-effective", { effectiveAtBusinessMinute: 500, releaseAtBusinessMinute: 500 }],
      ["unknown-node", { targetNodeId: asEntityId("ghost") }],
    ];
    for (const [code, patch] of cases) {
      const result = applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, { ...ARM_DROP, ...patch })]);
      expect(refused(result, 1).split(":")[0]).toBe(code);
    }
  });
});

/* ═══════════════════════ M2 structural wall (throws, never refuses) ═══════════════════════ */

describe("restart-node — M2 structural wall (the door refuses to fork the fence)", () => {
  it("every missing arg key is structural garbage — the door THROWS", () => {
    for (const key of ["targetNodeId", "dropQueued", "effectiveAtBusinessMinute", "releaseAtBusinessMinute"]) {
      const args = { ...(ARM_DROP as unknown as Record<string, unknown>) };
      delete args[key];
      expect(() =>
        applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, args as unknown as RestartArgs)]),
      ).toThrow(IntentDoorError);
    }
  });

  it("a planted BOOLEAN true on dropQueued THROWS — the wire is the closed-vocab STRING {drop,keep}", () => {
    expect(() =>
      applyIntentDoor(
        baseState(),
        ctx(1n),
        [ext(1n, 1, { ...ARM_DROP, dropQueued: true as unknown as "drop" })],
      ),
    ).toThrow(/payload\.args\.dropQueued/);
    expect(() =>
      applyIntentDoor(
        baseState(),
        ctx(1n),
        [ext(1n, 1, { ...ARM_DROP, dropQueued: true as unknown as "drop" })],
      ),
    ).toThrow(/string/);
  });

  it("a NULL releaseAtBusinessMinute THROWS (type-mismatch): the required-number leg is what keeps restart from being an unbounded isolate", () => {
    expect(() =>
      applyIntentDoor(
        baseState(),
        ctx(1n),
        [ext(1n, 1, { ...ARM_DROP, releaseAtBusinessMinute: null as unknown as number })],
      ),
    ).toThrow(IntentDoorError);
    expect(() =>
      applyIntentDoor(
        baseState(),
        ctx(1n),
        [ext(1n, 1, { ...ARM_DROP, releaseAtBusinessMinute: null as unknown as number })],
      ),
    ).toThrow(/releaseAtBusinessMinute/);
  });

  it("wrong wire TYPES throw: number node id, numeric drop mode, string effective", () => {
    const junk: Array<Partial<RestartArgs>> = [
      { targetNodeId: 42 as unknown as EntityId },
      { dropQueued: 1 as unknown as "drop" },
      { effectiveAtBusinessMinute: "now" as unknown as number | null },
      { releaseAtBusinessMinute: "480" as unknown as number },
    ];
    for (const patch of junk) {
      expect(() =>
        applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, { ...ARM_DROP, ...patch })]),
      ).toThrow(IntentDoorError);
    }
  });

  it("the error names the offending field path", () => {
    expect(() =>
      applyIntentDoor(
        baseState(),
        ctx(1n),
        [ext(1n, 1, { ...ARM_DROP, dropQueued: undefined as unknown as "drop" })],
      ),
    ).toThrow(/externalIntents\[0\]\.intent\.payload\.args\.dropQueued/);
  });

  it("the explicit null IS the ONLY now form for effective — and BOTH {drop,keep} words are accepted by the wall", () => {
    for (const mode of ["drop", "keep"] as const) {
      expect(outcomeOf(applyIntentDoor(baseState(), ctx(1n), [ext(1n, 1, { ...ARM_DROP, dropQueued: mode })]), 1)).toBe("executed");
    }
  });
});

/* ═══════════════════════════════ digest switch ═══════════════════════════════ */

describe("restart-node — the digest switch", () => {
  it("absent book ⇒ digest byte-identical to the untouched state (zero movement)", () => {
    const before = baseState();
    expect(digestState(before)).toBe(digestState(baseState()));
    const refusedRun = applyIntentDoor(
      before,
      ctx(1n),
      [ext(1n, 1, { ...ARM_DROP, targetNodeId: asEntityId("ghost") })],
    );
    expect(refusedRun.state).toBe(before); // identity: nothing applied
  });

  it("present book moves the digest; empty book counts as present (embed law)", () => {
    const before = baseState();
    const armed = applyIntentDoor(before, ctx(1n), [ext(1n, 1, ARM_DROP)]);
    expect(digestState(armed.state)).not.toBe(digestState(before));
    const empty: GameState = Object.freeze({ ...before, restart: createRestartBook() });
    expect(digestState(empty)).not.toBe(digestState(before));
  });

  it("insertion-order-independent: same entries, different Map order, SAME digest", () => {
    const a: GameState = Object.freeze({
      ...baseState(),
      restart: bookOf([
        [IDS.edge, entryOf({ shippedAtTick: 1n })],
        [IDS.origin, entryOf({ shippedAtTick: 2n, dropQueued: false })],
      ]),
    });
    const b: GameState = Object.freeze({
      ...baseState(),
      restart: bookOf(
        [
          [IDS.origin, entryOf({ shippedAtTick: 2n, dropQueued: false })],
          [IDS.edge, entryOf({ shippedAtTick: 1n })],
        ],
        1,
      ),
    });
    expect(digestState(a)).toBe(digestState(b));
  });

  it("field-participation twins: key, shippedAtTick, dropQueued, effective sentinel, release — EVERY leg moves the digest", () => {
    const anchor: GameState = Object.freeze({
      ...baseState(),
      restart: bookOf([[IDS.edge, entryOf({ shippedAtTick: 1n, dropQueued: true, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 480 })]]),
    });
    const twins: Array<GameState> = [
      Object.freeze({ ...baseState(), restart: bookOf([[IDS.origin, entryOf({ shippedAtTick: 1n })]]) }), // key
      Object.freeze({ ...baseState(), restart: bookOf([[IDS.edge, entryOf({ shippedAtTick: 2n })]]) }), // tick
      Object.freeze({ ...baseState(), restart: bookOf([[IDS.edge, entryOf({ dropQueued: false })]]) }), // BOOL leg
      Object.freeze({ ...baseState(), restart: bookOf([[IDS.edge, entryOf({ effectiveAtBusinessMinute: 100 })]]) }), // -1 sentinel leg
      Object.freeze({ ...baseState(), restart: bookOf([[IDS.edge, entryOf({ releaseAtBusinessMinute: 481 })]]) }), // release leg (no sentinel: required)
    ];
    const base = digestState(anchor);
    for (const twin of twins) expect(digestState(twin)).not.toBe(base);
  });

  it("restart, isolate and throttle digest APART (distinct fold namespaces, not a shared shape)", () => {
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
    const thr: GameState = Object.freeze({
      ...before,
      throttle: Object.freeze({
        version: 1,
        entries: Object.freeze(
          new Map([[IDS.edge, Object.freeze({ shippedAtTick: 1n, cutSlots: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null })]]),
        ),
      }),
    });
    const rst: GameState = Object.freeze({ ...before, restart: bookOf([[IDS.edge, entryOf()]]) });
    const digests = new Set([digestState(iso), digestState(thr), digestState(rst)]);
    expect(digests.size).toBe(3);
  });

  it("×100 determinism: the SAME door feed re-applied on fresh states yields ONE digest", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const run = applyIntentDoor(baseState(), ctx(2n), [
        ext(2n, 1, ARM_DROP),
        ext(2n, 2, { ...ARM_KEEP, targetNodeId: IDS.origin }),
      ]);
      digests.add(digestState(run.state));
    }
    expect(digests.size).toBe(1);
  });
});

/* ═══════════ MACHINE-PINNED refusal census (wave-20 review finding) ═══════════ */

describe("refusal census — machine-pinned by source-read (prose-only pinning RETIRED)", () => {
  it("intent-door.ts raises EXACTLY 46 unique refusal codes, and bad-drop-mode is one of them", () => {
    // The door suite headers prose-pinned 32 → 39 → 44 → 45 across the
    // waves; the wave-20 review named that as a nice-to-have finding ("the
    // census is pinned only by prose"). This test closes it: read the door
    // SOURCE and count the unique first tokens of every refusal reason
    // literal (`reason: "code…"` / `reason: \`code…\`` / `reject(label,
    // "code…")`) — one code before the colon or end of literal.
    const source = readFileSync(
      fileURLToPath(new URL("../intent-door.ts", import.meta.url)),
      "utf8",
    );
    const codes = new Set<string>();
    const re = /(?:reason:\s*|reject\([^,]+,\s*)["`]([a-z][a-z0-9-]*)/g;
    for (const match of source.matchAll(re)) codes.add(match[1] as string);
    // 46 = the 45 the throttle landing carried + `bad-drop-mode` (restart,
    // lane L-RS). The five fence codes restart reuses spend NO census.
    expect(codes.size).toBe(46);
    expect(codes.has("bad-drop-mode")).toBe(true);
    for (const reused of ["empty-node-id", "bad-effective-minute", "bad-release-minute", "release-before-effective", "unknown-node"]) {
      expect(codes.has(reused)).toBe(true);
    }
  });
});
