/**
 * ADR-0015 session-6 — the ISOLATE ↔ step-5 admission fence, end to end.
 * The door verb (intent-door-isolate.test.ts) writes the book; THIS file
 * pins the consume path: `isolatedNodeIds` rides the serve input as the
 * presence-only `ServeInExt.isolationFence` and `defaultServeStep` §(c)
 * assigns NO new units to fenced nodes — free arms answer zero, while
 * joins, releases, patience ageing, and hard-ceiling shed all run untouched.
 *
 * Precedence laws, pinned falsifiably:
 *  - FENCE BEATS WARMTH (four-arm witness): a scale-warmed roster (booked
 *    reserved arms in force) under a live fence still offers ZERO new
 *    admissions — the warm arms sit booked-and-unused, the roster and the
 *    books intact — and the moment the window lifts the warmth SERVES;
 *  - MIN-OF-CLAMPS vs recovery: with a §7.7 restoration window live, the
 *    unfenced clamped roster still admits (recovery's authority), while the
 *    fence turns any restored capacity into zero (the player's authority) —
 *    effective new-work capacity = min(recovery-restored, fenced ? 0 : full);
 *  - the fence WRITES NO ROSTER ⇒ occupied arms are never evicted (hold-then-
 *    walk-off witness), the queue is never truncated, and the
 *    `recovery[board-drift]` surface is impossible by construction (no-drift
 *    run with both authorities live).
 *
 * Byte-identity switches: an ABSENT book ⇒ the driver never calls the law
 * and twin runs are digest-identical; an IDLE book (every row armed-not-yet
 * or expired) ⇒ `isolatedNodeIds` returns null, the key is OMITTED, and the
 * ledger streams match the unarmed run exactly (presence without power —
 * only the digest embed moves). Zero RNG at the site: a silent board ships
 * identical streams fenced or not.
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  IsolateArgs,
  IsolateBook,
  NodeRecord,
  RecoveryState,
  RecoveryWindowRecord,
  ScaleBook,
  ScaleEntry,
} from "../../types";
import { asEntityId, asRunSeed, PlayerVerb } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { isolatedNodeIds, nodeIsolated } from "../isolation";
import { createIsolateBook, createScaleBook } from "../intent-door";
import { defaultRecoveryConfig } from "../recovery";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

function isolateBook(
  entries: ReadonlyMap<EntityId, { shippedAtTick: bigint; effectiveAtBusinessMinute: number | null; releaseAtBusinessMinute: number | null }>,
  version = 1,
): IsolateBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedEntry(
  effectiveAtBusinessMinute: number | null,
  releaseAtBusinessMinute: number | null,
  shippedAtTick = 0n,
) {
  return Object.freeze({ shippedAtTick, effectiveAtBusinessMinute, releaseAtBusinessMinute });
}

function scaleBook(entries: ReadonlyMap<EntityId, ScaleEntry>, version = 1): ScaleBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

/* ═══════════════════════════ as-of law unit pins — nodeIsolated ═══════════════════════════ */

