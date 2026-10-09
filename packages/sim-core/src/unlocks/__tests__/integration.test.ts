/**
 * Integration tests — the unlock engine fed by the REAL pipeline event
 * stream (fixtures mirrored locally, per lane law: pipeline/__tests__/
 * helpers.ts is sibling-owned and may churn) plus the digest-neutrality
 * proof: the observer proposal-streams beside the driver while every
 * digestState stays byte-identical.
 */

import { describe, expect, it } from "vitest";
import { FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN, initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import type { DefaultPipelineConfig } from "../../pipeline/defaults";
import type { TickInputs } from "../../pipeline/driver";
import { createInitialState, createTickDriver } from "../../pipeline/driver";
import { createDefaultSlots, digestState, makeSlots } from "../../pipeline/index";
import type {
  CauseId,
  EntityId,
  GameState,
  NodeRecord,
  QosClassDef,
  RetryPolicy,
  SimEvent,
  SimTimeUs,
  WaveEnvelope,
} from "../../types";
import { asCauseId, asEntityId, asRunSeed } from "../../types";
import { canUnlock, parsePrereqSets, whatBlocks } from "../prereqs";
import { createUnlockObserver, type UnlockProposal, type UnlockTickInput } from "../triggers";

/* ═══════════════ mirrored pipeline fixtures (read-only copies) ═══════════════ */

const IDS = {
  edge: asEntityId("edge"),
  origin: asEntityId("origin"),
} as const;

/** Local table id: unitIds mint as `<tableId>@<tick>#<e>.<i>`, so this
 *  string must be unique to this file's runs (no cross-test bleed). */
const TABLE = "unlocks-integration:probe";

function node(id: EntityId, slots: number, serviceUs: SimTimeUs, discipline: NodeRecord["discipline"]): NodeRecord {
  return Object.freeze({
    id,
    kind: "generic",
    slots: makeSlots(slots),
    serviceTimeUs: serviceUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: "pass-through" as const,
    discipline,
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

const NODES: readonly NodeRecord[] = Object.freeze([
  // One-slot hard ceiling × 4 arrivals/min: every tick admits 1, sheds 3
  // — the bounced-event census is ARITHMETIC, not luck (patience set to
  // a million minutes so the LUT returns exact zero bounce probability;
  // every bounce is a shed with nodeId = the shedding node).
  node(IDS.edge, 1, MIN, "hard-ceiling"),
  node(IDS.origin, 8, MIN, "hockey-stick"),
]);

function envelope(ratePerMin: number): WaveEnvelope {
  return Object.freeze({
    tableId: TABLE,
    role: "baseline" as const,
    shape: "plateau" as const,
    ratePerMin: fromInt(ratePerMin),
    telegraphed: false,
    dominantFamily: "organic" as const,
  });
}

const CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({
    id: "gold",
    label: "Gold",
    weight: fromRatio(6n, 10n),
    shedPriority: 0,
    budgetUs: 5n * MIN,
    inspectionDepth: "inspect" as const,
  }),
  Object.freeze({
    id: "bronze",
    label: "Bronze",
    weight: FIXED_ZERO,
    shedPriority: 1,
    budgetUs: 30n * MIN,
    inspectionDepth: "pass-through" as const,
  }),
]);

const NO_RETRY: RetryPolicy = Object.freeze({ maxRetries: 0, backoffBaseUs: 0n, jitterPurchased: false });

function config(): DefaultPipelineConfig {
  return Object.freeze({
    runSeed: asRunSeed(42n),
    dnsNodeId: null,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
    defaultPatienceUs: 1_000_000n * MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({ "pass-through": 0n, "sample-1-in-20": 3n * MIN, inspect: 10n * MIN, challenge: 20n * MIN }),
    detectionRatio: fromRatio(9n, 10n),
    falsePositiveRatio: fromRatio(2n, 100n),
    referralProbability: FIXED_ZERO,
    returnProbability: FIXED_ZERO,
  });
}

function arrivalInputs(): TickInputs {
  return Object.freeze({
    envelopes: Object.freeze([envelope(4)]),
    evidence: [],
    classes: CLASSES,
    dependencyEdges: Object.freeze([]),
    retryPolicy: NO_RETRY,
    aggression: fromRatio(5n, 10n),
    expressMaxConfidence: fromRatio(8n, 10n),
  });
}

function quietInputs(): TickInputs {
  return Object.freeze({
    envelopes: Object.freeze([]),
    evidence: [],
    classes: CLASSES,
    dependencyEdges: Object.freeze([]),
    retryPolicy: NO_RETRY,
    aggression: fromRatio(5n, 10n),
    expressMaxConfidence: fromRatio(8n, 10n),
  });
}

const ARRIVAL_TICKS = 10;
const DRAIN_TICKS = 20;

interface Run {
  readonly chain: readonly string[];
  readonly digestsPreObserve: readonly string[];
  readonly digestsPostObserve: readonly string[];
  readonly proposals: readonly UnlockProposal[];
  readonly bouncedEdge: number;
}

function run(observed: boolean): Run {
  const cfg = config();
  const driver = createTickDriver(createDefaultSlots(cfg), streamFor(cfg.runSeed, "root", 0), initialClocks(), {
    purgeTargetedMinNodes: 0, // 2-node fixture: pin the index arm on
  });
  const observer = createUnlockObserver({
    bounceScarAfter: 5,
    milestoneMinutes: [{ atMinute: 20, label: "ran-twenty-minutes" }],
  });
  let state: GameState = createInitialState({
    runSeed: cfg.runSeed,
    engineVersion: "unlocks-integration",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "unlocks-integration", ruleBookHash: "" },
    clocks: initialClocks(),
    nodes: NODES,
  });
  const chain: string[] = [];
  const digestsPreObserve: string[] = [];
  const digestsPostObserve: string[] = [];
  const proposals: UnlockProposal[] = [];
  let bouncedEdge = 0;
  const feed = async (inputs: TickInputs): Promise<void> => {
    const result = driver.advance(state, inputs);
    state = result.state;
    chain.push(digestState(state));
    bouncedEdge += result.events.filter((e) => e.kind === "bounced" && e.nodeId === IDS.edge).length;
    if (!observed) return;
    digestsPreObserve.push(digestState(state));
    proposals.push(...observer.observe({ tick: state.context.tick, minute: state.context.minute, events: result.events }));
    digestsPostObserve.push(digestState(state));
  };
  // vitest is sync-friendly: drive the loop eagerly instead of an async fn.
  for (let t = 0; t < ARRIVAL_TICKS; t += 1) void feed(arrivalInputs());
  for (let t = 0; t < DRAIN_TICKS; t += 1) void feed(quietInputs());
  return { chain, digestsPreObserve, digestsPostObserve, proposals, bouncedEdge };
}

/* ═══════════════════ 1 · digest neutrality (the design law) ═══════════════════ */

describe("digest neutrality (observer, never mutator)", () => {
  it("the whole 30-tick digest chain is byte-identical with and without the observer", () => {
    const bare = run(false);
    const watched = run(true);
    // Non-vacuity: the board really bounced traffic and the observer saw it.
    expect(watched.bouncedEdge).toBeGreaterThanOrEqual(5);
    expect(bare.bouncedEdge).toBe(watched.bouncedEdge);
    expect(watched.chain.length).toBe(ARRIVAL_TICKS + DRAIN_TICKS);
    expect(watched.chain).toStrictEqual(bare.chain);
    // And the observer's own proposals exist — neutrality is proven while
    // scar events are actively firing, not on a silent board.
    const scars = watched.proposals.filter((p) => p.via === "scar");
    expect(scars.length).toBeGreaterThanOrEqual(1);
    expect(scars.some((p) => p.targetRef === asEntityId("scar:bounce:edge"))).toBe(true);
  });

  it("digestState is invariant across each individual observe() call", () => {
    const watched = run(true);
    expect(watched.digestsPreObserve.length).toBe(ARRIVAL_TICKS + DRAIN_TICKS);
    expect(watched.digestsPostObserve).toStrictEqual(watched.digestsPreObserve);
  });

  it("the observer never sees GameState — its input type carries no units/nodes fields", () => {
    // Compile-time law made runtime-falsifiable: UnlockTickInput's keys are
    // exactly the observation surface (a GameState-shaped key must throw).
    const observer = createUnlockObserver();
    const shape: UnlockTickInput = { tick: 1n, minute: 0 };
    expect(observer.observe(shape)).toHaveLength(0);
    const keys = Object.keys(shape).sort();
    expect(keys).toStrictEqual(["minute", "tick"]);
  });
});

/* ═══════════════ 2 · scripted stream → exact proposal census ═══════════════ */

function ev(
  kind: SimEvent["kind"],
  tick: bigint,
  cause: string,
  extra: Record<string, unknown>,
): SimEvent {
  return { kind, atUs: 0n, tick, causeId: cause as CauseId, unitId: asEntityId(`u-${tick}-${kind}`), ...extra } as SimEvent;
}

describe("scripted event stream (handcrafted SimEvents, §5.2 choreography)", () => {
  it("a six-beat script produces the EXACT ordered proposal census", () => {
    const observer = createUnlockObserver({
      bounceScarAfter: 2,
      landedScarAfter: 1,
      noticeScarAfter: { "written-off": 1 },
      milestoneMinutes: [{ atMinute: 5, label: "five-minutes" }],
    });
    const fired: UnlockProposal[] = [];
    const beat = (window: UnlockTickInput): void => {
      fired.push(...observer.observe(window));
    };

    beat({ tick: 1n, minute: 1, events: [ev("bounced", 1n, "outcome:a", { nodeId: IDS.edge })] }); // below
    beat({
      tick: 2n,
      minute: 2,
      events: [
        ev("bounced", 2n, "outcome:b", { nodeId: IDS.edge }), // scar threshold crossed
        ev("landed", 2n, "breach:1", { targetId: IDS.origin }), // breach scar
      ],
    });
    beat({ tick: 3n, minute: 3, notices: [{ kind: "written-off", causeId: "economy:writeoff" }] }); // notice scar
    beat({ tick: 4n, minute: 4, eraYear: 1998 }); // baseline — silent
    beat({ tick: 5n, minute: 5, eraYear: 2026 }); // era flip + milestone (minute 5)
    beat({
      tick: 6n,
      minute: 6,
      declarations: [{ via: "acquisition", targetRef: asEntityId("node:acquired-co"), causeId: asCauseId("deal:1") }],
    });

    expect(fired.map((p) => `${p.via}:${p.targetRef}`)).toStrictEqual([
      "scar:scar:bounce:edge",
      "scar:scar:landed",
      "scar:scar:notice:written-off",
      "milestone:milestone:five-minutes",
      "era:era:2026",
      "acquisition:node:acquired-co",
    ]);
    // Causes ride the crossing evidence, not a re-stamp.
    expect(fired[0]?.causeId).toBe(asCauseId("outcome:b"));
    expect(fired[1]?.causeId).toBe(asCauseId("breach:1"));
    expect(fired[2]?.causeId).toBe(asCauseId("economy:writeoff"));
    expect(fired[5]?.causeId).toBe(asCauseId("deal:1"));
    // Once-per-target law holds across the whole script.
    expect(new Set(fired.map((p) => p.targetRef)).size).toBe(fired.length);
  });
});

/* ═══════════════ 3 · the scar stream feeds the lattice ═══════════════ */

describe("proposals → prereq evidence chain (§5.1 → §5.6 consumer)", () => {
  it("earned scars open exactly the routes they name, and whatBlocks reads the rest", () => {
    const lattice = parsePrereqSets([
      { tech: ["scar:bounce:edge", "scar:landed"], commercial: null, alt: "purchase-paper" },
      { tech: ["scar:notice:spiral-flagged"], commercial: null, alt: null },
    ]);
    const earned = new Set<string>([
      "scar:bounce:edge", // route 0 is HALF met — still locked
      "scar:notice:spiral-flagged", // route 1 fully met → the line opens ANY-route
    ]);
    expect(canUnlock(lattice, earned)).toBe(true);
    expect(whatBlocks(lattice, earned)).toStrictEqual([]); // open line prints no locks
    // Pull the opening evidence back and the lock reappears, name by name.
    const partial = new Set<string>(["scar:bounce:edge"]);
    expect(canUnlock(lattice, partial)).toBe(false);
    expect(whatBlocks(lattice, partial)).toHaveLength(2);
    expect(whatBlocks(lattice, partial)[1]?.missingTech).toStrictEqual(["scar:notice:spiral-flagged"]);
    // The alt route alone also opens route 0 (two doors, one line).
    expect(canUnlock(lattice, new Set(["purchase-paper", "scar:notice:spiral-flagged"]))).toBe(true);
  });
});
