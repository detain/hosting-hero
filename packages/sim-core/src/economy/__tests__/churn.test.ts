import { describe, expect, it } from "vitest";

import { asEntityId, type EntityId } from "../../types.js";
import {
  addChurnSignal,
  churnRoll,
  defuseForecasts,
  effectiveMonthlyChurnBps,
  forecastChurnBpsAt,
  ghostedForecastTable,
  paymentFailureRoll,
  pruneForecasts,
} from "../churn.js";
import { defaultEconomyConfig } from "../config.js";
import { DAY, OTHER_SEED, SEED } from "./helpers.js";

const cfg = defaultEconomyConfig();
const CONTRACTS: EntityId[] = ["a", "b", "c"].map(asEntityId);

describe("churn determinism — the (seed, contract, month) key law (task-4)", () => {
  function trace(seed: typeof SEED, months: number): string {
    const out: string[] = [];
    for (let month = 1; month <= months; month += 1) {
      for (const id of CONTRACTS) {
        out.push(`${id}:${churnRoll(id, 450n, month, seed)}`);
      }
    }
    return out.join("|");
  }

  it("×100 replays of the same seed produce byte-identical cohort traces", () => {
    const first = trace(SEED, 24);
    for (let replay = 0; replay < 100; replay += 1) {
      expect(trace(SEED, 24)).toBe(first);
    }
  });

  it("a different seed moves at least one cell (streams are seed-sensitive)", () => {
    expect(trace(OTHER_SEED, 24)).not.toBe(trace(SEED, 24));
  });

  it("one contract's rate change cannot perturb another's draw", () => {
    // 450 bps both months; churn "b" is queried alone vs alongside a heavy "a"
    const alone = churnRoll(CONTRACTS[1]!, 450n, 3, SEED);
    void churnRoll(CONTRACTS[0]!, 9_900n, 3, SEED);
    expect(churnRoll(CONTRACTS[1]!, 450n, 3, SEED)).toBe(alone);
  });

  it("0 bps never churns; 10000 bps always does (band edges)", () => {
    expect(churnRoll(CONTRACTS[0]!, 0n, 1, SEED)).toBe("retained");
    for (let month = 1; month <= 12; month += 1) {
      expect(churnRoll(CONTRACTS[0]!, 10_000n, month, SEED)).toBe("churned");
    }
  });

  it("payment failure roll honors its rate edges", () => {
    const noFail = { ...cfg, dunning: { ...cfg.dunning, cardFailureBps: 0n } };
    expect(paymentFailureRoll(0, CONTRACTS[0]!, SEED, noFail)).toBe(false);
    const allFail = { ...cfg, dunning: { ...cfg.dunning, cardFailureBps: 10_000n } };
    expect(paymentFailureRoll(0, CONTRACTS[0]!, SEED, allFail)).toBe(true);
  });
});

describe("rate table wiring (Sheet C §6.16:25610 MIDs)", () => {
  it("bundle lookup falls back for unknown ids and clamps at certainty", () => {
    expect(effectiveMonthlyChurnBps("vps", CONTRACTS[0]!, [], 0, cfg)).toBe(600n);
    expect(effectiveMonthlyChurnBps("nonexistent", CONTRACTS[0]!, [], 0, cfg)).toBe(cfg.churn.fallbackMonthlyBps);
    const hot = {
      ...cfg,
      churn: { ...cfg.churn, fallbackMonthlyBps: 9_900n, ghostedSignalAddBps: 3_000n },
    };
    let f = addChurnSignal([], CONTRACTS[0]!, 0, SEED, hot);
    // force-lit at its seeded lit time
    f = [{ ...f[0]!, litAtMin: 0 }];
    expect(effectiveMonthlyChurnBps("nonexistent", CONTRACTS[0]!, f, 0, hot)).toBe(10_000n);
  });
});

describe("ghosted forecast: 30–60 day lag accumulator (§7.15, task-4)", () => {
  it("fuse lights inside the doc band, adds bps while lit, decays out", () => {
    const at: EntityId = asEntityId("ghost-1");
    const f = addChurnSignal([], at, 0, SEED, cfg);
    expect(f.length).toBe(1);
    const lit = f[0]!;
    expect(lit.litAtMin).toBeGreaterThanOrEqual(30 * DAY);
    expect(lit.litAtMin).toBeLessThanOrEqual(60 * DAY);
    expect(lit.expiresAtMin).toBe(lit.litAtMin + cfg.churn.ghostedSignalDecayDays * DAY);

    expect(forecastChurnBpsAt(f, at, lit.litAtMin - 1)).toBe(0n); // still ghosted
    expect(forecastChurnBpsAt(f, at, lit.litAtMin)).toBe(cfg.churn.ghostedSignalAddBps);
    expect(forecastChurnBpsAt(f, at, lit.expiresAtMin)).toBe(0n); // decayed
    expect(ghostedForecastTable(f, lit.litAtMin).get(at)).toBe(cfg.churn.ghostedSignalAddBps);
  });

  it("same seed + signal minute re-lights the same day (replay-stable)", () => {
    const at = asEntityId("ghost-2");
    const x = addChurnSignal([], at, 5 * DAY, SEED, cfg)[0]!;
    const y = addChurnSignal([], at, 5 * DAY, SEED, cfg)[0]!;
    expect(x.litAtMin).toBe(y.litAtMin);
  });

  it("intervention defuses ALL of a contract's fuses; pruning drops dead ones", () => {
    let f = addChurnSignal([], asEntityId("g3"), 0, SEED, cfg);
    f = addChurnSignal(f, asEntityId("g3"), 2 * DAY, SEED, cfg);
    f = addChurnSignal(f, asEntityId("g4"), 0, SEED, cfg);
    expect(f.length).toBe(3);
    const defused = defuseForecasts(f, asEntityId("g3"));
    expect(defused.every((e) => e.contractId !== asEntityId("g3"))).toBe(true);
    const far = 1_000 * DAY;
    expect(pruneForecasts(f, far)).toEqual([]);
  });

  it("signals accumulate additively but the effective rate still clamps", () => {
    const at = asEntityId("g5");
    let f = addChurnSignal([], at, 0, SEED, cfg);
    f = addChurnSignal(f, at, DAY, SEED, cfg);
    const both = f.map((e) => ({ ...e, litAtMin: 0, expiresAtMin: 60 * DAY }));
    const now = cfg.calendar.minutesPerMonth; // month boundary, within expiry
    const eff = effectiveMonthlyChurnBps("shared", at, both, now, cfg);
    expect(eff).toBe(450n + 2n * cfg.churn.ghostedSignalAddBps);
  });
});
