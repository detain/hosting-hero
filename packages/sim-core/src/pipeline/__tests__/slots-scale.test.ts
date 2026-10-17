/**
 * ADR-0015 — the SCALE ↔ reserved-warmth fold, end to end. The door verb
 * (intent-door-scale.test.ts) writes the book; THIS file pins the consume
 * path: the step-5 serve input view is materialized by `applyScaleWarmth`
 * (defaults.ts) — a node with warmth in force serves its authored roster
 * PLUS the booked arms, and because serve echoes the view it STORES, every
 * capacity read downstream (admission, utilization, effectiveRho, patience)
 * follows the slots-not-HP arithmetic — no other seam needed.
 *
 * Witnesses on the corruption-shield board (congested 1-slot edge, 6/min):
 *  - door-fed `scale-node` intent (R=1, in force) ⇒ the edge roster GROWS to
 *    2 and the terminal ledger FLIPS: strictly fewer bounces, strictly more
 *    serves than the same-seed baseline — warmth buys absence of stutter;
 *  - armed-but-FUTURE stamp ⇒ per-tick served/bounced rosters BYTE-EQUAL to
 *    baseline while the digest moved (presence without power — the as-of
 *    gate is live and the fold waits for the minute);
 *  - the fold casts ZERO dice: a zero-arrival twin (book vs no book) ships
 *    identical event/outcome streams — the roster write is pure arithmetic;
 *  - absent book ⇒ twin runs digest-identical (byte-identity switch), and a
 *    booked run is deterministic ×100 fresh driver closures (Set.size 1);
 *  - withdrawal law: the 0-amendment shrinks back to `baseRosterSlots`, but
 *    an occupied arm is NEVER evicted (the occupied floor defers the
 *    release to the unit's walk-off — recovery's non-eviction doctrine).
 *
 * As-of law unit pins (`scaleWarmInForce`) and the recovery-window DEFERRAL
 * (no padding past a live §7.7 restoration law) close the file.
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  NodeRecord,
  NodeSlotRecord,
  RecoveryState,
  RecoveryWindowRecord,
  ScaleArgs,
  ScaleBook,
  ScaleEntry,
} from "../../types";
import { asEntityId, asRunSeed, PlayerVerb } from "../../types";
import { fromInt, fromRatio } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { applyScaleWarmth, scaleWarmInForce } from "../defaults";
import { createScaleBook } from "../intent-door";
import { RHO_CEILING, utilization } from "../queue";
import { DEFAULT_CLASSES, freshClocks, NO_RETRY, envelope, node, testConfig, tickInputs } from "./helpers";

const IDS = { edge: asEntityId("edge"), origin: asEntityId("origin") } as const;

function scaleBook(
  entries: ReadonlyMap<EntityId, ScaleEntry>,
  version = 1,
): ScaleBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedEntry(
  reservedSlots: number,
  baseRosterSlots: number,
  shippedAtTick = 0n,
  effectiveAtBusinessMinute: number | null = null,
): ScaleEntry {
  return Object.freeze({ reservedSlots, baseRosterSlots, shippedAtTick, effectiveAtBusinessMinute });
}

function nodeMap(...records: readonly NodeRecord[]): Map<EntityId, NodeRecord> {
  return new Map(records.map((r) => [r.id, r]));
}

function occupied(unitId: string): NodeSlotRecord {
  return Object.freeze({ occupied: true, unitId: asEntityId(unitId), waitingOn: null, releasedAtUs: null });
}

function blank(): NodeSlotRecord {
  return Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null });
}

function withSlots(record: NodeRecord, slots: readonly NodeSlotRecord[]): NodeRecord {
  return Object.freeze({ ...record, slots: Object.freeze([...slots]) });
}

function recoveryWithWindow(nodeId: EntityId, effectiveSlots: number, fullSlots: number): RecoveryState {
  const window: RecoveryWindowRecord = Object.freeze({
    nodeId,
    phase: "window" as const,
    openedAtMinute: 0,
    closesAtMinute: 1_000_000,
    lockUntilMinute: 0,
    strikes: 0,
    fullSlots,
    effectiveSlots,
  });
  return Object.freeze({
    windows: Object.freeze(new Map([[nodeId, window]])),
    lastStruggleMinute: Object.freeze(new Map<EntityId, number>()),
  });
}

/* ═══════════════════════════ as-of law unit pins ═══════════════════════════ */

