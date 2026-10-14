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
 *    in internal/tickFold.ts (one PROVISIONAL 60 s constant, mirroring it).
 *
 * Default-off law: with no authored `corrupts` row the slice never
 * materializes, the fold returns `{ corruptions: [] }` with no state, and
 * the driver touches neither `GameState.corruption` nor
 * `TickResult.corruptions` — byte-identical runs (pinned in
 * `__tests__/corruption.test.ts`).
 */

import type {
  CauseId,
  Contract,
  CorruptOutcome,
  CorruptionState,
  EntityId,
  OutcomeTerminal,
  SimMinute,
  SimTimeUs,
} from "../types.ts";
import { asCauseId } from "../types.ts";

/** PROVISIONAL (mirrors outageSecondsFromLanded @internal/tickFold.ts): one
 *  corrupted response burns 60 error-budget seconds per contract until the
 *  owner calibrates the severity split between landed breaches and silent
 *  corruption. */
export const CORRUPTION_OUTAGE_SEC = 60n;

/** House causeId convention (recovery/economy precedent): the corruption
 *  story is addressable end-to-end as `corruption:<unitId>:<minute>`. */
export function corruptionCauseId(unitId: EntityId, minute: SimMinute): CauseId {
  return asCauseId(`corruption:${String(unitId)}:${minute}`);
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
 * severity without touching the engine. Its default is the PROVISIONAL 60 s
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
