/**
 * The tick driver (MASTER_REPORT §4.1 / hosting_game.md §7.13): advances one
 * GameState through the canonical TICK_STEP_ORDER, threading step outputs
 * into step inputs, applying the in-band state updates the frozen step shapes
 * cannot express (hop progress, latency stamps, terminal purges), and owning
 * the two pieces of cross-tick memory the contract has no GameState field
 * for: the pending re-entry schedule (retries/referrals/returns awaiting
 * their backoff) and retry-lineage depth.
 *
 * Determinism notes:
 *  - every RNG stream is OPENED PER KEY via the kernel (`streamFor(seed,
 *    domain, minute)`), so step-internal consumption order can never perturb
 *    another step or tick (§4.1 R-16 stream isolation);
 *  - the driver never reads a wall clock — `advanceClocks` takes an INJECTED
 *    fixed delta; default = 1 real second at 1× ⇒ exactly one sim minute ⇒
 *    one tick (kernel/time DEFAULT_TICK_US);
 *  - cross-tick memory (pending re-entries, id-mint counter, retry depths)
 *    is a pure function of (initial state, input sequence) — replays match;
 *    export/import hooks let the replay wave checkpoint it (§3.3) until
 *    types.ts grows a GameState slot for it (friction reported);
 *  - UNIT_HOLD (defaults module) is cleared before every tick so no hold
 *    smuggles across ticks through the side-table;
 *  - rec#5 targeted purge: the driver indexes queue/slot membership from
 *    the serve step's own outputs — assignments for slots, per-node queue
 *    SIGNATURES (count+head ⇒ tail-join/admit-shift arithmetic) for queues,
 *    a WAITING/SHED full rebuild every `purgeVerifyTicks` as the drift
 *    backstop — and purges only the nodes its terminals were attributed to.
 *    Results are byte-identical to the old full-board sweep for every state
 *    the step contract can produce; the sweep remains as a counted, loud
 *    fallback on probe overflow, attribution contradiction, cold-boot
 *    rosters, `purgeProbeCap: 0`, or a board below `purgeTargetedMinNodes`
 *    (the by-design cheap-sweep path for tiny grids, counted as
 *    `smallBoardSweeps`). The index is driver-memory only (never
 *    in state/events/digest) and self-heals after checkpoint restore.
 */

import type {
  BackpressureIn,
  BoardState,
  ClockState,
  ConfidenceContribution,
  Contract,
  DependencyEdge,
  EntityId,
  ExternalIntent,
  Fixed,
  GameState,
  HandState,
  InspectionDepth,
  LaneStats,
  NodeRecord,
  NodeSlotRecord,
  ObservedCell,
  ObservedKey,
  Outcome,
  OutcomeCandidate,
  OutcomeIn,
  PolicyCard,
  PlayerIntent,
  PipelineSlots,
  QosClassDef,
  QueueWaitIn,
  ReplayContentHashes,
  RetryPolicy,
  RngStream,
  RuleFiring,
  RuleId,
  RoutingLock,
  RunSeed,
  SimEvent,
  SimTick,
  SimTimeUs,
  Unit,
  UnitDraft,
  WaveEnvelope,
} from "../types.ts";
import { asEntityId, emptyMoneyBuckets } from "../types.ts";
import { FIXED_UNIT, FIXED_ZERO } from "../kernel/fixed.ts";
import {
  DEFAULT_TICK_US,
  MICROS_PER_SEC,
  advanceClocks,
  simMinuteOf,
  tickOf,
  type ClockAdvance,
  type SpeedFactor,
} from "../kernel/time.ts";
import { streamFor } from "../kernel/rng.ts";
import { orderShedForTick, TICK_US, sortedIds, withUnit } from "./internal.ts";
import { UNIT_HOLD } from "./defaults.ts";
import { DEFAULT_KNEE_RHO, utilization } from "./queue.ts";
import { applyIntentDoor, mintHandState, type IntentDoorConfig, type IntentReceipt } from "./intent-door.ts";

/* ═══════════════════════════ Per-tick ambient inputs ═══════════════════════════ */

/** Everything the steps need that GameState does not carry (envelopes,
 *  evidence, board edges, tuning knobs). The host wave assembles these per
 *  tick from director/board/policy modules — replay-log fodder. */
export interface TickInputs {
  readonly envelopes: readonly WaveEnvelope[];
  readonly evidence: readonly ConfidenceContribution[];
  readonly classes: readonly QosClassDef[];
  readonly dependencyEdges: readonly DependencyEdge[];
  readonly retryPolicy: RetryPolicy;
  /** Inspection ROC slider 0..1 (R-52). */
  readonly aggression: Fixed;
  /** ρ split point for the express/deep routing decision (R-05). */
  readonly expressMaxConfidence: Fixed;
  /** Knee threshold — default 0.7 when omitted (R-07; OD-2 sheet owns it). */
  readonly kneeRho?: Fixed;
  readonly routingLocks?: readonly RoutingLock[];
  readonly valueByUnit?: ReadonlyMap<EntityId, Fixed>;
  /** Contention multiplier feeding storm pressure (R-61). */
  readonly stormFactor?: Fixed;
  readonly suppressedRuleIds?: readonly RuleId[];
  readonly lanes?: ReadonlyMap<EntityId, LaneStats>;
  /** THE INTENT DOOR (closes proto friction #1): external player/rule intents
   *  fed to THIS tick, applied before step 1 in (tick, seq) order — every
   *  entry executed (mutating its named slice + an `intent-executed` event)
   *  or refused (deterministic `intent-refused` event, nothing consumed).
   *  Ambient-input contract: feed each intent EXACTLY ONCE, the driver keeps
   *  no intent schedule (pause-with-orders: stamp at the paused tick, feed
   *  the whole queue on the first unfrozen advance — §7.13).
   *  Accepts replay/bundle.ts `StampedIntent` values structurally (the
   *  optional `extras` sidecar is ignored by the door, preserved by the
   *  bundle writer). */
  readonly externalIntents?: readonly ExternalIntent[];
}

/* ═══════════════════════════ Driver surface ═══════════════════════════ */

export interface TickResult {
  readonly state: GameState;
  /** Events from all steps, concatenated in canonical step order — door
   *  events LEAD (the door runs before step 1), then arrival…, outcome…,
   *  backpressure…, economics…. */
  readonly events: readonly SimEvent[];
  readonly outcomes: readonly Outcome[];
  readonly ruleFirings: readonly RuleFiring[];
  readonly intents: readonly PlayerIntent[];
  /** Per-intent door verdicts in canonical (tick, seq) application order —
   *  host ticker/HUD sugar over the replay-grade event record. */
  readonly doorReceipts: readonly IntentReceipt[];
  /** 0..1 retry-storm pressure this tick (metastability read-out). */
  readonly pressure: Fixed;
  /** Re-entries scheduled but not yet matured (storm headroom). */
  readonly pendingReentries: number;
}

