/**
 * Golden battery builders for `digestState` — the byte-identity pin set used
 * by the limbs fast-path port (perf audit rec #1). EVERY case here is
 * deterministic by construction: fixed seeds, sorted insertion, hand-written
 * literals only (never wall time, never locale, never unsorted iteration).
 *
 * The companion `digest-golden.json` holds the hexes captured from the
 * PRE-PORT bigint sink; `digest-golden.test.ts` rebuilds these states and
 * re-digests them. The law: if a stored hex mismatches, the PORT is wrong —
 * never regenerate the fixture to accommodate a change.
 */

import type {
  BoardState,
  Contract,
  GameState,
  HandState,
  LaneStats,
  NodeRecord,
  NodeSlotRecord,
  ObservedCell,
  ObservedKey,
  PolicyCard,
  QosClassDef,
  RunSeed,
  Unit,
  WaveEnvelope,
} from "../../types";
import {
  asCauseId,
  asEntityId,
  asMetricId,
  asMoney,
  asRuleId,
  asRunSeed,
  observedKey,
  PlayerVerb,
  ResolutionBand,
  type ExternalIntent,
  type PlayerVerbArgs,
  type SimTick,
} from "../../types";
import { FIXED_ONE, FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots, type DefaultPipelineConfig } from "../defaults";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createBoardState, mintHandState, type IntentDoorConfig } from "../intent-door";
import { makeSlots } from "../queue";
import { envelope, node, retryPolicy, testConfig, IDS } from "./helpers";

const MIN = MICROS_PER_MIN;

/** One battery case: a name plus the chain of states to digest (a case holds
 *  more than one state when ordering twins/presence twins matter). */
export interface GoldenCase {
  readonly name: string;
  readonly states: readonly GameState[];
}

/* ─────────────────────────────── 1 · empty ─────────────────────────────── */

function baseState(seed: RunSeed, engineVersion: string): GameState {
  return createInitialState({
    runSeed: seed,
    engineVersion,
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [],
  });
}

function emptyCase(): GoldenCase {
  return { name: "empty", states: [baseState(asRunSeed(1n), "hh-empty-v0")] };
}

/* ─────────────────────── 2 · lanes + policy rule book ──────────────────── */

function lanesCardsCase(): GoldenCase {
  const lanes: LaneStats[] = [
    {
      laneId: asEntityId("lane/ingress-1"),
      ratePerMin: fromRatio(1234n, 100n),
      latencyDistributionRef: "hist:p99-astral-✿",
      classMix: Object.freeze({ gold: fromRatio(7n, 10n), bronze: fromRatio(3n, 10n) }),
      health: fromRatio(995n, 1000n),
    },
    {
      laneId: asEntityId("lane/zero"),
      ratePerMin: FIXED_ZERO,
      latencyDistributionRef: "",
      classMix: Object.freeze({}),
      health: FIXED_ONE,
    },
  ];
  const cards: PolicyCard[] = [
    {
      id: asRuleId("rule:scale-web"),
      scope: { kind: "class", ref: "web" },
      when: [
        { metric: asMetricId("rho"), comparator: ">", threshold: { kind: "value", amount: fromRatio(85n, 100n), unit: "percent" } },
        { metric: asMetricId("p99"), comparator: "changed", threshold: { kind: "class-ref", classId: "gold" } },
        { metric: asMetricId("dep.fails"), comparator: "fails", threshold: { kind: "event-name", name: "origin.unreachable" } },
      ],
      then: [
        { id: "scale-out", runbookName: null, value: fromInt(3) },
        { id: "run-runbook", runbookName: "spin-up-web", value: null },
      ],
      band: "execute",
      upkeepMicroUsd: asMoney(500_000n),
    },
    {
      id: asRuleId("rule:page"),
      scope: { kind: "estate", ref: null },
      when: [{ metric: asMetricId("health"), comparator: "<", threshold: { kind: "value", amount: FIXED_ZERO, unit: "ratio" } }],
      then: [{ id: "page", runbookName: null, value: null }],
      band: "inform",
      upkeepMicroUsd: asMoney(0n),
    },
  ];
  const state = Object.freeze({
    ...baseState(asRunSeed(2n), "hh-lanes-cards"),
    lanes: Object.freeze(new Map(lanes.map((l) => [l.laneId, Object.freeze(l)]))),
    ruleBook: Object.freeze(cards.map((c) => Object.freeze(c))),
    ruleBookHash: "sha-book-1",
    contentHashes: Object.freeze({
      rulesetCardHashes: Object.freeze({ webhosting: "sha-a", vps: "sha-b" }),
      sheetsHash: "sha-sheets",
      ruleBookHash: "sha-book-1",
    }),
  });
  return { name: "lanes-cards", states: [state] };
}

