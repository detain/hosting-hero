/**
 * §7.7 recovery half v0 — the failure→recovery substrate as a PURE OBSERVER.
 *
 * Spec anchors (hosting_game.md, §7.7 headings 27513–27620):
 *  - The Second Failure Window (27513): "you cannot survive another failure
 *    right now" — a danger timer that runs from failure until redundancy is
 *    restored; a NEW failure inside the window after a recovery costs more
 *    (longer ramp, `second-failure` mark).
 *  - Recovery is gameplay (27530) + Partial restore and prioritised
 *    recovery (27612): recovery is not instant — a finite `recoveryCrewSlots`
 *    serializes who ramps when, and `setRecoveryPriority` is the "restore
 *    your whale first" knob.
 *  - Cold-cache thundering herd counter (27569): the gradual restore ramp —
 *    capacity rises from the safe-mode floor to full over the incident's
 *    ramp (slow-start / gradual traffic admission).
 *  - Degradation Debt (27577) seed: every observed minute below full
 *    capacity accrues `degradedMinutes` per node (the meter only — the
 *    catch-up overload event is future work).
 *  - The Failback Problem (27620): "getting home is harder than leaving" —
 *    after the ramp completes, steer-back is HELD for `failbackDelayMinutes`
 *    (`acceptsFailback`) so returning traffic doesn't immediately
 *    re-overload a just-recovered node.
 *  - Blameless post-mortem hook (27674 machinery): `markBlamelessPostmortem`
 *    credits the node; the NEXT failure's escalation EXCESS is halved and
 *    the credit consumed — the §5.10 honestHostFloor precedent (economy/
 *    reputation.ts): transparency insurance pays exactly once per incident.
 *
 * Integration stance (digest-switch friendly): this module NEVER touches
 * GameState. The host runs its driver normally and folds each tick's
 * `TickResult.events` through `observeRecoveryTick`; the derived capacity
 * reading (`recoveryCapacityBps`) is an OUT the host applies to node slots.
 * Nothing here mints money, SimEvents, or RNG rolls — recovery is a
 * consequence-shaping read-model until an owner call wires it into the tick.
 * Proven digest-neutral by pipeline/__tests__/recovery.test.ts (wired vs
 * bare driver run ×100, byte-equal digestState chains — the 71b8960
 * observer-seam precedent).
 *
 * Money side lives in economy/recovery.ts (restore-action opex drafts + the
 * rebuild-vs-restart table). This file imports ONLY ../types (module law).
 */

import { asCauseId, type CauseId, type EntityId, type SimEvent, type SimMinute } from "../../types.ts";

/* ────────────────────────────── closed vocab ─────────────────────────────── */

/** The four phases, in lifecycle order. A node with no record is `healthy`. */
export const RECOVERY_PHASES = ["healthy", "failed", "recovering", "recovered"] as const;
export type RecoveryPhase = (typeof RECOVERY_PHASES)[number];

/** Observer-local transition names (NOT SimEvent kinds — these never enter
 *  the replay log; chrome/attribution consumers read them from the host). */
export const RECOVERY_TRANSITION_KINDS = [
  "node-failed",
  "second-failure",
  "recovery-started",
  "recovery-completed",
  "postmortem-credited",
] as const;
export type RecoveryTransitionKind = (typeof RECOVERY_TRANSITION_KINDS)[number];

export interface RecoveryTransition {
  readonly kind: RecoveryTransitionKind;
  readonly nodeId: EntityId;
  readonly atMinute: SimMinute;
  /** `recovery:<kind>:<nodeId>:<minute>` — stable cause end-to-end, house
   *  style. */
  readonly causeId: CauseId;
  /** Machine-readable note (e.g. "ramp=60 escalated", "credit consumed"). */
  readonly detail: string | null;
}

/* ─────────────────────────────── the record ──────────────────────────────── */

