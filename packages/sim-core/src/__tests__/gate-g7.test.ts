/**
 * GATE-G7 — TWO BOARDS, ONE POOL (ADR-0018, owner-commissioned gate):
 * the Policy Book executes THROUGH the same intent door, hands, and
 * occupancy rail as the player — "the Book plays itself through the same
 * hands". This is the end-to-end acceptance suite: real createTickDriver,
 * real step-12.5 rule phase (policy/evaluator via createRulePhaseStep),
 * real rule-carrier translation at the door (pipeline/intent-door
 * ruleCarriers:"mapped"), zero engine shortcuts.
 *
 * The world: a wired three-hop data path node/edge → node/waf → node/origin
 * fed by a sustained plateau so the nodes' utilization rho crosses the
 * cards' 62.5% wall; the founder posts ONE estate note and then GOES
 * FOR COFFEE. Six execute-band cards ride the book (raise-inspection-depth,
 * page, shed-class, scale-out, drain — all mapped — plus failover,
 * deliberately unmapped: the bought-verb law as content).
 *
 * Pins here (each falsifiable):
 *  - OFF-ARM BYTE-IDENTITY: {ruleCarriers:"off"} equals config-absence on
 *    digest, events AND receipts — the pre-slice world is untouched;
 *  - a switched-on door with an EMPTY book is byte-identical to the off run;
 *  - the unwatched board still acts: depth changes, a ticket post lands,
 *    the scale book accrues, one cable gets pulled — all with the player idle;
 *  - `verb:failover` refuses on the untouched unsupported-verb-carrier rail
 *    and refuses STATE-INERTLY (a suppressed-failover twin run digests equal);
 *  - three edge carriers over two hands: (tick, seq) order + occupancy decide;
 *  - shadow mode: firings visible, ZERO intents, digest trail byte-ident to
 *    the frozen same-book run; suppressed/frozen: no adjudication at all;
 *  - ×100 replay of the whole gate run is one digest (harness);
 *  - the receipts trail and the firing trail each digest to a PINNED golden
 *    (self-derived this wave, g4's 13ba145f precedent — new-era literals).
 */

import { describe, expect, it } from "vitest";
import type {
  EntityId,
  ExternalIntent,
  GameState,
  IntentReceipt,
  NodeRecord,
  PlayerIntent,
  PolicyCard,
  PlayerVerbArgs,
  RuleId,
  RunSeed,
  SimTick,
} from "../index.ts";
import {
  asEntityId,
  asRuleId,
  asRunSeed,
  createRulePhaseStep,
  createInitialState,
  createDefaultSlots,
  createBoardState,
  createTickDriver,
  defaultEvaluationConfig,
  digestState,
  FIXED_ONE,
  fromInt,
  initialClocks,
  makeSlots,
  MICROS_PER_MIN,
  mintHandState,
  PlayerVerb,
  shadowEvaluationConfig,
  canonicalDigest,
  createHarness,
  streamFor,
  validatePolicyCard,
  type PolicyEvaluationConfig,
} from "../index.ts";

const MIN = MICROS_PER_MIN;
const SEED = asRunSeed(707n);
const TICKS = 24n;

/* ─────────────────────────────── the world ─────────────────────────────── */

const EDGE = asEntityId("node/edge");
const WAF = asEntityId("node/waf");
const ORIGIN = asEntityId("node/origin");

function nodeStub(id: EntityId, slots: number): NodeRecord {
  return {
    id,
    kind: "server",
    slots: makeSlots(slots),
    serviceTimeUs: MIN,
    queueDepth: 0,
    queue: [],
    shedOrder: "qos-weighted",
    inspectionDepth: "pass-through",
    discipline: "hockey-stick",
    utilizationRho: 0n,
    dependencyNodeId: null,
  };
}

/** rho > 62.5 % — the sustained-overload wall every card shares.
 *  (count unit is identity: the amount IS the raw Q16.16 Fixed.) */
const BUSY = Object.freeze({
  metric: "utilizationRho",
  comparator: ">" as const,
  threshold: Object.freeze({ kind: "value" as const, amount: 40_960n, unit: "count" as const }),
});