/** Checkpointable cross-tick driver memory (replay-wave hand-off). */
export interface PendingReentry {
  readonly draft: UnitDraft;
  readonly readyAtTick: SimTick;
  readonly retryDepth: number;
  readonly lineageRoot: EntityId;
}

export interface TickDriverOptions {
  /** Fixed per-advance delta; default = 1 real s @ 1× ⇒ exactly 1 tick. */
  readonly tickAdvance?: ClockAdvance;
  /** Macro-tick length for tick numbering (default one sim minute). */
  readonly tickUs?: SimTimeUs;
  /** Intent-door wiring (hand costs/occupancy, placement validator, policy
   *  card lookup). Omitted = defaults; door still runs for any fed schedule. */
  readonly intents?: IntentDoorConfig;
  /** rec#5 · TARGETED-PURGE probe cap. When the set of queue/slot nodes
   *  attributed to this tick's terminals exceeds it, the driver falls back
   *  to the full-board sweep (counted as `overflowFallbacks`, never silent).
   *  Default 64; `0` = always sweep (the pre-rec#5 behaviour — the
   *  byte-identity equivalence witness for tests). Non-integer/negative →
   *  throws at `createTickDriver` (fail fast). */
  readonly purgeProbeCap?: number;
  /** rec#5 · cadence of the WAITING/SHED verification sweep that rebuilds
   *  queue attribution from the serve step's truth channels (counted as
   *  `verifyRuns`). Between verifications the fast path indexes queue
   *  membership incrementally (append-tail + admit-shift arithmetic) and
   *  self-heals to a full node rescan the moment the arithmetic disagrees
   *  (`resyncScans`). Default 8; `1` = rescan every tick, `0` = trust the
   *  incremental path alone (debug ladder only). Same validation shape as
   *  `purgeProbeCap`. */
  readonly purgeVerifyTicks?: number;
  /** rec#5 · smallest board the attribution index runs on. Below it the
   *  full-board sweep is already sub-microsecond and paying the per-tick
   *  indexing tax is a NET LOSS — small boards skip indexing altogether
   *  (counted as `smallBoardSweeps`). Default 8; `0` = always index. */
  readonly purgeTargetedMinNodes?: number;
}

export interface TickDriver {
  /** Advance `state` one canonical tick. Pure w.r.t. GameState; the driver's
   *  internal schedule mutates exactly like the run it belongs to. */
  advance(state: GameState, inputs: TickInputs): TickResult;
  /** Export/import the re-entry schedule for save/replay checkpoints (§3.3).
   *  F6 — the payload is a checkpoint PAIR, not just the schedule: `pending`
   *  (each entry self-carries its `retryDepth`) plus `depths` — the LIVE
   *  roster units' storm depths sorted byId for a byte-stable serialization.
   *  A checkpoint that dropped depths would silently zero the retry history
   *  of every unit in flight: backpressure's maxRetries gate reads the map
   *  per live unit, so a restored run would re-issue storm after storm past
   *  the cap for the rest of THE LONG SAVE. */
  exportPending(): {
    readonly pending: readonly PendingReentry[];
    readonly depths: ReadonlyArray<readonly [EntityId, number]>;
  };
  importPending(
    checkpoint: {
      readonly pending: readonly PendingReentry[];
      readonly depths: ReadonlyArray<readonly [EntityId, number]>;
    },
    mintCounter: number,
  ): void;
  currentMintCounter(): number;
  /** rec#5 · cumulative targeted-purge diagnostics (host telemetry only —
   *  never enters GameState, events, or any digest). Frozen snapshot; the
   *  fallback counters must stay 0 in healthy default-step runs — with two
   *  by-design exceptions: `smallBoardSweeps` ticks on every purge of a
   *  sub-threshold board (indexing is off there intentionally), and
   *  `bootFallbacks` is legitimately 1 when a run is handed a state whose
   *  roster already carries admitted units (the first purge cannot attribute
   *  what it never watched serve). Every non-zero `attributedUnits` leak
   *  check reads this, not internals. */
  purgeStats(): {
    readonly targetPurges: number;
    readonly overflowFallbacks: number;
    readonly contradictionFallbacks: number;
    readonly forcedFallbacks: number;
    readonly bootFallbacks: number;
    readonly smallBoardSweeps: number;
    readonly verifyRuns: number;
    readonly resyncScans: number;
    readonly maxProbeNodes: number;
    readonly attributedUnits: number;
  };
}

/** Mint the initial GameState. Map INSERTION order is part of the
 *  deterministic identity (§3.4), so callers pass nodes/lanes/contracts in
 *  sorted order. */
export function createInitialState(options: {
  readonly runSeed: RunSeed;
  readonly engineVersion: string;
  readonly contentHashes: ReplayContentHashes;
  readonly clocks: ClockState;
  readonly nodes?: readonly NodeRecord[];
  readonly lanes?: readonly LaneStats[];
  readonly contracts?: readonly Contract[];
  readonly ruleBook?: readonly PolicyCard[];
  readonly ruleBookHash?: string;
  /** INTENT-DOOR embeds (optional — pre-door hosts digest unchanged). Pass a
   *  `hands`/`board` slice directly, or just `handCapacity` to mint a full
   *  idle rail (§7.5: T0–1 → 1 hand, T2 → 2 …). */
  readonly hands?: HandState;
  readonly handCapacity?: number;
  readonly board?: BoardState;
}): GameState {
  const nodes = new Map<EntityId, NodeRecord>();
  for (const node of options.nodes ?? []) nodes.set(node.id, node);
  const lanes = new Map<EntityId, LaneStats>();
  for (const lane of options.lanes ?? []) lanes.set(lane.laneId, lane);
  const contracts = new Map<EntityId, Contract>();
  for (const contract of options.contracts ?? []) contracts.set(contract.id, contract);
  const hands =
    options.hands ??
    (options.handCapacity !== undefined ? mintHandState(options.handCapacity) : undefined);
  return Object.freeze({
    runSeed: options.runSeed,
    engineVersion: options.engineVersion,
    contentHashes: options.contentHashes,
    context: Object.freeze({
      tick: tickOf(options.clocks, DEFAULT_TICK_US),
      minute: simMinuteOf(options.clocks),
      clocks: options.clocks,
    }),
    units: Object.freeze(new Map<EntityId, Unit>()),
    nodes: Object.freeze(nodes),
    lanes: Object.freeze(lanes),
    observed: Object.freeze(new Map<ObservedKey, ObservedCell<unknown>>()),
    cash: emptyMoneyBuckets(),
    ledgerSeq: 0,
    contracts: Object.freeze(contracts),
    ruleBook: Object.freeze([...(options.ruleBook ?? [])]),
    ruleBookHash: options.ruleBookHash ?? "",
    ...(hands !== undefined ? { hands } : {}),
    ...(options.board !== undefined ? { board: options.board } : {}),
  });
}