export interface NodeRecoveryRecord {
  readonly nodeId: EntityId;
  readonly phase: RecoveryPhase;
  /** Lifetime failure count (≥1 once a record exists). */
  readonly failures: number;
  /** Start of the CURRENT incident (null only before the first failure). */
  readonly failedAtMinute: SimMinute | null;
  /** Minute the ramp actually began (crew-permitted). */
  readonly recoveringAtMinute: SimMinute | null;
  /** Effective ramp length for the current incident — escalated/halved at
   *  failure time, then frozen (the number cannot drift mid-incident). */
  readonly rampMinutes: number;
  /** Exact completion minute of the LAST ramp (the window anchor). */
  readonly recoveredAtMinute: SimMinute | null;
  /** Minute steer-back unlocks (completion + failback hold). */
  readonly failbackEligibleAtMinute: SimMinute | null;
  /** The current incident opened inside the previous recovery's window. */
  readonly secondFailure: boolean;
  /** §5.10-style once-credit: halves the NEXT failure's escalation excess. */
  readonly postmortemCredit: boolean;
  /** Degradation-debt meter: observed minutes spent below full capacity. */
  readonly degradedMinutes: number;
  /** Crew-queue order override (higher goes first). */
  readonly priority: number;
}

export interface RecoveryTrackerState {
  /** Last observed clock — monotonic (re-observing the same minute is
   *  legal and double-counts nothing; going backwards throws). */
  readonly minute: SimMinute;
  /** Only nodes that ever failed appear here; iteration order is sorted by
   *  node id (codepoint) — insertion order never leaks into readings. */
  readonly nodes: ReadonlyMap<EntityId, NodeRecoveryRecord>;
}

export interface ObserveResult {
  readonly state: RecoveryTrackerState;
  readonly transitions: readonly RecoveryTransition[];
}

/* ───────────────────────────────── config ────────────────────────────────── */

/** All minutes are SIM-minutes (plain numbers, house law); multipliers are
 *  exact bigint bps. Every default is PROVISIONAL — ratify-on-playtest,
 *  same class as the death/elasticity constants. */
export interface RecoveryTuning {
  /** Bounces on one node within a single observed tick that declare it
   *  failed. ≥1 (0 would fail silent boards — refused at parse). */
  readonly failureBounceThreshold: number;
  /** Crash-cart dispatch: failed → eligible-to-start-ramp delay. */
  readonly autoRecoverDelayMinutes: number;
  /** Gradual restore ramp, minutes, from the safe-mode floor to full. */
  readonly baseRampMinutes: number;
  /** Second Failure Window: minutes after a completed recovery during
   *  which a new failure is escalated. */
  readonly secondFailureWindowMinutes: number;
  /** Ramp multiplier inside the window (20_000n = twice as long). */
  readonly secondFailureRampMultiplierBps: bigint;
  /** Safe Mode floor: capacity bps at ramp start (2_500n = serving at 25%
   *  while the cache warms). The host applies the reading to slots. */
  readonly safeModeFloorBps: bigint;
  /** Failback hold after ramp completion — steer-back waits this long. */
  readonly failbackDelayMinutes: number;
  /** Recovery crew: nodes allowed to be mid-ramp simultaneously (1 = one
   *  truck in the yard; order is decided by priority, then fail time). */
  readonly recoveryCrewSlots: number;
}

export class RecoveryTrackerError extends Error {
  public constructor(code: string, at: string, detail: string) {
    super(`recovery[${code}] at '${at}': ${detail}`);
    this.name = "RecoveryTrackerError";
  }
}

export function defaultRecoveryTuning(): RecoveryTuning {
  return Object.freeze({
    failureBounceThreshold: 4, // PROVISIONAL — a brownout signal worth reacting to
    autoRecoverDelayMinutes: 5, // PROVISIONAL — crash-cart dispatch lag
    baseRampMinutes: 30, // PROVISIONAL — slow-start admission
    secondFailureWindowMinutes: 60, // PROVISIONAL — the amber RAID-rebuild bar
    secondFailureRampMultiplierBps: 20_000n, // PROVISIONAL — 2× ramp inside the window
    safeModeFloorBps: 2_500n, // PROVISIONAL — safe mode starts at 25% capacity
    failbackDelayMinutes: 15, // PROVISIONAL — don't steer home into a storm
    recoveryCrewSlots: 1, // PROVISIONAL — one recovery crew, order matters
  });
}

