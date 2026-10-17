/**
 * THE STEP-9 FOLD — ADR-0015 mechanics 2/5: the Maintain attendance veto and
 * the Schedule job-window deadline, proven LIVE through the real chain
 * (slots-scale.test.ts is the shape template; corruption-shield.test.ts
 * supplied the shield-veto precedent the maintain gate mirrors).
 *
 * The two vetoes share ONE die and never touch it:
 *  - MAINTAIN gates BEFORE the abandonment-die site in createPatienceCheckStep
 *    (defaults.ts, after the corrupts branch): a queued unit whose queue-head
 *    node (routeHops[0]) is manned by a LIVE band skips the die for EVERY
 *    bounce mode. Binary patience (the §1.3 trunk-group-voip card, first
 *    corpus use) makes the witness crisp: p = 1 whenever a predicted wait
 *    exists — the CERTAIN path, no dice — so the baseline ledger is fully
 *    deterministic and the armed run's flip to zero bounces is a pure
 *    attendance effect, not a lucky roll.
 *  - SCHEDULE replaces the patience BUDGET inside a live band for mode
 *    "window" only: budget = the sim-time distance to the trailing edge
 *    (`jobBandDistanceUs`: remaining business-µs × accumulated sim:business
 *    ratio, 7/720 at 1× — kernel/time.ts Dual-Clock laws). Window mode
 *    answers p ∈ {0,1}; BOTH skip the "bounce" draw (defaults.ts zero-RNG
 *    law), so the band is threshold math end to end — pinned by the ×5-seed
 *    identical-ledger leg.
 *
 * v0 precedence, disclosed and pinned: attendance OUTRANKS the calendar —
 * the maintain skip happens before the schedule budget is computed, so a
 * manned board holds jobs past a missed 06:00 edge (the crew is on the
 * phone; the retry story lives host-side).
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  JobWindow,
  JobWindowBook,
  ClockState,
  MaintainBook,
  MaintainWindow,
  ScheduleArgs,
  MaintainArgs,
} from "../../types";
import { PlayerVerb } from "../../types";
import { asRunSeed } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import {
  jobBandDistanceUs,
  jobWindowInForce,
  maintainInForce,
} from "../defaults";
import { createJobWindowBook, createMaintainBook, createShieldBook } from "../intent-door";
import { DEFAULT_CLASSES, IDS, NO_RETRY, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

/* ═══════════════════════════ book fixtures ═══════════════════════════ */

function maintainBookOf(entries: ReadonlyMap<EntityId, MaintainWindow>, version = 1): MaintainBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

function jobBookOf(entries: ReadonlyMap<EntityId, JobWindow>, version = 1): JobWindowBook {
  return Object.freeze({ version, entries: Object.freeze(new Map(entries)) });
}

const MAINTAIN_TABLE = "maintain:probe";
const WINDOW_TABLE = "window:probe";

/* ═══════════════ as-of / expiry unit pins (the two InForce laws) ═══════════════ */

describe("maintainInForce — as-of + EXPIRY (the band law the pre-arm books never had)", () => {
  const live = maintainBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: 100, closeAtBusinessMinute: 200, shippedAtTick: 0n })]]));

  it("undefined book ⇒ null for every node; empty book likewise", () => {
    expect(maintainInForce(undefined, IDS.edge, 150)).toBeNull();
    expect(maintainInForce(createMaintainBook(), IDS.edge, 150)).toBeNull();
  });

  it("a DIFFERENT node's band never leaks; an absent entry is null", () => {
    expect(maintainInForce(live, IDS.origin, 150)).toBeNull();
  });

  it("open edge INCLUSIVE: 99 armed-not-yet, 100 live", () => {
    expect(maintainInForce(live, IDS.edge, 99)).toBeNull();
    expect(maintainInForce(live, IDS.edge, 100)?.closeAtBusinessMinute).toBe(200);
  });

  it("close edge EXCLUSIVE — hygiene expires: 199 manned, 200 the die re-admits, row KEPT (book still holds it)", () => {
    expect(maintainInForce(live, IDS.edge, 199)).not.toBeNull();
    expect(maintainInForce(live, IDS.edge, 200)).toBeNull();
    expect(live.entries.get(IDS.edge)).toBeDefined();
  });

  it("null open edge = in force from the executing minute (minute 0 already live)", () => {
    const nowBook = maintainBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 1, shippedAtTick: 0n })]]));
    expect(maintainInForce(nowBook, IDS.edge, 0)?.openAtBusinessMinute).toBeNull();
    expect(maintainInForce(nowBook, IDS.edge, 1)).toBeNull();
  });
});

