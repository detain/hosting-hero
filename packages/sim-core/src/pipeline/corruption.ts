/**
 * §3.1 `corrupts` patience mode — the SILENT CORRUPTION channel (v0).
 * Home of "Patience as HP — the unified visitor spec (the reverse creep)"
 * (hosting_game.md:11436, under "## 3.1 The visitor model" :11434); the
 * R25 mode census calls it "corrupt-not-bounce" (reports/MASTER_REPORT.md
 * §4.1). A queued unit whose patience budget runs out under this mode does
 * NOT abandon the queue (bounce probability stays 0); it stays, completes
 * service, and the response comes out quietly WRONG — damage instead of a
 * visible failure.
 *
 * This module owns the two PURE halves of the machinery; the roll itself
 * lives beside the other patience dice in defaults.ts step 9, and the
 * driver chains the slice through GameState:
 *
 *  - `foldCorruptionTerminals` — when a marked unit terminates: a `served`
 *    terminal carrying a true mark becomes a CorruptOutcome (the response
 *    completed, corrupted); EVERY terminal clears its mark (a shed/blocked
 *    exit leaves no debt — the mode delays death, never prevents it, and a
 *    response that never completed was never corrupted).
 *  - `corruptionOutageSecs` — the economy consume-site adapter: hosts fold
 *    corrupted responses into the EXISTING `EconomyTickIn.outageSecs` input
 *    (economy/tick.ts applyBudgets → drainOutage → error budget → SLA
 *    credits → covenant health). The engine never reaches into the economy
 *    module itself; the map this returns merges like the landed-outage fan
 *    in internal/tickFold.ts (one RATIFIED 60 s constant, mirroring it).
 *
 * Default-off law: with no authored `corrupts` row the slice never
 * materializes, the fold returns `{ corruptions: [] }` with no state, and
 * the driver touches neither `GameState.corruption` nor
 * `TickResult.corruptions` — byte-identical runs (pinned in
 * `__tests__/corruption.test.ts`).
 *
 * SHIELD PRE-ARM VETO (ADR-0014 #D2, the first tier-extension door pair):
 * while the node at the head of a corrupts-mode unit's queue is shielded —
 * read from the OPTIONAL door-written `GameState.shield` book via
 * `nodeShielded`, which mirrors economy's `activePriceOverride` as-of law
 * (null = in force; a future business-minute stamp is armed but NOT yet
 * law) — step 9 never casts the exhaustion die: the mark never lands, and
 * the terminal completes as a plain `served`. A mark cast BEFORE the shield
 * armed (or before its stamp came due) rides to its terminal — a pre-arm
 * prevents rot, it does not un-rot a response already in flight. There is
 * no un-shield verb in v0 (last-write-wins re-arm is the only amendment).
 * Absent book ⇒ zero reads, zero behavior change (the byte-identity gate).
 */

import type {
  CauseId,
  ClockState,
  Contract,
  CorruptOutcome,
  CorruptionState,
  EntityId,
  OutcomeTerminal,
  ShieldBook,
  SimMinute,
  SimTimeUs,
} from "../types.ts";
import { asCauseId } from "../types.ts";
import { MICROS_PER_MIN } from "../kernel/time.ts";

/** RATIFIED 2026-10-16 (ADR-0015 #1; mirrors outageSecondsFromLanded
 *  @internal/tickFold.ts): one corrupted response burns 60 error-budget
 *  seconds per contract — the 1:1 lands-parity severity ratio is RATIFIED;
 *  the E1 dial stays the host lever to tune it. */
export const CORRUPTION_OUTAGE_SEC = 60n;

/** House causeId convention (recovery/economy precedent): the corruption
 *  story is addressable end-to-end as `corruption:<unitId>:<minute>`. */
export function corruptionCauseId(unitId: EntityId, minute: SimMinute): CauseId {
  return asCauseId(`corruption:${String(unitId)}:${minute}`);
}

/** Current BUSINESS-clock minute of a tick's clocks (Dual-Clock law §4.4).
 *  Exact integer fold of `businessUs`; the economy lane owns a twin helper
 *  (economy/state.ts `businessMinuteOf`) — the import direction forbids
 *  sharing it, and the fold is one floor-division, so the twin is the honest
 *  home here rather than a widened seam. The name is DELIBERATELY distinct:
 *  the root barrel `export *`-s both lanes, and one name shipped twice is a
 *  TS2308 ambiguity, never a merge — so the shield-side fold wears the
 *  shield name. */
export function shieldBusinessMinuteOf(clocks: ClockState): SimMinute {
  const minute = Number(clocks.businessUs / MICROS_PER_MIN);
  if (!Number.isSafeInteger(minute)) {
    throw new RangeError(
      `corruption[bad-value]: business minute ${String(clocks.businessUs)}µs exceeds the safe-integer range`,
    );
  }
  return minute;
}