/**
 * `createTickDriver(steps, rng, clocks[, options])` — the §7.13 engine entry.
 * `rng` is the ROOT entropy handle: its key's runSeed must match
 * `state.runSeed` or the driver fails fast; per-step streams are opened BY
 * KEY, never by forking the root, so tick N's draws can never depend on tick
 * N−1's consumption order. `clocks` documents the run's clock origin (the
 * driver derives each tick's clocks from `state.context.clocks` — one clock
 * chain: the GameState's); pass the SAME clocks used for createInitialState.
 */
export function createTickDriver(
  steps: PipelineSlots,
  rng: RngStream,
  clocks: ClockState,
  options: TickDriverOptions = {},
): TickDriver {
  const tickAdvance: ClockAdvance = options.tickAdvance ?? {
    realElapsedUs: MICROS_PER_SEC,
    speed: 1 as SpeedFactor,
    incident: false,
  };
  const tickUs = options.tickUs ?? DEFAULT_TICK_US;
  if (tickUs !== DEFAULT_TICK_US) {
    throw new Error(
      `createTickDriver: custom tickUs ${tickUs}µs is not supported by the default step set (queue aging assumes one sim minute per tick)`,
    );
  }
  const rootSeed: RunSeed = rng.key.runSeed;
  const originClocks: ClockState = clocks; // validated identity anchor for the run
  const doorConfig: IntentDoorConfig = options.intents ?? {};
  const purgeProbeCap = options.purgeProbeCap ?? PURGE_PROBE_CAP_DEFAULT;
  if (!Number.isInteger(purgeProbeCap) || purgeProbeCap < 0) {
    throw new Error(
      `createTickDriver: purgeProbeCap ${purgeProbeCap} must be a non-negative integer (0 = always full sweep)`,
    );
  }
  const purgeVerifyTicks = options.purgeVerifyTicks ?? PURGE_VERIFY_TICKS_DEFAULT;
  if (!Number.isInteger(purgeVerifyTicks) || purgeVerifyTicks < 0) {
    throw new Error(
      `createTickDriver: purgeVerifyTicks ${purgeVerifyTicks} must be a non-negative integer (0 = never rescan, 1 = every tick)`,
    );
  }
  const purgeTargetedMinNodes = options.purgeTargetedMinNodes ?? PURGE_TARGETED_MIN_NODES_DEFAULT;
  if (!Number.isInteger(purgeTargetedMinNodes) || purgeTargetedMinNodes < 0) {
    throw new Error(
      `createTickDriver: purgeTargetedMinNodes ${purgeTargetedMinNodes} must be a non-negative integer (0 = always index)`,
    );
  }

  let pending: PendingReentry[] = [];
  let mintCounter = 0;
  const retryDepthById = new Map<EntityId, number>();
  let intentSeq = 0;
  /* rec#5 · cross-tick membership index (driver-internal, like
   * retryDepthById): unit → node ids whose queue/slot we have SEEN the unit
   * in via the serve step's own output channels. Cleared per terminal, never
   * enters state/events/digest, and needs no export/import hook — after a
   * checkpoint restore the same-tick serve signals rebuild every live
   * attribution before the terminal that consumes it can fire. */
  // Scalar EntityId = the common single-node attribution; a Set only exists
  // for the rare unit touching several nodes — zero Set allocation per join.
  const memberNodeOf = new Map<EntityId, EntityId | Set<EntityId>>();
  /* Per-node queue signature from the last tick we indexed: entry COUNT plus
   * head identity is enough to detect the only membership moves defaults
   * make (tail appends, head admit-shifts). A mismatch the arithmetic cannot
   * explain triggers a full rescan of that queue (loud, `resyncScans`). */
  const queueSigById = new Map<EntityId, QueueSignature>();
  /* Until the first advance we cannot know whether the handed state carried
   * pre-admitted slot occupants our assignment pass never saw occupy for —
   * the first purge on such a run takes one full sweep (`bootFallbacks`). */
  let bootSweep = false;
  let firstAdvanceSeen = false;
  let indexingWasActive = true;
  let purgeTicks = 0;
  const purgeCounters = {
    targetPurges: 0,
    overflowFallbacks: 0,
    contradictionFallbacks: 0,
    forcedFallbacks: 0,
    bootFallbacks: 0,
    smallBoardSweeps: 0,
    verifyRuns: 0,
    resyncScans: 0,
    maxProbeNodes: 0,
  };
  let attributionContradiction = false;

  function advance(state: GameState, inputs: TickInputs): TickResult {
    if (state.runSeed !== rootSeed) {
      throw new Error(
        `tick driver: state.runSeed ${state.runSeed} does not match root rng seed ${rootSeed}`,
      );
    }
    if (state.context.clocks.realUs < originClocks.realUs) {
      throw new Error("tick driver: state clocks run backwards vs the run origin");
    }
    UNIT_HOLD.clear(); // no hold may leak across ticks

    const clocksNow = advanceClocks(state.context.clocks, tickAdvance);
    const context = Object.freeze({
      tick: tickOf(clocksNow, tickUs),
      minute: simMinuteOf(clocksNow),
      clocks: clocksNow,
    });
    const simNow = clocksNow.simUs;
    const open = (domain: string) => streamFor(state.runSeed, domain, context.minute);

    /* ── THE INTENT DOOR (§7.13 canonical position: BEFORE step 1) ───────
       External intents execute in (tick, seq) order against the pre-arrival
       state: placed devices are routable THIS tick, board edges/hands/
       ruleBook mutate their named slices only, refusals are event-logged.
       No RNG stream is opened here — the door is pure insert. */
    const door = applyIntentDoor(state, context, inputs.externalIntents ?? [], doorConfig);
    const worked: GameState = door.state;
    if (!firstAdvanceSeen) {
      firstAdvanceSeen = true;
      if (worked.units.size > 0) {
        bootSweep = true; // pre-admitted occupants: our eyes never saw their occupy
      }
    }

    /* ── cross-tick memory: mature pending re-entries ─────────────────── */
    const matured: Unit[] = [];
    const stillPending: PendingReentry[] = [];
    for (const entry of pending) {
      if (entry.readyAtTick > context.tick) {
        stillPending.push(entry);
        continue;
      }
      const unitId = asEntityId(`re${mintCounter}@${context.tick}`);
      mintCounter += 1;
      retryDepthById.set(unitId, entry.retryDepth);
      matured.push(mintUnitFromDraft(entry.draft, unitId, context.tick));
    }
    pending = stillPending;

    /* ── step 1 · arrival (re-entries arrive THROUGH the same roster as
       fresh spawns — R-12: storms re-enter as new arrivals) ────────────── */
    const arrivalOut = steps.arrival({ context, envelopes: inputs.envelopes, rng: open("arrival") });

    // Tick roster: in-flight (GameState insertion order) → fresh arrivals →
    // matured re-entries (schedule order). All orders deterministic.
    let units: readonly Unit[] = [...worked.units.values(), ...arrivalOut.units, ...matured];
    const unitsById = new Map<EntityId, Unit>();
    for (const unit of units) unitsById.set(unit.id, unit);

    /* ── steps 2–4 · scoring → qos → route ────────────────────────────── */
    units = steps.scoring({ context, units, evidence: inputs.evidence }).units;
    units = steps.qosClassify({ context, units, classes: inputs.classes }).units;
    units = steps
      .route({
        context,
        units,
        nodes: worked.nodes,
        routingLocks: inputs.routingLocks ?? [],
        expressMaxConfidence: inputs.expressMaxConfidence,
        rng: open("route"),
      })
      .units;
    for (const unit of units) unitsById.set(unit.id, unit);

    /* ── step 5 · serve (slot-occupancy queueing core) ────────────────── */
    const serveOut = steps.serve({ context, units, nodes: worked.nodes });
    // R-06 class-aware shed (audit fix, §7.11): a hard-ceiling node sheds its WHOLE
    // residual queue each tick, but the order shed units enter the terminal ledger
    // follows each node's authored `shedOrder` law — cheap classes walk off first,
    // sold classes last, no-contract (unclassified) before them all, unitId breaks
    // every tie deterministically. Queue membership → node via routeHops[0]
    // (the FIX-8 queue-member-implies-hop invariant); foreign ghosts pass through
    // in place.
    const shed = orderShedForTick(serveOut.shed, worked.nodes, unitsById, inputs.classes);
    let nodes = serveOut.nodes;

    /* ── rec#5 · targeted-purge attribution ─────────────────────────────
       Index which node queues/slots could hold each unit, derived from the
       serve step's own output channels at near-zero steady-state cost:
       - assignments → slot occupy/release (a unit admitted while attributed
         to another node without releasing it is a contradiction);
       - per-node queue signature (entry COUNT + head identity): defaults
         only ever move queue membership by TAIL appends (joins) and HEAD
         admit-shifts, so the joiner increment `newLen − oldLen + admits` is
         attributed straight off the tail — no full-queue scan on healthy
         ticks. Arithmetic that cannot explain the queue (negative increment,
         head swap with no admits, unseen node) rescans that whole queue
         (loud `resyncScans`);
       - every `purgeVerifyTicks` the WAITING/SHED channels rebuild the index
         in full (`verifyRuns`) — a queued unit's hop IS its queue node (the
         FIX-8 invariant in defaults.ts), so shape-preserving drift (hop no
         longer naming the queue node, phantom waiters) trips the
         contradiction latch there.
        MUST run BEFORE the completion-slicing loop below mutates unitsById —
        the verify pass reads pre-slice routeHops. Contract for foreign
        steps: membership is only visible through these channels; drift
        lands in a loud full-sweep fallback EITHER way — the contradiction
        latch trips when an incremental signal sees it, and a same-tick
        reorder the tail-join/admit-shift arithmetic masks (queue count and
        head unchanged slips past every per-tick check) trips it no later
        than the next delayed verify sweep, within `purgeVerifyTicks`
        (default 8) ticks. The latch is the belt, the verify sweep the
        suspenders: no drift shape escapes both for longer than one window
        FOR STEPS PRESERVING THE QUEUE-MEMBER-IMPLIES-HOP INVARIANT (the
        FIX-8 defaults guarantee) — a foreign step that breaks that invariant
        itself (a queue member whose hop lies about its node) is exactly the
        hop-lie class this ladder does NOT cover: verify re-attributes such a
        member to the lied-to hop, so the contradiction rides on the tail/
        admit arithmetic alone. */
    attributionContradiction = false;
    const indexingActive = nodes.size >= purgeTargetedMinNodes;
    if (indexingActive && !indexingWasActive) bootSweep = true; // cold re-entry
    indexingWasActive = indexingActive;
    if (indexingActive) {
      purgeTicks += 1;
      const admitUnitsByNode = new Map<EntityId, Set<EntityId>>();
      for (const assignment of serveOut.assignments) {
        if (!assignment.blocked && assignment.serviceStartUs === simNow) {
          let admits = admitUnitsByNode.get(assignment.nodeId);
          if (admits === undefined) {
            admits = new Set<EntityId>();
            admitUnitsByNode.set(assignment.nodeId, admits);
          }
          admits.add(assignment.unitId); // a multi-slot admit shifts the queue exactly once
        }
        const releases = !assignment.blocked && assignment.serviceStartUs < simNow;
        if (
          attributeMembership(
            memberNodeOf,
            assignment.unitId,
            assignment.nodeId,
            releases ? "release" : "occupy",
          )
        ) {
          attributionContradiction = true;
        }
      }
      const verifyThisTick = purgeVerifyTicks > 0 && purgeTicks % purgeVerifyTicks === 0;
      if (verifyThisTick) purgeCounters.verifyRuns += 1;
      for (const record of nodes.values()) {
        // values() not entries(): no per-node pair allocation on the hot loop
        const nodeId = record.id;
        const queue = record.queue;
        const signature = queueSigById.get(nodeId);
        if (signature === undefined) {
          for (const unitId of queue) {
            if (attributeMembership(memberNodeOf, unitId, nodeId, "occupy")) {
              attributionContradiction = true;
            }
          }
          queueSigById.set(nodeId, { len: queue.length, head: queue[0] });
          continue;
        }
        // Idle-quiet node: still empty, nothing joined, nothing moved. This is
        // the overwhelming majority on a large board — read two numbers, skip.
        if (queue.length === 0 && signature.len === 0) continue;
        const admits = admitUnitsByNode.get(nodeId)?.size ?? 0;
        const joins = queue.length - signature.len + admits;
        const headSwapped =
          admits === 0 && signature.len > 0 && queue.length > 0 && queue[0] !== signature.head;
        if (joins < 0 || headSwapped) {
          purgeCounters.resyncScans += 1;
          for (const unitId of queue) {
            if (attributeMembership(memberNodeOf, unitId, nodeId, "occupy")) {
              attributionContradiction = true;
            }
          }
        } else {
          for (let i = queue.length - joins; i < queue.length; i += 1) {
            const unitId = queue[i];
            if (unitId === undefined) continue; // unreachable: i < queue.length
            if (attributeMembership(memberNodeOf, unitId, nodeId, "occupy")) {
              attributionContradiction = true;
            }
          }
        }
        signature.len = queue.length; // in-place: the map never churns records
        signature.head = queue[0];
      }
      if (queueSigById.size > nodes.size) {
        // Retired nodes: prune so the auxiliary map cannot grow unbounded. A
        // re-added node rescans its queue as unseen — safe, attribution is
        // additive-only until a purge consumes it.
        for (const nodeId of [...queueSigById.keys()]) {
          if (!nodes.has(nodeId)) queueSigById.delete(nodeId);
        }
      }
      if (verifyThisTick) {
        for (const unitId of serveOut.waiting) {
          const hop = unitsById.get(unitId)?.routeHops[0];
          if (hop === undefined) {
            attributionContradiction = true; // queued unit unknown to the roster / no hop
            continue;
          }
          if (attributeMembership(memberNodeOf, unitId, hop, "occupy")) {
            attributionContradiction = true;
          }
        }
        for (const unitId of shed) {
          const hop = unitsById.get(unitId)?.routeHops[0];
          if (hop === undefined) {
            attributionContradiction = true;
            continue;
          }
          if (attributeMembership(memberNodeOf, unitId, hop, "occupy")) {
            attributionContradiction = true;
          }
        }
      }
    }

    // Derive hop progress from the assignment ledger (ServeOut has no units
    // channel — contract friction, documented in defaults.ts):
    //   new start ⇒ serviceStartUs == simNow; completion ⇒ blocked=false and
    //   serviceStartUs < simNow; hold ⇒ blocked=true.
    const completedNodes = new Map<EntityId, EntityId>();
    const newlyAdmittedIds = new Set<EntityId>();
    const heldIds = new Set<EntityId>();
    // A multi-slot unit (R-32 "size ≠ 1") completes with ONE assignment PER
    // slot, all sharing releasedAtUs. Hop progress must fire once per
    // (unitId, nodeId) per tick, else consecutive same-node hops double-
    // advance the route and double-charge the latency (FIX-2).
    const completionSeen = new Set<string>();
    for (const assignment of serveOut.assignments) {
      const unit = unitsById.get(assignment.unitId);
      if (unit === undefined) continue;
      if (assignment.blocked) {
        heldIds.add(assignment.unitId);
        continue;
      }
      if (assignment.serviceStartUs === simNow) {
        newlyAdmittedIds.add(assignment.unitId);
        continue;
      }
      const completionKey = `${assignment.unitId}>${assignment.nodeId}`;
      if (completionSeen.has(completionKey)) continue;
      completionSeen.add(completionKey);
      if (unit.routeHops[0] === assignment.nodeId) {
        const hopTime = nodeServiceTime(nodes, assignment.nodeId);
        unitsById.set(
          assignment.unitId,
          withUnit(unit, {
            routeHops: Object.freeze(unit.routeHops.slice(1)),
            accumulatedLatencyUs: unit.accumulatedLatencyUs + hopTime,
            waitingOn: null,
          }),
        );
        completedNodes.set(assignment.unitId, assignment.nodeId);
      }
    }
    const downstreamOfHold = new Map<EntityId, EntityId>();
    for (const unitId of heldIds) {
      const hold = UNIT_HOLD.get(unitId);
      if (hold !== undefined) downstreamOfHold.set(unitId, hold);
    }

    /* ── step 6 · queue wait (analytic hockey stick, R-07) ────────────── */
    const queueWaitInput: QueueWaitInputSafe = {
      context,
      waiting: serveOut.waiting,
      nodes,
      kneeRho: inputs.kneeRho ?? DEFAULT_KNEE_RHO,
    };
    const queueWaitOut = steps.queueWait(queueWaitInput);

    // Real elapsed aging: queued and dependency-held units pay one tick of
    // sim time per tick they don't move (minute-granular honesty; the
    // analytic curve stays a PREDICTION fed to step 9, never double-stamped).
    const queuedSet = new Set<EntityId>(serveOut.waiting);
    units = units.map((unit) => {
      const tracked = unitsById.get(unit.id) ?? unit;
      const ages = queuedSet.has(tracked.id) || heldIds.has(tracked.id);
      return ages
        ? withUnit(tracked, { accumulatedLatencyUs: tracked.accumulatedLatencyUs + TICK_US })
        : tracked;
    });
    for (const unit of units) unitsById.set(unit.id, unit);

    /* ── step 7 · inspect (admitted-this-tick units: once per hop) ────── */
    const depths = new Map<EntityId, InspectionDepth>();
    for (const node of nodes.values()) depths.set(node.id, node.inspectionDepth);
    const admittedUnits = units.filter((unit) => newlyAdmittedIds.has(unit.id));
    const inspectOut = steps.inspect({
      context,
      units: admittedUnits,
      depths,
      aggression: inputs.aggression,
      rng: open("inspect"),
    });
    const blockedByInspection = new Map<EntityId, EntityId>();
    for (const verdict of inspectOut.verdicts) {
      const unit = unitsById.get(verdict.unitId);
      if (unit === undefined) continue;
      unitsById.set(
        verdict.unitId,
        withUnit(unit, { inspectionCostUs: unit.inspectionCostUs + verdict.costUs }),
      );
      if (verdict.blocked) blockedByInspection.set(verdict.unitId, verdict.nodeId);
    }
    units = units.map((unit) => unitsById.get(unit.id) ?? unit);

    /* ── step 8 · dependency block (formalize + edge-validate, R-09) ──── */
    const dependencyOut = steps.dependencyBlock({
      context,
      assignments: serveOut.assignments,
      edges: inputs.dependencyEdges,
    });
    const confirmedBlocks = new Set<EntityId>();
    for (const block of dependencyOut.blocks) confirmedBlocks.add(block.unitId);
    units = units.map((unit) => {
      const stillHeld = confirmedBlocks.has(unit.id) && !blockedByInspection.has(unit.id);
      const nextWaiting = stillHeld ? (downstreamOfHold.get(unit.id) ?? unit.waitingOn) : null;
      if (unit.waitingOn === nextWaiting) return unit;
      return withUnit(unit, { waitingOn: nextWaiting });
    });
    for (const unit of units) unitsById.set(unit.id, unit);
    // Holds step 8 could not validate against the edge list are orphaned —
    // release their waitingOn so a graph drift can never wedge capacity.
    const orphanHolds: EntityId[] = [];
    for (const unitId of heldIds) {
      if (!confirmedBlocks.has(unitId)) orphanHolds.push(unitId);
    }
    if (orphanHolds.length > 0) nodes = releaseHolds(nodes, orphanHolds);

    /* ── step 9 · patience check (R-60 LUT bounces) ───────────────────── */
    const patienceOut = steps.patienceCheck({ context, units, waits: queueWaitOut.waits });
    const bouncedSet = new Set<EntityId>();
    for (const unitId of patienceOut.bounced) {
      if (blockedByInspection.has(unitId) || !unitsById.has(unitId)) continue;
      bouncedSet.add(unitId);
    }

    /* ── step 10 · outcome (the four terminals, R-11) ─────────────────── */
    const candidates: OutcomeCandidate[] = [];
    const candidateSeen = new Set<EntityId>();
    const pushCandidate = (unitId: EntityId, preset: OutcomeCandidate["terminal"]): void => {
      if (candidateSeen.has(unitId)) return;
      const unit = unitsById.get(unitId);
      if (unit === undefined) return;
      candidateSeen.add(unitId);
      const done = completedNodes.get(unitId);
      const reachedGoal = unit.routeHops.length === 0 && done !== undefined;
      candidates.push(
        Object.freeze({
          unitId,
          nodeId: done ?? unit.routeHops[0] ?? null,
          targetId: reachedGoal ? (done ?? null) : null,
          terminal: preset,
        }),
      );
    };
    for (const unitId of shed) {
      // R8 F-2 · R-06 hard-ceiling shed: terminal like a bounce (SILENT — no
      // explosion, no alarm), pushed BEFORE the roster loop so the "bounced"
      // preset wins `candidateSeen`. The roster loop's null-preset push used
      // to land first and the preset was dropped — shed units resolved to no
      // terminal, survived the purge, re-joined and were shed again: every
      // hard ceiling was an immortal-unit factory. Same observable shape as a
      // patience bounce (the preset branch of resolveTerminal: cause
      // `outcome:<unitId>`, event kind "bounced" naming the shedding node);
      // backpressure R-12 takes shed through that same "bounced" branch — its
      // benign gate admits the whole bounced/FP list, and sheds are benign.
      pushCandidate(unitId, "bounced");
    }
    for (const unit of units) {
      if (unit.routeHops.length === 0 && !completedNodes.has(unit.id)) {
        // Parked zombie (FIX-7): empty route, completed nothing — it can
        // never queue, never age through the queue path, never terminate.
        // Idle-reap it once its patience budget is spent so a mis-authored
        // (empty) path cannot leak units into the roster forever.
        const idleUs = (context.tick - unit.arrivedAtTick) * TICK_US;
        if (idleUs > unit.patienceUs) pushCandidate(unit.id, "bounced");
        continue;
      }
      if (bouncedSet.has(unit.id) || blockedByInspection.has(unit.id)) continue;
      pushCandidate(unit.id, null);
    }
    for (const unitId of bouncedSet) pushCandidate(unitId, "bounced");
    for (const unitId of blockedByInspection.keys()) pushCandidate(unitId, null);

    const outcomeInput: OutcomeInputSafe = {
      context,
      candidates,
      inspections: inspectOut.verdicts,
      bounced: [...bouncedSet],
      completed: [...completedNodes.keys()].filter(
        (id) => (unitsById.get(id)?.routeHops.length ?? 1) === 0,
      ),
      valueByUnit: inputs.valueByUnit ?? new Map<EntityId, Fixed>(),
      rng: open("outcome"),
      unitsById,
    };
    const outcomeOut = steps.outcome(outcomeInput);
    const terminalById = new Map<EntityId, Outcome>();
    for (const outcome of outcomeOut.outcomes) terminalById.set(outcome.unitId, outcome);

    // Purge terminals from slots/queues BEFORE economics observes the nodes.
    // rec#5: walk ONLY the nodes attributed to this tick's terminals; the
    // full-board sweep survives as a LOUD fallback (each branch counts —
    // a silent fallback would hide a mis-maintained index until a digest
    // moves, which is exactly the debugging pain the ladder refuses).
    if (terminalById.size > 0) {
      const doomed = new Set<EntityId>(terminalById.keys());
      const probe = collectProbeNodes(memberNodeOf, doomed);
      if (!indexingActive) {
        purgeCounters.smallBoardSweeps += 1;
        nodes = purgeSweep(nodes, doomed);
        syncQueueSignatures(queueSigById, nodes);
      } else if (
        purgeProbeCap === 0 ||
        bootSweep ||
        attributionContradiction ||
        probe.size > purgeProbeCap
      ) {
        bootSweep = false;
        if (purgeProbeCap === 0) purgeCounters.forcedFallbacks += 1;
        else if (attributionContradiction) purgeCounters.contradictionFallbacks += 1;
        else if (probe.size > purgeProbeCap) purgeCounters.overflowFallbacks += 1;
        else purgeCounters.bootFallbacks += 1;
        nodes = purgeSweep(nodes, doomed);
        syncQueueSignatures(queueSigById, nodes);
      } else {
        purgeCounters.targetPurges += 1;
        if (probe.size > purgeCounters.maxProbeNodes) {
          purgeCounters.maxProbeNodes = probe.size;
        }
        nodes = purgeTargeted(nodes, doomed, probe);
        // The purge shrinks queues AFTER the attribution pass recorded its
        // signatures — refresh the touched ones so next tick's serve input
        // is what the arithmetic predicts (else every post-purge tick would
        // read a phantom contraction and rescan).
        for (const nodeId of probe) {
          const record = nodes.get(nodeId);
          const signature = record === undefined ? undefined : queueSigById.get(nodeId);
          if (record !== undefined && signature !== undefined) {
            signature.len = record.queue.length;
            signature.head = record.queue[0];
          }
        }
      }
    }

    /* ── step 11 · backpressure (storm engine, R-12) ──────────────────── */
    const backpressureInput: BackpressureInputSafe = {
      context,
      outcomes: outcomeOut.outcomes,
      policy: inputs.retryPolicy,
      stormFactor: inputs.stormFactor ?? FIXED_UNIT,
      rng: open("backpressure"),
      unitsById,
      retryDepthById,
    };
    const backpressureOut = steps.backpressure(backpressureInput);
    for (const draft of backpressureOut.reentries) {
      const depth = draft.retryOf === null ? 0 : (retryDepthById.get(draft.retryOf) ?? 0) + 1;
      const lineageRoot = lineageRootOf(draft, unitsById);
      const backoffUs =
        draft.retryOf === null
          ? 0n
          : inputs.retryPolicy.backoffBaseUs * 2n ** BigInt(Math.min(depth, 20));
      const jitterUs =
        draft.retryOf !== null && inputs.retryPolicy.jitterPurchased
          ? BigInt(streamFor(state.runSeed, "backoff", context.minute, lineageRoot).range(1_000_000))
          : 0n;
      const delayTicks = (backoffUs + jitterUs + TICK_US - 1n) / TICK_US;
      pending.push(
        Object.freeze({
          draft,
          readyAtTick: context.tick + delayTicks,
          retryDepth: depth,
          lineageRoot,
        }),
      );
    }

    /* ── step 12 · state economics (SINGLE observed-layer writer) ─────── */
    const economicsOut = steps.stateEconomics({
      context,
      prior: worked,
      outcomes: outcomeOut.outcomes,
      reentries: backpressureOut.reentries,
      nodes,
      lanes: inputs.lanes ?? worked.lanes,
    });
    const observed = new Map<ObservedKey, ObservedCell<unknown>>(worked.observed);
    for (const write of economicsOut.observedWrites) observed.set(write.key, write.cell);
    const lanes = new Map<EntityId, LaneStats>();
    for (const lane of economicsOut.laneStats) lanes.set(lane.laneId, lane);

    /* ── step 12.5 · rule phase (delegates to the passed interpreter) ─── */
    const ruleOut = steps.rulePhase({
      context,
      observed,
      book: worked.ruleBook,
      suppressed: inputs.suppressedRuleIds ?? [],
      rng: open("rules"),
    });
    const intents: PlayerIntent[] = ruleOut.intents.map((intent) =>
      Object.freeze({ ...intent, seq: (intentSeq += 1) }),
    );

    /* ── rebuild GameState (immutable-by-convention) ──────────────────── */
    const nextUnits = new Map<EntityId, Unit>();
    for (const unit of units) {
      if (terminalById.has(unit.id)) {
        retryDepthById.delete(unit.id);
        UNIT_HOLD.delete(unit.id);
        continue;
      }
      const tracked = unitsById.get(unit.id) ?? unit;
      nextUnits.set(tracked.id, tracked);
    }
    const nextLedgerSeq = economicsOut.ledgerEntry === null ? worked.ledgerSeq : worked.ledgerSeq + 1;
    const next: GameState = Object.freeze({
      ...worked,
      context,
      units: Object.freeze(nextUnits),
      nodes,
      lanes: Object.freeze(lanes),
      observed: Object.freeze(observed),
      cash: economicsOut.cash,
      ledgerSeq: nextLedgerSeq,
    });

    const events: SimEvent[] = [
      ...door.events, // the door is canonically BEFORE step 1
      ...arrivalOut.events,
      ...outcomeOut.events,
      ...backpressureOut.events,
      ...economicsOut.events,
    ];
    return Object.freeze({
      state: next,
      events: Object.freeze(events),
      outcomes: outcomeOut.outcomes,
      ruleFirings: ruleOut.firings,
      intents: Object.freeze(intents),
      doorReceipts: door.receipts,
      pressure: backpressureOut.pressure,
      pendingReentries: pending.length,
    });
  }

  return Object.freeze({
    advance,
    exportPending: () =>
      Object.freeze({
        pending: Object.freeze(pending.map((entry) => Object.freeze({ ...entry }))),
        /* F6 · live units' storm depths ride the checkpoint: pending entries
         * carry their own `retryDepth`, but a unit already in the roster must
         * remember its depth so its NEXT bounce increments from truth and the
         * maxRetries gate keeps binding post-restore. `sortedIds` — this array
         * is a serialization payload (save/replay), never a Map snapshot. */
        depths: Object.freeze(
          sortedIds(retryDepthById.keys()).map((id) =>
            Object.freeze([id, retryDepthById.get(id) ?? 0] as [EntityId, number]),
          ),
        ),
      }),
    importPending(
      checkpoint: Parameters<TickDriver["importPending"]>[0],
      mintCounterValue: number,
    ): void {
      pending = checkpoint.pending.map((entry) => Object.freeze({ ...entry }));
      retryDepthById.clear();
      for (const [unitId, depth] of checkpoint.depths) retryDepthById.set(unitId, depth);
      mintCounter = mintCounterValue;
    },
    currentMintCounter: () => mintCounter,
    purgeStats: () =>
      Object.freeze({
        targetPurges: purgeCounters.targetPurges,
        overflowFallbacks: purgeCounters.overflowFallbacks,
        contradictionFallbacks: purgeCounters.contradictionFallbacks,
        forcedFallbacks: purgeCounters.forcedFallbacks,
        bootFallbacks: purgeCounters.bootFallbacks,
        smallBoardSweeps: purgeCounters.smallBoardSweeps,
        verifyRuns: purgeCounters.verifyRuns,
        resyncScans: purgeCounters.resyncScans,
        maxProbeNodes: purgeCounters.maxProbeNodes,
        attributedUnits: memberNodeOf.size,
      }),
  });
}