describe("jobWindowInForce — the same band law over the deadline book", () => {
  const band = Object.freeze({ openAtBusinessMinute: 50, closeAtBusinessMinute: 500, shippedAtTick: 7n });
  const book = jobBookOf(new Map([[IDS.edge, band]]));

  it("undefined/empty book ⇒ null; future open ⇒ armed-not-law; live window ⇒ identity", () => {
    expect(jobWindowInForce(undefined, IDS.edge, 300)).toBeNull();
    expect(jobWindowInForce(createJobWindowBook(), IDS.edge, 300)).toBeNull();
    expect(jobWindowInForce(book, IDS.edge, 49)).toBeNull();
    expect(jobWindowInForce(book, IDS.edge, 50)).toBe(band);
    expect(jobWindowInForce(book, IDS.edge, 499)).toBe(band);
    expect(jobWindowInForce(book, IDS.edge, 500)).toBeNull(); // the edge passed: 06:00 means 06:00
  });
});

/* ═══════════════ the Dual-Clock conversion law (jobBandDistanceUs) ═══════════════ */

function clocksAt(businessUs: bigint, simUs: bigint): ClockState {
  return Object.freeze({ realUs: 0n, simUs, businessUs, wallUs: 0n });
}

describe("jobBandDistanceUs — business-minute edge → sim-µs budget (kernel/time.ts laws)", () => {
  const bizMin = (n: number) => BigInt(n) * MIN;

  it("tick-0 fallback is EXACT: the 1× law is 7/720 sim-µs per business-µs", () => {
    // 1 real µs = 60 sim µs = 43200/7 business µs ⇒ 60 × 7 / 43200 = 7/720.
    const band = Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 720, shippedAtTick: 0n });
    expect(jobBandDistanceUs(band, clocksAt(0n, 0n))).toBe(420_000_000n); // 720 biz-min = 7 sim-min, exact
  });

  it("constant 1×: the accumulated ratio lands the same 7/720 law at ANY elapsed real time", () => {
    // 7,000,000 real µs at 1×: business = floor(7e6 × 43200/7) = 43.2e9 µs (720 biz-min), sim = 420e6 µs.
    const band = Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 1440, shippedAtTick: 0n });
    expect(jobBandDistanceUs(band, clocksAt(43_200_000_000n, 420_000_000n))).toBe(420_000_000n);
  });

  it("speed history enters honestly: at 2× the edge is TWICE as far in sim-time", () => {
    const band = Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 1440, shippedAtTick: 0n });
    // same business clock, sim advanced at 2× ⇒ the player bought the job double sim-µs.
    expect(jobBandDistanceUs(band, clocksAt(43_200_000_000n, 840_000_000n))).toBe(840_000_000n);
  });

  it("headline scale: one business minute ≈ 583,333 sim-µs at 1× (sub-second bands are SUB-minute budgets)", () => {
    const band = Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 721, shippedAtTick: 0n });
    expect(jobBandDistanceUs(band, clocksAt(43_200_000_000n, 420_000_000n))).toBe(583_333n);
  });

  it("a passed edge answers ZERO budget — never inflating a dead band into infinite patience", () => {
    const dead = Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 719, shippedAtTick: 0n });
    expect(jobBandDistanceUs(dead, clocksAt(43_200_000_000n, 420_000_000n))).toBe(0n);
    const atEdge = Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 720, shippedAtTick: 0n });
    expect(jobBandDistanceUs(atEdge, clocksAt(43_200_000_000n, 420_000_000n))).toBe(0n);
  });
});

/* ═══════════════════════ the chain witness (slots-scale board) ═══════════════════════ */