const TUNING_INT_KEYS = [
  "failureBounceThreshold",
  "autoRecoverDelayMinutes",
  "baseRampMinutes",
  "secondFailureWindowMinutes",
  "failbackDelayMinutes",
  "recoveryCrewSlots",
] as const;
const TUNING_BPS_KEYS = ["secondFailureRampMultiplierBps", "safeModeFloorBps"] as const;

/** Fail-loud boundary parse (Law 2): overrides onto a base. Unknown keys,
 *  floats, negatives and out-of-range bps all throw
 *  `recovery[CODE] at 'path': detail`. */
export function resolveRecoveryTuning(
  base: RecoveryTuning = defaultRecoveryTuning(),
  overrides: Readonly<Record<string, unknown>> = {},
): RecoveryTuning {
  for (const key of Object.keys(overrides)) {
    if (
      !(TUNING_INT_KEYS as readonly string[]).includes(key) &&
      !(TUNING_BPS_KEYS as readonly string[]).includes(key)
    ) {
      throw new RecoveryTrackerError("RECOVERY_UNKNOWN_KEY", `cfg.${key}`, "not a recovery tuning knob");
    }
  }
  const next: Record<string, unknown> = { ...base, ...overrides };
  for (const key of TUNING_INT_KEYS) {
    const value = next[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
      throw new RecoveryTrackerError(
        "RECOVERY_BAD_VALUE",
        `cfg.${key}`,
        `expected a whole number ≥ 0, got ${String(value)}`,
      );
    }
  }
  if ((next.failureBounceThreshold as number) < 1) {
    throw new RecoveryTrackerError(
      "RECOVERY_BAD_VALUE",
      "cfg.failureBounceThreshold",
      "must be ≥ 1 — a 0 threshold would declare every silent node failed",
    );
  }
  if ((next.recoveryCrewSlots as number) < 1) {
    throw new RecoveryTrackerError(
      "RECOVERY_BAD_VALUE",
      "cfg.recoveryCrewSlots",
      "must be ≥ 1 — a zero crew makes failures permanent",
    );
  }
  if ((next.baseRampMinutes as number) < 1) {
    throw new RecoveryTrackerError(
      "RECOVERY_BAD_VALUE",
      "cfg.baseRampMinutes",
      "must be ≥ 1 — a zero-minute ramp is instant, not gradual",
    );
  }
  const mult = next.secondFailureRampMultiplierBps;
  if (typeof mult !== "bigint" || mult < 10_000n) {
    throw new RecoveryTrackerError(
      "RECOVERY_BAD_VALUE",
      "cfg.secondFailureRampMultiplierBps",
      `must be a bigint ≥ 10_000 (escalation never SHORTENS the ramp), got ${String(mult)}`,
    );
  }
  const floor = next.safeModeFloorBps;
  if (typeof floor !== "bigint" || floor < 0n || floor > 10_000n) {
    throw new RecoveryTrackerError(
      "RECOVERY_BAD_VALUE",
      "cfg.safeModeFloorBps",
      `must be a bigint inside [0, 10_000], got ${String(floor)}`,
    );
  }
  return Object.freeze(next as unknown as RecoveryTuning);
}

/* ─────────────────────────────── internals ───────────────────────────────── */

const FULL_BPS = 10_000n;

/** Mutable working shape for in-call drafts (Law 3 keeps the PUBLIC type
 *  frozen — drafts never escape `snapshot`). */
type RecoveryDraft = { -readonly [K in keyof NodeRecoveryRecord]: NodeRecoveryRecord[K] };

function healthyDraft(nodeId: EntityId): RecoveryDraft {
  return {
    nodeId,
    phase: "healthy",
    failures: 0,
    failedAtMinute: null,
    recoveringAtMinute: null,
    rampMinutes: 0,
    recoveredAtMinute: null,
    failbackEligibleAtMinute: null,
    secondFailure: false,
    postmortemCredit: false,
    degradedMinutes: 0,
    priority: 0,
  };
}

function compareIds(a: EntityId, b: EntityId): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function sortedNodes(entries: Iterable<RecoveryDraft>): ReadonlyMap<EntityId, NodeRecoveryRecord> {
  return new Map(
    [...entries]
      .sort((a, b) => compareIds(a.nodeId, b.nodeId))
      .map((r) => [r.nodeId, Object.freeze(r) as NodeRecoveryRecord]),
  );
}

