/**
 * §7.7 recovery money-side laws (economy/recovery.ts):
 *  1. memo convention `recovery:<action>:<nodeId>` mirrors the
 *     `unattended:opex:<memo>` precedent — the draft shape is structurally
 *     pinned against the real `UnattendedOpexDraft` type;
 *  2. canonical output order (nodeId, kind) — input order never leaks;
 *  3. money is never invented: every draft equals its config cost exactly,
 *     the sum is conserved, and no extra keys ride;
 *  4. a twin (same node+kind, one call) refuses BEFORE the host's
 *     (minute, memo) ledger wall can be the first to notice;
 *  5. restoreOptions: both strategies pay the SAME cash — the choice trades
 *     time and risk (exposure complements the service-lag difference), and
 *     `secondFailureFatal` rides ONLY the fragile single-copy option;
 *  6. absent-config defaults: everything answers from
 *     `defaultRecoveryCostConfig()` with zero throws.
 */

import { describe, expect, it } from "vitest";
import type { UnattendedOpexDraft } from "../../unattended/fastForward.ts";
import { asEntityId } from "../../types.ts";
import {
  defaultRecoveryCostConfig,
  parseRecoveryCostConfig,
  recoveryActionCost,
  recoveryOpexEntries,
  restoreOptions,
  RECOVERY_ACTIONS,
  RESTORE_STRATEGIES,
  type RecoveryActionRequest,
} from "../recovery.ts";

const A = asEntityId("edge");
const B = asEntityId("origin");
const CFG = defaultRecoveryCostConfig();

describe("recoveryOpexEntries — restore-action invoices", () => {
  const actions: readonly RecoveryActionRequest[] = [
    { nodeId: B, kind: "restart-service" },
    { nodeId: A, kind: "warm-cache" },
    { nodeId: A, kind: "rebuild-redundancy" },
  ];

  it("canonical (nodeId, kind) order, memo shape, exact config prices", () => {
    const drafts = recoveryOpexEntries(100, actions, CFG);
    expect(drafts.map((d) => d.memo)).toEqual([
      "recovery:rebuild-redundancy:edge",
      "recovery:warm-cache:edge",
      "recovery:restart-service:origin",
    ]);
    expect(drafts.map((d) => d.amountMicroUsd)).toEqual([150_000_000n, 40_000_000n, 20_000_000n]);
    expect(drafts.every((d) => d.atMinute === 100)).toBe(true);
    // shuffled input ⇒ byte-identical output (order never leaks)
    expect(recoveryOpexEntries(100, [...actions].reverse(), CFG)).toEqual(drafts);
  });

  it("conservation: the sum equals Σ config costs, key count exactly 3 (money never invented)", () => {
    const drafts = recoveryOpexEntries(0, RECOVERY_ACTIONS.map((kind) => ({ nodeId: A, kind })), CFG);
    const sum = drafts.reduce((acc, d) => acc + d.amountMicroUsd, 0n);
    const expected = RECOVERY_ACTIONS.reduce((acc, kind) => acc + recoveryActionCost(kind, CFG), 0n);
    expect(sum).toBe(expected);
    for (const d of drafts) expect(Object.keys(d).sort()).toEqual(["amountMicroUsd", "atMinute", "memo"]);
  });

  it("the draft is structurally an UnattendedOpexDraft (host folds it as-is)", () => {
    const drafts: readonly UnattendedOpexDraft[] = recoveryOpexEntries(5, [{ nodeId: B, kind: "failback-drill" }], CFG);
    expect(drafts[0]?.amountMicroUsd).toBe(60_000_000n);
  });

  it("a twin action refuses with the house grammar", () => {
    expect(() =>
      recoveryOpexEntries(7, [
        { nodeId: A, kind: "restart-service" },
        { nodeId: A, kind: "restart-service" },
      ], CFG),
    ).toThrow(/recovery\[RECOVERY_DUPLICATE_ENTRY\] at 'recovery:restart-service:edge'/);
  });

  it("empty request set ⇒ frozen empty list; bad minutes refuse", () => {
    const empty = recoveryOpexEntries(0, [], CFG);
    expect(empty).toEqual([]);
    expect(Object.isFrozen(empty)).toBe(true);
    expect(() => recoveryOpexEntries(1.5, [], CFG)).toThrow(/RECOVERY_BAD_VALUE/);
    expect(() => recoveryOpexEntries(-1, [], CFG)).toThrow(/RECOVERY_BAD_VALUE/);
  });

  it("the default config parameter is the same table, no hidden state", () => {
    expect(recoveryOpexEntries(0, [{ nodeId: A, kind: "warm-cache" }])).toEqual(
      recoveryOpexEntries(0, [{ nodeId: A, kind: "warm-cache" }], CFG),
    );
  });
});

describe("parseRecoveryCostConfig — fail-loud boundary", () => {
  it("unknown keys refuse by name", () => {
    expect(() => parseRecoveryCostConfig({ moonlightTax: 1n })).toThrow(
      /recovery\[RECOVERY_UNKNOWN_KEY\] at 'cfg.moonlightTax'/,
    );
  });
  it("free actions, floats, and an inverted rebuild/restart table all refuse", () => {
    expect(() => parseRecoveryCostConfig({ restartMicroUsd: 0n })).toThrow(/RECOVERY_BAD_VALUE/);
    expect(() => parseRecoveryCostConfig({ rebuildMicroUsd: 100 })).toThrow(/RECOVERY_BAD_VALUE/); // number, not bigint
    expect(() => parseRecoveryCostConfig({ rebuildMinutes: 5, restartMinutes: 10 })).toThrow(
      /the tradeoff table would invert/,
    );
  });
  it("valid overrides merge onto defaults and freeze", () => {
    const tuned = parseRecoveryCostConfig({ failbackDrillMicroUsd: 1n });
    expect(tuned.failbackDrillMicroUsd).toBe(1n);
    expect(tuned.restartMicroUsd).toBe(CFG.restartMicroUsd);
    expect(Object.isFrozen(tuned)).toBe(true);
  });
});

describe("restoreOptions — the rebuild-vs-restart table (§7.7:27561)", () => {
  it("both strategies cost the SAME cash; only time and risk differ", () => {
    const [redundancyFirst, serveFirst] = restoreOptions(CFG);
    expect(RESTORE_STRATEGIES).toEqual([redundancyFirst.strategy, serveFirst.strategy]);
    const cash = CFG.restartMicroUsd + CFG.rebuildMicroUsd + CFG.warmCacheMicroUsd;
    expect(redundancyFirst.cashCostMicroUsd).toBe(cash);
    expect(serveFirst.cashCostMicroUsd).toBe(cash);
  });

  it("exposure complements the service lag: serve-first saves exactly the minutes it risks", () => {
    const [redundancyFirst, serveFirst] = restoreOptions(CFG);
    expect(redundancyFirst.minutesToService).toBe(120);
    expect(serveFirst.minutesToService).toBe(10);
    expect(redundancyFirst.exposureMinutes).toBe(0);
    expect(serveFirst.exposureMinutes).toBe(110);
    expect(serveFirst.exposureMinutes).toBe(redundancyFirst.minutesToService - serveFirst.minutesToService);
  });

  it("secondFailureFatal rides ONLY the fragile single copy — the table picks nothing", () => {
    const [redundancyFirst, serveFirst] = restoreOptions(CFG);
    expect(redundancyFirst.secondFailureFatal).toBe(false);
    expect(serveFirst.secondFailureFatal).toBe(true);
    expect(Object.isFrozen(restoreOptions())).toBe(true);
  });
});