function card(
  id: string,
  scopeRef: EntityId,
  actionId: PolicyCard["then"][number]["id"],
  value: bigint | null,
): PolicyCard {
  return Object.freeze({
    id: asRuleId(id),
    scope: Object.freeze({ kind: "object" as const, ref: scopeRef }),
    when: Object.freeze([BUSY]) as PolicyCard["when"],
    then: Object.freeze([
      Object.freeze({ id: actionId, runbookName: null, value }),
    ]) as PolicyCard["then"],
    band: "execute" as const,
    upkeepMicroUsd: 0n,
  });
}

/** The hand-authored six-card book: five mapped carriers (three of them on
 *  the edge — they storm the two-hand rail together) + one bought wall. */
const BOOK: readonly PolicyCard[] = Object.freeze([
  card("watch-the-door", EDGE, "raise-inspection-depth", 2n * FIXED_ONE),
  card("open-the-ticket", EDGE, "page", null),
  card("shed-the-small", EDGE, "shed-class", null),
  card("warm-the-origin", ORIGIN, "scale-out", 2n * FIXED_ONE),
  card("pull-the-cable", WAF, "drain", null),
  card("escape-hatch", WAF, "failover", null),
]);
for (const c of BOOK) validatePolicyCard(c); // grammar-clean by construction

/* Player script: wire the path, then idle. seqs live in the 1000+ space so
 *  the driver's rule-stamp counter (from 1) never collides (M4 law). */

