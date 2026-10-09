/**
 * Driver × unlocks observer seam (Phase-2 wiring, §5) — the README's
 * "observe(tickInput)" hook driven by the REAL driver.
 *
 * Laws pinned here:
 *  1. OFF by default: an unwired TickResult carries NO unlockProposals key
 *     (the result serializes exactly as pre-seam hosts produced it);
 *  2. ON is digest-neutral: the whole digestState chain is byte-identical
 *     between the wired and the bare run, proven while scars actively fire
 *     (not on a silent board);
 *  3. the handoff is STRUCTURAL: a real createUnlockObserver() is passed
 *     where only UnlockDriverObserver was declared — the assignment itself
 *     is the compile-time witness that the mirrors hold;
 *  4. proposals are once-per-targetRef and replay-stable: the same input
 *     sequence re-proposes byte-identically.
 */

import { describe, expect, it } from "vitest";
import { FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN, initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import type { DefaultPipelineConfig } from "../defaults";
import type { TickInputs, UnlockDriverObserver, UnlockDriverWiring } from "../driver";
import { createInitialState, createTickDriver } from "../driver";
import { createDefaultSlots, digestState, makeSlots } from "../index";
import type {
  EntityId,
  GameState,
  NodeRecord,
  QosClassDef,
  RetryPolicy,
  SimTimeUs,
  WaveEnvelope,
} from "../../types";
import { asEntityId, asRunSeed } from "../../types";
import { createUnlockObserver, type UnlockProposal } from "../../unlocks/triggers";

/* ═══════════════ mirrored pipeline fixtures (per lane law) ═══════════════ */

const IDS = {
  edge: asEntityId("edge"),
  origin: asEntityId("origin"),
} as const;

const TABLE = "driver-unlocks:probe"; // unique: unitIds embed the tableId

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
  // 1-slot hard ceiling × 4/min: every tick admits 1, sheds 3 → the bounce
  // census is arithmetic, not luck. Patience = a million minutes so every
  // "bounced" event is a shed naming the edge node.
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
]);

const NO_RETRY: RetryPolicy = Object.freeze({ maxRetries: 0, backoffBaseUs: 0n, jitterPurchased: false });

