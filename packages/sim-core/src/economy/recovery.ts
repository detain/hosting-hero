/**
 * §7.7 recovery half v0 — the MONEY side. Two products, both pure data:
 *
 *  1. `recoveryOpexEntries` — restore-action invoices in the exact shape of
 *     unattended's `UnattendedOpexDraft` (`{atMinute, amountMicroUsd, memo}`),
 *     memo convention `recovery:<action>:<nodeId>` mirroring the
 *     `unattended:opex:<memo>` precedent (fastForward stamps the cause
 *     `…:<minute>:<memo>`; uniqueness per (minute, memo) is enforced HERE so
 *     the host's ledger guard can never be the first to notice a twin).
 *     DATA, never code — this file never moves money and never imports the
 *     unattended lane (module law: economy imports only ../types + siblings
 *     in-dir; structural typing is the compatibility witness, pinned in
 *     economy/__tests__/recovery.test.ts).
 *
 *  2. `restoreOptions` — the rebuild-vs-restart decision table (§7.7:27569
 *     "Restore service or restore redundancy?"): both options pay the SAME
 *     cash total (conservation law: the choice buys TIME, not money); what
 *     differs is time-to-service and the exposure window during which the
 *     Second Failure is fatal. The spec's ruling: "the game should never say
 *     which is correct" — so this helper returns BOTH, frozen, and picks
 *     nothing.
 *
 * Every constant RATIFIED 2026-10-16 (ADR-0015 #1), house grammar
 * `recovery[CODE] at 'path': detail` on refusal.
 */

import type { EntityId, SimMinute } from "../types.ts";

/* ───────────────────────────── restore actions ───────────────────────────── */

/** Closed vocabulary of billable restore operations (§7.7 recovery family). */
export const RECOVERY_ACTIONS = [
  "restart-service",
  "rebuild-redundancy",
  "warm-cache",
  "failback-drill",
] as const;
export type RecoveryActionKind = (typeof RECOVERY_ACTIONS)[number];

/** One requested restore action on one node (the tracker's subject model —
 *  pipeline/recovery.ts node ids are the same ids, by convention). */
export interface RecoveryActionRequest {
  readonly nodeId: EntityId;
  readonly kind: RecoveryActionKind;
}

/** Structurally identical to `UnattendedOpexDraft` (NOT imported — the
 *  unattended lane is sibling-owned; the test pins the compatibility). */
export interface RecoveryOpexDraft {
  readonly atMinute: SimMinute;
  readonly amountMicroUsd: bigint;
  readonly memo: string;
}

export class RecoveryCostError extends Error {
  public constructor(code: string, at: string, detail: string) {
    super(`recovery[${code}] at '${at}': ${detail}`);
    this.name = "RecoveryCostError";
  }
}

/* ───────────────────────────────── config ────────────────────────────────── */

/** µ$ costs (whole bigint) and minutes for the recovery menu. Cash
 *  magnitudes sit in the payroll class ($20–$200, g5's scale). Every value
 *  RATIFIED 2026-10-16 (ADR-0015 #1). */
export interface RecoveryCostConfig {
  /** Restart-service burn (crash-cart visit, µ$). */
  readonly restartMicroUsd: bigint;
  /** Rebuild-redundancy burn (RAID/replica re-arm, µ$). */
  readonly rebuildMicroUsd: bigint;
  /** Cache-warming burn (deliberate slow-start admission, µ$). */
  readonly warmCacheMicroUsd: bigint;
  /** Failback-drill burn (steer-home rehearsal, µ$). */
  readonly failbackDrillMicroUsd: bigint;
  /** Wall minutes a redundancy rebuild needs (serve stays down until done). */
  readonly rebuildMinutes: number;
  /** Wall minutes a service restart needs (single-copy serving comes up). */
  readonly restartMinutes: number;
}

