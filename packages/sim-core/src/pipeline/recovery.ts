/**
 * §7.7 RECOVERY HALF v0 — second failure window · gradual restoration ·
 * safe mode (audit g21: "nine consecutive headings, whole recovery half
 * absent"). Everything here is presence-gated: the driver folds recovery
 * ONLY when wired with `options.recovery`, and `GameState.recovery` is
 * absorbed by pipeline/digest.ts ONLY when present — every shipped golden
 * (shed trio, drain 78dc6556, g4 13ba145f, g5 digestQuarter, headless
 * parity) digests byte-identically with the seam absent.
 *
 * The three mechanics, in the primitives the engine already has:
 *
 * 1. SECOND FAILURE WINDOW (§7.7 "During any degraded state ... show a
 *    timer the player desperately wants to see hit zero"). A node that was
 *    STRUGGLING (bounced ≥ threshold units in a tick — the engine's own
 *    degraded-state witness, R-06/R-10 idioms) and then went quiet opens a
 *    countdown window at open+windowMinutes. Another struggle INSIDE the
 *    window is the "second failure" the node "cannot survive": it costs a
 *    LOCK — the node drops to safe-mode posture and the clock restarts.
 *
 * 2. GRADUAL RESTORATION (§7.7 "Recovery is gameplay"; the counter the
 *    cold-cache thundering-herd heading names for slow-start / gradual
 *    traffic admission). While a window lives, the node does NOT snap back
 *    to full redundancy: the serve step sees only `effectiveSlots` arms,
 *    climbing +1 arm every `rampMinutes` by pure minute math — never an
 *    RNG draw, never a wall clock. Higher ρ on fewer arms during the ramp
 *    is the emergent "serve on the fragile single copy" pressure.
 *
 * 3. SAFE MODE (§7.7 "shed to minimal viable posture"). The lock floor:
 *    `floorSlots` arms, held for `windowMinutes`, then the window resumes
 *    its climb from the floor. Strikes accumulate per episode.
 *
 * Occupancy law (fail-safe, pinned by tests): a truncation NEVER evicts an
 * occupied slot — the shrink defers until the arm's unit has walked off.
 * Window CLOSE requires the climb to have reached full arms (minute math
 * makes closesAt ≥ the full-ramp minute) plus one untouched tick, so the
 * stored node is already whole when the record disappears — no restore
 * channel can leak a truncated node.
 *
 * The struggle witness is THIS tick's `bounced` events carrying the node id
 * (patience bounces R-10 and hard-ceiling sheds R-06 both name it). There
 * is a deliberate one-tick reaction lag: the fold runs after the tick is
 * formed, so a window opened/struck at minute M shapes the serve at M+1 —
 * deterministic, documented, pinned.
 */

import type {
  CauseId,
  EntityId,
  GameState,
  NodeRecord,
  NodeSlotRecord,
  RecoveryState,
  RecoveryWindowPhase,
  RecoveryWindowRecord,
  SimEvent,
  SimMinute,
} from "../types.ts";
import { asCauseId } from "../types.ts";
import { sortedIds } from "./internal.ts";

/* ────────────────────────────── errors ──────────────────────────────── */

/** Boundary parse/posture failures halt loudly with `recovery[CODE]: detail`
 *  (the house error family — unattended/versus/audio shape). */
export class RecoveryError extends Error {
  override readonly name = "RecoveryError";
}

function fail(code: string, at: string, detail: string): never {
  throw new RecoveryError(`recovery[${code}] at '${at}': ${detail}`);
}

/* ────────────────────────────── config ──────────────────────────────── */

/** Every value PROVISIONAL — ratify-on-playtest, same class as the death
 *  thresholds (economy/death.ts) and the elasticity coefficients. Minutes
 *  are SIM minutes (1 tick == 1 sim minute on the shipped macro clock). */
