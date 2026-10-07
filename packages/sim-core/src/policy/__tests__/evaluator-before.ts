/**
 * PRISTINE PRE-OPTIMIZATION EVALUATOR — byte-faithful copy of
 * `src/policy/evaluator.ts` at commit c8a3606 (imports re-rooted two levels
 * down into __tests__/). Landed by the PERF LANE (audit rec #5) so
 * perf-hotpath.test.ts can benchmark OLD vs NEW INTERLEAVED in one process:
 * paired samples cancel sibling-lane load spikes — an absolute ms budget on
 * a shared box proved flaky at the honest 2× line (592 vs 589 ms).
 *
 * This is a FROZEN performance reference, NOT live code: do not edit, do not
 * export from any barrel (it would mint duplicate names), do not import it
 * outside perf-hotpath.test.ts. If a future refactor legitimately re-shapes
 * the hot path, the floor test stays green while this file's own behavior
 * digest diverges — that is the signal to re-cut the reference from the
 * then-HEAD (same `git show` recipe) and re-verify digests equal.
 */

/**
 * Policy interpreter — the step-12.5 rule phase (MASTER_REPORT §4.5 stack
 * architecture, Appendix B §2.2/§2.4, types.ts RulePhaseIn/Out).
 *
 * Laws this file lives by:
 *  - reads ONLY the observed map it is handed — ground truth is unreachable
 *    from here by construction ("fog degrades automation", WS-5 G1 ratified);
 *  - NO RNG inside evaluation: the `rng` field of RulePhaseIn is
 *    deliberately never touched — randomness decides timing/targets and
 *    belongs to the generators (§7.13 #3); evaluation is a pure function of
 *    (state, book, observed, tick);
 *  - evaluate-and-enqueue only: the phase emits PlayerIntents into the input
 *    log for NEXT-tick adjudication; it never mutates world state (§4.5);
 *  - canonical order = book array order (store's `order`); same-tick emits
 *    follow it;
 *  - all runtime state (FOR-debounce, edge-latches, value snapshots,
 *    pending consults, intent seq, fire journal) is threaded explicitly
 *    in→out of every run — pure functions, no hidden mutation (Law 3).
 *    `serializeState`/`restoreState` give the save/replay module its hook
 *    for THE LONG SAVE.
 *
 * Temporal semantics (interpretations logged as decision requests):
 *  - edge-triggered per assertion: once adjudicated, a rule latches and does
 *    not re-adjudicate until its WHEN-set goes false and re-asserts (D-4);
 *  - infeasible adjudications do NOT latch — they retry while the trigger
 *    stands (D-4b): that is the visible, all-night cost-cap fight (R7);
 *  - unreadable cells (missing / value null / status unknown) make the
 *    predicate FALSE: fog silences rules, it never guesses (D-6);
 *  - first-ever observation of a cell is not "changed" (D-6b).
 */

import type {
  CauseId,
  DelegationBand,
  EntityId,
  ObservedCell,
  ObservedKey,
  PlayerIntent,
  PolicyAction,
  PolicyCard,
  Predicate,
  RuleFiring,
  RuleId,
  RulePhaseIn,
  RulePhaseOut,
  ScopeSelector,
  SimTick,
  SimTimeUs,
} from "../../types.ts";
import { asCauseId, asEntityId, observedKey } from "../../types.ts";
import { minutesToSimUs } from "../../kernel/time.ts";
import {
  observedValueToCellRaw,
  thresholdAmountToCellRaw,
  validatePolicyCard,
} from "../grammar.ts";

export class PolicyEvalError extends Error {
  constructor(message: string) {
    super(`policy.eval: ${message}`);
    this.name = "PolicyEvalError";
  }
}

/* ═══════════════════════ Injected boundaries ═══════════════════════ */

/** Maps a role/query/class selector onto entity ids. object/estate scopes are
 *  resolved natively; the other selector kinds need the topology's tag index
 *  (G4: selector grammar defines no operators yet), so the host injects a
 *  resolver — the default FAILS LOUD rather than guess (Law 4). */
export type ScopeResolver = (
  scope: ScopeSelector,
  allEntities: readonly EntityId[],
) => readonly EntityId[];

/** Feasibility oracle for the "successful shadow-firing" definition (G8):
 *  would the action have been executable (budget, hands, targets)? The
 *  engine's resource modules own that truth; the policy phase only asks. */
export type ActionFeasibility = (
  ruleId: RuleId,
  actions: readonly PolicyAction[],
  tick: SimTick,
) => boolean;

export function defaultScopeResolver(scope: ScopeSelector, allEntities: readonly EntityId[]): readonly EntityId[] {
  if (scope.kind === "estate") return allEntities;
  if (scope.kind === "object") {
    if (scope.ref === null) throw new PolicyEvalError("object scope with null ref");
    return [asEntityId(scope.ref)];
  }
  throw new PolicyEvalError(
    `scope kind "${scope.kind}" needs an injected ScopeResolver (gap G4 defines no built-in operator set)`,
  );
}

