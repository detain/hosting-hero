/**
 * ADR-0016 successor program (lane L-TR) — the THROTTLE ↔ step-5 admission
 * clamp, end to end. The door verb (intent-door-throttle.test.ts) writes
 * the book; THIS file pins the consume path: `throttleCuts` rides the serve
 * input as the presence-only `ServeInExt.throttleCuts` and
 * `defaultServeStep` §(c) discounts each cut node's ADMISSION ceiling —
 * `occupied + need ≤ slots.length(view) − cut` — while joins, releases,
 * patience ageing, and hard-ceiling shed all run untouched, the roster is
 * never written, and occupied arms are never evicted.
 *
 * Precedence laws, pinned falsifiably (matrix names per the design lane):
 *  - "recovery composes min-of-clamps on the throttled view zero-drift-surface":
 *    the cut reads the recovery-CLAMPED view (the clamp already discounted
 *    the roster); no new drift surface exists because neither authority
 *    writes the other's — a `recovery[board-drift]` throw is structurally
 *    unreachable here;
 *  - "booked warmth raises the base the cut discounts (additive)": scale
 *    warmth widens the view, the cut discounts the widened ceiling — the
 *    cut never cancels warmth's promise, it spends against it;
 *  - "fenced+cut admits zero, cut resumes at release": the fence stays the
 *    TOTAL case and beats the cut by CODE POSITION (fenced skip-branch is
 *    the FIRST branch of §(c)); the cut's own window keeps ticking
 *    underneath and re-opens the full ceiling at `release`, strictly;
 *  - "cut on scale-to-zero roster inert-but-booked": a cut whose ceiling
 *    the recovery clamp has already eaten admits nothing, THROWS nothing,
 *    writes no roster, and rides the digest raw — inert in effect, booked
 *    in witness.
 *
 * The noisy-neighbor counter made mechanical (§1.3 dbaas): on a 2-slot
 * edge, cut=1 starves size-2 fat arrivals (need 2 > ceiling 1 — never
 * admitted) while size-1 arrivals keep serving one-at-a-time. Same seed,
 * two arms, the whole tenancy law of the card in one guard.
 *
 * Byte-identity switches: an ABSENT book ⇒ the driver never calls the law
 * and twin runs are digest-identical; an IDLE book (every row
 * armed-not-yet/expired/cut-0) ⇒ `throttleCuts` returns null, the key is
 * OMITTED, and the ledger streams match the unarmed run exactly (presence
 * without power — only the digest embed moves). Zero RNG at the site: a
 * silent board ships identical streams cut or not.
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  IsolateBook,
  NodeRecord,
  RecoveryState,
  RecoveryWindowRecord,
  ScaleBook,
  ScaleEntry,
  ThrottleArgs,
  ThrottleBook,
  ThrottleEntry,
} from "../../types";
import { asEntityId, asRunSeed, PlayerVerb } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { nodeThrottleCut, throttleCuts } from "../throttle";
import { createScaleBook } from "../intent-door";
import { defaultRecoveryConfig } from "../recovery";
import { shieldBusinessMinuteOf } from "../corruption";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

/* ───────────────────────────── book builders ───────────────────────────── */

type SeedCut = { shippedAtTick: bigint; cut: number; eff: number | null; rel: number | null };

function throttleBook(entries: ReadonlyMap<EntityId, ThrottleEntry>, version = 1): ThrottleBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function seedCut(eff: number | null, rel: number | null, cut = 1, shippedAtTick = 0n): ThrottleEntry {
  return Object.freeze({ shippedAtTick, cutSlots: cut, effectiveAtBusinessMinute: eff, releaseAtBusinessMinute: rel });
}

function cutBook(rows: readonly (readonly [EntityId, SeedCut])[], version = 1): ThrottleBook {
  return throttleBook(
    new Map(rows.map(([id, e]) => [
      id,
      Object.freeze({
        shippedAtTick: e.shippedAtTick,
        cutSlots: e.cut,
        effectiveAtBusinessMinute: e.eff,
        releaseAtBusinessMinute: e.rel,
      }) satisfies ThrottleEntry,
    ])),
    version,
  );
}

function isolateBook(entries: ReadonlyMap<EntityId, { shippedAtTick: bigint; effectiveAtBusinessMinute: number | null; releaseAtBusinessMinute: number | null }>, version = 1): IsolateBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function scaleBook(entries: ReadonlyMap<EntityId, ScaleEntry>, version = 1): ScaleBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