export interface RecoveryConfig {
  /** Length of the untouched shadow countdown (§7.7 Second Failure Window);
   *  also the hold of a safe-mode lock. PROVISIONAL 12 — mirrors the proto
   *  incident clock's `recovering` minute-fold (@2ef5cae) so the two
   *  degradations narratives stay legible side by side. */
  readonly windowMinutes: number;
  /** Minutes each restored arm stays clamped before the next one opens
   *  (gradual restoration / slow-start). PROVISIONAL 4. */
  readonly rampMinutes: number;
  /** Minimal viable posture: arms visible during the ramp start and every
   *  safe-mode lock. PROVISIONAL 1. */
  readonly floorSlots: number;
  /** Bounces attributed to one node in one tick that count as STRUGGLING.
   *  PROVISIONAL 2 (one silent patience bounce is weather; a burst is a
   *  degraded node). */
  readonly struggleBounceThreshold: number;
  /** Quiet minutes after the last struggle before the shadow window opens
   *  (the node "finished stabilizing"). PROVISIONAL 1 — pure minute math,
   *  no timers. */
  readonly quietMinutes: number;
}

/** The shipped default book (all PROVISIONAL — see RecoveryConfig). */
export function defaultRecoveryConfig(): RecoveryConfig {
  return Object.freeze({
    windowMinutes: 12,
    rampMinutes: 4,
    floorSlots: 1,
    struggleBounceThreshold: 2,
    quietMinutes: 1,
  });
}

/** Closed vocabulary of config keys — an unknown key is authoring poison. */
const RECOVERY_CONFIG_KEYS: readonly (keyof RecoveryConfig)[] = Object.freeze([
  "windowMinutes",
  "rampMinutes",
  "floorSlots",
  "struggleBounceThreshold",
  "quietMinutes",
]);

/** Fail-loud boundary parse (Law 2): every field must be a positive safe
 *  integer; unknown/missing keys, floats, zero, negatives all throw naming
 *  the exact path. Takes `unknown` so the driver can hand it the typed
 *  option AND a foreign JSON book alike — one parser, one truth. */
export function parseRecoveryConfig(raw: unknown): RecoveryConfig {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    fail("bad-shape", "recovery", `expected a config object, got ${String(raw)}`);
  }
  const book = raw as Readonly<Record<string, unknown>>;
  for (const key of Object.keys(book)) {
    if (!(RECOVERY_CONFIG_KEYS as readonly string[]).includes(key)) {
      fail("unknown-key", `recovery.${key}`, `not in {${RECOVERY_CONFIG_KEYS.join(", ")}}`);
    }
  }
  const positiveInt = (name: keyof RecoveryConfig): number => {
    const value = book[name];
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
      fail("bad-value", `recovery.${name}`, `expected positive safe integer, got ${String(value)}`);
    }
    return value as number;
  };
  return Object.freeze({
    windowMinutes: positiveInt("windowMinutes"),
    rampMinutes: positiveInt("rampMinutes"),
    floorSlots: positiveInt("floorSlots"),
    struggleBounceThreshold: positiveInt("struggleBounceThreshold"),
    quietMinutes: positiveInt("quietMinutes"),
  });
}

/* ────────────────────────────── notices ─────────────────────────────── */

/** What the recovery fold can say about a node. Closed vocabulary; the
 *  TickResult `recovery` channel exists ONLY on recovery-wired drivers (the
 *  unlockProposals precedent) so nothing here ever rides the frozen
 *  SimEvent union in types.ts. */
export type RecoveryNoticeKind =
  /** First struggle above threshold — the episode that will open a window. */
  | "episode"
  /** Quiet long enough: the shadow countdown opened (ramp starts at floor). */
  | "window-opened"
  /** A struggle INSIDE a live window — the second failure §7.7 warns of. */
  | "second-failure"
  /** Safe-mode posture engaged (the lock consequence of a strike). */
  | "lock-engaged"
  /** Countdown hit zero untouched at full arms — node restored. */
  | "window-cleared";

export interface RecoveryNotice {
  readonly kind: RecoveryNoticeKind;
  readonly nodeId: EntityId;
  readonly atMinute: SimMinute;
  /** Strikes carried AFTER this notice (episode/clear notices pass 0/current). */
  readonly strikes: number;
  /** Arms the node will serve with next tick. */
  readonly effectiveSlots: number;
  /** `recovery:<kind>:<nodeId>:<minute>` — cause-grammar consistent with the
   *  economy's `economy:<domain>:<id>` families. */
  readonly causeId: CauseId;
}

export const RECOVERY_NOTICE_KINDS: readonly RecoveryNoticeKind[] = Object.freeze([
  "episode",
  "window-opened",
  "second-failure",
  "lock-engaged",
  "window-cleared",
]);

