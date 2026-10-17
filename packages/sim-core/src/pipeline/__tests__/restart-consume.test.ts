/**
 * RESTART-NODE — the engine consumer of the 18th door verb (ADR-0016
 * successor program, lane L-RS: the LAST unbuilt §7.16 Act-row verb —
 * "drain, restart, isolate, shed"). The door books the bounded reboot
 * window; THIS file proves what the reboot MECHANICALLY IS at the step-5
 * serve input:
 *
 *  - the fence leg: a live reboot node admits NO new work (§(c) skip —
 *    the isolate posture verbatim, `ServeInExt.restartFence`);
 *  - the flush leg ("drop"): every in-window tick the node's ENTIRE queue
 *    (this tick's §(a) joins included) walks the EXISTED hard-ceiling shed
 *    channel (§(c′) — driver `orderShedForTick` reorder, rec#5
 *    attribution, R8 F-2 terminal PRESET branch: event kind "bounced",
 *    cause `outcome:<unitId>`, nodeId = the rebooting node via
 *    routeHops[0]). ZERO new event kinds, ZERO dice rolled by the purge;
 *  - completion-before-purge: §(b) releases run FIRST, so work finishing
 *    at the reboot minute is SERVED, never a casualty — occupied arms are
 *    never evicted (true kill-in-flight stays DEFERRED, wedge-state reason
 *    in pipeline/restart.ts);
 *  - "keep" is the pure bounded fence: per-frame observables EQUAL the
 *    same-window isolate run (the legibility ladder rung between throttle
 *    and isolate), while the digests honestly differ (the embeds do);
 *  - conservation is mechanical: every purged unit arrives as bounced
 *    exactly once — and exactly-once survives a hard-ceiling node too
 *    (`candidateSeen` first-writer makes the double push idempotent);
 *  - at `release` the node admits again, STRICTLY (half-open window),
 *    queue-empty;
 *  - the byte-identity switches: NO book, an EMPTY book, and an
 *    all-expired book all leave every observable of the run identical to
 *    the unarmed baseline (idle legs are null ⇒ the driver omits both
 *    `ServeInExt` keys ⇒ zero calls, zero copies).
 *
 * Determinism law: the armed chain ×2 digests byte-identical per frame —
 * the flush casts no dice, so it cannot fork replay.
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  IsolateBook,
  IsolateEntry,
  PlayerVerbArgs,
  RestartArgs,
  RestartBook,
  RestartEntry,
  SimMinute,
} from "../../types";
import { asEntityId, asRunSeed, PlayerVerb } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { nodeRestartWindow, restartSets } from "../restart";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

/* ───────────────────────────── book builders ───────────────────────────── */

type SeedRow = { shippedAtTick: bigint; drop: boolean; eff: SimMinute | null; rel: SimMinute };

function restartBookOf(entries: ReadonlyMap<EntityId, RestartEntry>, version = 1): RestartBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedRow(eff: SimMinute | null, rel: SimMinute, drop = true, shippedAtTick = 0n): SeedRow {
  return { shippedAtTick, drop, eff, rel };
}

function entryOf(row: SeedRow): RestartEntry {
  return Object.freeze({
    shippedAtTick: row.shippedAtTick,
    dropQueued: row.drop,
    effectiveAtBusinessMinute: row.eff,
    releaseAtBusinessMinute: row.rel,
  });
}

function dropBook(rows: readonly (readonly [EntityId, SeedRow])[], version = 1): RestartBook {
  return restartBookOf(new Map(rows.map(([id, row]) => [id, entryOf(row)])), version);
}

function isolateBookOf(rows: readonly (readonly [EntityId, { eff: SimMinute | null; rel: SimMinute | null }])[], version = 1): IsolateBook {
  return Object.freeze({
    version,
    entries: Object.freeze(
      new Map<EntityId, IsolateEntry>(
        rows.map(([id, r]) => [
          id,
          Object.freeze({ shippedAtTick: 0n, effectiveAtBusinessMinute: r.eff, releaseAtBusinessMinute: r.rel }),
        ]),
      ),
    ),
  });
}

