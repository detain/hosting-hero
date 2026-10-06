/**
 * ATTACK-SURFACE LEDGER — prototype gate G2 (hosting_game.md L6133-6152).
 *
 * "Threats are unspawnable until you build their invitation." The ledger
 * derives, from an append-only build log, which buildables exist at a tick;
 * a threat is spawnable iff at least one buildable that invites it exists.
 * Three authored rules ride along:
 *
 *  - retirement WITH LAG: removing a buildable retires its threats only
 *    after `retirementLagTicks` — "attackers don't get the memo" (§2.24).
 *  - mastery demotion (data hook): a threat countered ≥N times demotes to
 *    the WEATHER band — fully visible, still exists, never deleted (R-16).
 *  - pool cap (8-10 active families) is content-CI's job; the ledger just
 *    answers "is it spawnable" honestly.
 */
import type { SimTick } from "../types.ts";
import type { TelegraphBand } from "./bands.ts";
import type { CompositionEntry } from "./table.ts";

export interface BuildOp {
  readonly atTick: SimTick;
  readonly buildableId: string;
  readonly op: "build" | "remove";
}

export interface LedgerConfig {
  /** Ticks a removed buildable keeps haunting the attack surface. */
  readonly retirementLagTicks: SimTick;
  /** Counterances after which a threat demotes to weather ("Mastered"). */
  readonly masteryDemotionAfter: number;
}

export const DEFAULT_LEDGER_CONFIG: LedgerConfig = {
  retirementLagTicks: 60n,
  masteryDemotionAfter: 5,
};

/** threatId → buildable ids whose existence invites it. */
export type ThreatInvitations = ReadonlyMap<string, readonly string[]>;

export interface LedgerSnapshot {
  readonly asOfTick: SimTick;
  /** Buildables currently existing (last-op-wins; removals lag). */
  readonly existingBuildables: ReadonlySet<string>;
}

function assertNonNegativeTick(tick: SimTick, where: string): void {
  if (tick < 0n) throw new Error(`${where}: tick must be ≥ 0, got ${tick}`);
}

/** Invert {buildable: threatIds[]} into {threatId: buildableIds[]} with
 *  deterministic (sorted) pools. Throws on empty/dup-free validation. */
export function buildInvitations(unlockedByBuildables: Readonly<Record<string, readonly string[]>>): ThreatInvitations {
  const inverted = new Map<string, Set<string>>();
  for (const buildableId of Object.keys(unlockedByBuildables).sort()) {
    const threatIds = unlockedByBuildables[buildableId];
    if (threatIds === undefined) continue;
    for (const threatId of threatIds) {
      if (threatId.length === 0) throw new Error(`buildInvitations: empty threatId under buildable "${buildableId}"`);
      const pool = inverted.get(threatId) ?? new Set<string>();
      pool.add(buildableId);
      inverted.set(threatId, pool);
    }
  }
  const out = new Map<string, readonly string[]>();
  for (const [threatId, pool] of [...inverted].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    out.set(threatId, [...pool].sort());
  }
  return out;
}

/**
 * Fold the build log up to `asOfTick`. Ops must be pre-sorted by the caller
 * or get sorted here (stable by tick, then authored order). A `remove` only
 * stops existence once the retirement lag has elapsed.
 */
export function ledgerSnapshot(
  ops: readonly BuildOp[],
  asOfTick: SimTick,
  cfg: LedgerConfig = DEFAULT_LEDGER_CONFIG,
): LedgerSnapshot {
  assertNonNegativeTick(asOfTick, "ledgerSnapshot");
  if (cfg.retirementLagTicks < 0n) throw new Error(`ledger: negative retirementLagTicks ${cfg.retirementLagTicks}`);
  const lastOpPerBuildable = new Map<string, BuildOp>();
  const sorted = [...ops].sort((a, b) => (a.atTick === b.atTick ? 0 : a.atTick < b.atTick ? -1 : 1));
  for (const op of sorted) {
    if (op.atTick > asOfTick) break;
    lastOpPerBuildable.set(op.buildableId, op); // later wins at equal-or-lower tick
  }
  const existing = new Set<string>();
  for (const [buildableId, op] of lastOpPerBuildable) {
    if (op.op === "build") {
      existing.add(buildableId);
      continue;
    }
    // removal: still haunts the surface until the lag elapses
    if (asOfTick < op.atTick + cfg.retirementLagTicks) existing.add(buildableId);
  }
  return { asOfTick, existingBuildables: existing };
}

/**
 * Spawnable ⇔ no invitation requirement, or ≥1 inviter exists.
 * (Threats with no entry in `invitations` are ungated — organic-safe default
 * is NOT assumed: content must declare gating, so ungated means authored-ungated.)
 */
export function isThreatSpawnable(threatId: string, snapshot: LedgerSnapshot, invitations: ThreatInvitations): boolean {
  const inviters = invitations.get(threatId);
  if (inviters === undefined || inviters.length === 0) return true;
  return inviters.some((b) => snapshot.existingBuildables.has(b));
}

/** Deterministic spawnable subset of a threat-id universe. */
export function spawnableThreatIds(
  allThreatIds: Iterable<string>,
  snapshot: LedgerSnapshot,
  invitations: ThreatInvitations,
): readonly string[] {
  return [...allThreatIds].filter((t) => isThreatSpawnable(t, snapshot, invitations)).sort();
}

/**
 * Mastery-demotion data hook: returns the band a threat PLAYS at once the
 * player has countered it enough — demoted to "weather" (always visible).
 * Composition and existence are untouched; only the telegraph dimmer moves.
 */
export function bandAfterMastery(
  threatId: string,
  authoredBand: TelegraphBand,
  masteryCounts: ReadonlyMap<string, number>,
  cfg: LedgerConfig = DEFAULT_LEDGER_CONFIG,
): TelegraphBand {
  if (authoredBand === "weather") return authoredBand;
  const count = masteryCounts.get(threatId) ?? 0;
  return count >= cfg.masteryDemotionAfter ? "weather" : authoredBand;
}

export interface GatedComposition {
  readonly spawnable: readonly CompositionEntry[];
  /** Authored entries withheld because their invitation isn't built yet. */
  readonly deferred: readonly string[];
}

/**
 * Gate a wave's authored composition against the ledger. Deferral is
 * deterministic ledger state — never RNG (R-16). Original order preserved.
 */
export function gateComposition(
  entries: readonly CompositionEntry[],
  snapshot: LedgerSnapshot,
  invitations: ThreatInvitations,
): GatedComposition {
  const spawnable: CompositionEntry[] = [];
  const deferred: string[] = [];
  for (const entry of entries) {
    if (isThreatSpawnable(entry.threatId, snapshot, invitations)) {
      spawnable.push(entry);
      continue;
    }
    if (!deferred.includes(entry.threatId)) deferred.push(entry.threatId);
  }
  return { spawnable, deferred: deferred.sort() };
}