/** ADR-0014 #D2 as-of law — is `nodeId` under a live shield at
 *  `atBusinessMinute`? Same shape as economy's `activePriceOverride`: an
 *  absent entry = not shielded; `effectiveAtBusinessMinute === null` = in
 *  force from the executing tick; a future stamp is armed but NOT yet law.
 *  Accepting the optional book keeps the caller's guard flat (Law 1):
 *  `undefined` book ⇒ false for every node — the byte-identity switch. */
export function nodeShielded(
  shield: ShieldBook | undefined,
  nodeId: EntityId,
  atBusinessMinute: SimMinute,
): boolean {
  if (shield === undefined) return false;
  const entry = shield.entries.get(nodeId);
  if (entry === undefined) return false;
  return entry.effectiveAtBusinessMinute === null || atBusinessMinute >= entry.effectiveAtBusinessMinute;
}

/** One terminal this tick, as the driver's outcome fold sees it. */
export interface CorruptionTerminal {
  readonly unitId: EntityId;
  readonly terminal: OutcomeTerminal;
}

export interface CorruptionFoldResult {
  /** The next slice, or ABSENT (idle-while-absent law): no live marks and a
   *  zero lifetime count means the key leaves GameState entirely. */
  readonly state?: CorruptionState;
  /** Corrupted completions raised this tick (empty = honest quiet minute). */
  readonly corruptions: readonly CorruptOutcome[];
}

/**
 * Pure terminal fold (Law 3): prior slice + this tick's terminals → next
 * slice + corruption records. Iteration order is the caller's outcome order
 * (already canonical); marks delete deterministically and the surviving
 * Map keeps its insertion order (replay-stable).
 */
export function foldCorruptionTerminals(
  prior: CorruptionState | undefined,
  terminals: readonly CorruptionTerminal[],
  atUs: SimTimeUs,
  minute: SimMinute,
): CorruptionFoldResult {
  if (prior === undefined) return { corruptions: Object.freeze([]) };
  const marks = new Map(prior.marks);
  let corruptedCount = prior.corruptedCount;
  const corruptions: CorruptOutcome[] = [];
  for (const done of terminals) {
    const willCorrupt = marks.get(done.unitId);
    if (willCorrupt === undefined) continue;
    marks.delete(done.unitId);
    if (done.terminal !== "served" || willCorrupt !== true) continue; // no completed response, no corruption
    corruptedCount += 1;
    corruptions.push(
      Object.freeze({
        unitId: done.unitId,
        atUs,
        causeId: corruptionCauseId(done.unitId, minute),
      }),
    );
  }
  if (marks.size === 0 && corruptedCount === 0) return { corruptions: Object.freeze(corruptions) };
  return {
    state: Object.freeze({ marks: Object.freeze(marks), corruptedCount }),
    corruptions: Object.freeze(corruptions),
  };
}

/**
 * Adapter to the LIVE error-budget consume path: returns the per-contract
 * outage-seconds a host should ADD to its folded `EconomyTickIn.outageSecs`
 * for this tick's corruptions. Shape mirrors outageSecondsFromLanded:
 * null when there is nothing to burn or nobody to bill (empty input ⇒ the
 * host's map is untouched ⇒ byte-identical economy when the mode is off).
 *
 * SEVERITY DIAL (lane E1): `perSec` is how many outage seconds ONE corrupted
 * response burns — an OWNER TASTE knob, exposed so hosts can dial corruption
 * severity without touching the engine. Its default is the RATIFIED 60 s
 * lands-twin law (`CORRUPTION_OUTAGE_SEC`, the constant shipped @16c6add);
 * omitting the argument (or passing `undefined`) keeps every pre-dial run
 * byte-identical — the dial is law only where a host turns it. Fail-loud at
 * the boundary (Law 4): a non-bigint or non-positive `perSec` throws
 * `corruption[bad-value]` BEFORE the empty-input early exit, so a mis-dial
 * surfaces on the first money-lane tick, never as a silent zero burn.
 */
export function corruptionOutageSecs(
  corruptions: readonly CorruptOutcome[],
  contracts: ReadonlyMap<EntityId, Contract>,
  perSec: bigint = CORRUPTION_OUTAGE_SEC,
): ReadonlyMap<EntityId, bigint> | null {
  if (typeof perSec !== "bigint" || perSec <= 0n) {
    throw new RangeError(
      `corruption[bad-value]: perSec must be a positive bigint, got ${typeof perSec} ${String(perSec)}`,
    );
  }
  if (contracts.size === 0 || corruptions.length === 0) return null;
  const corruptionSec = perSec * BigInt(corruptions.length);
  const map = new Map<EntityId, bigint>();
  for (const id of contracts.keys()) map.set(id, corruptionSec);
  return map;
}