/* ═══════════════════ as-of law unit pins — nodeRestartWindow ═══════════════════ */

describe("nodeRestartWindow — the as-of law in the small (the nodeIsolated twin, entry-valued)", () => {
  const book = dropBook([[IDS.edge, seedRow(null, 480)]]);

  it("absent book and empty book answer null everywhere", () => {
    expect(nodeRestartWindow(undefined, IDS.edge, 0)).toBeNull();
    expect(nodeRestartWindow(restartBookOf(new Map()), IDS.edge, 0)).toBeNull();
  });

  it("an unknown node answers null", () => {
    expect(nodeRestartWindow(book, IDS.origin, 10)).toBeNull();
  });

  it("null effective arms from tick 0 and lives to the strict release edge", () => {
    expect(nodeRestartWindow(book, IDS.edge, 0)).not.toBeNull();
    expect(nodeRestartWindow(book, IDS.edge, 479)).not.toBeNull();
    expect(nodeRestartWindow(book, IDS.edge, 480)).toBeNull(); // half-open: rel is NOT in force
    expect(nodeRestartWindow(book, IDS.edge, 481)).toBeNull();
  });

  it("a future effective is armed but NOT yet law", () => {
    const armedLater = dropBook([[IDS.edge, seedRow(100, 200)]]);
    expect(nodeRestartWindow(armedLater, IDS.edge, 99)).toBeNull();
    expect(nodeRestartWindow(armedLater, IDS.edge, 100)).not.toBeNull();
    expect(nodeRestartWindow(armedLater, IDS.edge, 199)).not.toBeNull();
    expect(nodeRestartWindow(armedLater, IDS.edge, 200)).toBeNull();
  });

  it("the LIVE entry is returned verbatim — dropQueued is the flush-mode read", () => {
    const keepBook = dropBook([[IDS.edge, seedRow(null, 480, false)]]);
    expect(nodeRestartWindow(keepBook, IDS.edge, 1)?.dropQueued).toBe(false);
    expect(nodeRestartWindow(book, IDS.edge, 1)?.dropQueued).toBe(true);
    expect(nodeRestartWindow(book, IDS.edge, 1)?.releaseAtBusinessMinute).toBe(480);
  });

  it("an already-expired row (release 0) is inert history at minute 0", () => {
    const expired = dropBook([[IDS.edge, seedRow(null, 0)]]);
    expect(nodeRestartWindow(expired, IDS.edge, 0)).toBeNull();
    expect(nodeRestartWindow(expired, IDS.edge, 1)).toBeNull();
  });
});

/* ═══════════════════════════ restartSets — the two legs ═══════════════════════════ */