/* ═══════════════════ input structs with driver extensions ═══════════════════
 * Declared as named types (not inline literals) so the extra, step-private
 * fields pass type-checking contravariantly against the frozen TickStep
 * signatures — foreign steps simply never see them. */

type QueueWaitInputSafe = QueueWaitIn;

interface OutcomeInputSafe extends OutcomeIn {
  readonly unitsById: ReadonlyMap<EntityId, Unit>;
}

interface BackpressureInputSafe extends BackpressureIn {
  readonly unitsById: ReadonlyMap<EntityId, Unit>;
  readonly retryDepthById: ReadonlyMap<EntityId, number>;
}

/* ═══════════════════════════ internal mechanics ═══════════════════════════ */

function mintUnitFromDraft(draft: UnitDraft, id: EntityId, tick: SimTick): Unit {
  return Object.freeze({
    id,
    type: draft.type,
    sizeCost: draft.sizeCost,
    patienceUs: draft.patienceUs,
    trueIntent: draft.trueIntent,
    source: draft.source,
    retryOf: draft.retryOf,
    arrivedAtTick: tick,
    accumulatedLatencyUs: 0n,
    inspectionCostUs: 0n,
    confidence: FIXED_ZERO,
    qosClassId: null,
    routeHops: [],
    waitingOn: null,
  });
}

