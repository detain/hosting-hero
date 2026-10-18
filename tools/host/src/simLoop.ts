/**
 * `tools/host/src/simLoop.ts` — topology (a): the HOST-SIM-authoritative tick.
 *
 * I-TA variant (a) (wave-23 ruling 3b): instead of every browser running its
 * own local sim (variant (b), the shipped default), the HOST owns the engine:
 * `createTickDriver` on a fixed boot seed + a small fixed board, and the
 * host's interval steps the world. The hub's new `publish()` seam is what
 * makes the posture legal: the host fans fresh per-seat projections on its
 * OWN clock, with the fog (`projectionSource` → `projectSeat`) applied
 * per seat BEFORE bytes exist — a seat receives a projection, never the
 * store (tools/transport fog.ts law, restated at the topology level).
 *
 * ONE tick ritual (deterministic, timer-free — the interval in server.ts
 * CALLS step(); nothing here schedules anything):
 *
 *   1. relay.advanceTo(t + 1)      — the RELAY clock stays the stamp clock;
 *   2. hub.drain()                 — inbound submits stamp at the new tick
 *                                    (the relay remains the SOLE stamp
 *                                    authority — the sim does not);
 *   3. consume the stamped log     — a lifetime-`seq` cursor (relay R1 makes
 *                                    seqs never repeat, so `seq > cursor` is
 *                                    sound); `relay.feedFrom(fresh)` turns
 *                                    records into ExternalIntents;
 *   4. driver.advance(...)         — THE HOST IS THE ONLY DOOR FEEDER: the
 *                                    intents ride TickInputs.externalIntents
 *                                    and `applyIntentDoor` runs inside the
 *                                    driver before step 1 (driver-owned; the
 *                                    sim never calls the door directly), so
 *                                    hands/board mutate in NO other place;
 *   5. observed merge              — the simCoreRunner twin (below);
 *   6. hub.publish()               — fresh per-seat seat-state riders fan
 *                                    to LIVE seats only (@24426ec freeze).
 *
 * TWIN-NOTE (read-before-write law of the brief): the observed-merge step
 * mirrors `apps/proto/src/runner/simCoreRunner.ts` (the repo's reference
 * pattern: single ObservedStore write-gate, derived cells applied with the
 * tick's simUs watermark, then merged onto `game.observed` from
 * `store.toObservedMap()`). apps/ is NOT imported — the ~30 lines are mirrored
 * honestly and renamed to this host's vocabulary. Like the spike runner
 * (tools/relay/src/runner.ts, the topology-(b) proof) this loop feeds NO
 * money lane: the topology-(a) claim — server owns sim + door + fog — needs
 * pipeline physics + observed truth only, and an economy lane the proto
 * runner owns would double-author it. Named gap, README too.
 */

import { ObservedStore, asSeatId, entityScope, estateScope } from "@hh/sim-core/observed";
import type { SeatScope } from "@hh/sim-core/observed";
import {
  FIXED_ZERO,
  MICROS_PER_MIN,
  FIXED_UNIT,
  fromRatio,
  initialClocks,
  streamFor,
} from "@hh/sim-core/kernel";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDefaultSlots, createInitialState, createTickDriver, digestState, makeSlots } from "@hh/sim-core/pipeline";
import type { IntentReceipt } from "@hh/sim-core/pipeline";
import { loadTypeBundle } from "@hh/sim-core/loader";
import type { LoadedTypeBundle } from "@hh/sim-core/loader";
import { applyEraAvailabilityToDoorConfig, composeEraPlan } from "@hh/sim-core/scenario";
import type { GameState } from "@hh/sim-core/types";
import { asCauseId, asEntityId, asRunSeed, observedKey, ResolutionBand } from "@hh/sim-core/types";
import type {
  DependencyEdge,
  LaneStats,
  NodeRecord,
  ObservedCell,
  ObservedWrite,
  QosClassDef,
  RetryPolicy,
  RunSeed,
  WaveEnvelope,
} from "@hh/sim-core/types";
import type { CoopRelay } from "relay-tools";
import type { RelayHubHandle, SeatViewWire } from "transport-tools";
import { transportViewForStore } from "transport-tools";