function transition(
  kind: RecoveryTransitionKind,
  nodeId: EntityId,
  atMinute: SimMinute,
  detail: string | null,
): RecoveryTransition {
  return Object.freeze({
    kind,
    nodeId,
    atMinute,
    causeId: asCauseId(`recovery:${kind}:${nodeId}:${atMinute}`),
    detail,
  });
}

const EMPTY_TRANSITIONS: readonly RecoveryTransition[] = Object.freeze([]);

/** Reading for any id — untracked nodes answer `healthy`. */
export function nodeRecovery(state: RecoveryTrackerState, nodeId: EntityId): NodeRecoveryRecord {
  return state.nodes.get(nodeId) ?? Object.freeze(healthyDraft(nodeId));
}

export function createRecoveryTracker(): RecoveryTrackerState {
  return Object.freeze({ minute: 0, nodes: new Map<EntityId, NodeRecoveryRecord>() });
}

/** Effective ramp for a fresh incident. Inside the window: base × the
 *  escalation multiplier; a postmortem credit halves the EXCESS (2× → 1.5×)
 *  and is consumed. Outside the window: base, mark cleared. Exact integer
 *  math, floor, minimum 1 (parse already walls baseRampMinutes ≥ 1). */
function escalateIncident(
  prior: NodeRecoveryRecord,
  atMinute: SimMinute,
  cfg: RecoveryTuning,
): {
  readonly rampMinutes: number;
  readonly secondFailure: boolean;
  readonly creditConsumed: boolean;
} {
  const insideWindow =
    prior.recoveredAtMinute !== null &&
    atMinute - prior.recoveredAtMinute < cfg.secondFailureWindowMinutes;
  if (!insideWindow) {
    return { rampMinutes: cfg.baseRampMinutes, secondFailure: false, creditConsumed: false };
  }
  const excess = cfg.secondFailureRampMultiplierBps - FULL_BPS;
  const effective = prior.postmortemCredit ? FULL_BPS + excess / 2n : cfg.secondFailureRampMultiplierBps;
  const ramp = (BigInt(cfg.baseRampMinutes) * effective) / FULL_BPS;
  return {
    rampMinutes: Math.max(1, Number(ramp)),
    secondFailure: true,
    creditConsumed: prior.postmortemCredit,
  };
}

/** Open (or re-open) an incident on a node — the single failure funnel both
 *  the bounce detector and the host's explicit declare ride through. */
function openIncident(
  records: Map<EntityId, RecoveryDraft>,
  transitions: RecoveryTransition[],
  nodeId: EntityId,
  minute: SimMinute,
  cfg: RecoveryTuning,
): void {
  const prior = records.get(nodeId) ?? healthyDraft(nodeId);
  if (prior.phase === "failed" || prior.phase === "recovering") return; // one incident at a time
  const esc = escalateIncident(prior, minute, cfg);
  records.set(nodeId, {
    ...prior,
    phase: "failed",
    failures: prior.failures + 1,
    failedAtMinute: minute,
    recoveringAtMinute: null,
    rampMinutes: esc.rampMinutes,
    failbackEligibleAtMinute: null,
    secondFailure: esc.secondFailure,
    postmortemCredit: esc.creditConsumed ? false : prior.postmortemCredit,
  });
  transitions.push(transition("node-failed", nodeId, minute, `ramp=${esc.rampMinutes}`));
  if (esc.secondFailure) {
    transitions.push(
      transition(
        "second-failure",
        nodeId,
        minute,
        esc.creditConsumed ? "escalation halved by postmortem credit" : "inside second failure window",
      ),
    );
  }
}

/** Crew allocation: failed nodes whose dispatch delay has elapsed queue by
 *  (priority desc, failedAt asc, nodeId codepoint asc); the first
 *  `recoveryCrewSlots − currently-ramping` get a ramp started. */