function notice(
  kind: RecoveryNoticeKind,
  nodeId: EntityId,
  minute: SimMinute,
  strikes: number,
  effectiveSlots: number,
): RecoveryNotice {
  return Object.freeze({
    kind,
    nodeId,
    atMinute: minute,
    strikes,
    effectiveSlots,
    causeId: asCauseId(`recovery:${kind}:${nodeId}:${minute}`),
  });
}

/* ────────────────────────── struggle witness ────────────────────────── */

/** Count THIS tick's `bounced` events per node (R-06 sheds and R-10
 *  patience bounces both name the node; nodeId-null bounces are unowned
 *  roster reap and count nowhere). Pure fold over events — Law 3. */
export function countStrugglesByNode(events: readonly SimEvent[]): ReadonlyMap<EntityId, number> {
  const counts = new Map<EntityId, number>();
  for (const event of events) {
    if (event.kind !== "bounced" || event.nodeId === null) continue;
    counts.set(event.nodeId, (counts.get(event.nodeId) ?? 0) + 1);
  }
  return counts;
}

/* ────────────────────────────── the fold ────────────────────────────── */

export interface RecoveryFoldResult {
  /** undefined = idle-absent (no windows, no episode memory) — the slice
   *  key LEAVES GameState, matching the absent-while-idle house law. */
  readonly state: RecoveryState | undefined;
  readonly notices: readonly RecoveryNotice[];
}

/** Ramp target for a window at `minute` — pure minute math: floor + one
 *  arm per whole `rampMinutes` since the (re)open, capped at full arms. */
function rampTarget(rec: RecoveryWindowRecord, minute: SimMinute, cfg: RecoveryConfig): number {
  const elapsed = minute - rec.openedAtMinute;
  const arms = cfg.floorSlots + Math.floor(elapsed / cfg.rampMinutes);
  return Math.min(rec.fullSlots, arms);
}

/** The window's zero-hour minute: never before the countdown, and never
 *  before the climb can physically reach full arms (so close ⇒ whole). */
function closesAt(openMinute: SimMinute, fullSlots: number, cfg: RecoveryConfig): SimMinute {
  const rampSpan = cfg.rampMinutes * Math.max(0, fullSlots - cfg.floorSlots);
  return openMinute + Math.max(cfg.windowMinutes, rampSpan);
}

/**
 * Fold one tick of recovery state. Pure (Law 3): (prior, minute, struggles,
 * slot counts, cfg) → (next slice, notices). Node order is sorted code-unit
 * (§3.4 determinism), so the notice stream is host-insertion-order-proof.
 *
 * Order of operations per node (each branch falsifiable by tests):
 *  1. an expired LOCK resumes as a fresh window anchored NOW (climb from
 *     the floor again — the clock restarts, §7.7 "you just made it worse");
 *  2. while a window lives, the ramp target advances BEFORE any verdict;
 *  3. a window at/past zero-hour with full arms and a quiet tick CLOSES
 *     (`window-cleared`); a struggle on the zero hour is case 4 instead;
 *  4. a struggle while a window lives = SECOND FAILURE: strikes +1, phase
 *     locked, floor posture, hold = windowMinutes; a struggle already
 *     locked in costs nothing new (the lock IS the price — one strike per
 *     lock, pinned);
 *  5. a struggle with no window marks/refreshes the episode minute;
 *  6. quiet long enough after an episode opens the window (capturing the
 *     node's current FULL arm count — the restoration target);
 *  7. a window whose node left the board is dropped loudly (board drift is
 *     adjudicated, never silently swallowed).
 */