/* ═══════════════════ the fixed boot world (determinism by construction) ═══════════════════ */

const EDGE = asEntityId("edge");
const ORIGIN = asEntityId("origin");
const LANE_ID = asEntityId("lane/ingress-1");

/** The boot seed: `--sim` runs on this unless the host overrides — the
 *  determinism witness pins TWO fresh host sims on it byte-equal. */
export const HOST_SIM_BOOT_SEED: RunSeed = asRunSeed(904n);

function mkNode(id: ReturnType<typeof asEntityId>, slots: number, serviceUs: bigint, depth: NodeRecord["inspectionDepth"], dep: NodeRecord["dependencyNodeId"]): NodeRecord {
  return Object.freeze({
    id,
    kind: "generic",
    slots: makeSlots(slots),
    serviceTimeUs: serviceUs,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: depth,
    discipline: "hockey-stick" as const,
    utilizationRho: FIXED_ZERO,
    dependencyNodeId: dep,
  });
}

const NODES: readonly NodeRecord[] = Object.freeze([
  mkNode(EDGE, 4, MICROS_PER_MIN, "inspect", null),
  mkNode(ORIGIN, 4, 2n * MICROS_PER_MIN, "pass-through", EDGE),
]);

const LANE: LaneStats = Object.freeze({
  laneId: LANE_ID,
  ratePerMin: FIXED_ZERO,
  latencyDistributionRef: "hostsim:p50",
  classMix: Object.freeze({ gold: fromRatio(3n, 10n), bronze: fromRatio(7n, 10n) }),
  health: FIXED_UNIT,
});

const CLASSES: readonly QosClassDef[] = Object.freeze([
  Object.freeze({ id: "gold", label: "Gold", weight: fromRatio(6n, 10n), shedPriority: 0, budgetUs: 5n * MICROS_PER_MIN, inspectionDepth: "inspect" as const }),
  Object.freeze({ id: "bronze", label: "Bronze", weight: FIXED_ZERO, shedPriority: 1, budgetUs: 30n * MICROS_PER_MIN, inspectionDepth: "pass-through" as const }),
]);

const RETRY: RetryPolicy = Object.freeze({ maxRetries: 2, backoffBaseUs: 2n * MICROS_PER_MIN, jitterPurchased: false });

const DEPENDENCY_EDGES: readonly DependencyEdge[] = Object.freeze([
  Object.freeze({ upstreamNodeId: EDGE, downstreamNodeId: ORIGIN, correlation: "software" as const }),
]);

/** A flat 2/min baseline so rho is never vacuously zero — authored inline,
 *  deterministic by construction (no wave tables, no content coupling). */
const ENVELOPES: readonly WaveEnvelope[] = Object.freeze([
  Object.freeze({
    tableId: "hostsim:boot-traffic",
    role: "baseline" as const,
    shape: "plateau" as const,
    ratePerMin: fromRatio(2n, 1n),
    telegraphed: false,
    dominantFamily: "organic" as const,
  }),
]);

/* ═══════════════════════════════ the loop ═══════════════════════════════ */

/** Per-seat fog config: seat id → in-scope entity ids, or "all" for the
 *  estate. A seat ABSENT from the table gets NO rider at all — the hub's
 *  omit-when-unset law, exercised as the host's "this seat reads ledger
 *  only" posture. */
export interface HostSimScopes {
  readonly [seat: string]: readonly string[] | "all";
}

export interface HostSimOptions {
  readonly runSeed?: RunSeed;
  readonly handCapacity?: number;
  readonly scopes?: HostSimScopes;
  /** Fallback for seats absent from `scopes` — undefined keeps the strict
   *  posture (unlisted seat → NO rider). The `--sim` dev default is "all":
   *  a shared-world demo, honest because the README says so; per-seat scopes
   *  stay the tested posture. */
  readonly defaultScope?: readonly string[] | "all";
  /** L-EM (ADR-0019 program 4) — the era mechanics PILOT leg, the same
   *  `--era <year>` knob the scenario runner carries as `eraYear`: when set,
   *  the boot door config grows the era gate over the pilot bundle below.
   *  Absent (the default, and every existing test) ⇒ the door object is
   *  EXACTLY today's `{ handCapacity }` — byte-ident boot, zero new state. */
  readonly eraYear?: number;
  /** Override the pilot bundle (repo-relative or absolute path to a type
   *  bundle JSON). Only consulted when `eraYear` is set. */
  readonly eraBundlePath?: string;
}