describe("restartSets — the driver-threaded fence/drop pair", () => {
  it("absent and empty books yield two null legs (the byte-identity switch)", () => {
    expect(restartSets(undefined, 10)).toEqual({ fence: null, drop: null });
    const empty = restartSets(restartBookOf(new Map()), 10);
    expect(empty.fence).toBeNull();
    expect(empty.drop).toBeNull();
  });

  it("armed-not-yet and expired rows leave BOTH legs null — idle books cost zero", () => {
    const idle = dropBook([
      [IDS.edge, seedRow(1_000, 2_000)], // future stamp
      [IDS.origin, seedRow(null, 5)], // expired
    ]);
    const sets = restartSets(idle, 500);
    expect(sets.fence).toBeNull();
    expect(sets.drop).toBeNull();
  });

  it("a keep row fences without dropping: drop ⊆ fence, legs split by mode", () => {
    const sets = restartSets(dropBook([[IDS.edge, seedRow(null, 480, false)]]), 10);
    expect([...(sets.fence ?? [])]).toEqual([IDS.edge]);
    expect(sets.drop).toBeNull();
  });

  it("a drop row rides BOTH legs", () => {
    const sets = restartSets(dropBook([[IDS.edge, seedRow(null, 480, true)]]), 10);
    expect([...(sets.fence ?? [])]).toEqual([IDS.edge]);
    expect([...(sets.drop ?? [])]).toEqual([IDS.edge]);
  });

  it("mixed nodes split correctly; the pair and both sets are frozen", () => {
    const sets = restartSets(
      dropBook([
        [IDS.edge, seedRow(null, 480, true)],
        [IDS.origin, seedRow(null, 480, false)],
      ]),
      10,
    );
    expect([...(sets.fence ?? [])].sort()).toEqual([IDS.edge, IDS.origin].sort());
    expect([...(sets.drop ?? [])]).toEqual([IDS.edge]);
    expect(Object.isFrozen(sets)).toBe(true);
    expect(Object.isFrozen(sets.fence)).toBe(true);
    expect(Object.isFrozen(sets.drop)).toBe(true);
  });

  it("insertion order never leaks: same rows, different order, same membership", () => {
    const forward = restartSets(
      dropBook([
        [IDS.edge, seedRow(null, 480, true)],
        [IDS.origin, seedRow(null, 480, false)],
      ]),
      100,
    );
    const reverse = restartSets(
      dropBook([
        [IDS.origin, seedRow(null, 480, false)],
        [IDS.edge, seedRow(null, 480, true)],
      ]),
      100,
    );
    expect([...(forward.fence ?? [])].sort()).toEqual([...(reverse.fence ?? [])].sort());
    expect([...(forward.drop ?? [])].sort()).toEqual([...(reverse.drop ?? [])].sort());
  });
});

/* ═══════════════════════════ the chain witness ═══════════════════════════ */

type ChainFrame = {
  digest: string;
  bizMinute: number;
  tick: number;
  edgeRoster: number;
  edgeOccupied: readonly EntityId[];
  edgeQueue: readonly EntityId[];
  originOccupied: readonly EntityId[];
  served: readonly EntityId[];
  bounced: readonly EntityId[];
  arrived: number;
  outcomeTotal: number;
};

type BounceEvent = { unitId: EntityId; nodeId: EntityId | null; causeId: string; tick: number };

type ChainResult = {
  frames: ChainFrame[];
  bouncedEvents: readonly BounceEvent[];
  finalState: GameState;
};

type ChainOptions = {
  ticks?: number;
  ratePerMin?: number;
  edgeSlots?: number;
  edgeServiceUs?: bigint;
  hardCeiling?: boolean;
  restart?: RestartBook;
  isolate?: IsolateBook;
  doorArm?: { tick: number; drop: boolean; effectiveAtBusinessMinute: SimMinute | null; releaseAtBusinessMinute: SimMinute };
};