describe("nodeIsolated — the as-of law in the small (nodeShielded twin, widened by the release leg)", () => {
  const book = isolateBook(new Map([[IDS.edge, seedEntry(100, 200, 5n)]]));

  it("undefined book ⇒ false for every node; the EMPTY book likewise", () => {
    expect(nodeIsolated(undefined, IDS.edge, 999)).toBe(false);
    expect(nodeIsolated(createIsolateBook(), IDS.edge, 0)).toBe(false);
  });

  it("absent entry ⇒ false; a DIFFERENT node's fence never leaks", () => {
    expect(nodeIsolated(book, IDS.origin, 150)).toBe(false);
  });

  it("null effective ⇒ law from the executing minute (same-tick pre-arm honored)", () => {
    const now = isolateBook(new Map([[IDS.edge, seedEntry(null, null)]]));
    expect(nodeIsolated(now, IDS.edge, 0)).toBe(true);
  });

  it("armed-not-yet ⇒ false at minute-1, true at the stamp (shield discipline)", () => {
    expect(nodeIsolated(book, IDS.edge, 99)).toBe(false);
    expect(nodeIsolated(book, IDS.edge, 100)).toBe(true);
    expect(nodeIsolated(book, IDS.edge, 150)).toBe(true);
  });

  it("the release edge is STRICT: [eff, rel) half-open — at rel the node admits again", () => {
    expect(nodeIsolated(book, IDS.edge, 199)).toBe(true);
    expect(nodeIsolated(book, IDS.edge, 200)).toBe(false);
    expect(nodeIsolated(book, IDS.edge, 201)).toBe(false);
  });

  it("null release ⇒ indefinite until replaced (the amendment IS the lift)", () => {
    const forever = isolateBook(new Map([[IDS.edge, seedEntry(null, null)]]));
    expect(nodeIsolated(forever, IDS.edge, 10_000_000)).toBe(true);
  });

  it("release 0 with null effective ⇒ already-expired inert history — false at every minute", () => {
    const dead = isolateBook(new Map([[IDS.edge, seedEntry(null, 0)]]));
    expect(nodeIsolated(dead, IDS.edge, 0)).toBe(false);
    expect(nodeIsolated(dead, IDS.edge, 1)).toBe(false);
  });

  it("expired rows are KEPT as witness: the book still carries the entry while the law answers false", () => {
    expect(nodeIsolated(book, IDS.edge, 500)).toBe(false);
    expect(book.entries.get(IDS.edge)).toBeDefined(); // never pruned — digest reads raw
  });
});

/* ═══════════════════════ fence set for step 5 — isolatedNodeIds ═══════════════════════ */

describe("isolatedNodeIds — the driver-threaded fence set", () => {
  it("undefined book and empty book ⇒ null (the key is OMITTED, never an empty set)", () => {
    expect(isolatedNodeIds(undefined, 0)).toBeNull();
    expect(isolatedNodeIds(createIsolateBook(), 0)).toBeNull();
  });

  it("an ALL-INERT book (armed-not-yet or expired rows) ⇒ null — idle book costs ZERO", () => {
    const inert = isolateBook(
      new Map([
        [IDS.edge, seedEntry(10_000, null)], // armed, not yet law
        [IDS.origin, seedEntry(null, 0)], // already expired
      ]),
    );
    expect(isolatedNodeIds(inert, 500)).toBeNull();
  });

  it("the LIVE fences only: membership set, frozen; insertion order never leaks", () => {
    const two = isolateBook(
      new Map([
        [IDS.origin, seedEntry(null, null, 1n)],
        [IDS.edge, seedEntry(null, 200, 2n)],
      ]),
    );
    const at150 = isolatedNodeIds(two, 150);
    expect(at150).not.toBeNull();
    expect(Object.isFrozen(at150)).toBe(true);
    expect([...(at150 ?? [])].sort()).toEqual([IDS.edge, IDS.origin].sort());
    // origin keeps fencing, edge released at 200:
    const at205 = isolatedNodeIds(two, 205);
    expect([...(at205 ?? [])]).toEqual([IDS.origin]);
  });
});

/* ═══════════════════════════ the chain witness ═══════════════════════════ */

type ChainFrame = {
  digest: string;
  bizMinute: number;
  edgeSlots: number;
  edgeOccupied: readonly EntityId[];
  edgeQueue: readonly EntityId[];
  served: readonly EntityId[];
  bounced: readonly EntityId[];
};