const alwaysFeasible: ActionFeasibility = () => true;

/* ═══════════════════════ Runtime state & config ═══════════════════════ */

export interface PendingConsultation {
  readonly pendingId: string;
  readonly ruleId: RuleId;
  readonly actions: readonly PolicyAction[];
  readonly target: EntityId | null;
  readonly raisedAtTick: SimTick;
  readonly raisedAtUs: SimTimeUs;
  readonly expiresAtUs: SimTimeUs;
}

/** One adjudication outcome = one ticker row (R6 "rules fired" ticker). */
export type PolicyFireStage =
  | "execute"
  | "inform"
  | "consult-pending"
  | "consult-dispatched"
  | "consult-denied"
  | "consult-expired"
  | "consult-deferred"
  | "guard-blocked"
  | "guard-escalated"
  | "infeasible"
  | "escalation-role"
  | "escalation-runbook";

export interface PolicyFireEntry {
  readonly ruleId: RuleId;
  readonly tick: SimTick;
  readonly atUs: SimTimeUs;
  readonly mode: "live" | "shadow";
  readonly band: DelegationBand;
  readonly stage: PolicyFireStage;
  /** Intents emitted (live) or that WOULD be emitted (shadow). */
  readonly intents: number;
}

/* ═══════════════════ Fire log (P4: append-only, ring-compactable) ═══════════ */

/** One immutable batch of journal rows (a chunk = one run's entries). */
export interface FireLogChunk {
  readonly entries: readonly PolicyFireEntry[];
  readonly count: number;
  /** Older chunk, or null at the journal head. */
  readonly previous: FireLogChunk | null;
}

/**
 * P4: THE LONG SAVE journal. Appending is O(1) — a new chunk is consed onto
 * the front, never a spread-copy of history (the old `[...base, ...new]`
 * rebuild was O(entries²) across a long run) — and `compactFireLog` is the
 * ring/compaction hook mirroring replay/compact.ts `keepLastSnapshots`.
 * Serialization walks oldest→newest, so any retained span stays
 * byte-identical to the old flat-array journal (golden-pinned).
 */
export interface FireLog {
  readonly newest: FireLogChunk | null;
  readonly total: number;
  /** Rows already dropped from the head by the compaction hook. */
  readonly compactedCount: number;
}

export function emptyFireLog(): FireLog {
  return { newest: null, total: 0, compactedCount: 0 };
}

export function appendFireLog(log: FireLog, entries: readonly PolicyFireEntry[]): FireLog {
  if (entries.length === 0) return log;
  return {
    newest: { entries, count: entries.length, previous: log.newest },
    total: log.total + entries.length,
    compactedCount: log.compactedCount,
  };
}

/** Journal view, oldest→newest (the order serializeFireLog emits). */
export function fireLogEntries(log: FireLog): PolicyFireEntry[] {
  const chunks: Array<readonly PolicyFireEntry[]> = [];
  for (let node = log.newest; node !== null; node = node.previous) chunks.push(node.entries);
  const out: PolicyFireEntry[] = [];
  for (let i = chunks.length - 1; i >= 0; i -= 1) out.push(...(chunks[i] as readonly PolicyFireEntry[]));
  return out;
}

/** Ring/compaction hook: keep the LAST `keepLast` rows; dropped rows leave
 *  the journal but raise `compactedCount` — truncation is never silent. */
export function compactFireLog(log: FireLog, keepLast: number): FireLog {
  if (!Number.isSafeInteger(keepLast) || keepLast < 0) {
    throw new PolicyEvalError(`fireLogKeepLast must be a non-negative integer, got ${keepLast}`);
  }
  if (log.total <= keepLast) return log;
  const kept = fireLogEntries(log).slice(log.total - keepLast);
  return {
    newest: kept.length === 0 ? null : { entries: kept, count: kept.length, previous: null },
    total: kept.length,
    compactedCount: log.compactedCount + (log.total - kept.length),
  };
}

/** P3: a player verdict recorded while the Kill Switch stood; it waits here
 *  — logged, pending-consumed, intents HELD — until the first unfrozen run. */
export interface DeferredConsultationResolution {
  readonly pendingId: string;
  readonly ruleId: RuleId;
  readonly actions: readonly PolicyAction[];
  readonly target: EntityId | null;
  readonly raisedAtTick: SimTick;
  readonly decidedAtUs: SimTimeUs;
  readonly approve: boolean;
}