/** The pilot line is `official:shared-web` — the §0.4 exemplar (#1: its
 *  `availableFrom: "2009"` fallback ALONE gates the 1998 run) and the one
 *  bundle the dev carrier's demo seats place against. Resolved relative to
 *  THIS file so the flag works from any cwd; read lazily, only when armed. */
const HOST_ERA_PILOT_BUNDLE = new URL("../../../packages/content/types/shared-web.json", import.meta.url);

function loadEraPilotBundle(path: string | undefined): LoadedTypeBundle {
  const file = path === undefined ? fileURLToPath(HOST_ERA_PILOT_BUNDLE) : path;
  return loadTypeBundle(JSON.parse(readFileSync(file, "utf8")) as unknown);
}

export interface HostStepReport {
  readonly tick: bigint;
  /** Inbound wire frames consumed THIS tick. */
  readonly drained: number;
  /** Stamped relay records handed to the door THIS tick. */
  readonly intentsFed: number;
  /** Live seats the fresh projections fanned to. */
  readonly published: number;
  /** digestState of the post-step GameState. */
  readonly digest: string;
}

export interface HostSimHandle {
  step(): HostStepReport;
  /** Advance to `tick` (relay-monotonic), stepping one at a time. */
  runTo(tick: bigint): readonly HostStepReport[];
  tick(): bigint;
  state(): GameState;
  /** digestState trail, one hex per completed step. */
  digests(): readonly string[];
  /** THE projectionSource adapter: what seat `id` is allowed to see, as wire. */
  viewFor(id: string): SeatViewWire | undefined;
  /** Door receipts of the last step (host telemetry; empty until first). */
  lastReceipts(): readonly IntentReceipt[];
}

export interface HostSimDeps {
  readonly relay: CoopRelay;
  readonly hub: RelayHubHandle;
  readonly options?: HostSimOptions;
}