/* ═══════════════════ as-of law unit pins — nodeThrottleCut ═══════════════════ */

describe("nodeThrottleCut — the as-of law in the small (nodeIsolated twin, widened by the cut leg)", () => {
  const EDGE = IDS.edge;
  const book = (rows: readonly (readonly [EntityId, SeedCut])[]) => cutBook(rows);

  it("undefined book ⇒ null for every node; the EMPTY book likewise", () => {
    expect(nodeThrottleCut(undefined, EDGE, 100)).toBeNull();
    expect(nodeThrottleCut(book([]), EDGE, 100)).toBeNull();
  });

  it("absent entry ⇒ null; a DIFFERENT node's cut never leaks", () => {
    const only = book([[EDGE, { shippedAtTick: 0n, cut: 1, eff: null, rel: null }]]);
    expect(nodeThrottleCut(only, IDS.origin, 100)).toBeNull();
    expect(nodeThrottleCut(only, EDGE, 100)).toBe(1);
  });

  it("cut 0 is the explicit LIFT amendment — booked, and reads null at every minute", () => {
    const lifted = book([[EDGE, { shippedAtTick: 4n, cut: 0, eff: null, rel: null }]]);
    for (const m of [0, 100, 43_200]) expect(nodeThrottleCut(lifted, EDGE, m)).toBeNull();
    // the row stays in the book as history (the reader answers, it does not prune):
    expect(lifted.entries.get(EDGE)?.cutSlots).toBe(0);
  });

  it("null effective ⇒ law from the executing minute (same-tick pre-arm honored)", () => {
    const now = book([[EDGE, { shippedAtTick: 7n, cut: 2, eff: null, rel: null }]]);
    expect(nodeThrottleCut(now, EDGE, 0)).toBe(2);
  });

  it("armed-not-yet ⇒ null at minute-1, the cut at the stamp (shield/isolate discipline)", () => {
    const later = book([[EDGE, { shippedAtTick: 0n, cut: 1, eff: 100, rel: null }]]);
    expect(nodeThrottleCut(later, EDGE, 99)).toBeNull();
    expect(nodeThrottleCut(later, EDGE, 100)).toBe(1);
  });

  it("the release edge is STRICT: [eff, rel) half-open — at rel the full ceiling is back", () => {
    const window = book([[EDGE, { shippedAtTick: 0n, cut: 3, eff: 100, rel: 200 }]]);
    expect(nodeThrottleCut(window, EDGE, 100)).toBe(3);
    expect(nodeThrottleCut(window, EDGE, 199)).toBe(3);
    expect(nodeThrottleCut(window, EDGE, 200)).toBeNull();
  });

  it("null release ⇒ indefinite until replaced (the cut-0 amendment IS the lift)", () => {
    const forever = book([[EDGE, { shippedAtTick: 0n, cut: 1, eff: null, rel: null }]]);
    expect(nodeThrottleCut(forever, EDGE, 1_000_000)).toBe(1);
  });

  it("release 0 with null effective ⇒ already-expired inert history — null at every minute", () => {
    const stale = book([[EDGE, { shippedAtTick: 9n, cut: 2, eff: null, rel: 0 }]]);
    for (const m of [0, 1, 1_000_000]) expect(nodeThrottleCut(stale, EDGE, m)).toBeNull();
  });

  it("expired rows are KEPT as witness: the book carries the entry while the law answers null", () => {
    const gone = book([[EDGE, { shippedAtTick: 0n, cut: 1, eff: null, rel: 50 }]]);
    expect(nodeThrottleCut(gone, EDGE, 51)).toBeNull();
    expect(gone.entries.has(EDGE)).toBe(true);
  });

  it("the cut VALUE rides raw (no re-validation at read): a booked 7 answers 7 at any armed minute", () => {
    // the door can only book < roster; a foreign/restored board may present
    // a bigger number — the reader reports it, §(c) arithmetic does the rest
    // (ceiling goes negative ⇒ admits nothing — inert, never a throw):
    expect(nodeThrottleCut(book([[EDGE, { shippedAtTick: 0n, cut: 7, eff: null, rel: null }]]), EDGE, 5)).toBe(7);
  });
});

/* ═══════════════════ throttleCuts — the driver-threaded cut map ═══════════════════ */