describe("scaleWarmInForce — the as-of law in the small (nodeShielded twin)", () => {
  const book = scaleBook(new Map([[IDS.edge, seedEntry(2, 1, 5n, 100)]]));

  it("undefined book ⇒ null for every node; empty book likewise", () => {
    expect(scaleWarmInForce(undefined, IDS.edge, 999)).toBeNull();
    expect(scaleWarmInForce(createScaleBook(), IDS.edge, 0)).toBeNull();
  });

  it("absent entry ⇒ null; a DIFFERENT node's booking never leaks", () => {
    expect(scaleWarmInForce(book, IDS.origin, 1_000_000)).toBeNull();
  });

  it("null stamp ⇒ law from the executing minute (entry returned by identity)", () => {
    const entry = seedEntry(2, 1, 0n, null);
    const now = scaleBook(new Map([[IDS.edge, entry]]));
    expect(scaleWarmInForce(now, IDS.edge, 0)).toBe(entry);
  });

  it("as-of: before the stamp NOT law, at/after the stamp law", () => {
    expect(scaleWarmInForce(book, IDS.edge, 99)).toBeNull(); // armed, not yet
    expect(scaleWarmInForce(book, IDS.edge, 100)).toBe(entryOf(book, IDS.edge)); // the minute itself
    expect(scaleWarmInForce(book, IDS.edge, 101)).toBe(entryOf(book, IDS.edge));
  });

  it("a 0-amendment in force is STILL an entry (withdrawal is law, not absence)", () => {
    const zero = scaleBook(new Map([[IDS.edge, seedEntry(0, 1, 0n, null)]]));
    const live = scaleWarmInForce(zero, IDS.edge, 0);
    expect(live).not.toBeNull();
    expect(live?.reservedSlots).toBe(0);
  });
});

function entryOf(book: ScaleBook, id: EntityId): ScaleEntry {
  const entry = book.entries.get(id);
  if (entry === undefined) throw new Error("fixture lost its entry");
  return entry;
}

/* ═══════════════════════ materialization unit pins ═══════════════════════ */

describe("applyScaleWarmth — the roster materializer", () => {
  const edge1 = node(IDS.edge, { slots: 1, serviceUs: MIN });
  const origin8 = node(IDS.origin, { slots: 8, serviceUs: MIN });

  it("undefined/empty book ⇒ the SAME Map object (byte-identity, zero copies)", () => {
    const nodes = nodeMap(edge1, origin8);
    expect(applyScaleWarmth(nodes, undefined, 500, undefined)).toBe(nodes);
    expect(applyScaleWarmth(nodes, createScaleBook(), 500, undefined)).toBe(nodes);
  });

  it("inert future stamp ⇒ whole-map identity (armed is not yet materialized)", () => {
    const nodes = nodeMap(edge1, origin8);
    const future = scaleBook(new Map([[IDS.edge, seedEntry(4, 1, 0n, 10_000)]]));
    expect(applyScaleWarmth(nodes, future, 9_999, undefined)).toBe(nodes);
  });

  it("padding grows the tail with BLANK arms and keeps the untouched node by identity", () => {
    const nodes = nodeMap(edge1, origin8);
    const warm = scaleBook(new Map([[IDS.edge, seedEntry(2, 1)]]));
    const out = applyScaleWarmth(nodes, warm, 0, undefined);
    expect(out).not.toBe(nodes);
    const grown = out.get(IDS.edge);
    expect(grown?.slots.length).toBe(3); // base 1 + warm 2
    expect(grown?.slots[1]).toEqual(blank());
    expect(grown?.slots[2]).toEqual(blank());
    // authored fields ride unchanged; only the roster moved:
    expect(grown?.serviceTimeUs).toBe(edge1.serviceTimeUs);
    expect(grown?.queue).toBe(edge1.queue);
    expect(out.get(IDS.origin)).toBe(origin8);
  });

  it("the occupied floor defers SHRINK: warmth leaves only when its arm walks off", () => {
    const busyHigh = withSlots(edge1, [blank(), occupied("u-1"), blank()]); // grown roster, arm 1 busy
    const zero = scaleBook(new Map([[IDS.edge, seedEntry(0, 1)]])); // scale-to-zero
    const held = applyScaleWarmth(nodeMap(busyHigh, origin8), zero, 0, undefined);
    expect(held.get(IDS.edge)?.slots.length).toBe(2); // floor = last occupied + 1 — NEVER evicted
    // once that tenant walks off, the same order shrinks to the authored 1:
    const drained = withSlots(edge1, [blank(), blank(), blank()]);
    const released = applyScaleWarmth(nodeMap(drained, origin8), zero, 0, undefined);
    expect(released.get(IDS.edge)?.slots.length).toBe(1);
  });

  it("withdrawal after drain returns EXACTLY the authored roster (never the mid-warm length)", () => {
    const idle = withSlots(edge1, [blank(), blank(), blank()]); // warm roster, no tenants
    const zero = scaleBook(new Map([[IDS.edge, seedEntry(0, 1)]]));
    const out = applyScaleWarmth(nodeMap(idle, origin8), zero, 0, undefined);
    expect(out.get(IDS.edge)?.slots.length).toBe(1);
    // and at the authored size already ⇒ identity passthrough (no churn):
    const atRest = nodeMap(edge1, origin8);
    expect(applyScaleWarmth(atRest, zero, 0, undefined).get(IDS.edge)).toBe(edge1);
  });

  it("rho FOLLOWS the roster: 1 head on 1 arm saturates, the same head on 2 arms halves", () => {
    const busy = withSlots(edge1, [occupied("u-1")]);
    expect(utilization(busy)).toBe(RHO_CEILING); // 1/1 clamps at the 0.99 ceiling — hard saturation
    const warm = scaleBook(new Map([[IDS.edge, seedEntry(1, 1)]]));
    const padded = applyScaleWarmth(nodeMap(busy, origin8), warm, 0, undefined).get(IDS.edge);
    if (padded === undefined) throw new Error("pad vanished");
    expect(padded.slots.length).toBe(2);
    expect(utilization(padded)).toBe(fromRatio(1n, 2n)); // 0.5 in Q16.16 — below the knee, exact
    expect(utilization(padded) < utilization(busy)).toBe(true);
  });

  it("recovery windows DEFER materialization: booked warmth never outranks a live restoration law", () => {
    const nodes = nodeMap(edge1, origin8);
    const warm = scaleBook(new Map([[IDS.edge, seedEntry(4, 1)]]));
    const recovering = recoveryWithWindow(IDS.edge, 1, 2); // window live on edge
    expect(applyScaleWarmth(nodes, warm, 0, recovering)).toBe(nodes);
    // the SAME book materializes once the window closes:
    expect(
      applyScaleWarmth(nodes, warm, 0, recoveryWithWindow(IDS.origin, 1, 1)).get(IDS.edge)?.slots.length,
    ).toBe(5); // window on a DIFFERENT node does not defer edge
  });
});