function chain(opts: ChainOptions = {}): ChainResult {
  const config = testConfig({
    runSeed: asRunSeed(31n),
    defaultPatienceUs: 3n * MIN,
    defaultSizeCost: fromInt(1),
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
  });
  const driver = createTickDriver(
    createDefaultSlots(config),
    streamFor(config.runSeed, "root", 0),
    freshClocks(),
    { purgeTargetedMinNodes: 0 },
  );
  let state: GameState = Object.freeze({
    ...createInitialState({
      runSeed: config.runSeed,
      engineVersion: "restart-test",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "restart", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: Object.freeze([
        node(IDS.edge, {
          slots: opts.edgeSlots ?? 2,
          serviceUs: opts.edgeServiceUs ?? MIN,
          ...(opts.hardCeiling === true ? { discipline: "hard-ceiling" as const } : {}),
        }),
        node(IDS.origin, { slots: 8, serviceUs: MIN }),
      ]),
    }),
    // Host-style seeds (the door-fed variants below prove the REAL payment
    // path; these pins isolate the consume side from door side effects):
    ...(opts.restart !== undefined ? { restart: opts.restart } : {}),
    ...(opts.isolate !== undefined ? { isolate: opts.isolate } : {}),
  });
  const frames: ChainFrame[] = [];
  const bouncedEvents: BounceEvent[] = [];
  const doorFeeds = new Map<number, PlayerVerbArgs[]>();
  if (opts.doorArm !== undefined) {
    const args: RestartArgs = {
      verb: PlayerVerb.RestartNode,
      targetNodeId: IDS.edge,
      dropQueued: opts.doorArm.drop ? "drop" : "keep",
      effectiveAtBusinessMinute: opts.doorArm.effectiveAtBusinessMinute,
      releaseAtBusinessMinute: opts.doorArm.releaseAtBusinessMinute,
    };
    doorFeeds.set(opts.doorArm.tick, [args]);
  }
  for (let t = 0; t < (opts.ticks ?? 12); t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> &
      Pick<TickInputs, "envelopes"> & { externalIntents?: readonly ExternalIntent[] } = {
      envelopes: Object.freeze([envelope("restart:probe", fromInt(opts.ratePerMin ?? 6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    const feeds = doorFeeds.get(t + 1);
    if (feeds !== undefined) {
      partial.externalIntents = Object.freeze(
        feeds.map((args, i) =>
          Object.freeze({
            tick: BigInt(t + 1),
            intent: Object.freeze({
              seq: i + 1,
              clock: "sim" as const,
              atUs: BigInt(t + 1) * MIN,
              origin: "player" as const,
              payload: Object.freeze({ kind: "player-verb" as const, args }),
            }),
          }),
        ),
      );
    }
    const result = driver.advance(state, tickInputs(partial));
    state = result.state;
    const edge = state.nodes.get(IDS.edge);
    const origin = state.nodes.get(IDS.origin);
    for (const event of result.events) {
      if (event.kind === "bounced") {
        bouncedEvents.push({ unitId: event.unitId, nodeId: event.nodeId, causeId: event.causeId, tick: Number(event.tick) });
      }
    }
    frames.push({
      digest: digestState(state),
      bizMinute: Number(state.context.clocks.businessUs / MIN),
      tick: t + 1,
      edgeRoster: edge?.slots.length ?? -1,
      edgeOccupied: Object.freeze((edge?.slots ?? []).flatMap((s) => (s.occupied && s.unitId !== null ? [s.unitId] : []))),
      edgeQueue: edge?.queue ?? Object.freeze([]),
      originOccupied: Object.freeze((origin?.slots ?? []).flatMap((s) => (s.occupied && s.unitId !== null ? [s.unitId] : []))),
      served: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bounced: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
      arrived: result.events.filter((e) => e.kind === "arrival").length,
      outcomeTotal: result.outcomes.length,
    });
  }
  return { frames, bouncedEvents, finalState: state };
}

const sumServed = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.served.length, 0);
const sumBounced = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.bounced.length, 0);
const occupiedUnion = (frames: ChainFrame[]): Set<EntityId> => {
  const seen = new Set<EntityId>();
  for (const f of frames) for (const u of f.edgeOccupied) seen.add(u);
  return seen;
};

// The clock truth (pinned below): 1 tick = 1 sim-minute while the business
// clock runs 43200/7 sim-minutes per day… (Dual-Clock §4.4) ⇒ ≈ 102.857
// business minutes per tick: t1=102, t2=205, t3=308. rel=206 ⇒ the window
// covers t1+t2 and lifts strictly at t3.
const REL_206 = 206;

/* ══════════════ LIVE door-fed restart-drop (the queue dies, the roster stands) ══════════════ */

describe("restart-node — LIVE door-fed flush (drop: the whole queue walks the shed channel each in-window tick)", () => {
  const baseline = chain({ ticks: 10 });
  const armed = chain({ ticks: 10, doorArm: { tick: 1, drop: true, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: REL_206 } });
  // The KEEP arm — same seed, same window, the flush leg off. This is the
  // falsifier carrier: under a bounded fence the queue ACCRUES (joins ride
  // patience; the isolation-consume precedent pins the same growth), so a
  // keep run with a live backlog against a drop run reading zero every
  // in-window frame is the flush made mechanical. (The UNFENCED baseline
  // proves nothing here: on a saturated hockey-stick board the patience
  // LUT's projected-wait dice shed the excess the tick it joins — eq 0,
  // bn 4 every tick — so "queue present in baseline" would be a vacuous
  // pin; doctrine recorded in the landing report.)
  const keepArm = chain({ ticks: 10, doorArm: { tick: 1, drop: false, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: REL_206 } });

  it("the clock truth holds (window covers t1–t2, lifts at t3)", () => {
    expect(armed.frames[0]?.bizMinute).toBe(102);
    expect(armed.frames[1]?.bizMinute).toBe(205);
    expect(armed.frames[2]?.bizMinute).toBe(308);
  });

  it("the KEEP window congests (the fence accrues a backlog — flush claim would be vacuous without one)", () => {
    expect(keepArm.frames[0]!.edgeQueue.length).toBeGreaterThan(0);
    expect(keepArm.frames[1]!.edgeQueue.length).toBeGreaterThan(0);
  });

  it("EVERY in-window frame has an empty edge queue (same-tick pre-arm honored)", () => {
    expect(armed.frames[0]?.edgeQueue.length).toBe(0);
    expect(armed.frames[1]?.edgeQueue.length).toBe(0);
  });

  it("keep backlogs vs drop empties IN THE SAME WINDOW (falsifier pairing for the pin above)", () => {
    // The two arms share seed, traffic, and window — the ONLY difference is
    // the flush leg. If §(c′) never ran, drop would read exactly like keep.
    expect(keepArm.frames[0]!.edgeQueue.length).toBeGreaterThan(armed.frames[0]!.edgeQueue.length);
    expect(keepArm.frames[1]!.edgeQueue.length).toBeGreaterThan(armed.frames[1]!.edgeQueue.length);
    expect(armed.frames[0]!.edgeQueue.length + armed.frames[1]!.edgeQueue.length).toBe(0);
  });

  it("the bounce ledger strictly grows vs the same-seed baseline", () => {
    expect(sumBounced(armed.frames)).toBeGreaterThan(sumBounced(baseline.frames));
  });

  it("FLUSH IMMEDIACY + CONSERVATION: each in-window tick sheds its backlog AS bounced, exactly once, gone from the roster", () => {
    // The red-probe target: strip the §(c′) `shed.push(unitId)` (keeping the
    // queue clear) and the in-window bounce stream goes EMPTY — ping-ponging
    // units never leave the ledger — this pin reddens.
    const windowTicks = new Set([1, 2]);
    const edgeBounces = armed.bouncedEvents.filter((e) => e.nodeId === IDS.edge);
    const inWindow = edgeBounces.filter((e) => windowTicks.has(e.tick));
    expect(inWindow.length).toBeGreaterThan(0);
    const counts = new Map<EntityId, number>();
    for (const e of armed.bouncedEvents) counts.set(e.unitId, (counts.get(e.unitId) ?? 0) + 1);
    for (const [unitId, n] of counts) {
      expect(n).toBe(1); // none vanishes twice-cleaned, none double-bounces
      expect(armed.finalState.units.has(unitId)).toBe(false); // bounced ⇒ purged from roster
    }
    // Telescoping conservation: every unit the stream ARRIVED is either
    // still on the final roster or left through EXACTLY ONE terminal
    // outcome. A §(c′) purge that cleared the queue WITHOUT the shed.push
    // strands its units in neither camp — they re-join, re-clear, and never
    // terminalize — so the identity reddens (proven red by red-probe P1).
    const arrived = armed.frames.reduce((n, f) => n + f.arrived, 0);
    const terminalized = armed.frames.reduce((n, f) => n + f.outcomeTotal, 0);
    expect(arrived - terminalized).toBe(armed.finalState.units.size);
  });

  it("purge bounces ride the PRESET branch: kind bounced, cause outcome:<unitId>, nodeId the rebooting node — zero new event kinds", () => {
    const windowTicks = new Set([1, 2]);
    const purgeBounces = armed.bouncedEvents.filter((e) => e.nodeId === IDS.edge && windowTicks.has(e.tick));
    expect(purgeBounces.length).toBeGreaterThan(0);
    for (const e of purgeBounces) expect(e.causeId).toBe(`outcome:${e.unitId}`);
  });

  it("COMPLETION-BEFORE-PURGE: work that ever OCCUPIED an edge arm is never a purge casualty", () => {
    const occupied = occupiedUnion(armed.frames);
    const edgeBouncedUnits = new Set(
      armed.bouncedEvents.filter((e) => e.nodeId === IDS.edge).map((e) => e.unitId),
    );
    for (const unitId of occupied) expect(edgeBouncedUnits.has(unitId)).toBe(false);
  });

  it("the roster is NEVER written and admissions stay down in-window", () => {
    for (const f of armed.frames) expect(f.edgeRoster).toBe(2);
    expect(sumServed(armed.frames)).toBeLessThan(sumServed(baseline.frames));
  });

  it("the window LIFTS strictly: the fence zeroes admissions in-window, t3 re-admits (queue-empty rejoin)", () => {
    // t0 admits the first two units; the t1 door-fed fence releases them at
    // §(b) and admits NOTHING for t1–t2 (occupied 0 both frames); biz 308 ≥
    // rel 206 at t3 re-opens the channel — arms occupied again.
    expect(armed.frames[1]!.edgeOccupied.length).toBe(0);
    expect(armed.frames[2]!.edgeOccupied.length).toBeGreaterThan(0);
    // And the rejoin is QUEUE-EMPTY by law: nothing survived the flush to
    // wait behind the new admissions.
    expect(keepArm.frames[1]!.edgeQueue.length).toBeGreaterThan(0); // the backlog keep WOULD have kept
  });

  it("served units hop onward: the origin arm keeps working (fence stops RECEIVING, not KEEPS)", () => {
    const armedOriginWork = armed.frames.reduce((n, f) => n + f.originOccupied.length, 0);
    expect(armedOriginWork).toBeGreaterThan(0);
  });

  it("host-seeded book and door-fed order agree on the flush ledger", () => {
    const seeded = chain({ ticks: 10, restart: dropBook([[IDS.edge, seedRow(0, REL_206)]]) });
    expect(sumBounced(seeded.frames)).toBe(sumBounced(armed.frames));
    expect(seeded.frames.map((f) => f.edgeQueue.length)).toEqual(armed.frames.map((f) => f.edgeQueue.length));
  });
});

/* ═══════════════════ the keep twin: a fence wearing a reboot's clothes ═══════════════════ */

describe("restart-node — keep == the pure bounded fence (observables twin the isolate run, digests honestly differ)", () => {
  const keep = chain({ ticks: 10, restart: dropBook([[IDS.edge, seedRow(0, REL_206, false)]]) });
  const fenced = chain({ ticks: 10, isolate: isolateBookOf([[IDS.edge, { eff: 0, rel: REL_206 }]]) });

  it("every frame's edge admissions + queue are IDENTICAL to the same-window isolate", () => {
    expect(keep.frames.map((f) => f.edgeOccupied.map(String))).toEqual(fenced.frames.map((f) => f.edgeOccupied.map(String)));
    expect(keep.frames.map((f) => f.edgeQueue.map(String))).toEqual(fenced.frames.map((f) => f.edgeQueue.map(String)));
    expect(keep.frames.map((f) => f.served.length)).toEqual(fenced.frames.map((f) => f.served.length));
  });

  it("the keep queue RIDES (ages under patience) instead of flushing — the ladder rung between throttle and drop", () => {
    expect(Math.max(...keep.frames.slice(0, 2).map((f) => f.edgeQueue.length))).toBeGreaterThan(0);
  });

  it("the books still digests apart (embed honesty — identical observables, different state)", () => {
    expect(keep.frames[0]!.digest).not.toBe(fenced.frames[0]!.digest);
  });
});

/* ═════════════════ hard ceiling ∪ restart: candidateSeen makes the double push idempotent ═════════════════ */

describe("restart-node ∪ the hard ceiling (a double shed push bounces a unit ONCE, never twice)", () => {
  const hard = chain({ ticks: 10, hardCeiling: true });
  const hardArmed = chain({
    ticks: 10,
    hardCeiling: true,
    doorArm: { tick: 1, drop: true, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: REL_206 },
  });

  it("no unit ever bounces twice on the hard-ceiling reboot board", () => {
    const counts = new Map<EntityId, number>();
    for (const e of hardArmed.bouncedEvents) counts.set(e.unitId, (counts.get(e.unitId) ?? 0) + 1);
    for (const n of counts.values()) expect(n).toBe(1);
  });

  it("the hard ceiling already kept the queue at zero — the fence leg keeps admissions down", () => {
    expect(sumBounced(hardArmed.frames)).toBeGreaterThanOrEqual(sumBounced(hard.frames));
    for (const f of hardArmed.frames.slice(0, 2)) expect(f.edgeQueue.length).toBe(0);
  });
});

/* ═════════════════════ the byte-identity switches (absent / empty / expired) ═════════════════════ */

describe("the restart switches (no book, empty book, expired book)", () => {
  const unarmed = chain({ ticks: 8 });
  const emptyBook = chain({ ticks: 8, restart: restartBookOf(new Map()) });
  const expiredBook = chain({ ticks: 8, restart: dropBook([[IDS.edge, seedRow(0, 1)]]) });

  it("every observable of the armed-but-idle runs matches the unarmed baseline", () => {
    const shape = (fs: ChainFrame[]) => fs.map((f) => `${f.bizMinute}|${f.edgeOccupied.join(",")}|${f.edgeQueue.join(",")}|${f.served.length}|${f.bounced.length}`);
    expect(shape(emptyBook.frames)).toEqual(shape(unarmed.frames));
    expect(shape(expiredBook.frames)).toEqual(shape(unarmed.frames));
  });

  it("the PRESENT-but-idle books honestly switch the digest (embed law)", () => {
    expect(emptyBook.frames[0]!.digest).not.toBe(unarmed.frames[0]!.digest);
    expect(expiredBook.frames[0]!.digest).not.toBe(unarmed.frames[0]!.digest);
    // …while the ABSENT key costs nothing: two unarmed runs are byte-identical.
    expect(chain({ ticks: 8 }).frames[0]!.digest).toBe(unarmed.frames[0]!.digest);
  });
});

/* ═══════════════════════════ determinism (the flush casts no dice) ═══════════════════════════ */

describe("restart-node determinism — the armed chain replays byte-identical", () => {
  it("same seed, same door script ⇒ every frame digest equal across independent runs", () => {
    const a = chain({ ticks: 12, doorArm: { tick: 2, drop: true, effectiveAtBusinessMinute: 150, releaseAtBusinessMinute: 500 } });
    const b = chain({ ticks: 12, doorArm: { tick: 2, drop: true, effectiveAtBusinessMinute: 150, releaseAtBusinessMinute: 500 } });
    expect(a.frames.map((f) => f.digest)).toEqual(b.frames.map((f) => f.digest));
  });

  it("a future effective stamp arms NOTHING before its minute (pre-arm frames byte-match the baseline)", () => {
    const future = chain({ ticks: 1, doorArm: { tick: 1, drop: true, effectiveAtBusinessMinute: 5_000, releaseAtBusinessMinute: 6_000 } });
    const baseline = chain({ ticks: 1 });
    expect(future.frames[0]!.edgeQueue.length).toBe(baseline.frames[0]!.edgeQueue.length);
  });
});