/* ─────────────────── 3 · composite observed cells (FIX-4 fold) ─────────── */

function cellOf(value: unknown): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Exact,
    freshnessUs: 0n,
    coverage: FIXED_ONE,
    certainty: FIXED_ONE,
    status: "live" as const,
  });
}

type CellTriple = readonly [entity: string, metric: string, cell: ObservedCell<unknown>];

function observedState(seed: RunSeed, engineVersion: string, cells: readonly CellTriple[]): GameState {
  const observed = new Map<ObservedKey, ObservedCell<unknown>>();
  for (const [entity, metric, cell] of cells) observed.set(observedKey(asEntityId(entity), metric), cell);
  return Object.freeze({ ...baseState(seed, engineVersion), observed: Object.freeze(observed) });
}

function compositesCase(): GoldenCase {
  return {
    name: "observed-composites",
    states: [
      observedState(asRunSeed(3n), "hh-composites", [
        ["cell-a", "funnel", cellOf({ queue: 3n, shed: 1n, nested: { byClass: { gold: 2n, bronze: 5n }, total: 7n } })],
        ["cell-b", "funnel", cellOf([1n, 2n, 3n])],
        ["cell-c", "funnel", cellOf("plain string ✿")],
        ["cell-d", "funnel", cellOf(42)],
        ["cell-e", "funnel", cellOf(true)],
        ["cell-f", "funnel", cellOf(null)],
        ["cell-g", "funnel", cellOf(12345n)],
        ["cell-h", "funnel", cellOf(undefined)],
      ]),
    ],
  };
}

/* ──────────────────────── 4 · bigint limb extremes ─────────────────────── */

/** The `& MASK64` / `>> 40n` corners of the sink: limb boundaries, the 40-bit
 *  cut, the sign bit, wraparound at 2^64, and negatives (whose sign-preserving
 *  shift fills lane b with ones). */
function bigintExtremesCase(): GoldenCase {
  const boundaries: readonly bigint[] = [
    0n,
    1n,
    35n, // the "#" type tag itself — data must never alias a tag feed
    0xffff_ffffn, // 2^32 − 1 (low-limb edge)
    0x1_0000_0000n, // 2^32 (high limb first blood)
    0xff_ffff_ffffn, // 2^40 − 1 (the >> 40n cut, one below)
    0x100_0000_0000n, // 2^40 (lane b first blood)
    0xffff_ffff_ffffn, // 2^48 − 1
    0x7fff_ffff_ffff_ffffn, // 2^63 − 1
    0x8000_0000_0000_0000n, // 2^63 (lane-a sign bit)
    0xffff_ffff_ffff_ffffn, // 2^64 − 1 (MASK64 full)
    0x1_0000_0000_0000_0000n, // 2^64 — lane a wraps to 0, lane b keeps 2^24
    0x1ff_ffff_ffff_ffff_ffffn, // 2^73 − 1 — lane a truncates, lane b rides on
  ];
  const negatives: readonly bigint[] = [
    -1n, // lane a = MASK64, lane b = MASK64 (sign fill)
    -35n,
    -0x1_0000n,
    -(2n ** 40n), // the exact shift cut, negative side
    -(2n ** 63n),
    -(2n ** 64n),
    -(2n ** 64n) - 1n,
    -(2n ** 127n),
  ];
  const cells: CellTriple[] = [];
  boundaries.forEach((v, i) => cells.push([`limb-${String(i).padStart(2, "0")}`, "extreme", cellOf(v)]));
  negatives.forEach((v, i) => cells.push([`limb-neg-${String(i).padStart(2, "0")}`, "extreme", cellOf(v)]));
  const plain = observedState(asRunSeed(4n), "hh-limb-extremes", cells);
  // a state whose runSeed itself exceeds 2^64 (the int() axis on the seed):
  const hugeSeed = baseState(asRunSeed(2n ** 127n + 5n), "hh-huge-seed");
  return { name: "bigint-extremes", states: [plain, hugeSeed] };
}

/* ─────────────────────────── 5 · astral / odd text ─────────────────────── */

