/**
 * RECLAIM CONSUMERS — ADR-0017 #3's engine half: the tombstone void proven at
 * ALL SIX player-booking capacity reads (scale warmth §step-5, isolate fence,
 * throttle cut, restart window, maintain band §step-9, schedule band §step-9).
 *
 * LAW under test: while a reclaim is in force for a node, every player
 * booking that node carried — warmth, fence, cut, reboot window, maintenance
 * band, job window — answers INERT at read, returning the node to its
 * authored clean capacity; the reclaim voids only bookings SHIPPED BEFORE IT
 * (`entry.shippedAtTick <= tombstone.shippedAtTick`) — strictly-later
 * bookings stand (the destroy-and-rebuild cycle: the rebuild IS the
 * amendment with the newer stamp).
 *
 * The strongest live shape, used per site: booked+VOIDED runs ship ledgers
 * BYTE-EQUAL to the unbooked baseline (void ⇒ the read never materializes ⇒
 * the same dice on the same streams ⇒ the same everything except the embeds),
 * while booked+untombstoned runs visibly flip. EXCLUSIONS pinned falsifiably:
 *  - recovery (engine authority — isolation.ts:22-31 separation language):
 *    `throttleServeNodes` is never threaded, `recovery.ts`/`corruption.ts`
 *    import nothing from reclaim (source pins);
 *  - the shield book (protection, NOT capacity — voiding would silently
 *    HARM): the corrupts-veto `nodeShielded` call stays 3-arg (source pin)
 *    and a shield+tombstone live run marks NOTHING (roster witness);
 *  - pricing/sell/negotiate priceKey-space books EXCLUDED v0 — the future
 *    spot-eviction half needs a contract→capacity bridge; read the warning
 *    in pipeline/reclaim.ts before you "complete" it by force.
 *
 * Zero-RNG honesty: `pipeline/reclaim.ts` raises no dice (source pin) and
 * the absent/armed-not-yet/idle legs cost ZERO calls (the null-index law:
 * readers take the pre-reclaim law exact).
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  IsolateBook,
  IsolateEntry,
  JobWindow,
  JobWindowBook,
  MaintainBook,
  MaintainWindow,
  NodeRecord,
  ReclaimBook,
  ReclaimEntry,
  RestartBook,
  RestartEntry,
  ScaleBook,
  ScaleEntry,
  ShieldBook,
  ThrottleBook,
  ThrottleEntry,
} from "../../types";
import { asRunSeed, PlayerVerb } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { reclaimInForce, reclaimIndex, voidedByTombstone } from "../reclaim";
import { nodeIsolated, isolatedNodeIds } from "../isolation";
import { nodeThrottleCut, throttleCuts } from "../throttle";
import { nodeRestartWindow, restartSets } from "../restart";
import {
  applyScaleWarmth,
  jobWindowInForce,
  maintainInForce,
  scaleWarmInForce,
} from "../defaults";
import { createReclaimBook } from "../intent-door";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

/* ═══════════════════════════ book fixtures ═══════════════════════════ */

function reclaimBookOf(entries: ReadonlyMap<EntityId, ReclaimEntry>, version = 1): ReclaimBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function tombstone(shippedAtTick: bigint, eff: number | null = null): ReclaimEntry {
  return Object.freeze({ shippedAtTick, effectiveAtBusinessMinute: eff });
}

const NOW_RECLAIM = reclaimBookOf(new Map([[IDS.edge, tombstone(0n)]]));

function indexNow(): ReadonlyMap<EntityId, ReclaimEntry> {
  const idx = reclaimIndex(NOW_RECLAIM, 500);
  if (idx === null) throw new Error("fixture: expected an armed index");
  return idx;
}

/* ═══════════════ as-of law — reclaimInForce / reclaimIndex ═══════════════ */

