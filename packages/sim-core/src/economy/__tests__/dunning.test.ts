import { describe, expect, it } from "vitest";

import { asEntityId, type RunSeed } from "../../types.js";
import { asRunSeed } from "../../types.js";
import { advanceDunning, assertDunningLadder, DUNNING_STAGE_ORDER, stageForDaysPastDue } from "../dunning.js";
import { defaultEconomyConfig, type EconomyConfig } from "../config.js";
import { DAY, SEED, makeInvoice } from "./helpers.js";

const cfg = defaultEconomyConfig();
const SEED_A: RunSeed = asRunSeed(7n);

function failedInvoice(dueAtMin = 0) {
  return makeInvoice({
    id: asEntityId("inv-d1"),
    contractId: asEntityId("c-d1"),
    dueAtMin,
    state: "failed",
    dunningStage: "failed",
    dunningStageAtMin: dueAtMin,
  });
}

function noRecovery(base: EconomyConfig): EconomyConfig {
  return {
    ...base,
    dunning: {
      ...base.dunning,
      stageRecoveryBps: { retry: 0n, reminder: 0n, warning: 0n, suspend: 0n },
      postSuspensionRecoveryBps: 0n,
      dunningEngineBonusBps: 0n,
    },
  };
}

describe("dunning ladder geometry (§6.4: declines 1–4, dunning 5–20)", () => {
  it("stage boundaries follow the configured day dial", () => {
    expect(stageForDaysPastDue(0, cfg)).toBe("failed");
    expect(stageForDaysPastDue(1, cfg)).toBe("retry");
    expect(stageForDaysPastDue(5, cfg)).toBe("reminder");
    expect(stageForDaysPastDue(8, cfg)).toBe("warning");
    expect(stageForDaysPastDue(cfg.dunning.suspensionDay, cfg)).toBe("suspend");
    expect(stageForDaysPastDue(cfg.dunning.suspensionDay + cfg.dunning.terminationAfterSuspensionDays, cfg)).toBe("terminate");
  });

  it("the ladder must be monotonic — mis-ordered dial fails loud", () => {
    expect(() =>
      assertDunningLadder({ ...cfg, dunning: { ...cfg.dunning, warningStartDay: 99 } }),
    ).toThrow(/out of order/);
  });

  it("stage order constant is the closed enum, terminate last", () => {
    expect(DUNNING_STAGE_ORDER[DUNNING_STAGE_ORDER.length - 1]).toBe("terminate");
  });
});

describe("full-path FSM with recovery rates at zero (never recovers)", () => {
  const zero = noRecovery(cfg);
  let invoice = failedInvoice(0);
  const path: string[] = [];

  for (const day of [1, 5, 8, 10, 20]) {
    const adv = advanceDunning(invoice, day * DAY, SEED_A, zero, 0n);
    path.push(`${adv.kind}:${adv.stageNow}`);
    invoice = { ...invoice, dunningStage: adv.stageNow, dunningStageAtMin: day * DAY };
  }

  it("walks failed→retry→reminder→warning→suspend→terminate exactly once each", () => {
    expect(path).toEqual([
      "advanced:retry",
      "advanced:reminder",
      "advanced:warning",
      "suspended:suspend",
      "terminated:terminate",
    ]);
  });

  it("within-stage re-invocation is a no-op hold (single roll per entry)", () => {
    const mid = { ...failedInvoice(0), dunningStage: "reminder" as const };
    const held = advanceDunning(mid, 6 * DAY, SEED_A, zero, 0n);
    expect(held.kind).toBe("held");
    const done = advanceDunning({ ...mid, dunningStage: "terminate" }, 999 * DAY, SEED_A, zero, 0n);
    expect(done.kind).toBe("held"); // terminal is terminal
  });

  it("refuses to advance a non-failed invoice (Law 2: state parsed upstream)", () => {
    expect(() => advanceDunning(failedInvoice(0), 0, SEED_A, zero, 0n)).not.toThrow();
    const paid = { ...failedInvoice(0), state: "paid" as const };
    expect(() => advanceDunning(paid, DAY, SEED_A, zero, 0n)).toThrow(/requires state 'failed'/);
  });
});

describe("recovery branches", () => {
  it("100% retry recovery ⇒ invoice recovers at day 1 boundary", () => {
    const always = {
      ...cfg,
      dunning: { ...cfg.dunning, stageRecoveryBps: { ...cfg.dunning.stageRecoveryBps, retry: 10_000n } },
    };
    const adv = advanceDunning(failedInvoice(0), DAY, SEED_A, always, 0n);
    expect(adv.kind).toBe("recovered");
    expect(adv.stageNow).toBe("retry");
  });

  it("engine bonus stacks and caps at certainty (buildable 40–70% ⇒ never exceeds 10000 bps)", () => {
    const adv = advanceDunning(failedInvoice(0), DAY, SEED_A, cfg, 9_900n);
    expect(adv.kind).toBe("recovered"); // default 1200 + 9900 → capped 10000
  });

  it("last-chance roll at the terminate edge uses postSuspension rate", () => {
    const saveAtEnd = {
      ...cfg,
      dunning: { ...cfg.dunning, postSuspensionRecoveryBps: 10_000n },
    };
    const suspended = { ...failedInvoice(0), dunningStage: "suspend" as const };
    const adv = advanceDunning(suspended, 20 * DAY, SEED_A, saveAtEnd, 0n);
    expect(adv.kind).toBe("recovered");
    expect(adv.stageNow).toBe("terminate");
  });

  it("the seeded ladder is replay-stable: same seed ⇒ same recoveries ×100", () => {
    const outcomes = new Set<string>();
    for (let replay = 0; replay < 100; replay += 1) {
      let inv = failedInvoice(0);
      const line: string[] = [];
      for (const day of [1, 5, 8, 10, 20]) {
        const adv = advanceDunning(inv, day * DAY, SEED_A, cfg, 0n);
        line.push(adv.kind);
        if (adv.kind === "recovered" || adv.kind === "terminated" || adv.kind === "held") break;
        inv = { ...inv, dunningStage: adv.stageNow };
      }
      outcomes.add(line.join(","));
    }
    expect(outcomes.size).toBe(1);
  });
});
