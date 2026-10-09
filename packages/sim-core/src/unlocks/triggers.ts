/**
 * unlocks/triggers.ts — THE UNLOCK TRIGGER ENGINE v0 (hg §5.1 taxonomy,
 * audit g16 TOP-PROBLEMS #2: "all seven UnlockVia values are persistence
 * vocabulary in save/node.ts; nothing emits a scar, fires a milestone,
 * opens a node, or prices an unlock").
 *
 * DESIGN LAW — OBSERVER, NOT MUTATOR. This engine is fed (tick, minute,
 * SimEvents, economy notices, era year, host declarations) from OUTSIDE
 * GameState and folds them into its own internal store, emitting
 * UnlockProposal rows. It never touches GameState, so every existing
 * digest golden stays byte-identical when it is attached (pinned
 * falsifiably in __tests__/integration.test.ts). Wiring it into the
 * drivers is Phase-2 — the seam is `observe(tickInput)` (README).
 *
 * VOCABULARY MIRROR (deliberate, not duplication): the seven `via` values
 * are save/'s `UnlockVia` union verbatim (save/node.ts:231) — this file
 * re-declares the SAME closed set instead of importing it, exactly as
 * pipeline re-declares its board slice rather than importing topology/.
 * save/ stays a pure persistence leaf; unlocks/ stays independently
 * consumable. If the two ever drift, tsc refuses the structural handoff
 * at the record shape (NodeUnlockRecord.via) — the drift cannot go silent.
 *
 * §5.1 trigger census (v0 scope, stated honestly):
 *  - scar          — COMPUTED from the event stream: bounces repeated at a
 *    node, false-positive blocks, breaches landing, and economy pain
 *    notices (written-off, churned, suspended, spiral-flagged).
 *  - milestone     — COMPUTED: sim-minute thresholds crossed ("the
 *    threshold is the consequence", §5.3 — the fire itself is the
 *    mechanic; per-metric content thresholds ride config).
 *  - era           — COMPUTED: a flip of the host-declared era year.
 *  - foresight / testimony / anticipation / acquisition — DECLARATION
 *    channels: the engine has no forecast feed, no reading screen, no
 *    token-spent event and no succession runner yet (each is its own
 *    §5.x Phase-2 hole, catalogued in README). The host declares the
 *    experience happened; the trigger stamps it into a proposal. That is
 *    the whole v0 story for these four — no invented mechanics.
 *
 * Proposals are ONCE PER targetRef per observer (the unlock has fired;
 * re-observing the pain does not re-unlock). Predicates themselves are
 * pure "what is true of this snapshot" functions — dedup is the
 * observer's job, so unit tests can read the raw verdicts.
 *
 * Imports ONLY ../types.ts (Law: engine stays a leaf — no pipeline,
 * no economy, no save at runtime; observations arrive structurally).
 */

import type { CauseId, EntityId, SimEvent, SimMinute, SimTick } from "../types.ts";
import { asCauseId, asEntityId } from "../types.ts";

/* ═══════════════════════════ vocabulary ═══════════════════════════ */

/** Mirror of save/node.ts:231 `UnlockVia` (see VOCABULARY MIRROR header). */
export type UnlockTriggerKind =
  | "scar"
  | "foresight"
  | "testimony"
  | "anticipation"
  | "milestone"
  | "era"
  | "acquisition";

export const UNLOCK_TRIGGER_KINDS: readonly UnlockTriggerKind[] = Object.freeze([
  "scar",
  "foresight",
  "testimony",
  "anticipation",
  "milestone",
  "era",
  "acquisition",
]);

/** The four kinds the engine cannot COMPUTE from the event stream yet —
 *  they arrive only as host declarations (§5.1's other acquisition paths). */
export type UnlockDeclaredKind = "foresight" | "testimony" | "anticipation" | "acquisition";

export const UNLOCK_DECLARED_KINDS: readonly UnlockDeclaredKind[] = Object.freeze([
  "foresight",
  "testimony",
  "anticipation",
  "acquisition",
]);

/** What an unlock hangs off (hg §5.1: "unlocks hang off EXPERIENCES").
 *  For computed scars the targetRef IS the durable scar identity
 *  (`scar:bounce:<node>` …); the record-side NodeUnlockRecord.scarRef
 *  (save/node.ts:233-247) is where a proposal lands once the host accepts. */