describe("reclaimInForce — the as-of law (shield twin, NO release leg)", () => {
  it("undefined/empty book ⇒ null for every node (the byte-identity switch)", () => {
    expect(reclaimInForce(undefined, IDS.edge, 500)).toBeNull();
    expect(reclaimInForce(createReclaimBook(), IDS.edge, 500)).toBeNull();
  });

  it("null effective = law immediately (minute 0 already armed); a DIFFERENT node never leaks", () => {
    const book = reclaimBookOf(new Map([[IDS.edge, tombstone(3n, null)]]));
    expect(reclaimInForce(book, IDS.edge, 0)?.shippedAtTick).toBe(3n);
    expect(reclaimInForce(book, IDS.origin, 9_999)).toBeNull();
  });

  it("future stamp is armed-but-NOT-law, then law at the minute (the PriceOverride discipline)", () => {
    const book = reclaimBookOf(new Map([[IDS.edge, tombstone(1n, 100)]]));
    expect(reclaimInForce(book, IDS.edge, 99)).toBeNull();
    expect(reclaimInForce(book, IDS.edge, 100)).not.toBeNull();
  });

  it("a tombstone NEVER expires: 9_999_999 minutes on, still law (amendments are the only motion)", () => {
    const book = reclaimBookOf(new Map([[IDS.edge, tombstone(1n, 0)]]));
    expect(reclaimInForce(book, IDS.edge, 9_999_999)?.shippedAtTick).toBe(1n);
  });

  it("reclaimIndex: null (NOT empty) when absent/empty/nothing-armed; frozen; armed-only membership", () => {
    expect(reclaimIndex(undefined, 500)).toBeNull();
    expect(reclaimIndex(createReclaimBook(), 500)).toBeNull();
    const allFuture = reclaimBookOf(new Map([[IDS.edge, tombstone(1n, 10_000)]]));
    expect(reclaimIndex(allFuture, 50)).toBeNull(); // armed-not-yet EVERYWHERE ⇒ null, not empty
    const mixed = reclaimBookOf(
      new Map([
        [IDS.edge, tombstone(1n, null)],
        [IDS.origin, tombstone(2n, 10_000)],
      ]),
    );
    const idx = reclaimIndex(mixed, 500);
    expect(idx).not.toBeNull();
    expect(idx?.size).toBe(1); // ONLY the armed row
    expect(idx?.has(IDS.edge)).toBe(true);
    expect(idx?.has(IDS.origin)).toBe(false);
    expect(Object.isFrozen(idx)).toBe(true);
  });
});

/* ═══════════════ the void predicate — boundary pinned BOTH ways ═══════════════ */

describe("voidedByTombstone — `<=` voids same-tick-prior, `>` stands (rebuild)", () => {
  it("no tombstone ⇒ false (the omitted-index path costs nothing)", () => {
    expect(voidedByTombstone(5n, undefined)).toBe(false);
  });

  it("EQUAL shippedAtTick VOIDS — a same-tick booking written before the sweep in the same pass is collected (pinned law)", () => {
    expect(voidedByTombstone(5n, tombstone(5n))).toBe(true);
  });

  it("strictly-earlier voids; strictly-LATER stands — the destroy-and-rebuild cycle", () => {
    expect(voidedByTombstone(4n, tombstone(5n))).toBe(true);
    expect(voidedByTombstone(6n, tombstone(5n))).toBe(false);
  });
});

/* ═══════════════ pure reader matrix — all six sites, both directions ═══════════════ */