export interface PolicyRuntimeState {
  /** FOR-debounce: sim µs at which the WHEN-set became continuously true. */
  readonly sustainedSinceUs: ReadonlyMap<RuleId, SimTimeUs>;
  /** Edge trigger: rule already adjudicated for the current assertion. */
  readonly latched: ReadonlySet<RuleId>;
  /** Engine-maintained counters ("the SECOND failure…", §B 2.2 state budget):
   *  last value seen per (rule, observed key). Key = `${ruleId}\u0000${observedKey}`. */
  readonly snapshots: ReadonlyMap<string, bigint>;
  readonly pendingConsults: readonly PendingConsultation[];
  /** P3: verdicts received while frozen — dispatched on the first unfrozen
   *  live run, in arrival order. */
  readonly deferredResolutions: readonly DeferredConsultationResolution[];
  readonly nextIntentSeq: number;
  /** Append-only adjudication journal (byte-compare via serializeFireLog).
   *  P4: cons-chunked and ring-compactable — walk it with `fireLogEntries`. */
  readonly fireLog: FireLog;
}

export function createRuntimeState(): PolicyRuntimeState {
  return {
    sustainedSinceUs: new Map(),
    latched: new Set(),
    snapshots: new Map(),
    pendingConsults: [],
    deferredResolutions: [],
    nextIntentSeq: 0,
    fireLog: emptyFireLog(),
  };
}

export interface PolicyEvaluationConfig {
  readonly mode: "live" | "shadow";
  /** Kill Switch (R18): while true the phase adjudicates nothing and consult
   *  expiry CLOCKS STOP (P3 defensive reading — see OWNER QUESTION Q-P3-1 at
   *  the frozen branch of `runRulePhase`). */
  readonly frozen: boolean;
  /** P4 ring cap (THE LONG SAVE): when set, the commit hook compacts the
   *  fire log toward roughly the last N rows once it drifts past 2N.
   *  Unset = unbounded journal with a byte-stable prefix. */
  readonly fireLogKeepLast?: number;
  readonly scopeResolver: ScopeResolver;
  readonly feasibility: ActionFeasibility;
  /** Consult-pending TTL on the sim clock — G6 leaves it unstated;
   *  default 30 sim-minutes (DECISION REQUEST D-9). */
  readonly consultExpiryUs: SimTimeUs;
}

export const DEFAULT_CONSULT_EXPIRY_US = minutesToSimUs(30);

export const defaultEvaluationConfig: PolicyEvaluationConfig = {
  mode: "live",
  frozen: false,
  scopeResolver: defaultScopeResolver,
  feasibility: alwaysFeasible,
  consultExpiryUs: DEFAULT_CONSULT_EXPIRY_US,
} as const;

/** Dry-run/shadow config: evaluate-not-apply (R15). */
export const shadowEvaluationConfig: PolicyEvaluationConfig = {
  ...defaultEvaluationConfig,
  mode: "shadow",
} as const;

/* ═══════════════════════ Mutable scratch (one run only) ═══════════════ */

interface RunScratch {
  readonly sustained: Map<RuleId, SimTimeUs>;
  readonly latched: Set<RuleId>;
  readonly snapshots: Map<string, bigint>;
  /** P2 read-then-commit: values observed THIS run land here; they merge
   *  into `snapshots` only after the whole owning rule has finished reading,
   *  so a UNLESS guard on a metric WHEN already read still sees last
   *  tick's value (same-tick self-overwrite made guard-fires impossible). */
  readonly snapWrites: Map<string, bigint>;
  pending: PendingConsultation[];
  deferred: DeferredConsultationResolution[];
  intentSeq: number;
  readonly entries: PolicyFireEntry[];
  readonly consultExpiry: SimTimeUs;
  readonly observed: ReadonlyMap<ObservedKey, ObservedCell<unknown>>;
  readonly allEntities: readonly EntityId[];
}

interface PredicateOutcome {
  readonly satisfied: boolean;
  /** First (deterministically lowest-sorted) entity whose cell satisfied it. */
  readonly target: EntityId | null;
}

/* ═══════════════════════ Predicate evaluation ═══════════════════════ */

function isCellReadable(cell: ObservedCell<unknown> | undefined): boolean {
  if (cell === undefined) return false;
  if (cell.value === null) return false;
  return cell.status === "live" || cell.status === "stale";
}

function evaluatePredicate(predicate: Predicate, entities: readonly EntityId[], ruleId: RuleId, scratch: RunScratch): PredicateOutcome {
  const metricName = String(predicate.metric);
  const numericThreshold =
    predicate.threshold.kind === "value"
      ? thresholdAmountToCellRaw(predicate.threshold.unit, predicate.threshold.amount)
      : null;

  for (const entity of entities) {
    const key = observedKey(entity, metricName);
    const cell = scratch.observed.get(key);
    if (!isCellReadable(cell)) continue;
    const current = observedValueToCellRaw(cell?.value, ruleId, metricName);
    const snapKey = `${ruleId}\u0000${key}`;
    const previous = scratch.snapshots.get(snapKey);
    scratch.snapWrites.set(snapKey, current); // P2: committed only after the rule finishes reading

    let satisfied: boolean;
    switch (predicate.comparator) {
      case ">":
        satisfied = numericThreshold !== null && current > numericThreshold;
        break;
      case "<":
        satisfied = numericThreshold !== null && current < numericThreshold;
        break;
      case "changed":
        satisfied = previous !== undefined && previous !== current;
        break;
      case "fails":
      case "completes":
        // Engine-maintained event counters surfaced as nouns (D-3): the
        // property carries a monotone count; fails/completes = it advanced.
        satisfied = previous !== undefined && current > previous;
        break;
      default:
        throw new PolicyEvalError(`${ruleId}: comparator "${String(predicate.comparator)}" escaped validation`);
    }
    if (satisfied) return { satisfied: true, target: entity };
  }
  return { satisfied: false, target: null };
}