export function defaultRecoveryCostConfig(): RecoveryCostConfig {
  return Object.freeze({
    restartMicroUsd: 20_000_000n, // $20 — RATIFIED 2026-10-16 (ADR-0015 #1)
    rebuildMicroUsd: 150_000_000n, // $150 — RATIFIED 2026-10-16 (ADR-0015 #1)
    warmCacheMicroUsd: 40_000_000n, // $40 — RATIFIED 2026-10-16 (ADR-0015 #1)
    failbackDrillMicroUsd: 60_000_000n, // $60 — RATIFIED 2026-10-16 (ADR-0015 #1)
    rebuildMinutes: 120, // RATIFIED 2026-10-16 (ADR-0015 #1) — the amber bar's length
    restartMinutes: 10, // RATIFIED 2026-10-16 (ADR-0015 #1) — the fast-but-fragile option
  });
}

const COST_BPS_KEYS = [
  "restartMicroUsd",
  "rebuildMicroUsd",
  "warmCacheMicroUsd",
  "failbackDrillMicroUsd",
] as const;
const COST_MINUTE_KEYS = ["rebuildMinutes", "restartMinutes"] as const;

/** Fail-loud boundary parse (Law 2): every cost a whole bigint ≥ 1 (a free
 *  restore action is a modeling lie — drop it from the request list
 *  instead), minutes whole and ≥ 1, and rebuild ≥ restart (serving on a
 *  fragile single copy must come up no SLOWER than a full rebuild or the
 *  tradeoff table inverts). Unknown keys refuse by name. */
export function parseRecoveryCostConfig(
  raw: Readonly<Record<string, unknown>>,
): RecoveryCostConfig {
  const defaults = defaultRecoveryCostConfig();
  for (const key of Object.keys(raw)) {
    if (
      !(COST_BPS_KEYS as readonly string[]).includes(key) &&
      !(COST_MINUTE_KEYS as readonly string[]).includes(key)
    ) {
      throw new RecoveryCostError("RECOVERY_UNKNOWN_KEY", `cfg.${key}`, "not a recovery cost knob");
    }
  }
  const merged = { ...defaults, ...raw };
  for (const key of COST_BPS_KEYS) {
    const value = merged[key];
    if (typeof value !== "bigint" || value < 1n) {
      throw new RecoveryCostError(
        "RECOVERY_BAD_VALUE",
        `cfg.${key}`,
        `expected a whole µ$ bigint ≥ 1, got ${String(value)}`,
      );
    }
  }
  for (const key of COST_MINUTE_KEYS) {
    const value = merged[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
      throw new RecoveryCostError(
        "RECOVERY_BAD_VALUE",
        `cfg.${key}`,
        `expected a whole number ≥ 1, got ${String(value)}`,
      );
    }
  }
  if ((merged.rebuildMinutes as number) < (merged.restartMinutes as number)) {
    throw new RecoveryCostError(
      "RECOVERY_BAD_VALUE",
      "cfg.rebuildMinutes",
      `rebuild (${String(merged.rebuildMinutes)}m) cannot be faster than restart (${String(merged.restartMinutes)}m) — the tradeoff table would invert`,
    );
  }
  return Object.freeze(merged as unknown as RecoveryCostConfig);
}

/** Cost lookup on the closed vocabulary — exhaustive switch (Law 1: the
 *  compiler is the guard, an unmapped kind cannot exist). */
export function recoveryActionCost(kind: RecoveryActionKind, cfg: RecoveryCostConfig): bigint {
  switch (kind) {
    case "restart-service":
      return cfg.restartMicroUsd;
    case "rebuild-redundancy":
      return cfg.rebuildMicroUsd;
    case "warm-cache":
      return cfg.warmCacheMicroUsd;
    case "failback-drill":
      return cfg.failbackDrillMicroUsd;
  }
}

/* ───────────────────────── opex drafts (invoice fold) ────────────────────── */

