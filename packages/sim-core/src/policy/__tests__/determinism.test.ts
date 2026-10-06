import { describe, expect, it } from "vitest";

import type { PolicyCard, RulePhaseIn } from "../../types";
import {
  createRuntimeState,
  defaultEvaluationConfig,
  runRulePhase,
  serializeFireLog,
  shadowEvaluationConfig,
  type PolicyFireEntry,
} from "../evaluator";
import { action, card, observedOf, phaseInput, predicate, valueThreshold, F, MIN_US, stableJson } from "./fixtures";

/**
 * Slice-gate determinism tests (MASTER_REPORT §4.5 gate slice, acceptance 1):
 * "same seed → byte-identical fire-log across 100 replays" + the no-RNG
 * construction proof + dry-run prediction (acceptance 2, R15/R16/G8).
 */

const TICKS = 40;

const book: PolicyCard[] = [
  card({
    id: "r-autoscale",
    scopeEntity: "web-1",
    when: [predicate("cpu", ">", valueThreshold(F(0.85), "percent"))],
    forUs: 2n * MIN_US,
    then: [action("scale-out", F(2))],
    band: "execute",
  }),
  card({
    id: "r-costcap",
    scopeEntity: "web-1",
    when: [predicate("cost", ">", valueThreshold(F(900), "micro-usd"))],
    then: [action("drain")],
    band: "execute",
  }),
  card({
    id: "r-latency",
    scopeEntity: "web-1",
    when: [predicate("p95", ">", valueThreshold(F(200), "ms"))],
    then: [action("failover")],
    band: "consult",
  }),
  card({
    id: "r-drivefail",
    scopeEntity: "web-1",
    when: [predicate("drive-failures", "fails", { kind: "event-name", name: "drive-failure" })],
    then: [action("run-runbook", null, "swap-drive")],
    band: "execute",
  }),
];

/** Scripted observed stream (deterministic by construction). */
function observedAt(tick: number) {
  const cpu =
    tick <= 9 ? F(0.05 * tick + 0.1) : tick <= 20 ? F(0.95) : tick <= 25 ? F(0.4) : tick <= 35 ? F(0.92) : F(0.5);
  const cost = tick <= 11 ? 400_000_000n : tick <= 24 ? 1_200_000_000n : 300_000_000n;
  const p95 = tick >= 5 && tick <= 15 ? 260_000n : 120_000n;
  const failures = tick >= 30 ? 2n : tick >= 8 ? 1n : 0n;
  return observedOf([
    ["web-1", "cpu", cpu],
    ["web-1", "cost", cost],
    ["web-1", "p95", p95],
    ["web-1", "drive-failures", failures],
  ]);
}

function buildInputs(rngSeed: bigint): RulePhaseIn[] {
  return Array.from({ length: TICKS }, (_, t) => phaseInput(BigInt(t), observedAt(t), book, rngSeed));
}

interface ReplayResult {
  readonly fireLogText: string;
  readonly intentsText: string;
  readonly entries: readonly PolicyFireEntry[];
}

function replay(rngSeed: bigint, mode: "live" | "shadow", frozen = false): ReplayResult {
  let state = createRuntimeState();
  const allIntents = [];
  let lastEntries: readonly PolicyFireEntry[] = [];
  for (const input of buildInputs(rngSeed)) {
    const config = { ...defaultEvaluationConfig, mode, frozen };
    const result = runRulePhase(state, input, config);
    state = result.state;
    allIntents.push(...result.out.intents);
    lastEntries = result.entries;
  }
  return { fireLogText: serializeFireLog(state.fireLog), intentsText: stableJson(allIntents), entries: lastEntries };
}

describe("policy determinism gate — fire-log byte-identity", () => {
  it("×100 replays of the same observed stream are byte-identical (acceptance 1)", () => {
    const reference = replay(42n, "live");
    expect(reference.fireLogText.length).toBeGreaterThan(0);
    // The scenario must actually exercise every interesting stage.
    expect(reference.fireLogText).toContain("execute");
    expect(reference.fireLogText).toContain("consult-pending");
    expect(reference.fireLogText).toContain("consult-expired");
    for (let i = 0; i < 100; i += 1) {
      const again = replay(42n, "live");
      expect(again.fireLogText).toBe(reference.fireLogText);
      expect(again.intentsText).toBe(reference.intentsText);
    }
  });

  it("no-RNG proof: divergent rng streams cannot change any output", () => {
    const seedA = replay(1n, "live");
    const seedB = replay(999_999_999n, "live");
    expect(seedB.fireLogText).toBe(seedA.fireLogText);
    expect(seedB.intentsText).toBe(seedA.intentsText);
  });

  it("dry-run predicts ≥ the fires that occur post-arm (acceptance 2, R15/R16)", () => {
    const shadow = replay(7n, "shadow");
    const live = replay(7n, "live");
    const firingStages = new Set(["execute", "inform", "consult-pending", "guard-escalated"]);
    const keys = (text: string) =>
      text
        .split("\n")
        .filter((line) => line.length > 0)
        .filter((line) => firingStages.has(line.split("|")[4] as string))
        .map((line) => {
          const parts = line.split("|");
          return `${parts![0]}|${parts![1]}|${parts![4]}|${parts![5]}`; // tick|rule|stage|intents
        });
    const shadowFires = keys(shadow.fireLogText);
    const liveFires = keys(live.fireLogText);
    expect(shadowFires.length).toBeGreaterThan(0);
    for (const liveFire of liveFires) {
      expect(shadowFires).toContain(liveFire);
    }
    // Shadow logs would-fire rows with the tick (mode tag is the only delta).
    expect(shadow.fireLogText).toContain("|shadow|");
    expect(live.fireLogText).toContain("|live|");
  });

  it("kill-switch stops ALL firings on the same fixture (R18)", () => {
    const frozen = replay(42n, "live", true);
    expect(frozen.fireLogText).toBe("");
    expect(frozen.intentsText).toBe("[]");
    // …and the SAME replay unfrozen fires — the stop is the flag, not luck.
    expect(replay(42n, "live").fireLogText.length).toBeGreaterThan(0);
  });
});