describe("throttleCuts — the driver-threaded cut map", () => {
  it("undefined book and empty book ⇒ null (the key is OMITTED, never an empty map)", () => {
    expect(throttleCuts(undefined, 100)).toBeNull();
    expect(throttleCuts(cutBook([]), 100)).toBeNull();
  });

  it("an ALL-INERT book (cut-0, armed-not-yet, expired rows) ⇒ null — idle book costs ZERO", () => {
    const inert = cutBook([
      [IDS.edge, { shippedAtTick: 0n, cut: 0, eff: null, rel: null }],
      [IDS.origin, { shippedAtTick: 0n, cut: 2, eff: 1_000, rel: null }],
      [IDS.waf, { shippedAtTick: 0n, cut: 1, eff: null, rel: 10 }],
    ]);
    expect(throttleCuts(inert, 100)).toBeNull();
  });

  it("the LIVE cuts only: value map, frozen; expired/armed rows drop out, live rows carry their cut", () => {
    const mixed = cutBook([
      [IDS.edge, { shippedAtTick: 0n, cut: 1, eff: null, rel: 200 }],
      [IDS.origin, { shippedAtTick: 0n, cut: 3, eff: 150, rel: null }],
      [IDS.waf, { shippedAtTick: 0n, cut: 2, eff: null, rel: 100 }], // expired at 100 (strict)
    ]);
    const at150 = throttleCuts(mixed, 150);
    expect(at150).not.toBeNull();
    expect(Object.isFrozen(at150)).toBe(true);
    expect(at150?.get(IDS.edge)).toBe(1);
    expect(at150?.get(IDS.origin)).toBe(3);
    expect(at150?.has(IDS.waf)).toBe(false);
  });

  it("insertion order never leaks into membership: same rows, different order, same map contents", () => {
    const forward = throttleCuts(
      cutBook([
        [IDS.edge, { shippedAtTick: 0n, cut: 1, eff: null, rel: null }],
        [IDS.origin, { shippedAtTick: 0n, cut: 2, eff: null, rel: null }],
      ]),
      100,
    );
    const reverse = throttleCuts(
      cutBook([
        [IDS.origin, { shippedAtTick: 0n, cut: 2, eff: null, rel: null }],
        [IDS.edge, { shippedAtTick: 0n, cut: 1, eff: null, rel: null }],
      ]),
      100,
    );
    expect([...(forward?.keys() ?? [])].sort()).toEqual([...(reverse?.keys() ?? [])].sort());
    expect(forward?.get(IDS.edge)).toBe(reverse?.get(IDS.edge));
    expect(forward?.get(IDS.origin)).toBe(reverse?.get(IDS.origin));
  });
});

/* ═══════════════════════════ the chain witness ═══════════════════════════ */