export interface UnlockProposal {
  readonly via: UnlockTriggerKind;
  readonly targetRef: EntityId;
  readonly atTick: SimTick;
  /** Attribution end-to-end (§7.0): the cause of the triggering experience
   *  — the crossing event's causeId when one exists, else a minted
   *  `unlocks:<targetRef>` cause. */
  readonly causeId: CauseId;
}

/* ═══════════════════════════ errors ═══════════════════════════ */

export type UnlocksErrorCode = "bad-config" | "bad-clock" | "bad-value" | "unknown-prereq";

/** Boundary error; message grammar `unlocks[CODE] at 'path': detail`
 *  (the versus/unattended family). */
export class UnlocksError extends Error {
  readonly code: UnlocksErrorCode;
  readonly path: string;

  constructor(code: UnlocksErrorCode, path: string, detail: string) {
    super(`unlocks[${code}] at '${path}': ${detail}`);
    this.name = "UnlocksError";
    this.code = code;
    this.path = path;
  }
}

function assertPositiveInt(value: number, path: string): void {
  if (!Number.isSafeInteger(value) || value < 1) {
    throw new UnlocksError("bad-config", path, `expected a positive safe integer, got ${String(value)}`);
  }
}

/* ═══════════════════════════ config ═══════════════════════════ */

export interface MilestoneThreshold {
  /** Sim-minute at which the milestone crosses (1440 = one business day). */
  readonly atMinute: SimMinute;
  /** Slug folded into the targetRef `milestone:<label>`. */
  readonly label: string;
}

export interface UnlockObserverConfig {
  /** Lifetime bounces AT ONE NODE after which the node earns a scar. */
  readonly bounceScarAfter: number;
  /** Lifetime blocked-false-positives at one node after which it scars. */
  readonly falsePositiveScarAfter: number;
  /** Lifetime landed breaches after which the estate scars. */
  readonly landedScarAfter: number;
  /** Economy notice kind → lifetime count after which the pain scars
   *  (hg §5.2 business scars; kinds are EconomyNoticeKind strings,
   *  matched structurally — economy stays decoupled from unlocks). */
  readonly noticeScarAfter: Readonly<Record<string, number>>;
  /** Ascending sim-minute milestones (§5.3; defaults = time survived,
   *  content-authored per-metric thresholds replace these in Phase-2). */
  readonly milestoneMinutes: readonly MilestoneThreshold[];
}

export const DEFAULT_UNLOCK_OBSERVER_CONFIG: UnlockObserverConfig = Object.freeze({
  bounceScarAfter: 5,
  falsePositiveScarAfter: 3,
  landedScarAfter: 1,
  noticeScarAfter: Object.freeze({
    "written-off": 1,
    "churned-voluntary": 1,
    suspended: 1,
    "spiral-flagged": 1,
  }),
  milestoneMinutes: Object.freeze([
    Object.freeze({ atMinute: 1440, label: "first-day-survived" }),
    Object.freeze({ atMinute: 10080, label: "first-week-survived" }),
    Object.freeze({ atMinute: 43200, label: "first-month-survived" }),
  ]),
});

/** THE parse-don't-validate boundary (Laws 2/4): every observer entry
 *  point runs overrides through here once; internals trust the result. */