export function createHostSim(deps: HostSimDeps): HostSimHandle {
  const runSeed = deps.options?.runSeed ?? HOST_SIM_BOOT_SEED;
  const handCapacity = deps.options?.handCapacity ?? 2;
  const scopes = deps.options?.scopes ?? {};

  const clocks = initialClocks();
  let game = createInitialState({
    runSeed,
    engineVersion: "host-sim-0",
    contentHashes: Object.freeze({
      rulesetCardHashes: Object.freeze({}),
      sheetsHash: "host-sim-sheets",
      ruleBookHash: "host-sim-rulebook",
    }),
    clocks,
    nodes: NODES,
    lanes: Object.freeze([LANE]),
    handCapacity,
  });
  const slots = createDefaultSlots(
    Object.freeze({
      runSeed,
      dnsNodeId: null,
      expressPath: Object.freeze([EDGE, ORIGIN]),
      deepPath: Object.freeze([EDGE, ORIGIN]),
      defaultPatienceUs: 3n * MICROS_PER_MIN,
      defaultSizeCost: fromRatio(1n, 1n),
      patienceJitterPct: 0,
      inspectionCostUs: Object.freeze({
        "pass-through": 0n,
        "sample-1-in-20": 3_000_000n,
        inspect: 10_000_000n,
        challenge: 20_000_000n,
      }),
      detectionRatio: fromRatio(9n, 10n),
      falsePositiveRatio: fromRatio(2n, 100n),
      referralProbability: FIXED_ZERO,
      returnProbability: FIXED_ZERO,
    }),
  );
  /* L-EM era stage (the door-config twin of the runner's ERA-LAST compose):
   * unarmed the door config is the exact pre-rung frozen `{ handCapacity }`;
   * armed with `--era <year>` the pilot bundle's availability windows gate
   * place-device through the same `applyEraAvailabilityToDoorConfig` the
   * scenario runner rides — one authority, host-voiced refusals. */
  const eraYear = deps.options?.eraYear;
  const doorIntents = Object.freeze({ handCapacity });
  const driver = createTickDriver(slots, streamFor(runSeed, "root", 0), clocks, {
    intents: eraYear === undefined
      ? doorIntents
      : applyEraAvailabilityToDoorConfig(doorIntents, composeEraPlan(loadEraPilotBundle(deps.options?.eraBundlePath), eraYear)),
  });
  const store = new ObservedStore();
  const digests: string[] = [];
  let lastConsumedSeq = -1; // relay R1: seqs are lifetime-monotonic, never repeat
  let lastReceipts: readonly IntentReceipt[] = [];

  /** simCoreRunner twin (docblock): derive observed truth FROM ground truth
   *  each tick — one cell per node property the fog can scope on (rho +
   *  inspection depth), applied through the store's single-writer gate and
   *  merged onto `game.observed`. */
  function mergeObserved(): void {
    const writes: ObservedWrite[] = [];
    for (const [id, node] of game.nodes) {
      const tickLabel = String(game.context.tick);
      const rho: ObservedCell<unknown> = Object.freeze({
        value: node.utilizationRho,
        fidelity: ResolutionBand.Fine,
        freshnessUs: 0n,
        coverage: FIXED_UNIT,
        certainty: FIXED_UNIT,
        status: "live" as const,
      });
      writes.push(Object.freeze({ key: observedKey(id, "utilizationRho"), cell: rho, causeId: asCauseId(`hostsim:rho:${id}:${tickLabel}`) }));
      const depth: ObservedCell<unknown> = Object.freeze({
        value: node.inspectionDepth,
        fidelity: ResolutionBand.Exact,
        freshnessUs: 0n,
        coverage: FIXED_UNIT,
        certainty: FIXED_UNIT,
        status: "live" as const,
      });
      writes.push(Object.freeze({ key: observedKey(id, "inspectionDepth"), cell: depth, causeId: asCauseId(`hostsim:depth:${id}:${tickLabel}`) }));
    }
    store.applyObservedWrites(Object.freeze(writes), game.context.clocks.simUs);
    const merged = new Map(game.observed);
    for (const [key, cell] of store.toObservedMap()) merged.set(key, cell);
    game = Object.freeze({ ...game, observed: Object.freeze(merged) });
  }

  function scopeFor(id: string): SeatScope | undefined {
    const wire = scopes[id] ?? deps.options?.defaultScope;
    if (wire === undefined) return undefined;
    const seat = asSeatId(id);
    return wire === "all" ? estateScope(seat) : entityScope(seat, wire.map(asEntityId));
  }

  return {
    step(): HostStepReport {
      deps.relay.advanceTo(deps.relay.tick() + 1n);
      const drained = deps.hub.drain();
      const log = deps.relay.sharedLog();
      const fresh = log.filter((record) => record.seq > lastConsumedSeq);
      if (fresh.length > 0) {
        const tail = fresh[fresh.length - 1];
        if (tail !== undefined) lastConsumedSeq = tail.seq;
      }
      const externalIntents = deps.relay.feedFrom(fresh);
      const result = driver.advance(
        game,
        Object.freeze({
          envelopes: ENVELOPES,
          evidence: Object.freeze([]),
          classes: CLASSES,
          dependencyEdges: DEPENDENCY_EDGES,
          retryPolicy: RETRY,
          aggression: fromRatio(5n, 10n),
          expressMaxConfidence: fromRatio(8n, 10n),
          ...(externalIntents.length === 0 ? {} : { externalIntents }),
        }),
      );
      game = result.state;
      lastReceipts = result.doorReceipts;
      mergeObserved();
      const published = deps.hub.publish();
      const digest = digestState(game);
      digests.push(digest);
      return Object.freeze({ tick: game.context.tick, drained, intentsFed: externalIntents.length, published, digest });
    },
    runTo(tick: bigint): readonly HostStepReport[] {
      const reports: HostStepReport[] = [];
      while (deps.relay.tick() < tick) reports.push(this.step());
      return Object.freeze(reports);
    },
    tick: () => game.context.tick,
    state: () => game,
    digests: () => Object.freeze([...digests]),
    viewFor(id: string): SeatViewWire | undefined {
      const scope = scopeFor(id);
      return scope === undefined ? undefined : transportViewForStore(store, scope);
    },
    lastReceipts: () => lastReceipts,
  };
}