type ChainFrame = {
  digest: string;
  servedUnitIds: EntityId[];
  bouncedUnitIds: EntityId[];
};

type DoorArm =
  | { readonly verb: "maintain"; readonly openAtBusinessMinute: number | null; readonly closeAtBusinessMinute: number }
  | { readonly verb: "schedule"; readonly openAtBusinessMinute: number | null; readonly closeAtBusinessMinute: number };

function chain(
  opts: {
    ticks?: number;
    ratePerMin?: number;
    seed?: bigint;
    patienceUs?: bigint;
    table?: string;
    mode?: "binary" | "window";
    maintain?: MaintainBook;
    schedule?: JobWindowBook;
    doorArm?: { tick: number } & DoorArm;
  } = {},
): { frames: ChainFrame[]; finalState: GameState } {
  const table = opts.table ?? "plain:probe";
  const config = testConfig({
    runSeed: asRunSeed(opts.seed ?? 31n),
    defaultPatienceUs: opts.patienceUs ?? 3n * MIN,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
    ...(opts.mode !== undefined ? { patienceModeByType: Object.freeze({ [table]: opts.mode }) } : {}),
  });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    purgeTargetedMinNodes: 0,
  });
  let state: GameState = Object.freeze({
    ...createInitialState({
      runSeed: config.runSeed,
      engineVersion: "maintain-schedule-test",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "ms", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: Object.freeze([
        node(IDS.edge, { slots: 1, serviceUs: MIN }), // congested: queues, waits, bounces
        node(IDS.origin, { slots: 8, serviceUs: MIN }),
      ]),
    }),
    ...(opts.maintain !== undefined ? { maintain: opts.maintain } : {}),
    ...(opts.schedule !== undefined ? { schedule: opts.schedule } : {}),
  });
  const frames: ChainFrame[] = [];
  for (let t = 0; t < (opts.ticks ?? 30); t += 1) {
    const partial: Omit<Partial<TickInputs>, "externalIntents"> &
      Pick<TickInputs, "envelopes"> & {
        externalIntents?: readonly ExternalIntent[];
      } = {
      envelopes: Object.freeze([envelope(table, fromInt(opts.ratePerMin ?? 6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    };
    if (opts.doorArm !== undefined && opts.doorArm.tick === t + 1) {
      const args: MaintainArgs | ScheduleArgs =
        opts.doorArm.verb === "maintain"
          ? {
              verb: PlayerVerb.MaintainNode,
              targetNodeId: IDS.edge,
              openAtBusinessMinute: opts.doorArm.openAtBusinessMinute,
              closeAtBusinessMinute: opts.doorArm.closeAtBusinessMinute,
            }
          : {
              verb: PlayerVerb.ScheduleWindow,
              targetNodeId: IDS.edge,
              openAtBusinessMinute: opts.doorArm.openAtBusinessMinute,
              closeAtBusinessMinute: opts.doorArm.closeAtBusinessMinute,
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
    const result = driver.advance(state, tickInputs(partial));
    state = result.state;
    frames.push({
      digest: digestState(state),
      servedUnitIds: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bouncedUnitIds: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
    });
  }
  return { frames, finalState: state };
}

const sumServed = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.servedUnitIds.length, 0);
const sumBounced = (frames: ChainFrame[]): number => frames.reduce((n, f) => n + f.bouncedUnitIds.length, 0);
const ledgers = (frames: ChainFrame[]): [EntityId[][], EntityId[][]] => [
  frames.map((f) => f.servedUnitIds),
  frames.map((f) => f.bouncedUnitIds),
];

/* ═══════════════════ MAINTAIN live witnesses (binary patience) ═══════════════════ */

describe("maintain-node LIVE — attendance absorbs the abandonment die (binary, first corpus use)", () => {
  it("binary baseline congests: the 1-slot edge BOUNCES (certain path — no dice involved)", () => {
    const { frames } = chain({ table: MAINTAIN_TABLE, mode: "binary" });
    expect(sumBounced(frames)).toBeGreaterThan(0);
  });

  it("door-fed maintain-node (band in force) SKIPS every die: bounced flips to ZERO", () => {
    const baseline = chain({ table: MAINTAIN_TABLE, mode: "binary" }).frames;
    const { frames, finalState } = chain({
      table: MAINTAIN_TABLE,
      mode: "binary",
      doorArm: { tick: 1, verb: "maintain", openAtBusinessMinute: null, closeAtBusinessMinute: 43_200 },
    });
    expect(finalState.maintain?.version).toBe(1);
    expect(finalState.maintain?.entries.get(IDS.edge)).toEqual({
      openAtBusinessMinute: null,
      closeAtBusinessMinute: 43_200,
      shippedAtTick: 1n,
    });
    expect(finalState.hands).toBeDefined(); // the attendance-class payment materialized
    expect(sumBounced(frames)).toBe(0); // the whole point of a manned switchboard
    expect(sumBounced(baseline)).toBeGreaterThan(0); // and the flip is real
  });

  it("the window EXPIRES (hygiene is periodic): close at biz-min 150 re-admits the die from tick 2 on, row KEPT", () => {
    // driver clock law: tick 1 lands ≈ biz-min 102, tick 2 ≈ 205 — a 150-edge
    // covers the first patience check only.
    const { frames, finalState } = chain({
      table: MAINTAIN_TABLE,
      mode: "binary",
      doorArm: { tick: 1, verb: "maintain", openAtBusinessMinute: null, closeAtBusinessMinute: 150 },
    });
    expect(frames[0]?.bouncedUnitIds.length).toBe(0); // tick 1: crew present, all hold
    expect(frames[1]?.bouncedUnitIds.length).toBeGreaterThan(0); // tick 2: crew walked off, die re-cast
    // expiry NEVER prunes: the history witness stays in the book —
    expect(finalState.maintain?.entries.get(IDS.edge)?.closeAtBusinessMinute).toBe(150);
  });

  it("host-planted in-force band equals the door-fed run's ledger (one law, two doors)", () => {
    const planted = chain({
      table: MAINTAIN_TABLE,
      mode: "binary",
      maintain: maintainBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 43_200, shippedAtTick: 0n })]])),
    }).frames;
    const doorFed = chain({
      table: MAINTAIN_TABLE,
      mode: "binary",
      doorArm: { tick: 1, verb: "maintain", openAtBusinessMinute: null, closeAtBusinessMinute: 43_200 },
    }).frames;
    expect(ledgers(planted)).toStrictEqual(ledgers(doorFed));
    expect(sumBounced(planted)).toBe(0);
  });

  it("zero-roll honesty: a silent board (0 arrivals) ships IDENTICAL ledgers with and without a manned band", () => {
    const bare = chain({ table: MAINTAIN_TABLE, mode: "binary", ratePerMin: 0, ticks: 8 }).frames;
    const manned = chain({
      table: MAINTAIN_TABLE,
      mode: "binary",
      ratePerMin: 0,
      ticks: 8,
      maintain: maintainBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 43_200, shippedAtTick: 0n })]])),
    }).frames;
    expect(ledgers(manned)).toStrictEqual(ledgers(bare));
    // the ONLY movement is embed, never dice:
    expect(manned[7]?.digest).not.toBe(bare[7]?.digest);
  });

  it("absent-book twins are digest-identical; booked run ×100 fresh closures → Set.size 1 (replay substrate)", () => {
    const a = chain({ table: MAINTAIN_TABLE, mode: "binary" }).frames.map((f) => f.digest);
    const b = chain({ table: MAINTAIN_TABLE, mode: "binary" }).frames.map((f) => f.digest);
    expect(a).toStrictEqual(b);
    const finals = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      const { frames } = chain({
        table: MAINTAIN_TABLE,
        mode: "binary",
        ticks: 12,
        maintain: maintainBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 43_200, shippedAtTick: 0n })]])),
      });
      finals.add(frames[11]?.digest ?? "lost");
    }
    expect(finals.size).toBe(1);
  });
});