export function parseUnlockObserverConfig(
  overrides: Partial<UnlockObserverConfig> = {},
): UnlockObserverConfig {
  const base = DEFAULT_UNLOCK_OBSERVER_CONFIG;
  const bounceScarAfter = overrides.bounceScarAfter ?? base.bounceScarAfter;
  const falsePositiveScarAfter = overrides.falsePositiveScarAfter ?? base.falsePositiveScarAfter;
  const landedScarAfter = overrides.landedScarAfter ?? base.landedScarAfter;
  assertPositiveInt(bounceScarAfter, "config.bounceScarAfter");
  assertPositiveInt(falsePositiveScarAfter, "config.falsePositiveScarAfter");
  assertPositiveInt(landedScarAfter, "config.landedScarAfter");

  const noticeSource = overrides.noticeScarAfter ?? base.noticeScarAfter;
  const noticeScarAfter: Record<string, number> = {};
  for (const kind of Object.keys(noticeSource).sort()) {
    if (kind.length === 0) throw new UnlocksError("bad-config", "config.noticeScarAfter", "empty notice kind");
    assertPositiveInt(noticeSource[kind] as number, `config.noticeScarAfter.${kind}`);
    noticeScarAfter[kind] = noticeSource[kind] as number;
  }

  const milestones = overrides.milestoneMinutes ?? base.milestoneMinutes;
  if (!Array.isArray(milestones)) {
    throw new UnlocksError("bad-config", "config.milestoneMinutes", "must be an array");
  }
  const seenLabels = new Set<string>();
  const seenMinutes = new Set<number>();
  let previousMinute = -Infinity;
  for (const [index, row] of milestones.entries()) {
    const at = row?.atMinute;
    const label = row?.label;
    if (typeof at !== "number" || !Number.isSafeInteger(at) || at < 1) {
      throw new UnlocksError("bad-config", `config.milestoneMinutes[${index}].atMinute`, `expected a positive safe-integer minute, got ${String(at)}`);
    }
    if (typeof label !== "string" || label.length === 0 || label.includes(":")) {
      throw new UnlocksError("bad-config", `config.milestoneMinutes[${index}].label`, `expected a non-empty ':'-free slug, got ${String(label)}`);
    }
    if (seenLabels.has(label)) throw new UnlocksError("bad-config", `config.milestoneMinutes[${index}].label`, `duplicate label "${label}"`);
    if (seenMinutes.has(at)) throw new UnlocksError("bad-config", `config.milestoneMinutes[${index}].atMinute`, `duplicate minute ${at}`);
    if (at <= previousMinute) {
      throw new UnlocksError("bad-config", `config.milestoneMinutes[${index}].atMinute`, `minutes must ascend strictly (${at} after ${previousMinute})`);
    }
    seenLabels.add(label);
    seenMinutes.add(at);
    previousMinute = at;
  }

  return Object.freeze({
    bounceScarAfter,
    falsePositiveScarAfter,
    landedScarAfter,
    noticeScarAfter: Object.freeze(noticeScarAfter),
    milestoneMinutes: Object.freeze(milestones.map((row) => Object.freeze({ atMinute: row.atMinute, label: row.label }))),
  });
}

/* ═══════════════════════════ observation shapes ═══════════════════════════ */

/** Structural mirror of the fields unlocks reads off `EconomyNotice`
 *  (economy/tick.ts:207) — matched on `kind` strings, no import: economy
 *  stays free to rename its union while the shipped kinds hold. */
export interface UnlockNoticeLike {
  readonly kind: string;
  readonly causeId: string;
}

/** A host-declared experience the engine cannot observe itself (§5.1:
 *  foresight = a correct prediction paid off, testimony = something read,
 *  anticipation = a token spent, acquisition = an inherited node). */
export interface UnlockDeclaration {
  readonly via: UnlockDeclaredKind;
  readonly targetRef: EntityId;
  readonly causeId?: CauseId;
}

/** ONE tick's feed into the observer (the Phase-2 integration seam:
 *  a host ticker forwards `{tick, minute, events, notices, eraYear}`). */
export interface UnlockTickInput {
  readonly tick: SimTick;
  readonly minute: SimMinute;
  readonly events?: readonly SimEvent[];
  readonly notices?: readonly UnlockNoticeLike[];
  /** Host's current era year (loader/eras.ts vocabulary); null = no era
   *  channel wired. */
  readonly eraYear?: number | null;
  readonly declarations?: readonly UnlockDeclaration[];
}

/** Lifetime counters folded from every observed window. Keys (shared
 *  with `causes`): `bounce:<node>`, `false-positive:<node>`, `landed`,
 *  `notice:<kind>`. */
export interface UnlockCounters {
  readonly bounceCountByNode: ReadonlyMap<string, number>;
  readonly falsePositiveCountByNode: ReadonlyMap<string, number>;
  readonly landedCount: number;
  readonly noticeCountByKind: ReadonlyMap<string, number>;
}

/** The trusted, immutable snapshot every predicate reads — one per
 *  `observe()` call. `causes` maps each counter key to the causeId of the
 *  MOST RECENT event contributing to it (deterministic in feed order). */
export interface UnlockObservation {
  readonly tick: SimTick;
  readonly minute: SimMinute;
  readonly counters: UnlockCounters;
  readonly causes: ReadonlyMap<string, CauseId>;
  readonly eraYear: number | null;
  /** True only on a flip between two known years — the first sighting of
   *  an era establishes the baseline and never counts as a change. */
  readonly eraChanged: boolean;
  /** This window's host declarations (window-scoped, never accumulated). */
  readonly declarations: readonly UnlockDeclaration[];
}

/** Node id for events whose nodeId is null (a bounce with no shedding
 *  node is still pain — it scars the `_unattributed` bucket, honestly
 *  named rather than silently dropped). */
export const UNATTRIBUTED_NODE = "_unattributed";