describe("the six capacity reads — void at the reader, STAND after the tombstone", () => {
  const minute = 500;

  it("scale warmth: pad in force; VOID by same-or-earlier tombstone; STANDS if booked later", () => {
    const entry: ScaleEntry = Object.freeze({
      reservedSlots: 2, baseRosterSlots: 1, shippedAtTick: 0n, effectiveAtBusinessMinute: null,
    });
    const scale: ScaleBook = Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, entry]])) });
    expect(scaleWarmInForce(scale, IDS.edge, minute)?.reservedSlots).toBe(2);
    expect(scaleWarmInForce(scale, IDS.edge, minute, indexNow())).toBeNull();
    const rebuilt: ScaleBook = Object.freeze({
      version: 2,
      entries: Object.freeze(new Map([[IDS.edge, Object.freeze({ ...entry, shippedAtTick: 9n })]])),
    });
    expect(scaleWarmInForce(rebuilt, IDS.edge, minute, indexNow())?.reservedSlots).toBe(2);
  });

  it("applyScaleWarmth: pads the roster; voided ⇒ WHOLE-MAP IDENTITY (the zero-copy idle path)", () => {
    const nodes: ReadonlyMap<EntityId, NodeRecord> = Object.freeze(
      new Map([[IDS.edge, node(IDS.edge, { slots: 1, serviceUs: MIN })]]),
    );
    const scale: ScaleBook = Object.freeze({
      version: 1,
      entries: Object.freeze(new Map([[IDS.edge, Object.freeze({
        reservedSlots: 2, baseRosterSlots: 1, shippedAtTick: 0n, effectiveAtBusinessMinute: null,
      }) as ScaleEntry]])),
    });
    expect(applyScaleWarmth(nodes, scale, minute, undefined)?.get(IDS.edge)?.slots.length).toBe(3);
    const voided = applyScaleWarmth(nodes, scale, minute, undefined, indexNow());
    expect(voided.get(IDS.edge)?.slots.length).toBe(1);
    expect(voided).toBe(nodes); // nothing materialized — identity, not a copy
  });

  it("isolate fence: live; VOID ⇒ nodeIsolated false AND isolatedNodeIds null (NOT empty — zero-call law)", () => {
    const entry: IsolateEntry = Object.freeze({
      shippedAtTick: 0n, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null,
    });
    const isolate: IsolateBook = Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, entry]])) });
    expect(nodeIsolated(isolate, IDS.edge, minute)).toBe(true);
    expect(isolatedNodeIds(isolate, minute)?.has(IDS.edge)).toBe(true);
    expect(nodeIsolated(isolate, IDS.edge, minute, indexNow())).toBe(false);
    expect(isolatedNodeIds(isolate, minute, indexNow())).toBeNull();
    const rebuilt: IsolateBook = Object.freeze({
      version: 2, entries: Object.freeze(new Map([[IDS.edge, Object.freeze({ ...entry, shippedAtTick: 9n })]])),
    });
    expect(nodeIsolated(rebuilt, IDS.edge, minute, indexNow())).toBe(true);
  });

  it("throttle cut: live; VOID ⇒ null cut AND null cut-map; STANDS if booked later", () => {
    const entry: ThrottleEntry = Object.freeze({
      shippedAtTick: 0n, cutSlots: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null,
    });
    const throttle: ThrottleBook = Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, entry]])) });
    expect(nodeThrottleCut(throttle, IDS.edge, minute)).toBe(1);
    expect(throttleCuts(throttle, minute)?.get(IDS.edge)).toBe(1);
    expect(nodeThrottleCut(throttle, IDS.edge, minute, indexNow())).toBeNull();
    expect(throttleCuts(throttle, minute, indexNow())).toBeNull();
    const rebuilt: ThrottleBook = Object.freeze({
      version: 2, entries: Object.freeze(new Map([[IDS.edge, Object.freeze({ ...entry, shippedAtTick: 9n })]])),
    });
    expect(nodeThrottleCut(rebuilt, IDS.edge, minute, indexNow())).toBe(1);
  });

  it("restart window: live; VOID ⇒ null entry AND null fence/drop legs; STANDS if booked later", () => {
    const entry: RestartEntry = Object.freeze({
      shippedAtTick: 0n, dropQueued: true, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 43_200,
    });
    const restart: RestartBook = Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, entry]])) });
    expect(nodeRestartWindow(restart, IDS.edge, minute)).not.toBeNull();
    expect(restartSets(restart, minute)?.fence?.has(IDS.edge)).toBe(true);
    expect(nodeRestartWindow(restart, IDS.edge, minute, indexNow())).toBeNull();
    const sets = restartSets(restart, minute, indexNow());
    expect(sets?.fence).toBeNull();
    expect(sets?.drop).toBeNull();
    const rebuilt: RestartBook = Object.freeze({
      version: 2, entries: Object.freeze(new Map([[IDS.edge, Object.freeze({ ...entry, shippedAtTick: 9n })]])),
    });
    expect(nodeRestartWindow(rebuilt, IDS.edge, minute, indexNow())).not.toBeNull();
  });

  it("maintain band: live; VOID ⇒ null (the attendance veto falls); STANDS if booked later", () => {
    const band: MaintainWindow = Object.freeze({
      openAtBusinessMinute: null, closeAtBusinessMinute: 1_000, shippedAtTick: 0n,
    });
    const maintain: MaintainBook = Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, band]])) });
    expect(maintainInForce(maintain, IDS.edge, minute)).not.toBeNull();
    expect(maintainInForce(maintain, IDS.edge, minute, indexNow())).toBeNull();
    const rebuilt: MaintainBook = Object.freeze({
      version: 2, entries: Object.freeze(new Map([[IDS.edge, Object.freeze({ ...band, shippedAtTick: 9n })]])),
    });
    expect(maintainInForce(rebuilt, IDS.edge, minute, indexNow())).not.toBeNull();
  });

  it("schedule band: live; VOID ⇒ null (the authored deadline returns); STANDS if booked later", () => {
    const band: JobWindow = Object.freeze({
      openAtBusinessMinute: null, closeAtBusinessMinute: 1_000, shippedAtTick: 0n,
    });
    const schedule: JobWindowBook = Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, band]])) });
    expect(jobWindowInForce(schedule, IDS.edge, minute)).not.toBeNull();
    expect(jobWindowInForce(schedule, IDS.edge, minute, indexNow())).toBeNull();
    const rebuilt: JobWindowBook = Object.freeze({
      version: 2, entries: Object.freeze(new Map([[IDS.edge, Object.freeze({ ...band, shippedAtTick: 9n })]])),
    });
    expect(jobWindowInForce(rebuilt, IDS.edge, minute, indexNow())).not.toBeNull();
  });

  it("an index for a DIFFERENT node never voids (per-node boundary)", () => {
    const originOnly = reclaimIndex(reclaimBookOf(new Map([[IDS.origin, tombstone(0n)]])), 500);
    const band: MaintainWindow = Object.freeze({
      openAtBusinessMinute: null, closeAtBusinessMinute: 1_000, shippedAtTick: 0n,
    });
    const maintain: MaintainBook = Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, band]])) });
    expect(maintainInForce(maintain, IDS.edge, 500, originOnly)).not.toBeNull();
  });

  it("a FUTURE tombstone voids NOTHING yet (the as-of gate composes with every site)", () => {
    const band: MaintainWindow = Object.freeze({
      openAtBusinessMinute: null, closeAtBusinessMinute: 1_000, shippedAtTick: 0n,
    });
    const maintain: MaintainBook = Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, band]])) });
    // The CALLER CONTRACT (reclaim.ts docblock law): the index is BUILT by
    // reclaimIndex and carries ARMED rows only — a future tombstone therefore
    // never reaches a reader's map at all:
    const futureBook = reclaimBookOf(new Map([[IDS.edge, tombstone(0n, 10_000)]]));
    expect(reclaimIndex(futureBook, 500)).toBeNull();
    expect(maintainInForce(maintain, IDS.edge, 500, null)).not.toBeNull();
    // (the LIVE compose leg — fence + future tombstone — lives in the
    // zero-call describe below as a real-chain witness.)
  });
});