/** Lone surrogate + NUL + ZWJ emoji + combining marks + highest code point.
 *  Control chars are built via code points (never raw escape literals, which
 *  this workspace's write tooling decodes). */
function astralTextCase(): GoldenCase {
  const loneHigh = String.fromCharCode(0xd800);
  const loneLow = String.fromCharCode(0xdc00);
  const version = [
    "hh-astral",
    "✿", // BMP symbol
    "漢字", // CJK
    String.fromCodePoint(0x1f600), // astral emoji (surrogate PAIR in UTF-16)
    String.fromCodePoint(0x1f468, 0x200d, 0x1f4bb), // ZWJ sequence = 3 code points
    String.fromCharCode(0), // NUL code point inside text
    String.fromCodePoint(0x2205), // ∅ — the nullable sentinel glyph itself
    loneHigh, // UNPAIRED surrogates hash as themselves (for..of semantics)
    loneLow,
    "é", // decomposed combining mark
    String.fromCodePoint(0x10_ffff), // largest assigned code point
  ].join("-");
  const cells: CellTriple[] = [
    ["text-a", `metric-${version}`, cellOf(version)],
    ["text-b", "status", cellOf(`${loneHigh}tail`)],
    ["text-c", "status", cellOf(`${loneLow}head`)],
  ];
  const long = "repeat-".repeat(500);
  const nodes: readonly NodeRecord[] = Object.freeze([
    node(IDS.edge, { kind: `kind-${version}` }),
    Object.freeze({ ...node(IDS.origin, {}), kind: long }),
  ]);
  const state = observedState(asRunSeed(5n), version, cells);
  return {
    name: "astral-text",
    states: [Object.freeze({ ...state, nodes: Object.freeze(new Map(nodes.map((n) => [n.id, n]))) })],
  };
}

/* ───────────────────── 6 · hands + board embeds (door law) ─────────────── */

function handsBoardCase(): GoldenCase {
  const idleHands: HandState = mintHandState(2);
  const busyHands: HandState = Object.freeze({
    capacity: 3,
    tokens: Object.freeze([
      Object.freeze({ index: 0, busyUntilTick: 0n, busyCauseId: null }),
      Object.freeze({ index: 1, busyUntilTick: 9n, busyCauseId: asCauseId("intent:7") }),
      Object.freeze({ index: 2, busyUntilTick: 4294967296n, busyCauseId: asCauseId(`drain:edge${String.fromCharCode(1)}`) }),
    ]),
  });
  const edgesA = [
    { id: asEntityId("edge:data:a->c"), relation: "data" as const, from: asEntityId("a"), to: asEntityId("c"), slot: null },
    { id: asEntityId("edge:power:b->c"), relation: "power" as const, from: asEntityId("b"), to: asEntityId("c"), slot: "psu1" },
  ];
  const board: BoardState = createBoardState(edgesA);
  const reversedTwin: BoardState = createBoardState([...edgesA].reverse());
  const versioned: BoardState = Object.freeze({ ...board, version: board.version + 7 });
  const s1 = createInitialState({ ...doorBase(), hands: idleHands });
  const s2 = createInitialState({ ...doorBase(), hands: busyHands, board });
  const s3 = createInitialState({ ...doorBase(), hands: busyHands, board: reversedTwin });
  const s4 = createInitialState({ ...doorBase(), hands: idleHands, board: versioned });
  return { name: "hands-board", states: [s1, s2, s3, s4] };
}

interface DoorBaseOptions {
  readonly runSeed: RunSeed;
  readonly engineVersion: string;
  readonly contentHashes: { rulesetCardHashes: Record<string, string>; sheetsHash: string; ruleBookHash: string };
  readonly clocks: ReturnType<typeof initialClocks>;
  readonly nodes: NodeRecord[];
}

function doorBase(): DoorBaseOptions {
  return {
    runSeed: asRunSeed(9n),
    engineVersion: "test-golden-door",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [
      node(asEntityId("web-1"), { slots: 1 }),
      node(asEntityId("sw-1"), { slots: 1 }),
      node(asEntityId("spare-1"), { slots: 1 }),
    ],
  };
}

/* ─────────────────── 7 · live door session (per-tick chain) ────────────── */

const WEB = asEntityId("web-1");
const SWITCH = asEntityId("sw-1");
const SPARE = asEntityId("spare-1");
const DATA_EDGE = "edge:data:web-1->sw-1";
const CTRL_EDGE = "edge:control:web-1->spare-1";