function assertClock(tick: SimTick, minute: SimMinute, where: string): void {
  if (typeof tick !== "bigint" || tick < 0n) {
    throw new UnlocksError("bad-clock", where, `tick must be a non-negative bigint, got ${String(tick)}`);
  }
  if (typeof minute !== "number" || !Number.isSafeInteger(minute) || minute < 0) {
    throw new UnlocksError("bad-clock", where, `minute must be a non-negative safe integer, got ${String(minute)}`);
  }
}

/* ═══════════════════════════ the fold ═══════════════════════════ */

function bump(
  map: Map<string, number>,
  key: string,
  causes: Map<string, CauseId>,
  causeKey: string,
  cause: CauseId,
): void {
  map.set(key, (map.get(key) ?? 0) + 1);
  causes.set(causeKey, cause);
}

/** Pure fold: previous snapshot + this window → new snapshot (Law 3 —
 *  nothing is mutated; the observer stores only the returned value). */
export function observeUnlockWindow(
  previous: UnlockObservation | null,
  input: UnlockTickInput,
): UnlockObservation {
  assertClock(input.tick, input.minute, "observeUnlockWindow");

  const bounceCountByNode = new Map(previous?.counters.bounceCountByNode ?? []);
  const falsePositiveCountByNode = new Map(previous?.counters.falsePositiveCountByNode ?? []);
  const noticeCountByKind = new Map(previous?.counters.noticeCountByKind ?? []);
  const causes = new Map<string, CauseId>(previous?.causes ?? []);
  let landedCount = previous?.counters.landedCount ?? 0;

  for (const event of input.events ?? []) {
    const cause = asCauseId(event.causeId);
    if (event.kind === "bounced") {
      const node = event.nodeId ?? UNATTRIBUTED_NODE;
      bump(bounceCountByNode, node, causes, `bounce:${node}`, cause);
      continue;
    }
    if (event.kind === "blocked-false-positive") {
      bump(falsePositiveCountByNode, event.nodeId, causes, `false-positive:${String(event.nodeId)}`, cause);
      continue;
    }
    if (event.kind === "landed") {
      landedCount += 1;
      causes.set("landed", cause);
    }
  }
  for (const notice of input.notices ?? []) {
    bump(noticeCountByKind, notice.kind, causes, `notice:${notice.kind}`, asCauseId(notice.causeId));
  }

  const eraYear = input.eraYear ?? null;
  const eraChanged = previous?.eraYear != null && eraYear != null && previous.eraYear !== eraYear;
  if (eraChanged) {
    causes.set(`era:${String(eraYear)}`, asCauseId(`unlocks:era:${String(eraYear)}`));
  }

  return Object.freeze({
    tick: input.tick,
    minute: input.minute,
    counters: Object.freeze({
      bounceCountByNode,
      falsePositiveCountByNode,
      landedCount,
      noticeCountByKind,
    }),
    causes,
    eraYear,
    eraChanged,
    declarations: Object.freeze([...(input.declarations ?? [])]),
  });
}

/* ═══════════════════════════ predicates ═══════════════════════════ */

function mintCause(obs: UnlockObservation, key: string): CauseId {
  return obs.causes.get(key) ?? asCauseId(`unlocks:${key}`);
}

function proposal(via: UnlockTriggerKind, targetRef: string, obs: UnlockObservation, causeKey: string): UnlockProposal {
  return Object.freeze({
    via,
    targetRef: asEntityId(targetRef),
    atTick: obs.tick,
    causeId: mintCause(obs, causeKey),
  });
}

/** §5.1/§5.2 — pain the estate has already absorbed, from lifetime
 *  counters. Deterministic iteration: sorted node ids, then notice kinds. */
export function scarTrigger(
  obs: UnlockObservation,
  cfg: UnlockObserverConfig = DEFAULT_UNLOCK_OBSERVER_CONFIG,
): readonly UnlockProposal[] {
  const out: UnlockProposal[] = [];

  const bouncedNodes = [...obs.counters.bounceCountByNode.entries()]
    .filter(([, count]) => count >= cfg.bounceScarAfter)
    .map(([node]) => node)
    .sort();
  for (const node of bouncedNodes) {
    out.push(proposal("scar", `scar:bounce:${node}`, obs, `bounce:${node}`));
  }

  const fpNodes = [...obs.counters.falsePositiveCountByNode.entries()]
    .filter(([, count]) => count >= cfg.falsePositiveScarAfter)
    .map(([node]) => node)
    .sort();
  for (const node of fpNodes) {
    out.push(proposal("scar", `scar:false-positive:${node}`, obs, `false-positive:${node}`));
  }

  if (obs.counters.landedCount >= cfg.landedScarAfter) {
    out.push(proposal("scar", "scar:landed", obs, "landed"));
  }

  for (const kind of Object.keys(cfg.noticeScarAfter).sort()) {
    const after = cfg.noticeScarAfter[kind] as number;
    if ((obs.counters.noticeCountByKind.get(kind) ?? 0) >= after) {
      out.push(proposal("scar", `scar:notice:${kind}`, obs, `notice:${kind}`));
    }
  }

  return Object.freeze(out);
}