function allocateCrew(
  records: Map<EntityId, RecoveryDraft>,
  transitions: RecoveryTransition[],
  minute: SimMinute,
  cfg: RecoveryTuning,
): void {
  let ramping = 0;
  for (const r of records.values()) if (r.phase === "recovering") ramping += 1;
  const capacity = cfg.recoveryCrewSlots - ramping;
  if (capacity <= 0) return;
  const waiting = [...records.values()].filter(
    (r) =>
      r.phase === "failed" &&
      r.failedAtMinute !== null &&
      minute - r.failedAtMinute >= cfg.autoRecoverDelayMinutes,
  );
  waiting.sort(
    (a, b) =>
      b.priority - a.priority ||
      (a.failedAtMinute as number) - (b.failedAtMinute as number) ||
      compareIds(a.nodeId, b.nodeId),
  );
  for (const r of waiting.slice(0, capacity)) {
    r.phase = "recovering";
    r.recoveringAtMinute = minute;
    transitions.push(transition("recovery-started", r.nodeId, minute, `ramp=${r.rampMinutes}`));
  }
}

/** Advance phase clocks: completed ramps → recovered (exact completion
 *  minute, independent of sampling) and the failback hold armed. */
function advancePhases(
  records: Map<EntityId, RecoveryDraft>,
  transitions: RecoveryTransition[],
  minute: SimMinute,
  cfg: RecoveryTuning,
): void {
  for (const r of records.values()) {
    if (r.phase !== "recovering" || r.recoveringAtMinute === null) continue;
    const completedAt = r.recoveringAtMinute + r.rampMinutes;
    if (minute < completedAt) continue;
    r.phase = "recovered";
    r.failedAtMinute = null;
    r.recoveringAtMinute = null;
    r.recoveredAtMinute = completedAt;
    r.failbackEligibleAtMinute = completedAt + cfg.failbackDelayMinutes;
    transitions.push(
      transition("recovery-completed", r.nodeId, completedAt, `failback at +${cfg.failbackDelayMinutes}m`),
    );
  }
}

/** Degradation-debt meter — runs FIRST, on the interval-START phases: a
 *  failed or ramping node is degraded for the elapsed minutes, with the
 *  ramp's exact completion minute capping the recovering segment. Nodes that
 *  fail DURING the interval start counting on the next one (the meter is
 *  interval-granular, deterministic, and never double-counts). */
function accrueDegradation(records: Map<EntityId, RecoveryDraft>, from: SimMinute, to: SimMinute): void {
  const elapsed = to - from;
  if (elapsed <= 0) return;
  for (const r of records.values()) {
    if (r.phase === "failed") {
      r.degradedMinutes += elapsed;
    } else if (r.phase === "recovering" && r.recoveringAtMinute !== null) {
      const completedAt = r.recoveringAtMinute + r.rampMinutes;
      r.degradedMinutes += Math.min(elapsed, Math.max(0, completedAt - from));
    }
  }
}

/** Mutable working copy → snapshot (Law 3: the input state is never touched). */
function snapshot(minute: SimMinute, records: Map<EntityId, RecoveryDraft>): RecoveryTrackerState {
  return Object.freeze({ minute, nodes: sortedNodes(records.values()) });
}

function cloneRecords(nodes: ReadonlyMap<EntityId, NodeRecoveryRecord>): Map<EntityId, RecoveryDraft> {
  return new Map([...nodes].map(([id, r]) => [id, { ...r }]));
}

/* ────────────────────────────── the observer ─────────────────────────────── */

export interface RecoveryObservation {
  readonly minute: SimMinute;
  /** This tick's TickResult.events (read-only — never mutated). */
  readonly events: readonly SimEvent[];
}

function bounceCountByNode(events: readonly SimEvent[]): Map<EntityId, number> {
  const counts = new Map<EntityId, number>();
  for (const e of events) {
    if (e.kind !== "bounced" || e.nodeId === null) continue; // origin-side patience exits have no node
    counts.set(e.nodeId, (counts.get(e.nodeId) ?? 0) + 1);
  }
  return counts;
}

/** Node ids whose bounce count in THESE events reaches the failure
 *  threshold — only for nodes not already mid-incident (already-failed
 *  nodes are re-checked inside openIncident's guard anyway). */