/**
 * Turn restore actions into ledger-ready opex drafts at one sim-minute.
 * Output order is canonical (nodeId codepoint, then kind) — never input
 * order — so two hosts requesting the same set in different orders fold
 * byte-identical causes. A twin (same node + same kind, one call) refuses:
 * its memo would collide on the host's (minute, memo) uniqueness wall
 * (fastForward's F6 law, enforced at the source instead).
 */
export function recoveryOpexEntries(
  atMinute: SimMinute,
  actions: readonly RecoveryActionRequest[],
  cfg: RecoveryCostConfig = defaultRecoveryCostConfig(),
): readonly RecoveryOpexDraft[] {
  if (!Number.isInteger(atMinute) || atMinute < 0) {
    throw new RecoveryCostError("RECOVERY_BAD_VALUE", "atMinute", `expected a whole minute ≥ 0, got ${String(atMinute)}`);
  }
  const sorted = [...actions].sort(
    (a, b) =>
      (a.nodeId < b.nodeId ? -1 : a.nodeId > b.nodeId ? 1 : 0) ||
      (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0),
  );
  const seen = new Set<string>();
  const drafts: RecoveryOpexDraft[] = [];
  for (const action of sorted) {
    const memo = `recovery:${action.kind}:${action.nodeId}`;
    if (seen.has(memo)) {
      throw new RecoveryCostError(
        "RECOVERY_DUPLICATE_ENTRY",
        memo,
        `action '${action.kind}' requested twice for node '${action.nodeId}' at minute ${String(atMinute)}`,
      );
    }
    seen.add(memo);
    drafts.push(
      Object.freeze({ atMinute, amountMicroUsd: recoveryActionCost(action.kind, cfg), memo }),
    );
  }
  return Object.freeze(drafts);
}

/* ─────────────────── rebuild-vs-restart (the stated choice) ──────────────── */

/** The two defensible recovery orders (§7.7:27569). The helper NEVER picks
 *  — "the game should never say which is correct". */
export const RESTORE_STRATEGIES = ["restore-redundancy-first", "serve-on-single-copy"] as const;
export type RestoreStrategy = (typeof RESTORE_STRATEGIES)[number];

export interface RestoreOption {
  readonly strategy: RestoreStrategy;
  /** Minutes until customers are served again. */
  readonly minutesToService: number;
  /** Minutes spent exposed to a FATAL second failure (single copy live). */
  readonly exposureMinutes: number;
  /** Total cash burned across the whole recovery (identical across both —
   *  the choice trades time and risk, never money). */
  readonly cashCostMicroUsd: bigint;
  /** The danger-window truth: a second failure during exposure on a single
   *  copy is unrecoverable (the "now is fatal" of 27561). */
  readonly secondFailureFatal: boolean;
}

/**
 * The tradeoff table. Redundancy-first: serve comes back only when the
 * rebuild finishes (slow, zero exposure). Single-copy-first: service jumps
 * up at restart time, and the remaining rebuild runs behind it — every one
 * of those minutes is Second Failure exposure. Both pay restart + rebuild +
 * cache-warm (you always warm what you always serve).
 */
export function restoreOptions(cfg: RecoveryCostConfig = defaultRecoveryCostConfig()): readonly [RestoreOption, RestoreOption] {
  const cash = cfg.restartMicroUsd + cfg.rebuildMicroUsd + cfg.warmCacheMicroUsd;
  return Object.freeze([
    Object.freeze({
      strategy: "restore-redundancy-first",
      minutesToService: cfg.rebuildMinutes,
      exposureMinutes: 0,
      cashCostMicroUsd: cash,
      secondFailureFatal: false,
    }),
    Object.freeze({
      strategy: "serve-on-single-copy",
      minutesToService: cfg.restartMinutes,
      exposureMinutes: cfg.rebuildMinutes - cfg.restartMinutes,
      cashCostMicroUsd: cash,
      secondFailureFatal: true,
    }),
  ]);
}