function extAt(
  feedTick: SimTick,
  stamp: SimTick,
  seq: number,
  args: PlayerVerbArgs,
): { readonly feedTick: SimTick; readonly external: ExternalIntent } {
  return Object.freeze({
    feedTick,
    external: Object.freeze({
      tick: stamp,
      intent: Object.freeze({
        seq,
        clock: "sim" as const,
        atUs: stamp * MIN,
        origin: "player" as const,
        payload: Object.freeze({ kind: "player-verb" as const, args }),
      }),
    }),
  });
}

const DOOR_SCRIPT: readonly ReturnType<typeof extAt>[] = Object.freeze([
  extAt(1n, 1n, 1, { verb: PlayerVerb.PlaceDevice, nodeId: WEB, deviceKind: "server", template: null }),
  extAt(2n, 2n, 2, { verb: PlayerVerb.ConnectPorts, relation: "data", from: WEB, to: SWITCH, slot: null }),
  extAt(3n, 3n, 3, { verb: PlayerVerb.ConfigureNode, nodeId: WEB, inspectionDepth: "inspect", shedOrder: null }),
  extAt(4n, 4n, 4, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId(DATA_EDGE) }),
  extAt(5n, 5n, 5, { verb: PlayerVerb.Communicate, target: SWITCH, note: "window-✿" }),
  extAt(6n, 6n, 6, { verb: PlayerVerb.ShedLoad, nodeId: asEntityId("ghost"), qosClassId: null }), // refusal leg
  extAt(7n, 7n, 7, { verb: PlayerVerb.ConnectPorts, relation: "control", from: WEB, to: SPARE, slot: null }),
  extAt(8n, 8n, 8, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId(CTRL_EDGE) }),
]);

function scriptEnvelopes(): readonly WaveEnvelope[] {
  return Object.freeze([envelope("golden:wave", fromInt(2))]);
}

/** Eight ticks of place/connect/disconnect choreography under `doorConfig` —
 *  busy hand tokens, board versions and (drain mode) internal continuations
 *  all ride the digest. Chain = per-tick states. */