function nodeServiceTime(nodes: ReadonlyMap<EntityId, NodeRecord>, nodeId: EntityId): SimTimeUs {
  return nodes.get(nodeId)?.serviceTimeUs ?? 0n;
}

/** rec#5 default probe cap: a tick whose terminals are attributed to more
 *  distinct nodes than this falls back to the full sweep. Comfortably above
 *  typical terminal bursts the default step set produces (outcome terminals
 *  are per-unit; a hard-ceiling drain touches ONE node per shed queue). A
 *  pathological cross-board bounce wave CAN exceed it — that is not a fault,
 *  it costs one counted full sweep; the cap trades rare extra sweeps against
 *  per-tick index bookkeeping. */
const PURGE_PROBE_CAP_DEFAULT = 64;

/** rec#5 default WAITING/SHED rebuild cadence: every 8th tick pays the
 *  full waiter scan; between them the incremental tail/shift index plus its
 *  anomaly rescan governs. 8 keeps the amortised cost under a microsecond
 *  per tick on fat-queue boards while bounding the drift-detection window
 *  far below the patience time-out any terminal in that window would need. */
const PURGE_VERIFY_TICKS_DEFAULT = 8;

/** rec#5 · below this board size the sweep costs under a microsecond while
 *  the per-tick index maintenance is a comparable constant — targeted purge
 *  simply is not worth switching on until the board has somewhere to hide
 *  the walk. 8 keeps 2–3-node test/audit boards on the sweep path by default;
 *  the index-focused tests pin `purgeTargetedMinNodes: 0` precisely because
 *  0 means ALWAYS index — forcing the indexed arm on tiny fixtures — while
 *  the default gate itself is pinned by the no-override small-board test. */