function countThresholdedFailures(
  events: readonly SimEvent[],
  state: RecoveryTrackerState,
  cfg: RecoveryTuning,
): Set<EntityId> {
  const hits = new Set<EntityId>();
  if (events.length === 0) return hits;
  for (const [nodeId, count] of bounceCountByNode(events)) {
    if (count < cfg.failureBounceThreshold) continue;
    const prior = state.nodes.get(nodeId);
    if (prior !== undefined && (prior.phase === "failed" || prior.phase === "recovering")) continue;
    hits.add(nodeId);
  }
  return hits;
}

/**
 * Advance the tracker over one observed tick window [state.minute, minute]:
 * degradation accrual (start-of-interval phases) → phase clocks → crew
 * allocation → failure detection from terminal-outcome events. Pure: an untouched run returns the SAME
 * state object (identity witness), which is exactly what makes the observer
 * fold-free for hosts that mostly see quiet ticks.
 */
export function observeRecoveryTick(
  state: RecoveryTrackerState,
  observation: RecoveryObservation,
  cfg: RecoveryTuning,
): ObserveResult {
  if (observation.minute < state.minute) {
    throw new RecoveryTrackerError(
      "RECOVERY_BAD_CLOCK",
      "observation.minute",
      `${String(observation.minute)} < tracker clock ${String(state.minute)} — minutes must not run backwards`,
    );
  }
  // Identity law: a re-observation of the SAME minute with no events can
  // only re-derive what the last call already derived — hand the caller the
  // input object back untouched (the fold-free quiet-tick witness).
  if (observation.minute === state.minute && observation.events.length === 0) {
    return Object.freeze({ state, transitions: EMPTY_TRANSITIONS });
  }
  const records = cloneRecords(state.nodes);
  const transitions: RecoveryTransition[] = [];
  accrueDegradation(records, state.minute, observation.minute);
  advancePhases(records, transitions, observation.minute, cfg);
  allocateCrew(records, transitions, observation.minute, cfg);
  const failures = countThresholdedFailures(observation.events, state, cfg);
  for (const nodeId of [...failures].sort(compareIds)) {
    openIncident(records, transitions, nodeId, observation.minute, cfg);
  }
  if (transitions.length === 0 && records.size === 0) {
    // clock moved over an empty world — keep the new minute, mint nothing
    return Object.freeze({ state: snapshot(observation.minute, records), transitions: EMPTY_TRANSITIONS });
  }
  return Object.freeze({
    state: snapshot(observation.minute, records),
    transitions: Object.freeze(transitions),
  });
}

/* ───────────────────────── host-facing commands ──────────────────────────── */

/** Explicit failure injection (Black Start, drills, scripted disasters):
 *  the same escalation funnel as bounce-detected failures. Throws when the
 *  node is already mid-incident — declaring a failure that is already
 *  happening is a host bug, say it loud (Law 4). */
export function declareRecoveryFailure(
  state: RecoveryTrackerState,
  nodeId: EntityId,
  minute: SimMinute,
  cfg: RecoveryTuning,
): ObserveResult {
  if (minute < state.minute) {
    throw new RecoveryTrackerError("RECOVERY_BAD_CLOCK", "minute", `${String(minute)} < tracker clock ${String(state.minute)}`);
  }
  const prior = nodeRecovery(state, nodeId);
  if (prior.phase === "failed" || prior.phase === "recovering") {
    throw new RecoveryTrackerError(
      "RECOVERY_BAD_PHASE",
      String(nodeId),
      `cannot declare a failure while ${prior.phase} — the incident is already open`,
    );
  }
  const records = cloneRecords(state.nodes);
  const transitions: RecoveryTransition[] = [];
  openIncident(records, transitions, nodeId, minute, cfg);
  return Object.freeze({
    state: snapshot(Math.max(minute, state.minute), records),
    transitions: Object.freeze(transitions),
  });
}

/** Blameless post-mortem credit (§5.10 transparency insurance): earns the
 *  node a once-credit HALVING its next failure's escalation excess. The
 *  reputation side already exists (cfg.reputation.honestPostmortemBps +250,
 *  folded by economy/reputation.ts) — the host pairs this call with that
 *  signal; neither module imports the other. */