/* ═══════════════════ SCHEDULE live witnesses (window patience) ═══════════════════ */

describe("schedule-window LIVE — the band IS the deadline (window-mode branch only, zero RNG)", () => {
  // All legs run with defaultPatienceUs 60 MIN: a job whose authored hour
  // would save it is KILLED by a moved-early band and SAVED by a far band —
  // the calendar outranks the authored budget exactly as the card says.
  const HOUR = 60n * MIN;

  it("window baseline (1h authored patience, no book): the diverging queue KILLS at the authored hour — patience is the only deadline", () => {
    // 6 arrivals/min onto a 1-slot edge grows the hockey-stick wait without
    // bound; every queued job eventually answers elapsed+predicted ≥ 1 hour.
    // This is the ledger the far band must flip — and does (next leg).
    const { frames } = chain({ table: WINDOW_TABLE, mode: "window", patienceUs: HOUR });
    expect(sumBounced(frames)).toBeGreaterThan(0);
  });

  it("door-fed FAR band (close = biz-min 43,200): the RESCUE — the calendar grants ~419 sim-min of runway the authored hour never had; digest moves", () => {
    const baseline = chain({ table: WINDOW_TABLE, mode: "window", patienceUs: HOUR }).frames;
    const { frames, finalState } = chain({
      table: WINDOW_TABLE,
      mode: "window",
      patienceUs: HOUR,
      doorArm: { tick: 1, verb: "schedule", openAtBusinessMinute: null, closeAtBusinessMinute: 43_200 },
    });
    expect(finalState.schedule?.entries.get(IDS.edge)).toEqual({
      openAtBusinessMinute: null,
      closeAtBusinessMinute: 43_200,
      shippedAtTick: 1n,
    });
    expect(sumBounced(frames)).toBe(0); // ~419 sim-min of runway — every job fits
    expect(frames[29]?.digest).not.toBe(baseline[29]?.digest);
  });

  it("THE MOVED WINDOW, MADE MECHANICAL: same board, band EARLY (close = biz-min 104) — the jobs FAIL at the edge (06:00 didn't happen)", () => {
    // at tick 1 (biz-min ≈102) the live band leaves ≈666k sim-µs — less than
    // one queued minute of predicted wait ⇒ every queued job answers p = 1.
    const far = chain({
      table: WINDOW_TABLE,
      mode: "window",
      patienceUs: HOUR,
      schedule: jobBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 43_200, shippedAtTick: 0n })]])),
    }).frames;
    const near = chain({
      table: WINDOW_TABLE,
      mode: "window",
      patienceUs: HOUR,
      schedule: jobBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 104, shippedAtTick: 0n })]])),
    }).frames;
    expect(sumBounced(far)).toBe(0);
    expect(sumBounced(near)).toBeGreaterThan(0);
    // the fail is EARLY — at the band's own edge, tick 1, not at authored patience:
    expect(near[0]?.bouncedUnitIds.length).toBeGreaterThan(0);
  });

  it("×5 seeds the flip holds EXACTLY (zero-RNG: the band never touches the stream — same ledgers every seed)", () => {
    for (const seed of [31n, 33n, 42n, 78n, 904n]) {
      const far = sumBounced(
        chain({
          table: WINDOW_TABLE,
          mode: "window",
          patienceUs: HOUR,
          seed,
          schedule: jobBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 43_200, shippedAtTick: 0n })]])),
        }).frames,
      );
      const near = sumBounced(
        chain({
          table: WINDOW_TABLE,
          mode: "window",
          patienceUs: HOUR,
          seed,
          schedule: jobBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 104, shippedAtTick: 0n })]])),
        }).frames,
      );
      expect(far, `seed ${String(seed)} far band`).toBe(0);
      expect(near, `seed ${String(seed)} moved-early band`).toBeGreaterThan(0);
    }
  });

  it("band WITHOUT window-mode units is INERT: sigmoid board + live near band ⇒ byte-identical ledgers, digest moved", () => {
    const baseline = chain().frames; // default mode, no books
    const banded = chain({
      schedule: jobBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 104, shippedAtTick: 0n })]])),
    }).frames;
    expect(ledgers(banded)).toStrictEqual(ledgers(baseline));
    expect(banded[29]?.digest).not.toBe(baseline[29]?.digest);
  });

  it("window units WITHOUT a band are EXACT current behavior: empty book ⇒ identical ledgers, digest differs by embed only", () => {
    // authored patience SHORT (3 MIN) so the die path is LIVE — bounces
    // happen from patience, not from any band:
    const bare = chain({ table: WINDOW_TABLE, mode: "window", patienceUs: 3n * MIN });
    const withEmptyBook = chain({
      table: WINDOW_TABLE,
      mode: "window",
      patienceUs: 3n * MIN,
      schedule: createJobWindowBook(),
    });
    expect(sumBounced(bare.frames)).toBeGreaterThan(0); // the authored budget is doing the killing
    expect(ledgers(withEmptyBook.frames)).toStrictEqual(ledgers(bare.frames)); // the empty band changes NOTHING
    expect(withEmptyBook.frames[29]?.digest).not.toBe(bare.frames[29]?.digest); // book rides embed only
  });

  it("zero-roll honesty (silent board): band presence ships identical ledgers with and without arrivals", () => {
    const bare = chain({ table: WINDOW_TABLE, mode: "window", patienceUs: HOUR, ratePerMin: 0, ticks: 8 }).frames;
    const banded = chain({
      table: WINDOW_TABLE,
      mode: "window",
      patienceUs: HOUR,
      ratePerMin: 0,
      ticks: 8,
      schedule: jobBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 104, shippedAtTick: 0n })]])),
    }).frames;
    expect(ledgers(banded)).toStrictEqual(ledgers(bare));
  });
});