function config(): DefaultPipelineConfig {
  return Object.freeze({
    runSeed: asRunSeed(4242n),
    dnsNodeId: null,
    expressPath: Object.freeze([IDS.edge, IDS.origin]),
    deepPath: Object.freeze([IDS.edge, IDS.origin]),
    defaultPatienceUs: 1_000_000n * MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({
      "pass-through": 0n,
      "sample-1-in-20": 3n * MIN,
      inspect: 10n * MIN,
      challenge: 20n * MIN,
    }),
    detectionRatio: fromRatio(9n, 10n),
    falsePositiveRatio: FIXED_ZERO,
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

const TICKS = 10;
const ERA_FLIP_TICK = 5;

/** Era year seen by `eraYearOf` on tick t (1-based): 1998 until the flip. */
function eraAtTick(tick: number): number {
  return tick >= ERA_FLIP_TICK ? 2026 : 1998;
}

function initialState(cfg: DefaultPipelineConfig): GameState {
  return createInitialState({
    runSeed: cfg.runSeed,
    engineVersion: "driver-unlocks",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "driver-unlocks", ruleBookHash: "" },
    clocks: initialClocks(),
    nodes: NODES,
  });
}

interface Run {
  readonly digests: string[];
  readonly proposals: UnlockProposal[];
  readonly keyPresence: boolean[];
}

/** Advance TICKS arrival ticks; when `wiring` is set, era/notice feeds are
 *  scripted (era flip at ERA_FLIP_TICK, a constant written-off notice). */
function run(wiring?: Omit<UnlockDriverWiring, "observer"> & { observer: UnlockDriverObserver }): Run {
  const cfg = config();
  let era = 1998; // scripted host state; read through the eraYearOf closure
  const effective: UnlockDriverWiring | undefined =
    wiring === undefined
      ? undefined
      : {
          observer: wiring.observer,
          noticesOf: () => [{ kind: "written-off", causeId: "economy:probe" }],
          eraYearOf: () => era,
        };
  const driver = createTickDriver(createDefaultSlots(cfg), streamFor(cfg.runSeed, "root", 0), initialClocks(), {
    purgeTargetedMinNodes: 0, // 2-node fixture: pin the index arm on
    ...(effective !== undefined ? { unlocks: effective } : {}),
  });
  let state = initialState(cfg);
  const digests: string[] = [];
  const proposals: UnlockProposal[] = [];
  const keyPresence: boolean[] = [];
  for (let t = 1; t <= TICKS; t += 1) {
    era = eraAtTick(t);
    const result = driver.advance(state, arrivalInputs());
    state = result.state;
    digests.push(digestState(state));
    keyPresence.push("unlockProposals" in result);
    if (result.unlockProposals !== undefined) proposals.push(...(result.unlockProposals as readonly UnlockProposal[]));
  }
  return { digests, proposals, keyPresence };
}

/* ═══════════════════ 1 · default OFF is byte-identical ═══════════════════ */

describe("unlock seam default-off (digest-neutrality)", () => {
  it("an unwired TickResult carries NO unlockProposals key, ever", () => {
    const bare = run();
    expect(bare.keyPresence.every((present) => !present)).toBe(true);
    expect(bare.proposals).toHaveLength(0);
  });

  it("wired and bare runs produce byte-identical digestState chains (proven while scars fire)", () => {
    const wired = run({ observer: createUnlockObserver({ bounceScarAfter: 5, milestoneMinutes: [] }) });
    const bare = run();
    expect(wired.digests).toStrictEqual(bare.digests);
    // Non-vacuity: the hard ceiling sheds 3 units/tick at `edge`, so the
    // bounce scar fires THROUGH the driver by tick 2 — never a silent board.
    expect(wired.proposals.some((p) => p.targetRef === asEntityId("scar:bounce:edge"))).toBe(true);
    expect(wired.keyPresence.every((present) => present)).toBe(true);
  });
});

/* ═══════════════ 2 · structural handoff compiles real engine ═══════════════ */

describe("structural handoff (mirror types accept the real observer)", () => {
  it("createUnlockObserver() satisfies UnlockDriverObserver without adapters", () => {
    const asSeam: UnlockDriverObserver = createUnlockObserver(); // compile witness
    expect(typeof asSeam.observe).toBe("function");
    expect(asSeam.observe({ tick: 1n, minute: 1, events: [] })).toStrictEqual([]); // clean minimal window
  });

  it("a wiring object whose observer lacks observe() fails fast at createTickDriver", () => {
    const cfg = config();
    expect(() =>
      createTickDriver(createDefaultSlots(cfg), streamFor(cfg.runSeed, "root", 0), initialClocks(), {
        unlocks: { observer: {} as unknown as UnlockDriverObserver },
      }),
    ).toThrow(/observe/);
  });
});

/* ═══════════ 3 · every channel flows: events, notices, era, milestone ═══════════ */

describe("driver-fed proposal census (all three feed channels)", () => {
  it("scar + milestone + notice-scar + era all fire, each exactly once", () => {
    const observer = createUnlockObserver({
      bounceScarAfter: 5,
      milestoneMinutes: [{ atMinute: 8, label: "eight-minutes" }],
      noticeScarAfter: { "written-off": 1 },
    });
    const wired = run({ observer });
    const labels = wired.proposals.map((p) => `${p.via}:${p.targetRef}`);
    expect(new Set(labels).size).toBe(labels.length); // once-per-target law
    expect(labels).toContain("scar:scar:bounce:edge");
    expect(labels).toContain("scar:scar:notice:written-off");
    expect(labels).toContain("milestone:milestone:eight-minutes");
    expect(labels).toContain("era:era:2026");
    // The first sighting of an era never counts as a change (baseline law):
    expect(labels).not.toContain("era:era:1998");
    // And the observer's own ledger agrees with what the driver surfaced.
    expect(observer.proposals()).toStrictEqual(wired.proposals);
  });
});

/* ═══════════════ 4 · replay determinism of the proposal stream ═══════════════ */

describe("proposal stream is a deterministic fold of the feed", () => {
  it("two identically-wired runs propose byte-identical streams", () => {
    const census = (rows: readonly UnlockProposal[]): string =>
      rows.map((p) => `${p.via}|${p.targetRef}|${p.atTick}|${p.causeId}`).join("\n");
    const first = run({
      observer: createUnlockObserver({
        bounceScarAfter: 5,
        milestoneMinutes: [{ atMinute: 8, label: "eight-minutes" }],
      }),
    });
    const second = run({
      observer: createUnlockObserver({
        bounceScarAfter: 5,
        milestoneMinutes: [{ atMinute: 8, label: "eight-minutes" }],
      }),
    });
    expect(first.proposals.length).toBeGreaterThan(0);
    expect(census(second.proposals)).toBe(census(first.proposals));
  });
});