export function markBlamelessPostmortem(
  state: RecoveryTrackerState,
  nodeId: EntityId,
  minute: SimMinute,
): ObserveResult {
  if (minute < state.minute) {
    throw new RecoveryTrackerError("RECOVERY_BAD_CLOCK", "minute", `${String(minute)} < tracker clock ${String(state.minute)}`);
  }
  const prior = nodeRecovery(state, nodeId);
  if (prior.failures === 0) {
    throw new RecoveryTrackerError("RECOVERY_UNKNOWN_NODE", String(nodeId), "no incident to write a post-mortem about");
  }
  if (prior.postmortemCredit) {
    throw new RecoveryTrackerError("RECOVERY_BAD_PHASE", String(nodeId), "a post-mortem credit is already outstanding");
  }
  const records = cloneRecords(state.nodes);
  records.set(nodeId, { ...prior, postmortemCredit: true });
  return Object.freeze({
    state: snapshot(Math.max(minute, state.minute), records),
    transitions: Object.freeze([transition("postmortem-credited", nodeId, minute, "next escalation excess halved")]),
  });
}

/** "Restore your whale first" (27612): higher priority goes first in the
 *  crew queue; 0 is the default, ties break on fail time then node id. */
export function setRecoveryPriority(
  state: RecoveryTrackerState,
  nodeId: EntityId,
  priority: number,
): ObserveResult {
  if (!Number.isInteger(priority)) {
    throw new RecoveryTrackerError("RECOVERY_BAD_VALUE", "priority", `expected an integer, got ${String(priority)}`);
  }
  if (!state.nodes.has(nodeId)) {
    throw new RecoveryTrackerError("RECOVERY_UNKNOWN_NODE", String(nodeId), "cannot prioritize a node with no incident");
  }
  const records = cloneRecords(state.nodes);
  records.set(nodeId, { ...(records.get(nodeId) as RecoveryDraft), priority });
  return Object.freeze({ state: snapshot(state.minute, records), transitions: EMPTY_TRANSITIONS });
}

/* ─────────────────────────────── out-readings ────────────────────────────── */

/** Safe-Mode / gradual-restore capacity in bps at `minute`:
 *  healthy 10_000 · failed 0 (v0 stance: down until the crew starts) ·
 *  recovering floor→10_000 linear along the ramp · recovered 10_000.
 *  Floor-rounded integer progress — the same minute always answers the same
 *  bps (Law 3). */
export function recoveryCapacityBps(
  state: RecoveryTrackerState,
  nodeId: EntityId,
  minute: SimMinute,
  cfg: RecoveryTuning,
): bigint {
  const r = nodeRecovery(state, nodeId);
  if (r.phase === "healthy" || r.phase === "recovered") return FULL_BPS;
  if (r.phase === "failed") return 0n;
  const start = r.recoveringAtMinute as SimMinute;
  if (minute <= start) return cfg.safeModeFloorBps;
  const progressBps = (BigInt(Math.min(minute - start, r.rampMinutes)) * FULL_BPS) / BigInt(r.rampMinutes);
  return cfg.safeModeFloorBps + ((FULL_BPS - cfg.safeModeFloorBps) * progressBps) / FULL_BPS;
}

/** Failback law (27620): steer traffic back ONLY after the post-recovery
 *  hold elapsed. False while down, ramping, or inside the hold. */
export function acceptsFailback(state: RecoveryTrackerState, nodeId: EntityId, minute: SimMinute): boolean {
  const r = nodeRecovery(state, nodeId);
  return r.phase === "recovered" && r.failbackEligibleAtMinute !== null && minute >= r.failbackEligibleAtMinute;
}

/** The amber bar (27513): "you cannot survive another failure right now".
 *  True for the whole degraded stretch (failed, recovering) and for
 *  `secondFailureWindowMinutes` after the last recovery completed. */
export function secondFailureWindowActive(
  state: RecoveryTrackerState,
  nodeId: EntityId,
  minute: SimMinute,
  cfg: RecoveryTuning,
): boolean {
  const r = nodeRecovery(state, nodeId);
  if (r.phase === "failed" || r.phase === "recovering") return true;
  if (r.phase === "recovered" && r.recoveredAtMinute !== null) {
    return minute - r.recoveredAtMinute < cfg.secondFailureWindowMinutes;
  }
  return false;
}