const PURGE_TARGETED_MIN_NODES_DEFAULT = 8;

/** rec#5 · one membership write on the attribution index. Returns TRUE when
 *  the write contradicted the recorded attribution — a unit occupying a node
 *  it was never released from, or a release while still attributed
 *  elsewhere. Contradictions are recorded CONSERVATIVELY (the node is still
 *  added), so the probe stays a superset of true membership even after the
 *  fallback tick; the latch only makes the next purge walk the whole board.
 *  A release for a unit with no attribution at all is benign: a checkpoint
 *  restore starts the index cold and the serve slot was already freed by
 *  the release itself. */
function attributeMembership(
  memberNodeOf: Map<EntityId, EntityId | Set<EntityId>>,
  unitId: EntityId,
  nodeId: EntityId,
  mode: "occupy" | "release",
): boolean {
  const attributed = memberNodeOf.get(unitId);
  if (mode === "occupy") {
    if (attributed === undefined) {
      memberNodeOf.set(unitId, nodeId); // scalar fast path
      return false;
    }
    if (typeof attributed === "string") {
      if (attributed === nodeId) return false;
      memberNodeOf.set(unitId, new Set<EntityId>([attributed, nodeId])); // promote
      return true; // attributed to another node without ever releasing it
    }
    if (attributed.has(nodeId)) return false;
    attributed.add(nodeId); // conservative superset
    return true;
  }
  if (attributed === undefined) return false;
  if (typeof attributed === "string") {
    if (attributed === nodeId) {
      memberNodeOf.delete(unitId);
      return false;
    }
    return true; // releasing a node we never indexed while held elsewhere
  }
  attributed.delete(nodeId);
  if (attributed.size === 0) {
    memberNodeOf.delete(unitId);
    return false;
  }
  if (attributed.size === 1) {
    const [remaining] = attributed;
    memberNodeOf.set(unitId, remaining as EntityId); // demote back to scalar
  }
  return true; // still a member somewhere else
}