export function foldRecoveryTick(input: {
  readonly prior: RecoveryState | undefined;
  readonly minute: SimMinute;
  /** bounced-event counts per node THIS tick (countStrugglesByNode). */
  readonly struggles: ReadonlyMap<EntityId, number>;
  /** Current stored slot COUNT per node (post-serve, pre-rebuild). */
  readonly nodeSlotCounts: ReadonlyMap<EntityId, number>;
  readonly cfg: RecoveryConfig;
}): RecoveryFoldResult {
  const { prior, minute, struggles, nodeSlotCounts, cfg } = input;

  const windows = new Map<EntityId, RecoveryWindowRecord>();
  const episodes = new Map<EntityId, SimMinute>();
  const notices: RecoveryNotice[] = [];

  const ids = sortedIds(
    new Set([
      ...(prior?.windows.keys() ?? []),
      ...(prior?.lastStruggleMinute.keys() ?? []),
      ...struggles.keys(),
    ]),
  );

  for (const nodeId of ids) {
    const struggling = (struggles.get(nodeId) ?? 0) >= cfg.struggleBounceThreshold;
    let rec = prior?.windows.get(nodeId);
    let episode = prior?.lastStruggleMinute.get(nodeId);

    // (1) lock expiry → the shadow window resumes from the floor, re-anchored.
    if (rec !== undefined && rec.phase === "locked" && minute >= rec.lockUntilMinute) {
      rec = Object.freeze({
        ...rec,
        phase: "window" as RecoveryWindowPhase,
        openedAtMinute: minute,
        closesAtMinute: closesAt(minute, rec.fullSlots, cfg),
        lockUntilMinute: 0,
        effectiveSlots: Math.min(rec.fullSlots, cfg.floorSlots),
      });
    }

    // (2) a live window advances its climb BEFORE any verdict.
    if (rec !== undefined && rec.phase === "window") {
      const target = rampTarget(rec, minute, cfg);
      if (target !== rec.effectiveSlots) {
        rec = Object.freeze({ ...rec, effectiveSlots: target });
      }
    }

    // (3) untouched zero hour at full arms → restored, record leaves.
    if (rec !== undefined && rec.phase === "window" && !struggling && minute > rec.closesAtMinute) {
      notices.push(notice("window-cleared", nodeId, minute, rec.strikes, rec.effectiveSlots));
      continue; // both maps drop the node (episode was consumed at open).
    }

    if (struggling) {
      if (rec !== undefined) {
        if (rec.phase === "window") {
          // (4) THE SECOND FAILURE — costlier than the same struggle at peace:
          // the node locks to minimal posture and the countdown restarts.
          const strikes = rec.strikes + 1;
          rec = Object.freeze({
            ...rec,
            phase: "locked" as RecoveryWindowPhase,
            openedAtMinute: minute,
            closesAtMinute: minute + cfg.windowMinutes,
            lockUntilMinute: minute + cfg.windowMinutes,
            strikes,
            effectiveSlots: Math.min(rec.fullSlots, cfg.floorSlots),
          });
          notices.push(notice("second-failure", nodeId, minute, strikes, rec.effectiveSlots));
          notices.push(notice("lock-engaged", nodeId, minute, strikes, rec.effectiveSlots));
        }
        // struggling while ALREADY locked: the lock is the price — no new
        // strike, no episode churn (pinned: consecutive locked struggles
        // hold strikes at 1).
      } else {
        // (5) plain degraded weather: remember the episode minute.
        if (episode === undefined) {
          notices.push(notice("episode", nodeId, minute, 0, nodeSlotCounts.get(nodeId) ?? 0));
        }
        episode = minute;
      }
      if (rec !== undefined) windows.set(nodeId, rec);
      if (episode !== undefined) episodes.set(nodeId, episode);
      continue;
    }

    // (6) quiet: open the shadow window once the node has settled.
    if (rec === undefined && episode !== undefined && minute - episode >= cfg.quietMinutes) {
      const full = nodeSlotCounts.get(nodeId);
      if (full === undefined) {
        // the node left the board mid-episode: nothing to restore.
        continue;
      }
      rec = Object.freeze({
        nodeId,
        phase: "window" as RecoveryWindowPhase,
        openedAtMinute: minute,
        closesAtMinute: closesAt(minute, full, cfg),
        lockUntilMinute: 0,
        strikes: 0,
        fullSlots: full,
        effectiveSlots: Math.min(full, cfg.floorSlots),
      });
      notices.push(notice("window-opened", nodeId, minute, 0, rec.effectiveSlots));
      windows.set(nodeId, rec);
      continue;
    }

    // (7) a window whose node vanished is board drift — fail loud.
    if (rec !== undefined) {
      if (!nodeSlotCounts.has(nodeId)) {
        fail(
          "board-drift",
          `recovery.windows.${nodeId}`,
          `node left the board at minute ${minute} while a recovery window was live`,
        );
      }
      windows.set(nodeId, rec);
    }
    if (episode !== undefined && rec === undefined) episodes.set(nodeId, episode);
  }

  if (windows.size === 0 && episodes.size === 0) {
    return { state: undefined, notices: Object.freeze(notices) };
  }
  return {
    state: Object.freeze({
      windows: Object.freeze(windows),
      lastStruggleMinute: Object.freeze(episodes),
    }),
    notices: Object.freeze(notices),
  };
}