type ChainFrame = {
  digest: string;
  bizMinute: number;
  edgeRoster: number;
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
    sizeCost?: number;
    throttle?: ThrottleBook;
    isolate?: IsolateBook;
    scale?: ScaleBook;
    recovery?: boolean;
    recoveryState?: RecoveryState;
    hardCeiling?: boolean;
    doorArm?: { tick: number; cut: number; effectiveAtBusinessMinute: number | null; releaseAtBusinessMinute: number | null };
    doorLift?: { tick: number };
  } = {},
): { frames: ChainFrame[]; finalState: GameState } {
  const config = testConfig({
    runSeed: asRunSeed(31n),
    defaultPatienceUs: 3n * MIN,
    defaultSizeCost: fromInt(opts.sizeCost ?? 1),
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
      engineVersion: "throttle-test",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "throttle", ruleBookHash: "" },
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
    ...(opts.throttle !== undefined ? { throttle: opts.throttle } : {}),
    ...(opts.isolate !== undefined ? { isolate: opts.isolate } : {}),
    ...(opts.scale !== undefined ? { scale: opts.scale } : {}),
    ...(opts.recoveryState !== undefined ? { recovery: opts.recoveryState } : {}),
  });
  const frames: ChainFrame[] = [];
  const doorFeeds = new Map<number, ThrottleArgs[]>();
  if (opts.doorArm !== undefined) {
    doorFeeds.set(opts.doorArm.tick, [
      {
        verb: PlayerVerb.ThrottleNode,
        targetNodeId: IDS.edge,
        cutSlots: opts.doorArm.cut,
        effectiveAtBusinessMinute: opts.doorArm.effectiveAtBusinessMinute,
        releaseAtBusinessMinute: opts.doorArm.releaseAtBusinessMinute,
      },
    ]);
  }
  if (opts.doorLift !== undefined) {
    const lift: ThrottleArgs = {
      verb: PlayerVerb.ThrottleNode,
      targetNodeId: IDS.edge,
      cutSlots: 0, // the explicit lift amendment
      effectiveAtBusinessMinute: null,
      releaseAtBusinessMinute: null,
    };
    doorFeeds.set(opts.doorLift.tick, [...(doorFeeds.get(opts.doorLift.tick) ?? []), lift]);
  }
  for (let t = 0; t < (opts.ticks ?? 30); t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> &
      Pick<TickInputs, "envelopes"> & { externalIntents?: readonly ExternalIntent[] } = {
      envelopes: Object.freeze([envelope("throttle:probe", fromInt(opts.ratePerMin ?? 6))]),
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
    frames.push({
      digest: digestState(state),
      bizMinute: Number(state.context.clocks.businessUs / MIN),
      edgeRoster: edge?.slots.length ?? -1,
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
const maxConcurrent = (frames: ChainFrame[]): number => frames.reduce((n, f) => Math.max(n, f.edgeOccupied.length), 0);
const edgeAdmitted = (frames: ChainFrame[]): number => {
  // distinct units ever seen occupying the edge:
  const seen = new Set<EntityId>();
  for (const f of frames) for (const u of f.edgeOccupied) seen.add(u);
  return seen.size;
};

const WARM_EDGE = scaleBook(
  new Map([[IDS.edge, Object.freeze({ reservedSlots: 3, baseRosterSlots: 2, shippedAtTick: 0n, effectiveAtBusinessMinute: null }) as ScaleEntry]]),
);
const CUT1_EDGE = cutBook([[IDS.edge, { shippedAtTick: 0n, cut: 1, eff: null, rel: null }]]);

/* ══════════════════ the noisy-neighbor counter, made mechanical ══════════════════ */

describe("throttle-node — LIVE driver-fed clamp (cut=1 starves the fat tenant, serves the thin one)", () => {
  it("baseline 2-slot edge congests at full ceiling: up to TWO concurrent occupants, terminals serve", () => {
    const frames = chain({ ticks: 10 }).frames;
    expect(maxConcurrent(frames)).toBe(2);
    expect(sumServed(frames)).toBeGreaterThan(0);
    expect(sumBounced(frames)).toBeGreaterThan(0); // 6/min into 2 slots is genuinely congested
  });

  it("thin tenant (size 1) under cut=1: admits keep flowing, ONE at a time — never two concurrent", () => {
    const frames = chain({ ticks: 10, throttle: CUT1_EDGE }).frames;
    expect(sumServed(frames)).toBeGreaterThan(0);
    expect(maxConcurrent(frames)).toBe(1); // the ceiling bit; never-evict never raised it
  });

  it("fat tenant (size 2) under cut=1: NEVER admitted — ceiling 1 < need 2 starves every arrival", () => {
    const frames = chain({ ticks: 10, sizeCost: 2, throttle: CUT1_EDGE }).frames;
    expect(edgeAdmitted(frames)).toBe(0);
    expect(sumServed(frames)).toBe(0);
  });

  it("the sustained cut GROWS the queue then BOUNCES the patience clock (the soft degrade is visible, never silent)", () => {
    const frames = chain({ ticks: 10, sizeCost: 2, throttle: CUT1_EDGE }).frames;
    // pinned against the probed arm (seed 31n, 6/min, patience 3min):
    // queue = [6,12,14,14,11,9,11,12,17,16], bounces = [0,0,4,6,9,8,4,5,1,7]
    // — the backlog builds while the cut starves admissions, then the
    // patience dice drain it: visible, never silent, never admitting:
    expect(frames[0]!.edgeQueue.length).toBeGreaterThan(0);
    expect(frames[3]!.edgeQueue.length).toBeGreaterThan(frames[0]!.edgeQueue.length);
    expect(frames[5]!.edgeQueue.length).toBeLessThan(frames[3]!.edgeQueue.length);
    expect(sumBounced(frames)).toBeGreaterThan(0); // patience law still runs — the cut casts no dice itself
    expect(edgeAdmitted(frames)).toBe(0);
  });

  it("the fat control (same seed, no book) admits the fat tenant and serves it — the cut is the ONLY difference", () => {
    const starved = chain({ ticks: 10, sizeCost: 2, throttle: CUT1_EDGE }).frames;
    const free = chain({ ticks: 10, sizeCost: 2 }).frames;
    expect(edgeAdmitted(free)).toBeGreaterThan(0);
    expect(sumServed(free)).toBeGreaterThan(0);
    expect(starved[9]!.digest).not.toBe(free[9]!.digest);
    // the authored roster is UNTOUCHED in both arms (capacity-as-clamp):
    expect(starved[9]!.edgeRoster).toBe(free[9]!.edgeRoster);
  });
});

/* ═══════════════════ lift / amendment across the window ═══════════════════ */

describe("throttle-node — the half-open window pays through the real clock", () => {
  it("cut=1 starves the fat tenant until [rel); at rel the ceiling is back and fat admits — strictly", () => {
    // rel 206: biz minutes run 102, 205, 308 by t3 (the isolate lane's
    // clock arithmetic) — zero fat admissions while 102 ≤ m < 206, admits from t3 on.
    const frames = chain({
      ticks: 12,
      sizeCost: 2,
      ratePerMin: 4,
      throttle: cutBook([[IDS.edge, { shippedAtTick: 0n, cut: 1, eff: null, rel: 206 }]]),
    }).frames;
    const before = frames.filter((f) => f.bizMinute < 206);
    const after = frames.filter((f) => f.bizMinute >= 206);
    expect(before.length).toBeGreaterThan(0);
    expect(after.length).toBeGreaterThan(0);
    for (const f of before) expect(f.edgeOccupied.length).toBe(0);
    expect(after.some((f) => f.edgeOccupied.length > 0)).toBe(true);
  });

  it("door-fed arm then door-fed cut-0 lift: concurrency 2 → 1 (after walk-off) → 2 again (the amendment IS the lift)", () => {
    const frames = chain({
      ticks: 14,
      edgeServiceUs: 3n * MIN,
      doorArm: { tick: 2, cut: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null },
      doorLift: { tick: 9 },
    }).frames;
    // (a) before the arm at t2 the ceiling is full: two concurrent:
    expect(frames[0]!.edgeOccupied.length + frames[1]!.edgeOccupied.length).toBeGreaterThan(0);
    // (b) the t1 pair HOLDS through the arm (never evicted — over-cap tolerated):
    const heldAtArm = frames[1]!.edgeOccupied.length; // t2 frame, occupied from t1
    expect(heldAtArm).toBeLessThanOrEqual(2);
    // (c) once walk-off drains, the cut keeps concurrency at ONE for the whole cut span:
    const cutSpan = frames.slice(4, 8);
    for (const f of cutSpan) expect(f.edgeOccupied.length).toBeLessThanOrEqual(1);
    // (d) after the t9 lift the second arm admits again:
    const afterLift = frames.slice(10);
    expect(afterLift.some((f) => f.edgeOccupied.length === 2)).toBe(true);
  });

  it("a door-FED in-force book equals the host-seeded run's ledger (one law, two doors)", () => {
    const fed = chain({ ticks: 10, doorArm: { tick: 1, cut: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null } });
    const seeded = chain({ ticks: 10, throttle: CUT1_EDGE });
    for (let t = 0; t < 10; t += 1) {
      expect(fed.frames[t]!.edgeOccupied).toStrictEqual(seeded.frames[t]!.edgeOccupied);
      expect(fed.frames[t]!.edgeQueue).toStrictEqual(seeded.frames[t]!.edgeQueue);
    }
  });
});

/* ═══════════ PRECEDENCE MATRIX — the four named laws, falsifiable ═══════════ */

describe("PRECEDENCE MATRIX — throttle vs the other step-5 authorities", () => {
  it("recovery composes min-of-clamps on the throttled view zero-drift-surface", () => {
    // 3-slot authored edge, recovery clamped to 1, door-legal cut=2 booked
    // against the AUTHORED roster: the cut reads the CLAMPED view
    // (ceiling 1−2 = −1) — zero admissions, no `recovery[board-drift]`
    // throw (the run IS the guard: any throw reddens this it), no roster
    // write beyond recovery's own authority.
    const clamped = chain({
      recovery: true,
      recoveryState: windowOnEdge(),
      edgeSlots: 3,
      throttle: cutBook([[IDS.edge, { shippedAtTick: 0n, cut: 2, eff: null, rel: null }]]),
    }).frames;
    expect(clamped.length).toBe(30);
    for (const f of clamped) expect(f.edgeOccupied.length).toBe(0);
    expect(sumServed(clamped)).toBe(0);
    // recovery ALONE admits (its authority is real); the cut discounts it:
    const recoveryOnly = chain({ recovery: true, recoveryState: windowOnEdge(), edgeSlots: 3 }).frames;
    expect(sumServed(recoveryOnly)).toBeGreaterThan(0);
    // the two states' rosters agree — the cut wrote nothing:
    expect(clamped[29]!.edgeRoster).toBe(recoveryOnly[29]!.edgeRoster);
  });

  it("booked warmth raises the base the cut discounts (additive)", () => {
    // bare+cut: ceiling 2−1 = 1 → one concurrent (pinned above).
    // warm+cut: warmth widens the roster to base+reserved = 5; the cut
    // discounts the WIDENED base → ceiling 4 — the cut never cancels the
    // warmth's promise, it spends against it:
    const warmCut = chain({ ticks: 10, edgeServiceUs: 4n * MIN, scale: WARM_EDGE, throttle: CUT1_EDGE }).frames;
    expect(maxConcurrent(warmCut)).toBeGreaterThan(1); // warmth reached past the bare+cut ceiling
    expect(maxConcurrent(warmCut)).toBeLessThanOrEqual(4); // and the cut still bit (5 would be uncapped)
    const warmFree = chain({ ticks: 10, edgeServiceUs: 4n * MIN, scale: WARM_EDGE }).frames;
    expect(maxConcurrent(warmFree)).toBe(5); // the same warmth with no book fills all five arms
    // cut-armed digest differs from warmth-only digest (the book rides):
    expect(warmCut[9]!.digest).not.toBe(warmFree[9]!.digest);
  });

  it("fenced+cut admits zero, cut resumes at release (fence beats throttle by CODE POSITION)", () => {
    // FENCE BEATS CUT: the fenced skip-branch is the FIRST branch of §(c) —
    // a fenced node never reaches the ceiling guard, so the cut's PARTIAL
    // allowance is invisible while the fence stands. If the skip were ever
    // widened into the ceiling branch (red-probe #1), this arm would admit
    // up to ceiling 1 and redden:
    const fence = isolateBook(
      new Map([[IDS.edge, Object.freeze({ shippedAtTick: 0n, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null })]]),
    );
    const both = chain({ ticks: 10, isolate: fence, throttle: CUT1_EDGE }).frames;
    expect(edgeAdmitted(both)).toBe(0);
    const fenceOnly = chain({ ticks: 10, isolate: fence }).frames;
    expect(edgeAdmitted(fenceOnly)).toBe(0);
    // the cut alone WOULD admit (thin tenant) — the fence subsumes it:
    const cutOnly = chain({ ticks: 10, throttle: CUT1_EDGE }).frames;
    expect(edgeAdmitted(cutOnly)).toBeGreaterThan(0);
    // digests keep the books apart (different fold namespaces, §digest):
    expect(both[9]!.digest).not.toBe(fenceOnly[9]!.digest);
    expect(both[9]!.digest).not.toBe(cutOnly[9]!.digest);
    // the cut's own window keeps ticking UNDER the fence: release the fence
    // and the still-live cut re-opens at its discount, not at full ceiling —
    // cut [null, 43_200) fence [null, 206): zero while fenced (t1,t2), 1-per
    // frame under the live cut at t3+ (biz 308 < 43_200 — the window spans
    // the run: the earlier 1000-minute release EXPIRED at t10, biz 1028,
    // which is exactly what this first probe caught), never 2:
    const fenceOpens = isolateBook(
      new Map([[IDS.edge, Object.freeze({ shippedAtTick: 0n, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 206 })]]),
    );
    const opened = chain({
      ticks: 10,
      isolate: fenceOpens,
      throttle: cutBook([[IDS.edge, { shippedAtTick: 0n, cut: 1, eff: null, rel: 43_200 }]]),
    }).frames;
    expect(edgeAdmitted(opened)).toBeGreaterThan(0); // fence released at 206
    for (const f of opened.filter((x) => x.bizMinute >= 206).slice(2)) expect(f.edgeOccupied.length).toBeLessThanOrEqual(1);
  });

  it("cut on scale-to-zero roster inert-but-booked", () => {
    // warmth amended to reservedSlots 0 (scale-to-zero posture) over a
    // recovery-clamped view: the roster the cut discounts is smaller than
    // the cut itself — §(c) arithmetic admits NOTHING (negative ceiling),
    // THROWS nothing, writes nothing; the book stays carried, digest-raw.
    const zeroWarm = scaleBook(
      new Map([[IDS.edge, Object.freeze({ reservedSlots: 0, baseRosterSlots: 3, shippedAtTick: 0n, effectiveAtBusinessMinute: null }) as ScaleEntry]]),
    );
    const inertBig = chain({
      recovery: true,
      recoveryState: windowOnEdge(),
      edgeSlots: 3,
      scale: zeroWarm,
      throttle: cutBook([[IDS.edge, { shippedAtTick: 0n, cut: 2, eff: null, rel: null }]]),
    });
    for (const f of inertBig.frames) expect(f.edgeOccupied.length).toBe(0);
    expect(sumServed(inertBig.frames)).toBe(0);
    // the cut is INERT (same ledger streams as the recovery-only board —
    // recovery alone also can't reach 3 concurrent on this window… it CAN
    // reach 1, and the cut zeroes it: streams differ, and that is the
    // honesty: "inert" = no throw, no roster write, book carried):
    const recoveryOnly = chain({ recovery: true, recoveryState: windowOnEdge(), edgeSlots: 3 }).frames;
    expect(sumServed(recoveryOnly)).toBeGreaterThan(0);
    expect(inertBig.frames[29]!.digest).not.toBe(recoveryOnly[29]!.digest);
    expect(inertBig.finalState.throttle?.entries.get(IDS.edge)?.cutSlots).toBe(2); // booked
    expect(inertBig.frames[29]!.edgeRoster).toBe(recoveryOnly[29]!.edgeRoster);   // no roster write
  });

  /** A live §7.7 restoration window on a 3-slot edge, clamped to 1 arm —
   *  the isolation/scale suite's shape (open at minute 0, closing never). */
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
});

/* ═══════════════════════ byte-identity switches ═══════════════════════ */

describe("the byte-identity switches (absent book, idle book)", () => {
  it("absent-book twins across fresh driver closures are digest-identical (the zero-call law)", () => {
    const a = chain({ ticks: 12 }).frames.map((f) => f.digest);
    const b = chain({ ticks: 12 }).frames.map((f) => f.digest);
    expect(a).toStrictEqual(b);
  });

  it("an IDLE book (every row cut-0/expired/armed-not-yet) ⇒ ledger streams BYTE-EQUAL to the unarmed run; only the digest embed moves", () => {
    const bare = chain({ ticks: 12 }).frames;
    const idle = chain({
      ticks: 12,
      throttle: cutBook([
        [IDS.edge, { shippedAtTick: 0n, cut: 0, eff: null, rel: null }],
        [IDS.origin, { shippedAtTick: 0n, cut: 2, eff: 10_000, rel: null }],
      ]),
    }).frames;
    for (let t = 0; t < 12; t += 1) {
      expect(idle[t]!.served).toStrictEqual(bare[t]!.served);
      expect(idle[t]!.bounced).toStrictEqual(bare[t]!.bounced);
      expect(idle[t]!.edgeOccupied).toStrictEqual(bare[t]!.edgeOccupied);
      expect(idle[t]!.edgeQueue).toStrictEqual(bare[t]!.edgeQueue);
    }
    // presence without power: the book still rides the digest:
    expect(idle[11]!.digest).not.toBe(bare[11]!.digest);
  });

  it("armed-but-FUTURE stamp ⇒ streams byte-equal baseline while the digest moved (the as-of gate is live)", () => {
    const bare = chain({ ticks: 12 }).frames;
    const armed = chain({
      ticks: 12,
      throttle: cutBook([[IDS.edge, { shippedAtTick: 0n, cut: 1, eff: 1_000_000, rel: null }]]),
    }).frames;
    for (let t = 0; t < 12; t += 1) {
      expect(armed[t]!.edgeOccupied).toStrictEqual(bare[t]!.edgeOccupied);
      expect(armed[t]!.served).toStrictEqual(bare[t]!.served);
    }
    expect(armed[11]!.digest).not.toBe(bare[11]!.digest);
  });

  it("zero-RNG honesty: a silent board (0 arrivals) ships IDENTICAL streams cut or unarmed", () => {
    const bare = chain({ ratePerMin: 0, ticks: 8 }).frames;
    const cut = chain({ ratePerMin: 0, ticks: 8, throttle: CUT1_EDGE }).frames;
    for (let t = 0; t < 8; t += 1) {
      expect(cut[t]!.served).toStrictEqual(bare[t]!.served);
      expect(cut[t]!.bounced).toStrictEqual(bare[t]!.bounced);
      expect(cut[t]!.edgeQueue).toStrictEqual(bare[t]!.edgeQueue);
    }
  });

  it("booked run is deterministic ×100 fresh driver closures (Set.size 1 — replay-gate substrate)", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const { frames } = chain({
        ticks: 12,
        sizeCost: 2,
        doorArm: { tick: 2, cut: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 206 },
        isolate: isolateBook(
          new Map([[IDS.origin, Object.freeze({ shippedAtTick: 0n, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null })]]),
        ),
      });
      digests.add(frames[11]!.digest);
    }
    expect(digests.size).toBe(1);
  });
});

/* ═══════════════════ the cut never breaks the queue discipline ═══════════════════ */

describe("the cut never breaks the queue discipline", () => {
  it("no queue ghosts under a live cut (FIX-8: membership survives; duplicates stay zero)", () => {
    const frames = chain({ ticks: 12, sizeCost: 2, throttle: CUT1_EDGE }).frames;
    for (const f of frames) {
      expect(new Set(f.edgeQueue).size).toBe(f.edgeQueue.length); // no duplicates within a frame
    }
    // the cut grows the queue (joins ride on), never truncates it:
    expect(frames[11]!.edgeQueue.length).toBeGreaterThan(0);
  });

  it("hard-ceiling discipline still sheds the residual queue of a CUT node (cut ≠ shed exemption)", () => {
    // the fat tenant can never be admitted under the cut; a hard-ceiling
    // node dumps its whole residual queue each tick — the cut must not
    // shield the backlog from the shed law. There is no "shed" terminal
    // (R-11 vocab is four); the shed rides "bounced" (the isolation suite's
    // established witness shape):
    const cutHard = chain({ ticks: 8, sizeCost: 2, ratePerMin: 6, hardCeiling: true, throttle: CUT1_EDGE }).frames;
    for (const f of cutHard) expect(f.edgeQueue.length).toBe(0); // shed every tick, cut or not
    expect(sumBounced(cutHard)).toBeGreaterThan(0);
    // the same cut on the hockey-stick twin PARKS the queue instead:
    const parked = chain({ ticks: 8, sizeCost: 2, throttle: CUT1_EDGE }).frames;
    expect(parked[7]!.edgeQueue.length).toBeGreaterThan(0);
  });

  it("the phantom-purge hygiene WRITE still runs on a cut node (only the fence silences it — code-position twin)", () => {
    // §(c)'s ceiling guard sits AFTER the phantom purge; a foreign queue
    // member with no roster unit is purged even while the cut stands:
    const config = testConfig({ runSeed: asRunSeed(31n), expressPath: Object.freeze([IDS.edge, IDS.origin]), deepPath: Object.freeze([IDS.edge, IDS.origin]) });
    const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), { purgeTargetedMinNodes: 0 });
    const edge = node(IDS.edge, { slots: 2, serviceUs: MIN });
    const ghost = asEntityId("ghost@1#0.0");
    const planted: GameState = Object.freeze({
      ...createInitialState({
        runSeed: config.runSeed,
        engineVersion: "throttle-ghost",
        contentHashes: { rulesetCardHashes: {}, sheetsHash: "t", ruleBookHash: "" },
        clocks: freshClocks(),
        nodes: Object.freeze([Object.freeze({ ...edge, queue: Object.freeze([ghost]) }), node(IDS.origin, { slots: 8, serviceUs: MIN })]),
      }),
      throttle: CUT1_EDGE,
    });
    const result = driver.advance(planted, tickInputs({
      envelopes: Object.freeze([envelope("throttle:probe", fromInt(0))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    }));
    expect(result.state.nodes.get(IDS.edge)?.queue.length ?? -1).toBe(0); // purged despite the cut
  });
});