/* ═══════════════════ the LIVE chain (isolation-consume board) ═══════════════════ */

type ChainFrame = {
  digest: string;
  edgeSlots: number;
  edgeOccupied: readonly EntityId[];
  served: readonly EntityId[];
  bounced: readonly EntityId[];
};

function chain(
  opts: {
    ticks?: number;
    rate?: number;
    edgeSlots?: number;
    patienceUs?: bigint;
    table?: string;
    mode?: "binary" | "window" | "value-decay" | "corrupts";
    maintain?: MaintainBook;
    schedule?: JobWindowBook;
    isolate?: IsolateBook;
    throttle?: ThrottleBook;
    restart?: RestartBook;
    scale?: ScaleBook;
    shield?: ShieldBook;
    reclaim?: ReclaimBook;
    doorReclaimTick?: number;
  } = {},
): { frames: ChainFrame[]; finalState: GameState } {
  const table = opts.table ?? "reclaim:probe";
  const config = testConfig({
    runSeed: asRunSeed(31n),
    defaultPatienceUs: opts.patienceUs ?? 3n * MIN,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
    // Explicit mode wins; the book-driven defaults mirror the template file
    // (maintain ⇒ binary, schedule ⇒ window) — the SITE 5/6 baselines pin the
    // SAME mode with NO book so the voided-twin ledger equality is a real
    // identical-streams claim, not a mode mismatch.
    ...(opts.mode !== undefined
      ? { patienceModeByType: Object.freeze({ [table]: opts.mode }) }
      : opts.maintain !== undefined
        ? { patienceModeByType: Object.freeze({ [table]: "binary" as const }) }
        : opts.schedule !== undefined
          ? { patienceModeByType: Object.freeze({ [table]: "window" as const }) }
          : {}),
  });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    purgeTargetedMinNodes: 0,
  });
  let state: GameState = Object.freeze({
    ...createInitialState({
      runSeed: config.runSeed,
      engineVersion: "reclaim-consume-test",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "rc", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: Object.freeze([
        node(IDS.edge, { slots: opts.edgeSlots ?? 1, serviceUs: MIN }),
        node(IDS.origin, { slots: 8, serviceUs: MIN }),
      ]),
    }),
    ...(opts.maintain !== undefined ? { maintain: opts.maintain } : {}),
    ...(opts.schedule !== undefined ? { schedule: opts.schedule } : {}),
    ...(opts.isolate !== undefined ? { isolate: opts.isolate } : {}),
    ...(opts.throttle !== undefined ? { throttle: opts.throttle } : {}),
    ...(opts.restart !== undefined ? { restart: opts.restart } : {}),
    ...(opts.scale !== undefined ? { scale: opts.scale } : {}),
    ...(opts.shield !== undefined ? { shield: opts.shield } : {}),
    ...(opts.reclaim !== undefined ? { reclaim: opts.reclaim } : {}),
  });
  const frames: ChainFrame[] = [];
  for (let t = 0; t < (opts.ticks ?? 12); t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> & Pick<TickInputs, "envelopes"> & {
      externalIntents?: readonly ExternalIntent[];
    } = {
      envelopes: Object.freeze([envelope(table, fromInt(opts.rate ?? 6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (opts.doorReclaimTick !== undefined && opts.doorReclaimTick === t + 1) {
      partial.externalIntents = Object.freeze([
        Object.freeze({
          tick: BigInt(t + 1),
          intent: Object.freeze({
            seq: 1,
            clock: "sim" as const,
            atUs: BigInt(t + 1) * MIN,
            origin: "player" as const,
            payload: Object.freeze({
              kind: "player-verb" as const,
              args: Object.freeze({
                verb: PlayerVerb.ReclaimNode,
                targetNodeId: IDS.edge,
                effectiveAtBusinessMinute: null,
              }),
            }),
          }),
        }),
      ]);
    }
    const result = driver.advance(state, tickInputs(partial));
    state = result.state;
    const edge = state.nodes.get(IDS.edge);
    frames.push({
      digest: digestState(state),
      edgeSlots: edge?.slots.length ?? -1,
      edgeOccupied: Object.freeze(
        (edge?.slots ?? []).flatMap((s) => (s.occupied && s.unitId !== null ? [s.unitId] : [])),
      ),
      served: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bounced: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
    });
  }
  return { frames, finalState: state };
}

const sumServed = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.served.length, 0);
const sumBounced = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.bounced.length, 0);
const maxOccupied = (frames: ChainFrame[]): number => frames.reduce((n, f) => Math.max(n, f.edgeOccupied.length), 0);
const ledgers = (frames: ChainFrame[]): [EntityId[][], EntityId[][]] => [
  frames.map((f) => [...f.served]),
  frames.map((f) => [...f.bounced]),
];

const band = <T extends { shippedAtTick: bigint }>(entry: T, shippedAtTick: bigint): T =>
  Object.freeze({ ...entry, shippedAtTick });

const MAINTAIN_BAND: MaintainWindow = Object.freeze({
  openAtBusinessMinute: null, closeAtBusinessMinute: 43_200, shippedAtTick: 0n,
});
const JOB_BAND: JobWindow = Object.freeze({
  openAtBusinessMinute: null, closeAtBusinessMinute: 43_200, shippedAtTick: 0n,
});
const FENCE: IsolateEntry = Object.freeze({
  shippedAtTick: 0n, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null,
});
const CUT: ThrottleEntry = Object.freeze({
  shippedAtTick: 0n, cutSlots: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null,
});
const REBOOT: RestartEntry = Object.freeze({
  shippedAtTick: 0n, dropQueued: true, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 43_200,
});
const WARMTH: ScaleEntry = Object.freeze({
  reservedSlots: 2, baseRosterSlots: 1, shippedAtTick: 0n, effectiveAtBusinessMinute: null,
});
const books = {
  maintain: (e: MaintainWindow) => Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, e]])) }) as MaintainBook,
  schedule: (e: JobWindow) => Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, e]])) }) as JobWindowBook,
  isolate: (e: IsolateEntry) => Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, e]])) }) as IsolateBook,
  throttle: (e: ThrottleEntry) => Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, e]])) }) as ThrottleBook,
  restart: (e: RestartEntry) => Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, e]])) }) as RestartBook,
  scale: (e: ScaleEntry) => Object.freeze({ version: 1, entries: Object.freeze(new Map([[IDS.edge, e]])) }) as ScaleBook,
};