/** rec#5 · union of the nodes attributed to the doomed units; consumption
 *  clears their index entries (a terminal is no longer anyone's member). */
function collectProbeNodes(
  memberNodeOf: Map<EntityId, EntityId | Set<EntityId>>,
  doomed: ReadonlySet<EntityId>,
): Set<EntityId> {
  const probe = new Set<EntityId>();
  for (const unitId of doomed) {
    const attributed = memberNodeOf.get(unitId);
    if (attributed === undefined) continue;
    if (typeof attributed === "string") probe.add(attributed);
    else for (const nodeId of attributed) probe.add(nodeId);
    memberNodeOf.delete(unitId);
  }
  return probe;
}

/** rec#5 · re-record every queue signature from the post-purge board: the
 *  sweep removed doomed units from queues the attribution pass had just
 *  indexed pre-purge, and the arithmetic must describe the NEXT serve input. */
/** rec#5 · per-node queue signature (count + head identity), driver-internal,
 *  mutated in place — never leaves the driver closure. */
interface QueueSignature {
  len: number;
  head: EntityId | undefined;
}

function syncQueueSignatures(
  queueSigById: Map<EntityId, QueueSignature>,
  nodes: ReadonlyMap<EntityId, NodeRecord>,
): void {
  for (const record of nodes.values()) {
    const nodeId = record.id;
    const signature = queueSigById.get(nodeId);
    if (signature === undefined) {
      queueSigById.set(nodeId, { len: record.queue.length, head: record.queue[0] });
    } else {
      signature.len = record.queue.length;
      signature.head = record.queue[0];
    }
  }
}