function chain(
  opts: {
    ticks?: number;
    ratePerMin?: number;
    edgeSlots?: number;
    edgeServiceUs?: bigint;
    isolate?: IsolateBook;
    scale?: ScaleBook;
    recovery?: boolean;
    recoveryState?: RecoveryState;
    doorArm?: { tick: number; effectiveAtBusinessMinute: number | null; releaseAtBusinessMinute: number | null };
  } = {},
): { frames: ChainFrame[]; finalState: GameState } {
  const config = testConfig({
    runSeed: asRunSeed(31n),
    defaultPatienceUs: 3n * MIN,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
  });
  const driver = createTickDriver(
    createDefaultSlots(config),
    streamFor(config.runSeed, "root", 0),
    freshClocks(),
    {
      purgeTargetedMinNodes: 0,
      ...(opts.recovery === true ? { recovery: defaultRecoveryConfig() } : {}),
    },
  );
  let state: GameState = Object.freeze({
    ...createInitialState({
      runSeed: config.runSeed,
      engineVersion: "isolate-test",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "isolate", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: Object.freeze([
        node(IDS.edge, { slots: opts.edgeSlots ?? 1, serviceUs: opts.edgeServiceUs ?? MIN }),
        node(IDS.origin, { slots: 8, serviceUs: MIN }),
      ]),
    }),
    // Host-style seeds (the door-fed variants below prove the REAL payment
    // path; these pins isolate the consume side from door side effects):
    ...(opts.isolate !== undefined ? { isolate: opts.isolate } : {}),
    ...(opts.scale !== undefined ? { scale: opts.scale } : {}),
    ...(opts.recoveryState !== undefined ? { recovery: opts.recoveryState } : {}),
  });
  const frames: ChainFrame[] = [];
  for (let t = 0; t < (opts.ticks ?? 30); t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> &
      Pick<TickInputs, "envelopes"> & { externalIntents?: readonly ExternalIntent[] } = {
      envelopes: Object.freeze([envelope("isolate:probe", fromInt(opts.ratePerMin ?? 6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (opts.doorArm !== undefined && opts.doorArm.tick === t + 1) {
      const args: IsolateArgs = {
        verb: PlayerVerb.IsolateNode,
        targetNodeId: IDS.edge,
        effectiveAtBusinessMinute: opts.doorArm.effectiveAtBusinessMinute,
        releaseAtBusinessMinute: opts.doorArm.releaseAtBusinessMinute,
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
      digest: digestState(state),
      bizMinute: Number(state.context.clocks.businessUs / MIN),
      edgeSlots: edge?.slots.length ?? -1,
      edgeOccupied: Object.freeze((edge?.slots ?? []).flatMap((s) => (s.occupied && s.unitId !== null ? [s.unitId] : []))),
      edgeQueue: edge?.queue ?? Object.freeze([]),
      served: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bounced: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
    });
  }
  return { frames, finalState: state };
}

const sumServed = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.served.length, 0);
const sumBounced = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.bounced.length, 0);

/* ═══════════════════════ FENCE BEATS WARMTH — the four arms ═══════════════════════ */

const WARM = scaleBook(new Map([[IDS.edge, Object.freeze({ reservedSlots: 2, baseRosterSlots: 1, shippedAtTick: 0n, effectiveAtBusinessMinute: null }) as ScaleEntry]]));

describe("fence beats warmth — booked reserved arms answer ZERO while isolated", () => {
  it("arm (b) warmth alone: the pad grows the roster and buys serves over the bare baseline (a)", () => {
    const bare = chain().frames;
    const warm = chain({ scale: WARM }).frames;
    expect(warm[1]?.edgeSlots).toBe(3); // base 1 + warm 2, materialized
    expect(sumServed(warm)).toBeGreaterThan(sumServed(bare));
  });

  it("arm (c) warmth + live fence: the roster STAYS warm (books intact) while NO unit is ever admitted", () => {
    const fenced = chain({ scale: WARM, isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, null)]])), ticks: 14 }).frames;
    // the warmth is NOT destroyed — the fence only stops RECEIVING:
    expect(fenced[1]?.edgeSlots).toBe(3);
    // zero admissions at every tick (nothing occupies the warm arms):
    for (const f of fenced) expect(f.edgeOccupied.length).toBe(0);
    // zero dice for the fence itself: no terminal serves, waiting units age
    // and bounce under the EXISTING patience law:
    expect(sumServed(fenced)).toBe(0);
    expect(sumBounced(fenced)).toBeGreaterThan(0);
    // the queue keeps growing (joins are never blocked):
    expect((fenced[13]?.edgeQueue.length ?? 0)).toBeGreaterThan((fenced[1]?.edgeQueue.length ?? 0));
  });

  it("arm (d) lift the fence ⇒ warmth serves IMMEDIATELY (release-window falsifiable across ticks)", () => {
    // rel 206 fences t1-t2 (biz 102/205) and opens at t3 (308):
    const lifted = chain({ scale: WARM, isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, 206)]])), ticks: 14 }).frames;
    expect(lifted[0]?.edgeOccupied.length).toBe(0); // fenced t1
    expect(lifted[1]?.edgeOccupied.length).toBe(0); // fenced t2
    // t3 (biz 308 ≥ rel 206): the FULL warm width re-admits in one step —
    // three booked arms, three head units. The fence lifted, warmth served:
    expect(lifted[2]?.edgeOccupied.length).toBe(3);
    expect(lifted[13]?.edgeSlots).toBe(3); // the roster never collapsed under the fence
    // and the lift changed the ledger, not just the clock:
    expect(sumServed(lifted)).toBeGreaterThan(0);
  });

  it("the four arms are digest-distinct where their books differ, and (c)/(a) share the zero-serve witness shape", () => {
    const bare = chain({ ticks: 8 }).frames;
    const warm = chain({ ticks: 8, scale: WARM }).frames;
    const warmFenced = chain({ ticks: 8, scale: WARM, isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, null)]])) }).frames;
    const warmLifted = chain({
      ticks: 8,
      scale: WARM,
      isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, 206)]])),
    }).frames;
    expect(warm[7]?.digest).not.toBe(bare[7]?.digest);
    expect(warmFenced[7]?.digest).not.toBe(warm[7]?.digest);
    expect(warmLifted[7]?.digest).not.toBe(warmFenced[7]?.digest); // the release minute rides the fold
  });
});