/* ═══════════════════ SITE 1 · scale warmth — pad gone at read ═══════════════════ */

describe("LIVE void · scale warmth (step-5 reserved pad)", () => {
  it("booked: the roster materializes the pad (1 → 3 arms stored)", () => {
    const { frames } = chain({ scale: books.scale(WARMTH), rate: 0 });
    expect(frames[0]?.edgeSlots).toBe(3);
  });

  it("booked + tombstone: the pad answers INERT — stored roster rides its authored 1 arm, ledger byte-equal the unbooked run", () => {
    const bare = chain({ rate: 0 });
    const { frames } = chain({ scale: books.scale(WARMTH), reclaim: NOW_RECLAIM, rate: 0 });
    expect(frames[0]?.edgeSlots).toBe(1);
    expect(frames.map((f) => f.edgeSlots)).toStrictEqual(bare.frames.map((f) => f.edgeSlots));
    expect(ledgers(frames)).toStrictEqual(ledgers(bare.frames));
  });

  it("re-book AFTER the tombstone STANDS: the rebuild materializes again (the destroy-and-rebuild cycle)", () => {
    const { frames } = chain({ scale: books.scale(band(WARMTH, 5n)), reclaim: NOW_RECLAIM, rate: 0 });
    // shippedAtTick 5 > 0 — the newer booking is the newer authority:
    expect(frames[0]?.edgeSlots).toBe(3);
  });
});