/* ═══════════════════ coexistence (the three books, one honest test set) ═══════════════════ */

describe("shield + maintain + schedule coexist — independent books, ONE die, disclosed precedence", () => {
  const HOUR_BOOK = 60n * MIN;
  const seed = createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "coexist",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "c", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: Object.freeze([node(IDS.edge, { slots: 2, serviceUs: MIN }), node(IDS.origin, { slots: 1, serviceUs: MIN })]),
  });
  const bandRow = Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 480, shippedAtTick: 0n });
  const shieldBook = createShieldBook();
  const maintainBook = maintainBookOf(new Map([[IDS.edge, bandRow]]));
  const scheduleBook = jobBookOf(new Map([[IDS.edge, bandRow]]));
  const withShield = Object.freeze({ ...seed, shield: shieldBook });
  const withMaintain = Object.freeze({ ...seed, maintain: maintainBook });
  const withSchedule = Object.freeze({ ...seed, schedule: scheduleBook });
  const withMaintainAndSchedule = Object.freeze({ ...seed, maintain: maintainBook, schedule: scheduleBook });
  const withAll = Object.freeze({ ...seed, shield: shieldBook, maintain: maintainBook, schedule: scheduleBook });

  it("each book moves the digest ON ITS OWN; every subset is a distinct state (six-way twin set)", () => {
    const digests = [
      digestState(seed),
      digestState(withShield),
      digestState(withMaintain),
      digestState(withSchedule),
      digestState(withMaintainAndSchedule),
      digestState(withAll),
    ];
    expect(new Set(digests).size).toBe(digests.length);
  });

  it("ATTENDANCE OUTRANKS THE CALENDAR (v0 precedence, disclosed): manned board holds the job the near band would kill", () => {
    const nearBand = () => jobBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 104, shippedAtTick: 0n })]]));
    const crew = () => maintainBookOf(new Map([[IDS.edge, Object.freeze({ openAtBusinessMinute: null, closeAtBusinessMinute: 43_200, shippedAtTick: 0n })]]));
    const killed = chain({ table: WINDOW_TABLE, mode: "window", patienceUs: HOUR_BOOK, schedule: nearBand() }).frames;
    const manned = chain({ table: WINDOW_TABLE, mode: "window", patienceUs: HOUR_BOOK, maintain: crew(), schedule: nearBand() }).frames;
    expect(sumBounced(killed)).toBeGreaterThan(0); // the calendar kills
    expect(sumBounced(manned)).toBe(0); // the crew holds — the skip happens BEFORE the budget read
  });
});