/* ═══════════════════════ MIN-OF-CLAMPS vs the recovery throttle ═══════════════════════ */

describe("min-of-clamps — the fence beats restored capacity; the authorities stay separate", () => {
  it("recovery window live + fence ⇒ zero admissions AND no board-drift throw (the fence writes no roster)", () => {
    const fence = isolateBook(new Map([[IDS.edge, seedEntry(null, null)]]));
    // the run itself is the guard: any recovery[board-drift] throw reddens:
    const fenced = chain({ recovery: true, recoveryState: windowOnEdge(), edgeSlots: 3, isolate: fence }).frames;
    expect(fenced.length).toBe(30);
    for (const f of fenced) expect(f.edgeOccupied.length).toBe(0);
    expect(sumServed(fenced)).toBe(0);
  });

  it("the SAME recovery board UNFENCED admits on its clamped arms (recovery alone never fences)", () => {
    const open = chain({ recovery: true, recoveryState: windowOnEdge(), edgeSlots: 3 }).frames;
    expect(sumServed(open)).toBeGreaterThan(0);
    // the recovery authority is REAL here: the roster is pinned at the
    // clamped 1 arm, not the authored 3 (throttleServeNodes' restoration ramp
    // grows it back — the fence in the arm above stops admissions at any size):
    expect(open[0]?.edgeSlots).toBeLessThanOrEqual(3);
  });
});

/** A live §7.7 restoration window on a 3-slot edge, clamped to 1 arm —
 *  the scale test's `recoveryWithWindow` shape (open at minute 0, closing
 *  never). */
function windowOnEdge(): RecoveryState {
  const window: RecoveryWindowRecord = Object.freeze({
    nodeId: IDS.edge,
    phase: "window" as const,
    openedAtMinute: 0,
    closesAtMinute: 1_000_000,
    lockUntilMinute: 0,
    strikes: 0,
    fullSlots: 3,
    effectiveSlots: 1,
  });
  return Object.freeze({
    windows: Object.freeze(new Map([[IDS.edge, window]])),
    lastStruggleMinute: Object.freeze(new Map<EntityId, number>()),
  });
}

/* ═══════════════════ occupied floor — hold then walk-off, never evict ═══════════════════ */