function runDoor(doorConfig: IntentDoorConfig): GameState[] {
  const config: DefaultPipelineConfig = testConfig({
    runSeed: asRunSeed(13n),
    expressPath: Object.freeze([WEB]),
    deepPath: Object.freeze([WEB, SWITCH]),
  });
  const driver = createTickDriver(
    createDefaultSlots(config),
    streamFor(config.runSeed, "root", 0),
    initialClocks(),
    { intents: doorConfig },
  );
  let state = createInitialState({
    ...doorBase(),
    runSeed: config.runSeed,
    handCapacity: 2,
    board: createBoardState(),
  });
  const chain: GameState[] = [];
  for (let t = 1; t <= 8; t += 1) {
    const tick = BigInt(t);
    const batch: ExternalIntent[] = DOOR_SCRIPT.filter((entry) => entry.feedTick === tick).map((entry) => entry.external);
    const inputs: TickInputs = Object.freeze({
      envelopes: scriptEnvelopes(),
      evidence: Object.freeze([]),
      classes: Object.freeze([]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: retryPolicy(0, 0n),
      aggression: fromInt(0),
      expressMaxConfidence: fromInt(1),
      externalIntents: Object.freeze(batch),
    });
    state = driver.advance(state, inputs).state;
    chain.push(state);
  }
  return chain;
}

function doorRunCases(): GoldenCase[] {
  return [
    { name: "door-run-off", states: runDoor(Object.freeze({})) },
    { name: "door-run-drain", states: runDoor(Object.freeze({ drainPolicy: Object.freeze({ enabled: true }) })) },
  ];
}

/* ─────────────── 8 · occupied slots / queue / unit lineage ─────────────── */

function queueActiveCase(): GoldenCase {
  const idleSlot: NodeSlotRecord = makeSlots(1)[0] as NodeSlotRecord;
  const slots: readonly NodeSlotRecord[] = Object.freeze([
    Object.freeze({ occupied: true, unitId: asEntityId("u1"), waitingOn: asEntityId("origin"), releasedAtUs: 5n * MIN }),
    idleSlot,
    Object.freeze({ occupied: true, unitId: asEntityId("u3"), waitingOn: null, releasedAtUs: null }),
  ]);
  const nodes: readonly NodeRecord[] = Object.freeze([
    Object.freeze({
      ...node(IDS.edge, { slots: 3 }),
      slots,
      queue: Object.freeze([asEntityId("u4"), asEntityId("u5")]),
      queueDepth: 2,
      utilizationRho: fromRatio(95n, 100n),
      dependencyNodeId: IDS.origin,
    }),
    node(IDS.origin, { slots: 1 }),
  ]);
  const unit = (over: Partial<Unit> & { id: Unit["id"] }): Unit =>
    Object.freeze({
      type: "booter",
      sizeCost: fromInt(1),
      patienceUs: 3n * MIN,
      trueIntent: "malicious",
      source: Object.freeze({ identity: "asn:evil-✿", reputation: FIXED_ZERO }),
      retryOf: null,
      arrivedAtTick: 4n,
      accumulatedLatencyUs: 61_440n,
      inspectionCostUs: 0n,
      confidence: FIXED_ZERO,
      qosClassId: null,
      routeHops: Object.freeze([]),
      waitingOn: null,
      ...over,
    });
  const units: readonly Unit[] = [
    unit({ id: asEntityId("u1"), qosClassId: "gold", routeHops: Object.freeze([IDS.edge, IDS.origin]), waitingOn: IDS.origin }),
    unit({ id: asEntityId("u2"), retryOf: asEntityId("u1"), trueIntent: "abuser", inspectionCostUs: 20n * MIN, confidence: fromRatio(1n, 3n) }),
    unit({ id: asEntityId("u3"), routeHops: Object.freeze([IDS.waf, IDS.edge, IDS.origin]), accumulatedLatencyUs: -(2n ** 70n), patienceUs: 2n ** 64n + 7n }),
  ];
  const state = Object.freeze({
    ...baseState(asRunSeed(6n), "hh-queue-active"),
    nodes: Object.freeze(new Map(nodes.map((n) => [n.id, n]))),
    units: Object.freeze(new Map(units.map((u) => [u.id, u]))),
    cash: Object.freeze({
      free: asMoney(-1n),
      restricted: asMoney(2n ** 63n),
      deferred: asMoney(0n),
      accountsReceivable: asMoney(2n ** 64n + 1n),
      backlog: asMoney(42n),
      committedOut: asMoney(-(2n ** 70n)),
    }),
    ledgerSeq: 2 ** 40,
  });
  return { name: "queue-active", states: [state] };
}

/* ────────────────── 9/10 · thin + fat engine runs (p3 recipe) ──────────── */

function contractOf(id: string): Contract {
  return {
    id: asEntityId(id),
    customerEntityId: asEntityId(`cust:${id}`),
    bundleId: "shared",
    mrcMicroUsd: asMoney(100_000_000n),
    tcvMicroUsd: asMoney(0n),
    acvMicroUsd: asMoney(0n),
    termStartMin: 0,
    termEndMin: 2 * 43_200,
    billingCycle: "monthly",
    sla: {
      uptimeTarget: fromRatio(999n, 1000n),
      responseBudgetUs: 0n,
      creditRate: 0n,
      creditCap: 0n,
      claimWindowUs: 0n,
      autoRenew: false,
      noticePeriodMin: 0,
      threeBreachExitRight: false,
    },
    routingLocks: [],
    shedImmunityClassId: null,
    allocations: [],
  } as Contract;
}

function mkNode(id: string, slots: number, serviceTimeUs: bigint): NodeRecord {
  return Object.freeze({
    id: asEntityId(id),
    kind: "generic",
    slots: makeSlots(slots),
    serviceTimeUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: "pass-through" as const,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

const GOLDEN_CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({ id: "gold", label: "gold", weight: fromInt(3), shedPriority: 3, budgetUs: 200_000n, inspectionDepth: "inspect" as const }),
]);

function fatCase(): GoldenCase {
  const seed = asRunSeed(11n);
  const nodes = [
    mkNode("edge", 64, 10_000_000n),
    mkNode("origin", 64, 20_000_000n),
    ...Array.from({ length: 198 }, (_, i) => mkNode(`idle-${String(i).padStart(3, "0")}`, 2, 30_000_000n)),
  ];
  const config = Object.freeze({
    runSeed: seed,
    dnsNodeId: null,
    expressPath: Object.freeze([asEntityId("edge"), asEntityId("origin")]),
    deepPath: Object.freeze([asEntityId("edge"), asEntityId("origin")]),
    defaultPatienceUs: 180_000_000n,
    defaultSizeCost: FIXED_ONE,
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({ "pass-through": 0n, "sample-1-in-20": 50_000n, inspect: 50_000n, challenge: 100_000n }),
    detectionRatio: fromRatio(9n, 10n),
    falsePositiveRatio: fromRatio(10n, 100n),
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(seed, "root", 0), initialClocks());
  let game = createInitialState({
    runSeed: seed,
    engineVersion: "perf-p3",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "p3", ruleBookHash: "" },
    clocks: initialClocks(),
    nodes,
  });
  for (let t = 1; t <= 200; t += 1) {
    game = driver.advance(game, Object.freeze({
      envelopes: Object.freeze([
        Object.freeze({ tableId: "perf:wave", role: "wave" as const, shape: "ramp" as const, ratePerMin: fromInt(200), telegraphed: true, dominantFamily: "malicious" as const }),
      ]),
      evidence: Object.freeze([]),
      classes: GOLDEN_CLASSES,
      dependencyEdges: Object.freeze([]),
      retryPolicy: Object.freeze({ maxRetries: 3, backoffBaseUs: 5_000_000n, jitterPurchased: true }),
      aggression: fromRatio(3n, 10n),
      expressMaxConfidence: fromRatio(5n, 10n),
    } as TickInputs)).state;
  }
  const observed = new Map(game.observed);
  for (let i = 0; i < 500; i += 1) {
    observed.set(observedKey(asEntityId(`feed-${String(i).padStart(3, "0")}`), "mrrMicroUsd"), Object.freeze({
      value: BigInt(i) * 1000n,
      fidelity: 3,
      freshnessUs: 0n,
      coverage: FIXED_ONE,
      certainty: FIXED_ONE,
      status: "live" as const,
    } satisfies ObservedCell<unknown>));
  }
  const contracts = new Map(game.contracts);
  for (let i = 0; i < 1000; i += 1) {
    const c = contractOf(`c${String(i).padStart(4, "0")}`);
    contracts.set(c.id, c);
  }
  return { name: "fat-run", states: [Object.freeze({ ...game, observed: Object.freeze(observed), contracts: Object.freeze(contracts) })] };
}

function thinCase(): GoldenCase {
  const seed = asRunSeed(11n);
  const thinCfg = Object.freeze({
    runSeed: seed,
    dnsNodeId: null,
    expressPath: Object.freeze([asEntityId("edge")]),
    deepPath: Object.freeze([asEntityId("edge")]),
    defaultPatienceUs: 800_000n,
    defaultSizeCost: FIXED_ONE,
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({ "pass-through": 0n, "sample-1-in-20": 50_000n, inspect: 50_000n, challenge: 100_000n }),
    detectionRatio: FIXED_ONE,
    falsePositiveRatio: FIXED_ONE,
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });
  const thinDriver = createTickDriver(createDefaultSlots(thinCfg), streamFor(seed, "root", 0), initialClocks());
  let thin = createInitialState({
    runSeed: seed,
    engineVersion: "perf-p3",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "t", ruleBookHash: "" },
    clocks: initialClocks(),
    nodes: [mkNode("edge", 8, 120_000n)],
  });
  for (let t = 1; t <= 50; t += 1) {
    thin = thinDriver.advance(thin, Object.freeze({
      envelopes: Object.freeze([
        Object.freeze({ tableId: "b", role: "baseline" as const, shape: "plateau" as const, ratePerMin: fromInt(4), telegraphed: false, dominantFamily: "organic" as const }),
      ]),
      evidence: Object.freeze([]),
      classes: GOLDEN_CLASSES,
      dependencyEdges: Object.freeze([]),
      retryPolicy: Object.freeze({ maxRetries: 3, backoffBaseUs: 5_000_000n, jitterPurchased: true }),
      aggression: fromRatio(5n, 10n),
      expressMaxConfidence: fromRatio(5n, 10n),
    } as TickInputs)).state;
  }
  return { name: "thin-run", states: [thin] };
}

/* ─────────────────────────────── registry ──────────────────────────────── */

export function goldenCases(): GoldenCase[] {
  return [
    emptyCase(),
    lanesCardsCase(),
    compositesCase(),
    bigintExtremesCase(),
    astralTextCase(),
    handsBoardCase(),
    ...doorRunCases(),
    queueActiveCase(),
    thinCase(),
    fatCase(),
  ];
}