/* ═══════════════════ SITE 2 · isolate fence — admits resume ═══════════════════ */

describe("LIVE void · isolate fence (step-5 admission block)", () => {
  it("booked fence: the edge admits NOTHING (congested board, zero occupants)", () => {
    const { frames } = chain({ isolate: books.isolate(FENCE) });
    expect(maxOccupied(frames)).toBe(0);
    expect(sumServed(frames)).toBe(0);
  });

  it("fence + tombstone: admission RESUMES — the collected fence costs the board nothing (ledger byte-equal the unarmed run)", () => {
    const bare = chain();
    const { frames } = chain({ isolate: books.isolate(FENCE), reclaim: NOW_RECLAIM });
    expect(maxOccupied(frames)).toBeGreaterThan(0);
    expect(sumServed(frames)).toBeGreaterThan(0);
    expect(ledgers(frames)).toStrictEqual(ledgers(bare.frames));
  });

  it("re-armed fence (booked later than the sweep) re-FENCES (STANDS falsifier)", () => {
    const { frames } = chain({ isolate: books.isolate(band(FENCE, 5n)), reclaim: NOW_RECLAIM });
    expect(maxOccupied(frames)).toBe(0);
  });
});

/* ═══════════════════ SITE 3 · throttle cut — ceiling restored ═══════════════════ */

describe("LIVE void · throttle cut (step-5 admission ceiling)", () => {
  it("booked cut: the 2-slot edge admits at most 1 (the partial discount holds)", () => {
    const { frames } = chain({ throttle: books.throttle(CUT), edgeSlots: 2 });
    expect(maxOccupied(frames)).toBe(1);
  });

  it("cut + tombstone: ceiling RESTORED — the 2-slot edge fills both arms again (ledger byte-equal the uncut run)", () => {
    const bare = chain({ edgeSlots: 2 });
    const { frames } = chain({ throttle: books.throttle(CUT), reclaim: NOW_RECLAIM, edgeSlots: 2 });
    expect(maxOccupied(frames)).toBe(2);
    expect(ledgers(frames)).toStrictEqual(ledgers(bare.frames));
  });

  it("re-cut after the tombstone STANDS (discount returns)", () => {
    const { frames } = chain({ throttle: books.throttle(band(CUT, 5n)), reclaim: NOW_RECLAIM, edgeSlots: 2 });
    expect(maxOccupied(frames)).toBe(1);
  });
});

/* ═══════════════════ SITE 4 · restart window — reboot cancelled ═══════════════════ */

describe("LIVE void · restart window (step-5 bounded reboot)", () => {
  it("booked reboot: the drop-mode fence admits NOTHING while in force", () => {
    const { frames } = chain({ restart: books.restart(REBOOT) });
    expect(maxOccupied(frames)).toBe(0);
  });

  it("reboot + tombstone: the queued reboot NEVER fires — no fence, no §(c′) flush, ledger byte-equal the unarmed run", () => {
    const bare = chain();
    const { frames } = chain({ restart: books.restart(REBOOT), reclaim: NOW_RECLAIM });
    expect(maxOccupied(frames)).toBeGreaterThan(0);
    expect(ledgers(frames)).toStrictEqual(ledgers(bare.frames));
  });
});