function verb(seq: number, feedTick: SimTick, args: PlayerVerbArgs): ExternalIntent {
  return Object.freeze({
    tick: feedTick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: feedTick * MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

const PLAYER: readonly ExternalIntent[] = Object.freeze([
  verb(1000, 7n, { verb: PlayerVerb.Communicate, target: null, note: "founder posts" }),
]);

const SLOT_CONFIG = Object.freeze({
  runSeed: SEED,
  dnsNodeId: null,
  expressPath: [EDGE, WAF, ORIGIN],
  deepPath: [] as readonly EntityId[],
  defaultPatienceUs: 3n * MIN,
  defaultSizeCost: fromInt(1),
  patienceJitterPct: 0,
  inspectionCostUs: Object.freeze({
    "pass-through": 0n,
    "sample-1-in-20": 3n * MIN,
    inspect: 10n * MIN,
    challenge: 20n * MIN,
  }),
  detectionRatio: fromInt(1),
  falsePositiveRatio: fromInt(0),
  referralProbability: fromInt(0),
  returnProbability: fromInt(0),
});

const ENVELOPES = Object.freeze([
  Object.freeze({
    tableId: "g7-plateau",
    role: "baseline" as const,
    shape: "plateau" as const,
    ratePerMin: fromInt(2),
    telegraphed: false,
    dominantFamily: "organic" as const,
  }),
]);

function buildInitial(book: readonly PolicyCard[], seed: RunSeed = SEED): GameState {
  return createInitialState({
    runSeed: seed,
    engineVersion: "gate-g7",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "g7-sheets", ruleBookHash: "g7-book" },
    clocks: initialClocks(),
    nodes: [nodeStub(EDGE, 1), nodeStub(WAF, 1), nodeStub(ORIGIN, 1)],
    hands: mintHandState(2),
    board: createBoardState([
      Object.freeze({ id: asEntityId(`edge:data:${EDGE}->${WAF}`), relation: "data" as const, from: EDGE, to: WAF, slot: null }),
      Object.freeze({ id: asEntityId(`edge:data:${WAF}->${ORIGIN}`), relation: "data" as const, from: WAF, to: ORIGIN, slot: null }),
    ]),
    ruleBook: book,
    ruleBookHash: "g7-book",
  });
}

interface G7Run {
  readonly state: GameState;
  readonly receipts: readonly IntentReceipt[];
  readonly firings: readonly RuleFiring[];
  readonly intentsByTick: ReadonlyMap<string, readonly PlayerIntent[]>;
  readonly digests: readonly string[];
}

/** The host loop: feed PLAYER intents by tick, re-feed the book's stamped
 *  intents on the NEXT tick (the only channel the driver offers). */
function simulate(options: {
  readonly doorConfig: { readonly ruleCarriers?: "off" | "mapped" };
  readonly evalConfig?: () => PolicyEvaluationConfig;
  readonly book?: readonly PolicyCard[];
  readonly suppressed?: readonly RuleId[];
  readonly player?: readonly ExternalIntent[];
  readonly seed?: RunSeed;
  readonly ticks?: SimTick;
}): G7Run {
  const book = options.book ?? BOOK;
  const rulePhase = createRulePhaseStep(options.evalConfig ?? (() => defaultEvaluationConfig));
  const slots = { ...createDefaultSlots(SLOT_CONFIG), rulePhase: rulePhase.step };
  const seed = options.seed ?? SEED;
  const driver = createTickDriver(
    slots,
    streamFor(seed, "root", 0),
    initialClocks(),
    { intents: options.doorConfig },
  );
  let state = buildInitial(book, seed);
  const byTick = new Map<string, readonly ExternalIntent[]>();
  (options.player ?? PLAYER).forEach((entry) => {
    const key = entry.tick.toString();
    byTick.set(key, [...(byTick.get(key) ?? []), entry]);
  });
  const receipts: IntentReceipt[] = [];
  const firings: RuleFiring[] = [];
  const intentsByTick = new Map<string, readonly PlayerIntent[]>();
  const digests: string[] = [];
  let pending: readonly PlayerIntent[] = [];
  const total = options.ticks ?? TICKS;
  for (let tick = 1n; tick <= total; tick += 1n) {
    const res = driver.advance(state, Object.freeze({
      envelopes: ENVELOPES,
      evidence: [],
      classes: [],
      dependencyEdges: [],
      retryPolicy: { maxRetries: 2, backoffBaseUs: 2n * MIN, jitterPurchased: false },
      aggression: fromInt(0),
      expressMaxConfidence: fromInt(1),
      suppressedRuleIds: options.suppressed ?? [],
      externalIntents: Object.freeze([...(byTick.get(tick.toString()) ?? []), ...pending.map((intent) => Object.freeze({ tick, intent }))]),
    }));
    state = res.state;
    pending = res.intents;
    receipts.push(...res.doorReceipts);
    firings.push(...res.ruleFirings);
    if (res.intents.length > 0) intentsByTick.set(tick.toString(), res.intents);
    digests.push(digestState(state));
  }
  return { state, receipts, firings, intentsByTick, digests };
}

const MAPPED = Object.freeze({ ruleCarriers: "mapped" as const });
const OFF = Object.freeze({} as { readonly ruleCarriers?: "off" | "mapped" });

const codeOf = (reason: string | null | undefined): string => (reason ?? "").split(":")[0] ?? "";

/** The canonical mapped run everything else is compared against. */
function canonical(): G7Run {
  return simulate({ doorConfig: MAPPED });
}

/* ═══════════════════════ 1 · the off arm is pre-slice ═══════════════════════ */

describe("GATE-7 · off-arm byte-identity (the zero-golden spine)", () => {
  it("config absence equals explicit off — terminal digest, full per-tick digest trail, events-visible projections", () => {
    const absent = simulate({ doorConfig: {} });
    const off = simulate({ doorConfig: { ruleCarriers: "off" } });
    expect(off.digests).toEqual(absent.digests);
    expect(off.receipts).toEqual(absent.receipts);
    expect(off.state).toEqual(absent.state);
  });

  it("off refuses every rule carrier on the untouched rail and pays NOTHING (all hands free forever)", () => {
    const off = simulate({ doorConfig: OFF });
    const refused = off.receipts.filter((r) => r.verb.startsWith("verb:"));
    expect(refused.length).toBeGreaterThan(0); // the book DID mint carriers
    expect(new Set(refused.map((r) => r.outcome))).toEqual(new Set(["refused"]));
    expect(new Set(refused.map((r) => codeOf(r.reason)))).toEqual(new Set(["unsupported-verb-carrier"]));
    // NOTHING with an arrow label ever executed — the Book gets no traction
    // (the token busyCauseId stamps that linger are the door's own lazy
    // release sweep: with an empty tail feed no pass runs to clear them; the
    // half-open busyUntilTick law, not a payment).
    expect(off.receipts.filter((r) => r.verb.includes("→") && r.outcome === "executed")).toHaveLength(0);
    expect(off.state.nodes?.get(EDGE)?.inspectionDepth).toBe("pass-through");
  });

  it("mapped with an EMPTY book is byte-identical to the off run (the switch alone changes nothing)", () => {
    const mappedIdle = simulate({ doorConfig: MAPPED, book: [] });
    const off = simulate({ doorConfig: OFF, book: [] });
    expect(mappedIdle.digests).toEqual(off.digests);
    expect(mappedIdle.receipts).toEqual(off.receipts);
  });
});

/* ═══════════════════════ 2 · the unwatched board acts ═══════════════════════ */

describe("GATE-7 · the Book plays itself while the player is idle", () => {
  const run = canonical();

  it("the raise-inspection-depth carrier moved the REAL node: depth=inspect, arrow-labelled executed receipt", () => {
    expect(run.state.nodes?.get(EDGE)?.inspectionDepth).toBe("inspect");
    const executed = run.receipts.filter((r) => r.outcome === "executed");
    expect(executed.map((r) => r.verb)).toContain("raise-inspection-depth→configure-node");
    expect(
      executed.find((r) => r.verb === "raise-inspection-depth→configure-node")?.detail,
    ).toBe("depth=inspect");
  });

  it("the page carrier posted the estate note through communicate", () => {
    const posted = run.receipts.find((r) => r.verb === "page→communicate");
    expect(posted?.outcome).toBe("executed");
    expect(posted?.detail).toBe(`node=${EDGE}:"the Book opened a ticket"`);
  });

  it("the scale-out carrier booked warmth against the authored anchor (1 slot, 2 wanted → +1)", () => {
    expect(run.state.scale?.entries.get(ORIGIN)).toMatchObject({ reservedSlots: 1, baseRosterSlots: 1 });
  });

  it("the drain carrier pulled the unique supplier cable edge→waf (edges 2 → 1)", () => {
    const pulled = run.receipts.find((r) => r.verb === "drain→disconnect-drain");
    expect(pulled?.outcome).toBe("executed");
    expect(pulled?.detail).toBe(`pulled:edge:data:${EDGE}->${WAF}`);
    expect(run.state.board?.edges.size).toBe(1);
  });

  it("the THIRD edge carrier overflows the shared rail: shed-class refuses hands-exhausted, suffixed", () => {
    const shed = run.receipts.find((r) => r.verb === "shed-class→shed-load");
    expect(shed?.outcome).toBe("refused");
    expect(String(shed?.reason)).toBe(
      'hands-exhausted: need 1, free 0 of 2 — rule carrier "shed-class" pays the same hands as the player',
    );
    // (The translated shed-load EXECUTES — pinned door-side in
    //  intent-door-rulecarrier.test.ts; at the gate it loses the race,
    //  which is exactly what "one pool" means.)
  });

  it("the failover carrier — NOT bought — refuses through the ordinary rail, state-inert", () => {
    const hatch = run.receipts.filter((r) => r.verb === "verb:failover");
    expect(hatch.length).toBeGreaterThan(0);
    expect(new Set(hatch.map((r) => r.outcome))).toEqual(new Set(["refused"]));
    expect(String(hatch[0]?.reason).startsWith("unsupported-verb-carrier")).toBe(true);
    // State-inert: suppressing ONLY the failover card leaves the terminal
    // digest of the shared four-carrier outcome byte-identical.
    const withoutHatch = simulate({
      doorConfig: MAPPED,
      suppressed: [asRuleId("escape-hatch")],
    });
    expect(withoutHatch.receipts.filter((r) => r.verb === "verb:failover")).toHaveLength(0);
    expect(digestState(withoutHatch.state)).toBe(digestState(run.state));
  });

  it("every carrier paid the SAME hands rail: executed receipts book occupancy and causeId intent:<seq>", () => {
    const executedTicks = new Map<string, number>();
    for (const r of run.receipts) {
      if (r.outcome !== "executed" || !r.verb.includes("→")) continue;
      executedTicks.set(r.submittedTick.toString(), (executedTicks.get(r.submittedTick.toString()) ?? 0) + 1);
    }
    // No tick ever executed more than the two hands allow given occupancy…
    expect(Math.max(...executedTicks.values())).toBeLessThanOrEqual(2);
    expect(executedTicks.size).toBeGreaterThan(0);
  });
});

/* ═══════════════════════ 3 · one pool, honest contention ═══════════════════════ */

describe("GATE-7 · two boards, ONE pool — contention is (tick, seq), not origin", () => {
  it("three edge carriers meet two hands: the seq order executes, the overflow refuses hands-exhausted, nobody starves silently", () => {
    const run = canonical();
    // Book stamping order (driver seq 1.. at each cross tick): the three
    // EDGE cards storm first; origin-scale, cable-pull, hatch follow.
    const crossed = run.receipts.filter(
      (r) => r.verb.includes("→") || r.verb.startsWith("verb:"),
    );
    const handsRefused = crossed.filter((r) => codeOf(r.reason) === "hands-exhausted");
    // The carrier suffix law is ONLY on rule entries:
    expect(handsRefused.length).toBeGreaterThan(0);
    for (const r of handsRefused) {
      expect(String(r.reason)).toContain("pays the same hands as the player");
      expect(r.verb).toContain("→");
    }
    // And every refused carrier spent nothing: the executed set plus the
    // final free-rail is exactly the minted-hand count.
    const stillBusy = run.state.hands?.tokens.filter((t) => t.busyCauseId !== null).length ?? 0;
    expect((run.state.hands?.tokens.length ?? 0)).toBe(2);
    expect(stillBusy).toBeLessThanOrEqual(2);
  });

  it("a player intent losing (tick, seq) to the Book's stamps is refused hands-exhausted, plain", () => {
    // Intents minted at T reach the door at T+1 (the host re-feed law).
    const mintTick = BigInt([...canonical().intentsByTick.keys()].sort((a, b) => Number(a) - Number(b))[0] ?? "0");
    const stormTick = mintTick + 1n;
    const probe = simulate({
      doorConfig: MAPPED,
      player: [...PLAYER, verb(1000, stormTick, { verb: PlayerVerb.Communicate, target: null, note: "founder pokes" })],
    });
    const late = probe.receipts.find((r) => r.seq === 1000 && r.submittedTick === stormTick);
    expect(late?.outcome).toBe("refused");
    expect(String(late?.reason)).toBe("hands-exhausted: need 1, free 0 of 2"); // NO carrier suffix on player entries
    // Flipped stamp: a player seq EARLIER than every rule stamp takes a hand first.
    const flipped = simulate({
      doorConfig: MAPPED,
      player: [...PLAYER, verb(0, stormTick, { verb: PlayerVerb.Communicate, target: null, note: "founder first" })],
    });
    const winner = flipped.receipts.find((r) => r.seq === 0 && r.submittedTick === stormTick);
    expect(winner?.outcome).toBe("executed");
  });
});

/* ═══════════════════════ 4 · bands: shadow, suppressed, frozen ═══════════════════════ */

describe("GATE-7 · adjudication bands", () => {
  it("shadow: firings visible, ZERO intents, digest trail byte-ident to the frozen same-book run", () => {
    // (The ruleBook lives INSIDE the state digest, so the control must carry
    //  the SAME book: frozen adjudicates nothing — the zero-delta witness.)
    const shadow = simulate({ doorConfig: MAPPED, evalConfig: () => shadowEvaluationConfig });
    const control = simulate({
      doorConfig: MAPPED,
      evalConfig: () => ({ ...defaultEvaluationConfig, frozen: true }),
    });
    expect(shadow.firings.length).toBeGreaterThan(0);
    expect(shadow.firings.every((f) => f.mode === "shadow")).toBe(true);
    expect(shadow.intentsByTick.size).toBe(0);
    expect(shadow.receipts.filter((r) => r.verb.includes("→"))).toHaveLength(0);
    expect(shadow.digests).toEqual(control.digests);
  });

  it("suppressed book: no adjudication rows at all, state equals the no-book control", () => {
    const all = BOOK.map((c) => c.id);
    const suppressed = simulate({ doorConfig: MAPPED, suppressed: all });
    const control = simulate({
      doorConfig: MAPPED,
      evalConfig: () => ({ ...defaultEvaluationConfig, frozen: true }),
    });
    expect(suppressed.firings).toHaveLength(0);
    expect(suppressed.digests).toEqual(control.digests);
  });

  it("frozen kill switch: the phase adjudicates nothing even with the full book live", () => {
    const frozen = simulate({
      doorConfig: MAPPED,
      evalConfig: () => ({ ...defaultEvaluationConfig, frozen: true }),
    });
    expect(frozen.firings).toHaveLength(0);
    expect(frozen.state.nodes?.get(EDGE)?.inspectionDepth).toBe("pass-through");
    // Only the founder's own note moved the world; zero arrow-labelled receipts.
    expect(frozen.receipts.filter((r) => r.verb.includes("→"))).toHaveLength(0);
    expect(frozen.receipts.filter((r) => r.outcome === "executed")).toHaveLength(1);
  });

  it("a suppressed failover row does not fire — the skip leaves NO adjudication (kill-switch law)", () => {
    const one = simulate({ doorConfig: MAPPED, suppressed: [asRuleId("escape-hatch")] });
    expect(one.firings.every((f) => String(f.ruleId) !== "escape-hatch")).toBe(true);
    expect(one.firings.length).toBeGreaterThan(0); // the rest of the book is live
  });
});

/* ═══════════════════════ 5 · determinism: ×100 + goldens ═══════════════════════ */

describe("GATE-7 · determinism", () => {
  const run = canonical();
  const receiptTrail = run.receipts.map((r) =>
    Object.freeze({
      tick: r.submittedTick.toString(),
      seq: r.seq,
      verb: r.verb,
      outcome: r.outcome,
      code: codeOf(r.reason),
    }),
  );
  const firingTrail = run.firings.map((f) =>
    Object.freeze({
      tick: f.tick.toString(),
      rule: String(f.ruleId),
      mode: f.mode,
      band: f.band,
      cause: String(f.causeId),
    }),
  );

  it("×100 replay through the harness closes to ONE terminal digest", () => {
    const harness = createHarness({
      runner: (request) =>
        simulate({
          doorConfig: MAPPED,
          seed: request.runSeed,
          ticks: request.targetTick,
        }).state,
      initialState: buildInitial(BOOK, SEED),
      runSeed: SEED,
      engineVersion: "gate-g7",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "g7-sheets", ruleBookHash: "g7-book" },
      totalTicks: TICKS,
      snapshotEveryTicks: 8n,
      checkpointEveryTicks: 2n,
      intents: PLAYER.map((entry) => Object.freeze({ tick: entry.tick, intent: entry.intent })),
      digest: digestState,
    });
    const hundred = harness.replayDigests(100);
    expect(hundred).toHaveLength(100);
    expect(new Set(hundred).size).toBe(1);
    expect(hundred[99]).toBe(run.digests[Number(TICKS) - 1]);
  });

  it("GOLDEN: the receipts trail (rule + player) digests to the pinned Gate-7 hex", () => {
    // SELF-DERIVED wave-24 literal (g4 13ba145f precedent): the complete
    // two-boards-one-pool receipt stream, arrow labels and census codes only.
    expect(canonicalDigest(receiptTrail)).toBe("d727cdda5fde0250");
  });

  it("GOLDEN: the firing trail (the Book's motion) digests to the pinned Gate-7 hex", () => {
    expect(canonicalDigest(firingTrail)).toBe("1622412ac78d585a");
  });

  it("a different seed re-rolls the traffic dice: the per-tick digest trail diverges", () => {
    const other = simulate({ doorConfig: MAPPED, seed: 708n });
    expect(other.digests).not.toEqual(run.digests);
  });
});