/** §5.3 — time-survived thresholds; a milestone is true of every snapshot
 *  past its minute, the observer's once-per-target law makes it fire once. */
export function milestoneTrigger(
  obs: UnlockObservation,
  cfg: UnlockObserverConfig = DEFAULT_UNLOCK_OBSERVER_CONFIG,
): readonly UnlockProposal[] {
  const out: UnlockProposal[] = [];
  for (const row of cfg.milestoneMinutes) {
    if (obs.minute < row.atMinute) continue;
    out.push(proposal("milestone", `milestone:${row.label}`, obs, `milestone:${row.label}`));
  }
  return Object.freeze(out);
}

/** §5.1 era channel / loader/eras.ts flip (audit g16 TOP-PROBLEMS #6:
 *  era is the only trigger with a resolver — this is its first consumer). */
export function eraTrigger(obs: UnlockObservation): readonly UnlockProposal[] {
  if (!obs.eraChanged || obs.eraYear === null) return Object.freeze([]);
  return Object.freeze([proposal("era", `era:${String(obs.eraYear)}`, obs, `era:${String(obs.eraYear)}`)]);
}

/** The four declaration channels — pass-through, stamped with this tick. */
export function declaredTrigger(obs: UnlockObservation): readonly UnlockProposal[] {
  return Object.freeze(
    obs.declarations.map((decl) =>
      Object.freeze({
        via: decl.via,
        targetRef: decl.targetRef,
        atTick: obs.tick,
        causeId: decl.causeId ?? asCauseId(`unlocks:declared:${decl.via}:${decl.targetRef}`),
      }) satisfies UnlockProposal,
    ),
  );
}

/** Canonical evaluation order (deterministic proposal stream): the whole
 *  §5.1 v0 taxonomy in one call. */
export function evaluateUnlockTriggers(
  obs: UnlockObservation,
  cfg: UnlockObserverConfig = DEFAULT_UNLOCK_OBSERVER_CONFIG,
): readonly UnlockProposal[] {
  return Object.freeze([
    ...scarTrigger(obs, cfg),
    ...milestoneTrigger(obs, cfg),
    ...eraTrigger(obs),
    ...declaredTrigger(obs),
  ]);
}

/* ═══════════════════════════ the observer ═══════════════════════════ */

export interface UnlockObserver {
  /** THE integration seam (README, Phase-2): feed one tick's observables,
   *  get the NEWLY fired proposals (once per targetRef for the run's
   *  life). Feeding the same window twice is idempotent on proposals —
   *  counters double, but an already-proposed target never refires. */
  readonly observe: (input: UnlockTickInput) => readonly UnlockProposal[];
  /** Accepted-surface view: every proposal this run has ever fired, in
   *  firing order. Feed this to prereqs/codex + (Phase-2) the save writer. */
  readonly proposals: () => readonly UnlockProposal[];
  /** The latest trusted snapshot (null before the first observe). */
  readonly lastObservation: () => UnlockObservation | null;
  readonly config: UnlockObserverConfig;
}

export function createUnlockObserver(
  overrides: Partial<UnlockObserverConfig> = {},
): UnlockObserver {
  const config = parseUnlockObserverConfig(overrides);
  let observation: UnlockObservation | null = null;
  const fired: UnlockProposal[] = [];
  const firedRefs = new Set<string>();

  function observe(input: UnlockTickInput): readonly UnlockProposal[] {
    observation = observeUnlockWindow(observation, input);
    const fresh: UnlockProposal[] = [];
    for (const candidate of evaluateUnlockTriggers(observation, config)) {
      if (firedRefs.has(candidate.targetRef)) continue;
      firedRefs.add(candidate.targetRef);
      fired.push(candidate);
      fresh.push(candidate);
    }
    return Object.freeze(fresh);
  }

  return Object.freeze({
    observe,
    proposals: () => Object.freeze([...fired]),
    lastObservation: () => observation,
    config,
  });
}