/* ═══════════════════ the chain witness (corruption-shield board) ═══════════════════ */

type ChainFrame = {
  digest: string;
  edgeSlots: number;
  servedUnitIds: EntityId[];
  bouncedUnitIds: EntityId[];
};

function chain(
  opts: {
    ticks?: number;
    ratePerMin?: number;
    scale?: ScaleBook;
    doorArm?: { tick: number; reservedSlots: number; effectiveAtBusinessMinute: number | null };
  } = {},
): { frames: ChainFrame[]; finalState: GameState } {
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
      engineVersion: "scale-test",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "scale-test", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: Object.freeze([
        node(IDS.edge, { slots: 1, serviceUs: MIN }), // congested: queues, waits, bounces
        node(IDS.origin, { slots: 8, serviceUs: MIN }),
      ]),
    }),
    // Host-style seed of the book (the door-fed variant below proves the REAL
    // payment path; this pin isolates the consume side from door side effects):
    ...(opts.scale !== undefined ? { scale: opts.scale } : {}),
  });
  const frames: ChainFrame[] = [];
  for (let t = 0; t < (opts.ticks ?? 30); t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> &
      Pick<TickInputs, "envelopes"> & {
        externalIntents?: readonly ExternalIntent[];
      } = {
      envelopes: Object.freeze([envelope("scale:probe", fromInt(opts.ratePerMin ?? 6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (opts.doorArm !== undefined && opts.doorArm.tick === t + 1) {
      const args: ScaleArgs = {
        verb: PlayerVerb.ScaleNode,
        targetNodeId: IDS.edge,
        reservedSlots: opts.doorArm.reservedSlots,
        effectiveAtBusinessMinute: opts.doorArm.effectiveAtBusinessMinute,
      };
      const intent: ExternalIntent = Object.freeze({
        tick: BigInt(t + 1),
        intent: Object.freeze({
          seq: 1,
          clock: "sim" as const,
          atUs: BigInt(t + 1) * MIN,
          origin: "player" as const,
          payload: Object.freeze({ kind: "player-verb" as const, args }),
        }),
      });
      partial.externalIntents = Object.freeze([intent]);
    }
    const inputs: TickInputs = tickInputs(partial);
    const result = driver.advance(state, inputs);
    state = result.state;
    frames.push({
      digest: digestState(state),
      edgeSlots: state.nodes.get(IDS.edge)?.slots.length ?? -1,
      servedUnitIds: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bouncedUnitIds: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
    });
  }
  return { frames, finalState: state };
}

const sumServed = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.servedUnitIds.length, 0);
const sumBounced = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.bouncedUnitIds.length, 0);

/* ═══════════════════════ the falsification pairs ═══════════════════════ */

describe("scale warmth — terminal flip on the congested board (one seed)", () => {
  it("baseline congests: the 1-slot edge BOUNCES (the historical witness: N > 0)", () => {
    const { frames } = chain();
    expect(sumBounced(frames)).toBeGreaterThan(0);
  });

  it("door-fed scale-node (R=1, in force) GROWS the roster and FLIPS bounces into serves", () => {
    const baseline = chain().frames;
    const { frames, finalState } = chain({
      doorArm: { tick: 1, reservedSlots: 1, effectiveAtBusinessMinute: null },
    });
    // the warmth materialized through the REAL payment path:
    expect(finalState.scale?.version).toBe(1);
    expect(finalState.scale?.entries.get(IDS.edge)).toEqual({
      reservedSlots: 1,
      baseRosterSlots: 1,
      shippedAtTick: 1n,
      effectiveAtBusinessMinute: null,
    });
    expect(finalState.hands).toBeDefined(); // the commit-class payment materialized
    expect(frames[5]?.edgeSlots).toBe(2); // the stored roster shows 2 arms from tick 1 on
    // the terminal ledger — buying warmth is buying the absence of a stutter:
    expect(sumBounced(frames)).toBeLessThan(sumBounced(baseline));
    expect(sumServed(frames)).toBeGreaterThan(sumServed(baseline));
  });

  it("armed-but-FUTURE stamp (biz-min 1_000_000) ⇒ rosters byte-equal baseline, digest moved", () => {
    const baseline = chain().frames;
    const future = chain({
      scale: scaleBook(new Map([[IDS.edge, seedEntry(1, 1, 0n, 1_000_000)]])),
    }).frames;
    expect(future.map((f) => f.servedUnitIds)).toStrictEqual(baseline.map((f) => f.servedUnitIds));
    expect(future.map((f) => f.bouncedUnitIds)).toStrictEqual(baseline.map((f) => f.bouncedUnitIds));
    expect(future[29]?.edgeSlots).toBe(1); // never materialized
    // presence without power: the book rides the digest, the warmth does not:
    expect(future[29]?.digest).not.toBe(baseline[29]?.digest);
  });

  it("host-planted in-force book equals the door-fed run's ledger (one law, two doors)", () => {
    const planted = chain({ scale: scaleBook(new Map([[IDS.edge, seedEntry(1, 1, 0n, null)]])) }).frames;
    const doorFed = chain({ doorArm: { tick: 1, reservedSlots: 1, effectiveAtBusinessMinute: null } }).frames;
    expect(sumServed(planted)).toBe(sumServed(doorFed));
    expect(sumBounced(planted)).toBe(sumBounced(doorFed));
  });

  it("zero-RNG honesty: a silent board (0 arrivals) ships IDENTICAL event/outcome streams with and without warmth", () => {
    const bare = chain({ ratePerMin: 0, ticks: 8 }).frames;
    const warm = chain({
      ratePerMin: 0,
      ticks: 8,
      scale: scaleBook(new Map([[IDS.edge, seedEntry(3, 1, 0n, null)]])),
    }).frames;
    for (let t = 0; t < 8; t += 1) {
      expect(warm[t]?.servedUnitIds).toStrictEqual(bare[t]?.servedUnitIds ?? []);
      expect(warm[t]?.bouncedUnitIds).toStrictEqual(bare[t]?.bouncedUnitIds ?? []);
    }
    // the only movement is arithmetic + embed, never dice (rosters differ by the pad):
    expect(warm[7]?.edgeSlots).toBe(4);
    expect(bare[7]?.edgeSlots).toBe(1);
  });

  it("absent-book twins across fresh driver closures are digest-identical (the byte-identity switch)", () => {
    const a = chain().frames.map((f) => f.digest);
    const b = chain().frames.map((f) => f.digest);
    expect(a).toStrictEqual(b);
  });

  it("booked run is deterministic ×100 fresh driver closures (Set.size 1 — replay-gate substrate)", () => {
    const finals = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const { frames } = chain({
        ticks: 12,
        scale: scaleBook(new Map([[IDS.edge, seedEntry(1, 1, 0n, null)], [IDS.origin, seedEntry(2, 8, 0n, 40)]])),
      });
      finals.add(frames[11]?.digest ?? "lost");
    }
    expect(finals.size).toBe(1);
  });
});