/** Evaluates EVERY predicate (no short-circuit — changed/fails snapshots
 *  must advance even when an earlier conjunct is false). AND-only per §B 2.3.5. */
function evaluateConjunction(
  predicates: readonly Predicate[],
  scope: ScopeSelector,
  ruleId: RuleId,
  scratch: RunScratch,
  resolver: ScopeResolver,
): PredicateOutcome {
  const entities = sortEntities(resolver(scope, scratch.allEntities));
  let firstTarget: EntityId | null = null;
  let satisfied = true;
  for (const predicate of predicates) {
    const outcome = evaluatePredicate(predicate, entities, ruleId, scratch);
    if (!outcome.satisfied) satisfied = false;
    else if (firstTarget === null) firstTarget = outcome.target;
  }
  return { satisfied, target: firstTarget };
}

/** Locale-free total order (§3.4): codepoint `<`/`>` only. */
function sortEntities(entities: readonly EntityId[]): readonly EntityId[] {
  return [...entities].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** P2 merge point: called once per card after EVERY clause it owns has read
 *  the pre-run snapshot world. */
function commitSnapWrites(scratch: RunScratch): void {
  for (const [snapKey, value] of scratch.snapWrites) scratch.snapshots.set(snapKey, value);
  scratch.snapWrites.clear();
}

const KEY_SEPARATOR = "::";

/**
 * P1: strict inverse of the flat `entity::property` key — the old code split
 * on the FIRST "::" and re-branded whatever fell out, so an entity id that
 * itself contains "::" silently truncated to its prefix.
 *
 * CONTRACT REQUEST → foundation (types.ts, not editable from this lane):
 * `observedKey` mints `${entity}::${property}` but offers no parse-inverse
 * (`entitySegmentOfKey`) and no escaping rule, so a key with more than one
 * separator is IRRECOVERABLY AMBIGUOUS (entity-with-"::" vs metric-with-"::").
 * Until the foundation adds one, this policy-local parser ACCEPTS only
 * exactly-one-separator keys and fails loud on every other shape (Law 4) —
 * never a quiet truncation.
 */
export function parseKeyEntityStrict(key: ObservedKey): EntityId {
  const raw = String(key);
  const first = raw.indexOf(KEY_SEPARATOR);
  if (first <= 0) {
    throw new PolicyEvalError(
      `observed key "${raw}" is not of the form entity${KEY_SEPARATOR}property — cannot derive the entity`,
    );
  }
  if (raw.indexOf(KEY_SEPARATOR, first + KEY_SEPARATOR.length) !== -1) {
    throw new PolicyEvalError(
      `observed key "${raw}" carries more than one "${KEY_SEPARATOR}" separator — entity ids containing it are ambiguous under the flat key format; ` +
        `foundation contract request: add escaping or an entitySegmentOfKey accessor to types.ts (policy/evaluator.parseKeyEntityStrict stands in)`,
    );
  }
  return asEntityId(raw.slice(0, first));
}

function allObservedEntities(observed: ReadonlyMap<ObservedKey, ObservedCell<unknown>>): readonly EntityId[] {
  const seen = new Set<EntityId>();
  for (const key of observed.keys()) {
    seen.add(parseKeyEntityStrict(key));
  }
  return sortEntities([...seen]);
}

/* ═══════════════════════ Intent building & band dispatch ═══════════════ */

function verbFor(action: PolicyAction): string {
  // Appendix B spells the runbook action `run-runbook:NAME` — a name rides
  // INSIDE a closed verb prefix; no verb is ever minted from input data.
  if (action.id === "run-runbook") {
    if (action.runbookName === null || action.runbookName.length === 0) {
      throw new PolicyEvalError("run-runbook action lost its name between validation and evaluation");
    }
    return `run-runbook:${action.runbookName}`;
  }
  return action.id;
}

function buildIntents(
  scratch: RunScratch,
  ruleId: RuleId,
  actions: readonly PolicyAction[],
  target: EntityId | null,
  atUs: SimTimeUs,
): PlayerIntent[] {
  const intents: PlayerIntent[] = [];
  for (const action of actions) {
    intents.push({
      seq: scratch.intentSeq,
      clock: "sim",
      atUs,
      origin: "rule",
      ruleId,
      payload: { kind: "verb", verb: verbFor(action), target, value: action.value },
    });
    scratch.intentSeq += 1;
  }
  return intents;
}

interface BandOutcome {
  readonly stage: PolicyFireStage;
  readonly intentCount: number;
}

function dispatchBand(
  scratch: RunScratch,
  ruleId: RuleId,
  actions: readonly PolicyAction[],
  band: DelegationBand,
  target: EntityId | null,
  tick: SimTick,
  atUs: SimTimeUs,
  mode: "live" | "shadow",
  sink: PlayerIntent[],
): BandOutcome {
  if (band === "execute") {
    const intents = buildIntents(scratch, ruleId, actions, target, atUs);
    if (mode === "live") sink.push(...intents);
    return { stage: "execute", intentCount: intents.length };
  }
  if (band === "consult") {
    if (mode === "live") {
      // D-10: only one pending per rule — re-raise would need a re-assertion
      // anyway (edge-latch), so no dedup beyond the latch itself.
      scratch.pending.push({
        pendingId: `${ruleId}@${tick}`,
        ruleId,
        actions,
        target,
        raisedAtTick: tick,
        raisedAtUs: atUs,
        expiresAtUs: atUs + scratch.consultExpiry,
      });
    }
    return { stage: "consult-pending", intentCount: 0 };
  }
  return { stage: "inform", intentCount: 0 };
}

/* ═══════════════════════ The rule phase (slot 12.5) ═══════════════════════ */

export interface RulePhaseResult {
  readonly state: PolicyRuntimeState;
  readonly out: RulePhaseOut;
  /** Fire-log entries appended by THIS run (the ticker delta). */
  readonly entries: readonly PolicyFireEntry[];
}

/**
 * One rule-phase step. Pure: (state, input, config) → (state′, out, entries).
 * `input.rng` is intentionally NEVER read — determinism-by-construction,
 * exercised by the no-RNG divergence test.
 */
export function runRulePhase(
  state: PolicyRuntimeState,
  input: RulePhaseIn,
  config: PolicyEvaluationConfig = defaultEvaluationConfig,
): RulePhaseResult {
  // N1: the store is the factory, but nothing stops a host from handing a raw
  // array to this seam. Parse, don't trust (Law 2): fail loud with the same
  // domain error the store raises — never a TypeError deep inside evaluation.
  for (const card of input.book) validatePolicyCard(card);

  const scratch: RunScratch = {
    sustained: new Map(state.sustainedSinceUs),
    latched: new Set(state.latched),
    snapshots: new Map(state.snapshots),
    snapWrites: new Map(),
    pending: [...state.pendingConsults],
    deferred: [...state.deferredResolutions],
    intentSeq: state.nextIntentSeq,
    entries: [],
    consultExpiry: config.consultExpiryUs,
    observed: input.observed,
    allEntities: allObservedEntities(input.observed),
  };
  const intents: PlayerIntent[] = [];
  const firings: RuleFiring[] = [];
  const tick = input.context.tick;
  const nowUs = input.context.clocks.simUs;

  if (config.frozen) {
    // Kill Switch (R18) — P3 DEFENSIVE READING (OWNER QUESTION Q-P3-1):
    // freeze = automation FULLY halted. Pending consults are PRESERVED, not
    // expired — their TTL clock stops with the world — adjudication emits
    // nothing, and verdicts the player gives mid-freeze are recorded via
    // `resolveConsultation(…, frozen = true)` with their intents HELD until
    // the first unfrozen run. The alternative reading (expiry keeps running,
    // so frozen consults die unanswered) throws away player agency precisely
    // when the player reached for the big red button — not shipped.
    // Debounce clocks and value snapshots stay parked too, so unfreezing
    // resumes the pre-freeze world.
    return { state: commit(state, scratch, config), out: { firings, intents }, entries: scratch.entries };
  }

  expireConsults(scratch, nowUs, config.mode);
  dispatchDeferred(scratch, intents, tick, nowUs, config.mode);

  const suppressed = new Set<RuleId>(input.suppressed);

  for (const card of input.book) {
    if (suppressed.has(card.id)) continue;

    const trigger = evaluateConjunction(card.when, card.scope, card.id, scratch, config.scopeResolver);

    if (!trigger.satisfied) {
      scratch.sustained.delete(card.id);
      scratch.latched.delete(card.id);
      commitSnapWrites(scratch);
      continue;
    }
    if (scratch.latched.has(card.id)) {
      commitSnapWrites(scratch);
      continue;
    }

    if (card.for !== undefined) {
      const started = scratch.sustained.get(card.id);
      if (started === undefined) {
        scratch.sustained.set(card.id, nowUs);
        commitSnapWrites(scratch);
        continue; // first sustained tick — debounce window not yet earned
      }
      if (nowUs - started < card.for.durationUs) {
        commitSnapWrites(scratch);
        continue;
      }
    }

    adjudicate(scratch, intents, firings, card, trigger.target, tick, nowUs, config);
    commitSnapWrites(scratch); // P2: WHEN+UNLESS read the PRE-run world; publish now
  }

  return { state: commit(state, scratch, config), out: { firings, intents }, entries: scratch.entries };
}

/** P3: a frozen player verdict becomes intents + a dispatch/deny row on the
 *  first UNFROZEN live run, in arrival order. Shadow runs leave the queue
 *  untouched — a dry run never consumes a player's decision. */
function dispatchDeferred(
  scratch: RunScratch,
  intents: PlayerIntent[],
  tick: SimTick,
  nowUs: SimTimeUs,
  mode: "live" | "shadow",
): void {
  if (mode !== "live" || scratch.deferred.length === 0) return;
  const settled = scratch.deferred;
  scratch.deferred = [];
  for (const resolution of settled) {
    const rows = resolution.approve
      ? buildIntents(scratch, resolution.ruleId, resolution.actions, resolution.target, nowUs)
      : [];
    intents.push(...rows);
    scratch.entries.push({
      ruleId: resolution.ruleId,
      tick,
      atUs: nowUs,
      mode: "live",
      band: "consult",
      stage: resolution.approve ? "consult-dispatched" : "consult-denied",
      intents: rows.length,
    });
  }
}

function adjudicate(
  scratch: RunScratch,
  intents: PlayerIntent[],
  firings: RuleFiring[],
  card: PolicyCard,
  target: EntityId | null,
  tick: SimTick,
  nowUs: SimTimeUs,
  config: PolicyEvaluationConfig,
): void {
  const mode = config.mode;

  if (card.unless !== undefined) {
    const guard = evaluateConjunction(card.unless, card.scope, card.id, scratch, config.scopeResolver);
    if (guard.satisfied) {
      if (card.else === undefined) {
        log(scratch, card, mode, "guard-blocked", 0, tick, nowUs);
        scratch.latched.add(card.id); // D-4: one decision per assertion
        return;
      }
      escalate(scratch, intents, firings, card, target, tick, nowUs, config);
      return;
    }
  }

  if (!config.feasibility(card.id, card.then, tick)) {
    // G8 (D-8): "successful shadow-firing" = trigger match + guard pass +
    // feasibility-oracle yes. Infeasible does NOT latch → retries each tick
    // while the trigger stands (the watchable all-night fight, R7).
    log(scratch, card, mode, "infeasible", 0, tick, nowUs);
    return;
  }

  const outcome = dispatchBand(scratch, card.id, card.then, card.band, target, tick, nowUs, mode, intents);
  scratch.latched.add(card.id);
  log(scratch, card, mode, outcome.stage, outcome.intentCount, tick, nowUs);
  firings.push(firing(card, tick, mode));
}

function escalate(
  scratch: RunScratch,
  intents: PlayerIntent[],
  firings: RuleFiring[],
  card: PolicyCard,
  target: EntityId | null,
  tick: SimTick,
  nowUs: SimTimeUs,
  config: PolicyEvaluationConfig,
): void {
  const mode = config.mode;
  const escalation = card.else;
  if (escalation === undefined) throw new PolicyEvalError(`${card.id}: escalate without ELSE target`);
  scratch.latched.add(card.id);

  if (escalation.to === "role" || escalation.to === "runbook") {
    // D-11: role/runbook escalation is LOGGED only — paging a role or kicking
    // a runbook is incident-command's job (separate object class, R25/R30),
    // not a policy-grammar action.
    log(scratch, card, mode, escalation.to === "role" ? "escalation-role" : "escalation-runbook", 0, tick, nowUs);
    return;
  }

  // D-5: ELSE → band hands the blocked condition to that band WITH the
  // rule's THEN actions: inform = tell, consult = ask, execute = override
  // the guard ("widening trades attention for variance", R19).
  const band = escalation.ref;
  const outcome = dispatchBand(scratch, card.id, card.then, band, target, tick, nowUs, mode, intents);
  log(scratch, card, mode, "guard-escalated", outcome.intentCount, tick, nowUs);
  firings.push(firing(card, tick, mode, band));
}

function firing(card: PolicyCard, tick: SimTick, mode: "live" | "shadow", band: DelegationBand = card.band): RuleFiring {
  return {
    ruleId: card.id,
    tick,
    mode,
    band,
    actions: card.then,
    causeId: firingCauseId(card.id, tick, mode),
  };
}

export function firingCauseId(ruleId: RuleId, tick: SimTick, mode: "live" | "shadow"): CauseId {
  return asCauseId(`rule:${ruleId}:${tick}:${mode}`);
}

function expireConsults(scratch: RunScratch, nowUs: SimTimeUs, mode: "live" | "shadow"): void {
  const still: PendingConsultation[] = [];
  for (const pending of scratch.pending) {
    if (pending.expiresAtUs <= nowUs) {
      // G10 (D-12): an unanswered consult EXPIRES — the action dies with it,
      // logged so the ticker keeps the fight watchable.
      scratch.entries.push({
        ruleId: pending.ruleId,
        tick: pending.raisedAtTick,
        atUs: nowUs,
        mode,
        band: "consult",
        stage: "consult-expired",
        intents: 0,
      });
      continue;
    }
    still.push(pending);
  }
  scratch.pending = still;
}

function log(
  scratch: RunScratch,
  card: PolicyCard,
  mode: "live" | "shadow",
  stage: PolicyFireStage,
  intents: number,
  tick: SimTick,
  atUs: SimTimeUs,
): void {
  scratch.entries.push({ ruleId: card.id, tick, atUs, mode, band: card.band, stage, intents });
}

function commit(
  state: PolicyRuntimeState,
  scratch: RunScratch,
  config?: Pick<PolicyEvaluationConfig, "fireLogKeepLast">,
): PolicyRuntimeState {
  // P4: O(1) cons-append (no history spread); optional ring hook keeps
  // THE LONG SAVE bounded when the host sets fireLogKeepLast.
  let fireLog = appendFireLog(state.fireLog, scratch.entries);
  const keepLast = config?.fireLogKeepLast;
  if (keepLast !== undefined && fireLog.total > keepLast * 2) {
    fireLog = compactFireLog(fireLog, keepLast);
  }
  return {
    sustainedSinceUs: scratch.sustained,
    latched: scratch.latched,
    snapshots: scratch.snapshots,
    pendingConsults: scratch.pending,
    deferredResolutions: scratch.deferred,
    nextIntentSeq: scratch.intentSeq,
    fireLog,
  };
}

/* ═══════════════════════ Consult resolution ═══════════════════════ */

export interface ConsultResolution {
  readonly state: PolicyRuntimeState;
  readonly intents: readonly PlayerIntent[];
  readonly entries: readonly PolicyFireEntry[];
}

/**
 * Human (or staff-role) decision on a pending consult. Approving dispatches
 * the rule's THEN actions as rule-origin intents stamped at `decidedAtUs`
 * on the caller's current sim clock.
 *
 * P3 (defensive kill-switch reading): with `frozen = true` the verdict is
 * still the player's and is NEVER lost — the consult is consumed, a
 * `consult-deferred` row is journaled, and the intents wait in
 * `state.deferredResolutions` until the first unfrozen live `runRulePhase`
 * dispatches them. Nothing goes out while the Kill Switch stands.
 */
export function resolveConsultation(
  state: PolicyRuntimeState,
  pendingId: string,
  approve: boolean,
  decidedAtUs: SimTimeUs,
  frozen = false,
): ConsultResolution {
  const pending = state.pendingConsults.find((p) => p.pendingId === pendingId);
  if (pending === undefined) {
    throw new PolicyEvalError(`no pending consultation "${pendingId}" to resolve`);
  }
  const withoutPending = state.pendingConsults.filter((p) => p.pendingId !== pendingId);
  const scratch: RunScratch = {
    sustained: new Map(state.sustainedSinceUs),
    latched: new Set(state.latched),
    snapshots: new Map(state.snapshots),
    snapWrites: new Map(),
    pending: withoutPending,
    deferred: [...state.deferredResolutions],
    intentSeq: state.nextIntentSeq,
    entries: [],
    consultExpiry: DEFAULT_CONSULT_EXPIRY_US,
    observed: new Map(),
    allEntities: [],
  };
  if (frozen) {
    scratch.deferred.push({
      pendingId: pending.pendingId,
      ruleId: pending.ruleId,
      actions: pending.actions,
      target: pending.target,
      raisedAtTick: pending.raisedAtTick,
      decidedAtUs,
      approve,
    });
    scratch.entries.push({
      ruleId: pending.ruleId,
      tick: pending.raisedAtTick,
      atUs: decidedAtUs,
      mode: "live",
      band: "consult",
      stage: "consult-deferred",
      intents: 0,
    });
    return { state: commit(state, scratch), intents: [], entries: scratch.entries };
  }
  const intents = approve ? buildIntents(scratch, pending.ruleId, pending.actions, pending.target, decidedAtUs) : [];
  scratch.entries.push({
    ruleId: pending.ruleId,
    tick: pending.raisedAtTick,
    atUs: decidedAtUs,
    mode: "live",
    band: "consult",
    stage: approve ? "consult-dispatched" : "consult-denied",
    intents: intents.length,
  });
  return {
    state: commit(state, scratch),
    intents,
    entries: scratch.entries,
  };
}

/* ═══════════════════════ Serialization (ticker / save / replay) ══════════ */

/** Canonical fire-log serialization: one line per entry, "|"-joined, bigints
 *  stringified — byte-stable across runs and runtimes (G-slice acceptance 1). */
export function serializeFireLog(source: readonly PolicyFireEntry[] | FireLog): string {
  const entries = "total" in source ? fireLogEntries(source) : source;
  return entries
    .map(
      (entry) =>
        `${entry.tick}|${entry.ruleId}|${entry.mode}|${entry.band}|${entry.stage}|${entry.intents}|${entry.atUs}`,
    )
    .join("\n");
}

/** Minimal JSON-safe state view for the save module (fire log travels with
 *  the replay artifact, not the state snapshot). */
export interface RuntimeStateSnapshot {
  readonly sustained: readonly (readonly [RuleId, string])[];
  readonly latched: readonly RuleId[];
  readonly snapshots: readonly (readonly [string, string])[];
  readonly pendingConsults: readonly {
    readonly pendingId: string;
    readonly ruleId: RuleId;
    readonly actions: readonly PolicyAction[];
    readonly target: EntityId | null;
    readonly raisedAtTick: string;
    readonly raisedAtUs: string;
    readonly expiresAtUs: string;
  }[];
  readonly nextIntentSeq: number;
  /** P3: optional for snapshot-format back-compat — older saves restore to
   *  an empty queue. */
  readonly deferredResolutions?: readonly {
    readonly pendingId: string;
    readonly ruleId: RuleId;
    readonly actions: readonly PolicyAction[];
    readonly target: EntityId | null;
    readonly raisedAtTick: string;
    readonly decidedAtUs: string;
    readonly approve: boolean;
  }[];
}

export function serializeState(state: PolicyRuntimeState): RuntimeStateSnapshot {
  return {
    sustained: [...state.sustainedSinceUs.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
      .map(([ruleId, us]) => [ruleId, us.toString()] as const),
    latched: [...state.latched].sort(),
    snapshots: [...state.snapshots.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).map(([k, v]) => [k, v.toString()] as const),
    pendingConsults: state.pendingConsults.map((p) => ({
      pendingId: p.pendingId,
      ruleId: p.ruleId,
      actions: p.actions,
      target: p.target,
      raisedAtTick: p.raisedAtTick.toString(),
      raisedAtUs: p.raisedAtUs.toString(),
      expiresAtUs: p.expiresAtUs.toString(),
    })),
    nextIntentSeq: state.nextIntentSeq,
    deferredResolutions: state.deferredResolutions.map((d) => ({
      pendingId: d.pendingId,
      ruleId: d.ruleId,
      actions: d.actions,
      target: d.target,
      raisedAtTick: d.raisedAtTick.toString(),
      decidedAtUs: d.decidedAtUs.toString(),
      approve: d.approve,
    })),
  };
}

export function restoreState(
  snapshot: RuntimeStateSnapshot,
  fireLog: readonly PolicyFireEntry[] | FireLog = emptyFireLog(),
): PolicyRuntimeState {
  return {
    sustainedSinceUs: new Map(snapshot.sustained.map(([r, us]) => [r, BigInt(us)])),
    latched: new Set(snapshot.latched),
    snapshots: new Map(snapshot.snapshots.map(([k, v]) => [k, BigInt(v)])),
    pendingConsults: snapshot.pendingConsults.map((p) => ({
      pendingId: p.pendingId,
      ruleId: p.ruleId,
      actions: p.actions,
      target: p.target,
      raisedAtTick: BigInt(p.raisedAtTick) as SimTick,
      raisedAtUs: BigInt(p.raisedAtUs),
      expiresAtUs: BigInt(p.expiresAtUs),
    })),
    deferredResolutions: (snapshot.deferredResolutions ?? []).map((d) => ({
      pendingId: d.pendingId,
      ruleId: d.ruleId,
      actions: d.actions,
      target: d.target,
      raisedAtTick: BigInt(d.raisedAtTick) as SimTick,
      decidedAtUs: BigInt(d.decidedAtUs),
      approve: d.approve,
    })),
    nextIntentSeq: snapshot.nextIntentSeq,
    fireLog: "total" in fireLog ? fireLog : appendFireLog(emptyFireLog(), fireLog),
  };
}

/* ═══════════════════════ Pipeline-slot adapter ═══════════════════════ */

/**
 * Stateful wrapper giving the bare `TickStep<RulePhaseIn, RulePhaseOut>`
 * shape PipelineSlots expects. The closure mutates ONLY its own
 * PolicyRuntimeState — reachable via getState/setState for saves and for the
 * determinism harness. `getConfig` is re-read per tick so the host can flip
 * shadow/live/kill-switch without rebuilding the slot.
 */
export function createRulePhaseStep(
  getConfig: () => PolicyEvaluationConfig = () => defaultEvaluationConfig,
): {
  readonly step: (input: RulePhaseIn) => RulePhaseOut;
  getState: () => PolicyRuntimeState;
  setState: (state: PolicyRuntimeState) => void;
} {
  let state = createRuntimeState();
  return {
    step: (input: RulePhaseIn) => {
      const result = runRulePhase(state, input, getConfig());
      state = result.state;
      return result.out;
    },
    getState: () => state,
    setState: (next: PolicyRuntimeState) => {
      state = next;
    },
  };
}