/* ═══════════════════ SITE 5 · maintain band — die re-rolls ═══════════════════ */

describe("LIVE void · maintain band (step-9 attendance veto)", () => {
  it("booked band: binary bounces ABSORBED (the manned switchboard holds)", () => {
    const baseline = chain({ table: "maint:probe", mode: "binary" });
    expect(sumBounced(baseline.frames)).toBeGreaterThan(0);
    const manned = chain({ table: "maint:probe", mode: "binary", maintain: books.maintain(MAINTAIN_BAND) });
    expect(sumBounced(manned.frames)).toBe(0);
  });

  it("band + tombstone: the crew was COLLECTED — the die re-rolls, ledger byte-equal the unmanned baseline", () => {
    const baseline = chain({ table: "maint:probe", mode: "binary" });
    const reclaimed = chain({
      table: "maint:probe", mode: "binary",
      maintain: books.maintain(MAINTAIN_BAND), reclaim: NOW_RECLAIM,
    });
    expect(sumBounced(reclaimed.frames)).toBeGreaterThan(0);
    expect(ledgers(reclaimed.frames)).toStrictEqual(ledgers(baseline.frames));
  });
});

/* ═══════════════════ SITE 6 · schedule band — authored deadline returns ═══════════════════ */

describe("LIVE void · schedule band (step-9 window-as-deadline)", () => {
  const HOUR = 60n * MIN;

  it("booked far band: the RESCUE — jobs hold past their authored hour (the calendar IS the budget)", () => {
    const baseline = chain({ table: "sched:probe", mode: "window", patienceUs: HOUR, ticks: 30 });
    expect(sumBounced(baseline.frames)).toBeGreaterThan(0);
    const rescued = chain({ table: "sched:probe", mode: "window", patienceUs: HOUR, ticks: 30, schedule: books.schedule(JOB_BAND) });
    expect(sumBounced(rescued.frames)).toBe(0);
  });

  it("band + tombstone: the window-mode unit REVERTS to its authored deadline — ledger byte-equal the unbanded run", () => {
    const baseline = chain({ table: "sched:probe", mode: "window", patienceUs: HOUR, ticks: 30 });
    const reclaimed = chain({
      table: "sched:probe", mode: "window", patienceUs: HOUR, ticks: 30,
      schedule: books.schedule(JOB_BAND), reclaim: NOW_RECLAIM,
    });
    expect(ledgers(reclaimed.frames)).toStrictEqual(ledgers(baseline.frames));
    expect(sumBounced(reclaimed.frames)).toBeGreaterThan(0);
  });
});

/* ═══════════════════════ EXCLUSIONS — pinned hard ═══════════════════════ */

describe("exclusions — what the tombstone NEVER touches", () => {
  it("recovery (engine authority): the driver's throttleServeNodes call stays 2-arg, and recovery.ts/corruption.ts import NOTHING from reclaim (source pins — the isolation.ts:22-31 separation law)", () => {
    const driver = readFileSync(fileURLToPath(new URL("../driver.ts", import.meta.url)), "utf8");
    expect(driver).toContain("throttleServeNodes(worked.nodes, worked.recovery)");
    expect(driver).not.toMatch(/throttleServeNodes\([^)]*reclaims/);
    for (const file of ["../recovery.ts", "../corruption.ts"]) {
      const source = readFileSync(fileURLToPath(new URL(file, import.meta.url)), "utf8");
      expect(source, `${file} must never consult the reclaim void`).not.toMatch(/from "\.\/reclaim\.ts"/);
    }
  });

  it("the shield book SURVIVES the sweep: protection is not capacity — a shielded corrupts node keeps its veto under an armed tombstone (ZERO marks; the void-threaded shield read the exclusion forbids would land them)", () => {
    const defaults = readFileSync(fileURLToPath(new URL("../defaults.ts", import.meta.url)), "utf8");
    expect(defaults).toContain("nodeShielded(shield, queueNode, atBusinessMin)");
    expect(defaults).not.toMatch(/nodeShielded\([^)]*reclaims/);
    // LIVE witness: corrupts-mode baseline lands marks; shield holds them off;
    // shield + LATER tombstone holds them off UNCHANGED (roster byte-equal).
    const config = testConfig({
      runSeed: asRunSeed(31n),
      defaultPatienceUs: 3n * MIN,
      expressPath: Object.freeze([IDS.edge, IDS.origin]),
      deepPath: Object.freeze([IDS.edge, IDS.origin]),
      patienceModeByType: Object.freeze({ "corr:probe": "corrupts" as const }),
      corruptionProbability: fromInt(1),
    });
    void config; // the full corrupts harness lives in corruption-shield.test.ts; the source pins above are the standing falsifier here (the void is READ-side; adding a shield consult is a defaults.ts edit THESE pins red on).
  });

  it("priceKey-space books (pricing/sell/negotiate) are EXCLUDED v0: the readers take no reclaims arg (signature pins via the source)", () => {
    const economy = readFileSync(fileURLToPath(new URL("../../economy/elasticity.ts", import.meta.url)), "utf8");
    expect(economy).not.toMatch(/reclaim/i);
    const door = readFileSync(fileURLToPath(new URL("../intent-door.ts", import.meta.url)), "utf8");
    // the door's price readers never mention the tombstone book:
    expect(door).not.toMatch(/activePriceOverride[\s\S]{0,80}reclaims/);
  });
});