/* ─────────────────────────── the serve throttle ─────────────────────── */

/** The blank arm an expansion re-opens (identical shape to queue.ts
 *  makeSlots — a restored arm starts empty, never with a ghost tenant). */
const BLANK_SLOT: NodeSlotRecord = Object.freeze({
  occupied: false,
  unitId: null,
  waitingOn: null,
  releasedAtUs: null,
});

/** Last occupied slot index + 1 for a stored record (0 when none). An
 *  occupied arm is NEVER evicted — the shrink defers until the unit walks
 *  off, so throttling can never orphan an in-service unit. */
function occupiedFloor(slots: readonly NodeSlotRecord[]): number {
  let floor = 0;
  for (let i = slots.length - 1; i >= 0; i -= 1) {
    const slot = slots[i];
    if (slot !== undefined && slot.occupied) {
      floor = i + 1;
      break;
    }
  }
  return floor;
}

/**
 * Present the SERVE step its node view under recovery throttling: every node
 * with a live window sees `max(effectiveSlots, occupiedFloor)` arms —
 * truncated by prefix (the serve step only ever occupies slots it can see,
 * so the suffix is provably unoccupied once the guard is honored) or
 * expanded with blank arms on the climb. Nodes without a window pass
 * through by identity; a slice with no windows returns the SAME Map object,
 * so even a wired driver with nothing recovering pays zero copies.
 *
 * This view is what gets STORED (serve echoes its nodes) — that is the
 * point: reduced redundancy is ground truth while the recovery runs, and
 * the digest moves ONLY on recovery-wired runs (absent-input byte-identity
 * is pinned in __tests__/recovery.test.ts).
 */
export function throttleServeNodes(
  nodes: ReadonlyMap<EntityId, NodeRecord>,
  recovery: RecoveryState | undefined,
): ReadonlyMap<EntityId, NodeRecord> {
  if (recovery === undefined || recovery.windows.size === 0) return nodes;
  const out = new Map<EntityId, NodeRecord>();
  for (const [nodeId, record] of nodes) {
    const window = recovery.windows.get(nodeId);
    if (window === undefined) {
      out.set(nodeId, record);
      continue;
    }
    const stored = record.slots.length;
    if (stored > window.fullSlots) {
      // Someone rebuilt the node to MORE arms than the snapshot mid-window:
      // adjudicate loudly instead of silently shrinking restored truth.
      fail(
        "board-drift",
        `recovery.windows.${nodeId}`,
        `stored ${stored} arms exceeds captured fullSlots ${window.fullSlots}`,
      );
    }
    const target = Math.max(window.effectiveSlots, occupiedFloor(record.slots));
    if (target === stored) {
      out.set(nodeId, record);
      continue;
    }
    const slots =
      target < stored
        ? Object.freeze(record.slots.slice(0, target))
        : Object.freeze([...record.slots, ...Array.from({ length: target - stored }, () => BLANK_SLOT)]);
    out.set(nodeId, Object.freeze({ ...record, slots }));
  }
  return out;
}

/* ────────────────────────── idle-state helpers ──────────────────────── */

/** Empty, frozen slice — the shape createInitialState embeds when a host
 *  wants the key materialized from tick 1 (the fold keeps it ABSENT while
 *  idle otherwise). */
export function emptyRecoveryState(): RecoveryState {
  return Object.freeze({
    windows: Object.freeze(new Map<EntityId, RecoveryWindowRecord>()),
    lastStruggleMinute: Object.freeze(new Map<EntityId, SimMinute>()),
  });
}

/** The minute the given node (if any) is under a live window or lock —
 *  HUD-side convenience read of the "cannot survive another failure" bar
 *  without re-deriving the fold. */
export function recoveryWindowOf(
  state: GameState,
  nodeId: EntityId,
): RecoveryWindowRecord | undefined {
  return state.recovery?.windows.get(nodeId);
}