/** Remove terminal units from ONE node record: same identity when the node
 *  holds none of them, else a fresh frozen record. ρ refreshed with the ONE
 *  shared helper (queue.utilization — same rounding + ceiling the serve step
 *  uses, FIX-6). */
function purgeNodeTerminals(
  node: NodeRecord,
  doomed: ReadonlySet<EntityId>,
): NodeRecord {
  const queue = node.queue.filter((id) => !doomed.has(id));
  let changed = queue.length !== node.queue.length;
  const slots = node.slots.map((slot) => {
    if (slot.occupied && slot.unitId !== null && doomed.has(slot.unitId)) {
      changed = true;
      return Object.freeze({
        occupied: false,
        unitId: null,
        waitingOn: null,
        releasedAtUs: null,
      }) satisfies NodeSlotRecord;
    }
    return slot;
  });
  return changed
    ? Object.freeze({
        ...node,
        slots: Object.freeze(slots),
        queue: Object.freeze(queue),
        queueDepth: queue.length,
        utilizationRho: utilization({ ...node, slots }),
      })
    : node;
}

/** Full-board sweep: every node visited in pinned sorted order into a fresh
 *  map. The pre-rec#5 path, kept as the loud fallback. */
function purgeSweep(
  nodes: ReadonlyMap<EntityId, NodeRecord>,
  doomed: ReadonlySet<EntityId>,
): ReadonlyMap<EntityId, NodeRecord> {
  const next = new Map<EntityId, NodeRecord>();
  for (const nodeId of sortedIds(nodes.keys())) {
    const node = nodes.get(nodeId);
    if (node === undefined) continue;
    next.set(nodeId, purgeNodeTerminals(node, doomed));
  }
  return next;
}

/** rec#5 · targeted purge: walk ONLY the probe-attributed nodes (in pinned
 *  sorted order for a deterministic visit sequence), cloning the map
 *  copy-on-write on first change. Returning the input identity when nothing
 *  changed is legal — allocation identity is unobservable (rec#2 law) and
 *  digestState sorts node keys. Unknown probe nodes are skipped (a forged
 *  board that queues at a node absent from `nodes` is outside the contract;
 *  the queue-hop attribution pass above already latched a contradiction for
 *  its roster ghost, and the fallback sweep covers the purge itself). */
function purgeTargeted(
  nodes: ReadonlyMap<EntityId, NodeRecord>,
  doomed: ReadonlySet<EntityId>,
  probe: ReadonlySet<EntityId>,
): ReadonlyMap<EntityId, NodeRecord> {
  let next: Map<EntityId, NodeRecord> | undefined;
  for (const nodeId of sortedIds(probe)) {
    const node = nodes.get(nodeId);
    if (node === undefined) continue;
    const purged = purgeNodeTerminals(node, doomed);
    if (purged === node) continue;
    if (next === undefined) next = new Map(nodes);
    next.set(nodeId, purged); // existing key: insertion position preserved
  }
  return next ?? nodes;
}

/** Release orphaned (step-8-unvalidated) holds: clear waitingOn so the slot
 *  completes normally next tick — a graph drift must never wedge capacity. */
function releaseHolds(
  nodes: ReadonlyMap<EntityId, NodeRecord>,
  unitIds: readonly EntityId[],
): ReadonlyMap<EntityId, NodeRecord> {
  const freed = new Set<EntityId>(unitIds);
  const next = new Map<EntityId, NodeRecord>();
  for (const nodeId of sortedIds(nodes.keys())) {
    const node = nodes.get(nodeId);
    if (node === undefined) continue;
    let changed = false;
    const slots = node.slots.map((slot) => {
      if (slot.waitingOn !== null && slot.unitId !== null && freed.has(slot.unitId)) {
        changed = true;
        return Object.freeze({ ...slot, waitingOn: null });
      }
      return slot;
    });
    next.set(nodeId, changed ? Object.freeze({ ...node, slots: Object.freeze(slots) }) : node);
  }
  return next;
}

/** Follow retryOf lineage to the original visitor id (stable backoff key). */
function lineageRootOf(draft: UnitDraft, unitsById: ReadonlyMap<EntityId, Unit>): EntityId {
  let cursor: EntityId = draft.retryOf ?? asEntityId(draft.type);
  let guard = 0;
  for (;;) {
    const unit = unitsById.get(cursor);
    if (unit === undefined || unit.retryOf === null || guard > 64) return cursor;
    cursor = unit.retryOf;
    guard += 1;
  }
}