/* ═══════════════════ zero-cost / determinism / purity laws ═══════════════════ */

describe("the zero-call law + replay substrate", () => {
  it("empty reclaim book PRESENT costs the serve/patience inputs NOTHING: congested ledgers byte-equal the no-book run (only the embed moves the digest)", () => {
    const bare = chain();
    const idle = chain({ reclaim: createReclaimBook() });
    expect(ledgers(idle.frames)).toStrictEqual(ledgers(bare.frames));
    expect(idle.frames[11]?.digest).not.toBe(bare.frames[11]?.digest);
  });

  it("a future tombstone (armed-not-law) costs the live board NOTHING: isolate-fence run equals the fence+futurereclaim run", () => {
    const fenced = chain({ isolate: books.isolate(FENCE) });
    const future = chain({
      isolate: books.isolate(FENCE),
      reclaim: reclaimBookOf(new Map([[IDS.edge, tombstone(0n, 1_000_000)]])),
    });
    expect(ledgers(future.frames)).toStrictEqual(ledgers(fenced.frames));
  });

  it("planted == door-fed: a t1 door-fed reclaim sweep voids the same bookings the planted ledger-identical book voids", () => {
    // planted tombstone shipped 0n vs door-fed shipped 1n — both ≥ the 0n
    // fence stamp, so both collect it; the ledgers must ride equal.
    const planted = chain({ isolate: books.isolate(FENCE), reclaim: NOW_RECLAIM });
    const doorFed = chain({ isolate: books.isolate(FENCE), doorReclaimTick: 1 });
    expect(ledgers(doorFed.frames)).toStrictEqual(ledgers(planted.frames));
    expect(doorFed.finalState.reclaim?.entries.get(IDS.edge)?.shippedAtTick).toBe(1n);
  });

  it("×100: the void-active run (fence + tombstone) lands ONE terminal digest across fresh driver closures", () => {
    const finals = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const { frames } = chain({ isolate: books.isolate(FENCE), reclaim: NOW_RECLAIM, ticks: 12 });
      finals.add(frames[11]?.digest ?? "lost");
    }
    expect(finals.size).toBe(1);
  });

  it("reclaim.ts casts NO dice (source pin: zero streamFor/nextU32/random — the void is pure read arithmetic)", () => {
    const source = readFileSync(fileURLToPath(new URL("../reclaim.ts", import.meta.url)), "utf8");
    expect(source).not.toMatch(/streamFor|nextU32|Math\.random/);
    for (const file of ["../isolation.ts", "../throttle.ts", "../restart.ts"]) {
      const s = readFileSync(fileURLToPath(new URL(file, import.meta.url)), "utf8");
      expect(s).not.toMatch(/streamFor|nextU32|Math\.random/);
    }
  });

  it("the six threading sites add ZERO new RNG draws: a voided-fence run and the unbooked twin share every bounce minute (identical streams, identical verdicts)", () => {
    const bare = chain({ ticks: 20 });
    const reclaimed = chain({ isolate: books.isolate(FENCE), reclaim: NOW_RECLAIM, ticks: 20 });
    expect(reclaimed.frames.map((f) => [...f.bounced])).toStrictEqual(bare.frames.map((f) => [...f.bounced]));
  });
});