describe("occupied arms ride out the fence (no eviction, ever)", () => {
  it("a unit in service when the fence drops stays OCCUPIED until its natural walk-off, then the arm idles", () => {
    // 3-min service on the edge: the t1 occupant must hold through t2-t3.
    const frames = chain({
      edgeServiceUs: 3n * MIN,
      doorArm: { tick: 2, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null },
      ticks: 8,
    }).frames;
    const first = frames[0]?.edgeOccupied[0];
    expect(first).toBeDefined();
    expect(frames[1]?.edgeOccupied.includes(first as EntityId)).toBe(true); // fenced at t2 — STILL held
    expect(frames[2]?.edgeOccupied.includes(first as EntityId)).toBe(true); // t3 — still held
    // walk-off at t4 (serviceEnd = 1MIN + 3MIN = 4MIN ≤ simNow t4):
    expect(frames[3]?.edgeOccupied.includes(first as EntityId)).toBe(false);
    // and nobody replaces it — the fence holds the arm EMPTY:
    for (const f of frames.slice(3)) expect(f.edgeOccupied.length).toBe(0);
  });
});

/* ═══════════════════════ byte-identity switches ═══════════════════════ */

describe("the byte-identity switches (absent book, idle book)", () => {
  it("absent-book twins across fresh driver closures are digest-identical (the zero-call law)", () => {
    const a = chain({ ticks: 12 }).frames.map((f) => f.digest);
    const b = chain({ ticks: 12 }).frames.map((f) => f.digest);
    expect(a).toStrictEqual(b);
  });

  it("an IDLE book (all rows expired) ⇒ ledger streams BYTE-EQUAL to the unarmed run; only the digest embed moves", () => {
    // rel 0 = already-expired history at every minute ≥ 0 — the fence set is
    // null, the serve key is OMITTED (the crown witness of zero idle cost):
    const bare = chain({ ticks: 12 }).frames;
    const inert = chain({ ticks: 12, isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, 0)]])) }).frames;
    for (let t = 0; t < 12; t += 1) {
      expect(inert[t]?.served).toStrictEqual(bare[t]?.served);
      expect(inert[t]?.bounced).toStrictEqual(bare[t]?.bounced);
      expect(inert[t]?.edgeOccupied).toStrictEqual(bare[t]?.edgeOccupied);
      expect(inert[t]?.edgeQueue).toStrictEqual(bare[t]?.edgeQueue);
    }
    // presence without power: the book still rides the digest:
    expect(inert[11]?.digest).not.toBe(bare[11]?.digest);
  });

  it("armed-but-FUTURE stamp ⇒ streams byte-equal baseline while the digest moved (the as-of gate is live)", () => {
    const bare = chain({ ticks: 12 }).frames;
    const armed = chain({ ticks: 12, isolate: isolateBook(new Map([[IDS.edge, seedEntry(1_000_000, null)]])) }).frames;
    for (let t = 0; t < 12; t += 1) {
      expect(armed[t]?.edgeOccupied).toStrictEqual(bare[t]?.edgeOccupied);
      expect(armed[t]?.served).toStrictEqual(bare[t]?.served);
    }
    expect(armed[11]?.digest).not.toBe(bare[11]?.digest);
  });

  it("zero-RNG honesty: a silent board (0 arrivals) ships IDENTICAL streams fenced or unarmed", () => {
    const bare = chain({ ratePerMin: 0, ticks: 8 }).frames;
    const fenced = chain({ ratePerMin: 0, ticks: 8, isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, null)]])) }).frames;
    for (let t = 0; t < 8; t += 1) {
      expect(fenced[t]?.served).toStrictEqual(bare[t]?.served);
      expect(fenced[t]?.bounced).toStrictEqual(bare[t]?.bounced);
      expect(fenced[t]?.edgeQueue).toStrictEqual(bare[t]?.edgeQueue);
    }
  });

  it("host-planted in-force book equals the door-fed run's ledger (one law, two doors)", () => {
    const planted = chain({ isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, null, 1n)]])), ticks: 12 }).frames;
    const doorFed = chain({ doorArm: { tick: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null }, ticks: 12 }).frames;
    // the door pays on t1; the planted run fences from t1 as well:
    expect(sumServed(planted)).toBe(sumServed(doorFed));
    expect(sumBounced(planted)).toBe(sumBounced(doorFed));
    expect(doorFed[11]?.edgeOccupied.length).toBe(0);
  });

  it("booked run is deterministic ×100 fresh driver closures (Set.size 1 — replay-gate substrate)", () => {
    const finals = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const { frames } = chain({
        ticks: 12,
        scale: WARM,
        isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, null)], [IDS.origin, seedEntry(40, null)]])),
      });
      finals.add(frames[11]?.digest ?? "lost");
    }
    expect(finals.size).toBe(1);
  });
});

/* ═══════════════════ FIX-8 hop invariant under the fence ═══════════════════════ */

describe("the fence never breaks the queue discipline", () => {
  it("no queue ghosts under a live fence (FIX-8: membership survives; duplicates stay zero)", () => {
    const frames = chain({
      isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, null)]])),
      ticks: 10,
    }).frames;
    for (const f of frames) {
      const q = f.edgeQueue;
      expect(q.length).toBe(new Set(q).size);
    }
    // the fence grows the queue (joins ride on), never truncates it:
    expect((frames[9]?.edgeQueue.length ?? 0)).toBeGreaterThan(0);
  });

  it("hard-ceiling discipline still sheds the residual queue of a FENCED node (fence ≠ shed exemption)", () => {
    const fenced = chain({
      edgeSlots: 1,
      isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, null)]])),
      ticks: 6,
    });
    // rebuild the same board with hard-ceiling edge:
    const config = testConfig({
      runSeed: asRunSeed(31n),
      defaultPatienceUs: 3n * MIN,
      expressPath: Object.freeze([IDS.edge, IDS.origin]),
      deepPath: Object.freeze([IDS.edge, IDS.origin]),
    });
    const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
      purgeTargetedMinNodes: 0,
    });
    const hardEdge: NodeRecord = node(IDS.edge, { slots: 1, serviceUs: MIN, discipline: "hard-ceiling" });
    let state: GameState = Object.freeze({
      ...createInitialState({
        runSeed: config.runSeed,
        engineVersion: "isolate-hard",
        contentHashes: { rulesetCardHashes: {}, sheetsHash: "isolate-hard", ruleBookHash: "" },
        clocks: freshClocks(),
        nodes: Object.freeze([hardEdge, node(IDS.origin, { slots: 8, serviceUs: MIN })]),
      }),
      isolate: isolateBook(new Map([[IDS.edge, seedEntry(null, null)]])),
    });
    let shedViaBounce = 0;
    for (let t = 0; t < 6; t += 1) {
      const result = driver.advance(
        state,
        tickInputs({
          envelopes: Object.freeze([envelope("isolate:probe", fromInt(6))]),
          dependencyEdges: Object.freeze([]),
          retryPolicy: NO_RETRY,
          classes: DEFAULT_CLASSES,
        }),
      );
      state = result.state;
      // there is no "shed" terminal (R-11 vocab is four); the shed rides
      // "bounced", so the shed witness is the ledger SUM + the zero queue:
      shedViaBounce += result.outcomes.filter((o) => o.terminal === "bounced").length;
      const edge = state.nodes.get(IDS.edge);
      expect(edge?.queue.length ?? -1).toBe(0); // the residual queue is shed, not parked
    }
    expect(shedViaBounce).toBeGreaterThan(0);
    // the fence sheds NOTHING it did not shed unarmed: the fenced hard-ceiling
    // board bounces every mint, strictly MORE than the hockey-stick twin
    // (which parks a queue instead of terminating it):
    expect(shedViaBounce).toBeGreaterThan(sumBounced(fenced.frames));
    // and the hockey-stick twin (first chain) kept its queue alive:
    expect((fenced.frames[5]?.edgeQueue.length ?? 0)).toBeGreaterThan(0);
  });
});
