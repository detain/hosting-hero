import { describe, expect, it } from "vitest";

import { asMoney, asRuleId, type PolicyCard, type RulePhaseIn } from "../../types";
import {
  appendFireLog,
  compactFireLog,
  createRuntimeState,
  defaultEvaluationConfig,
  emptyFireLog,
  fireLogEntries,
  parseKeyEntityStrict,
  resolveConsultation,
  runRulePhase,
  serializeFireLog,
  shadowEvaluationConfig,
  PolicyEvalError,
  type PolicyFireEntry,
  type PolicyRuntimeState,
} from "../evaluator";
import { PolicyGrammarError } from "../grammar";
import { detectConflicts } from "../conflicts";
import { detectDirectedCycles, detectDirectedCyclesBounded } from "../graph";
import { projectEscalationChain, validateRoutingTable, type AlertRoutingTable } from "../routing";
import { action, at, card, observedOf, phaseInput, predicate, valueThreshold, F, MIN_US } from "./fixtures";

/**
 * Expert-review fix pins (P1–P5, P7, N1, N2) — one focused test per finding.
 */

const consultCard = card({
  id: "r-pin-consult",
  scopeEntity: "web-1",
  when: [predicate("suspicion", ">", valueThreshold(F(0.5), "ratio"))],
  then: [action("failover")],
  band: "consult",
});

function consultInputs(count: number, tickOffset = 0): RulePhaseIn[] {
  const observed = observedOf([["web-1", "suspicion", F(0.9)]]);
  return Array.from({ length: count }, (_, i) => {
    const tick = BigInt(i + tickOffset);
    const input = phaseInput(tick, observed, [consultCard]);
    return { ...input, context: { ...input.context, tick, clocks: { ...input.context.clocks, simUs: tick * MIN_US } } };
  });
}

/* ─────────────────────────── P7: bounded cycle scan ─────────────────────────── */

function estateCapacityBook(size: number): PolicyCard[] {
  // Every rule reads cpu→capacity and writes capacity (scale-out) under an
  // estate scope: the interference graph is the mutual K_n the review named.
  return Array.from({ length: size }, (_, i) =>
    card({
      id: `k-${i}`,
      when: [predicate("cpu", ">", valueThreshold(F(0.85), "percent"))],
      then: [action("scale-out")],
      band: "execute",
    }),
  );
}

describe("P7 — oscillation scan is work-bounded, truncation is loud (graph/conflicts)", () => {
  it("K8 estate mutual-interference graph finishes fast and flags the 2–3 cycles", () => {
    const started = Date.now();
    const findings = detectConflicts(estateCapacityBook(8));
    const elapsedMs = Date.now() - started;
    const cycles = findings.filter((f) => f.kind === "oscillation-cycle");
    expect(cycles.length).toBeGreaterThan(0); // K8: 28 two-cycles + 56 three-cycles
    expect(cycles.every((f) => f.ruleIds.length === 2 || f.ruleIds.length === 3)).toBe(true);
    expect(findings.some((f) => f.kind === "cycle-scan-budget-exceeded")).toBe(false);
    expect(elapsedMs).toBeLessThan(2000);
  });

  it("dense K_n past the work budget emits CYCLE_SCAN_BUDGET_EXCEEDED with truncated=true", () => {
    const findings = detectConflicts(estateCapacityBook(64));
    const notice = findings.filter((f) => f.kind === "cycle-scan-budget-exceeded");
    expect(notice).toHaveLength(1);
    expect(notice[0]?.detail).toContain("CYCLE_SCAN_BUDGET_EXCEEDED");
    expect(notice[0]?.detail).toContain("truncated=true");
    expect(notice[0]?.ruleIds).toEqual([]);
  });

  it("bounded scan stops at maxCycleLength; complete scan still finds the 4-cycle", () => {
    const ring = { nodes: ["a", "b", "c", "d"], edges: [["a", "b"], ["b", "c"], ["c", "d"], ["d", "a"]] } as const;
    const graph = { nodes: [...ring.nodes], edges: ring.edges.map(([x, y]) => [x, y] as const) };
    const bounded = detectDirectedCyclesBounded(graph, false, { maxCycleLength: 3, workBudget: 100_000 });
    expect(bounded.cycles).toEqual([]);
    expect(bounded.truncated).toBe(false); // budget honored it — LENGTH bound stopped it
    expect(detectDirectedCycles(graph, false)).toEqual([["a", "b", "c", "d"]]);
  });

  it("work budget itself truncates a shallow-but-vast search", () => {
    const graph = {
      nodes: Array.from({ length: 20 }, (_, i) => String(i)),
      edges: Array.from({ length: 20 }, (_, i) =>
        Array.from({ length: 20 }, (_, j) => [String(i), String(j)] as const),
      ).flat(),
    };
    const result = detectDirectedCyclesBounded(graph, false, { maxCycleLength: 3, workBudget: 50 });
    expect(result.truncated).toBe(true);
    expect(result.steps).toBeLessThanOrEqual(51);
    expect(result.cycles.length).toBeGreaterThan(0); // partial results survive
  });
});

/* ─────────────────────────── P1: strict key parsing ─────────────────────────── */

describe("P1 — observed keys parse strictly; entity ids containing '::' fail loud", () => {
  it("parseKeyEntityStrict accepts exactly-one-separator keys", () => {
    expect(String(parseKeyEntityStrict("web-1::cpu" as never))).toBe("web-1");
  });

  it("multi-separator keys throw a domain error, never a silent truncation", () => {
    const informer = card({
      id: "r-estate-pin",
      when: [predicate("cpu", ">", valueThreshold(F(0.5), "percent"))],
      then: [action("page")],
      band: "inform",
    });
    // entity "weird::ent" + metric "cpu" ⇒ two separators — ambiguous by contract
    const ambiguous = observedOf([["weird::ent", "cpu", F(0.9)]]);
    const input = phaseInput(0n, ambiguous, [informer]);
    expect(() => runRulePhase(createRuntimeState(), input, defaultEvaluationConfig)).toThrow(PolicyEvalError);
    expect(() => runRulePhase(createRuntimeState(), input, defaultEvaluationConfig)).toThrow(/more than one "::"/);
    expect(() => parseKeyEntityStrict("nonsense" as never)).toThrow(/not of the form/);
  });

  it("well-formed estate books keep resolving entities as before", () => {
    const informer = card({
      id: "r-estate-ok",
      when: [predicate("cpu", ">", valueThreshold(F(0.5), "percent"))],
      then: [action("page")],
      band: "inform",
    });
    const ok = phaseInput(0n, observedOf([["web-1", "cpu", F(0.9)], ["db-1", "cpu", F(0.2)]]), [informer]);
    const result = runRulePhase(createRuntimeState(), ok, defaultEvaluationConfig);
    expect(at(result.entries, 0).stage).toBe("inform");
    expect(at(result.entries, 0).ruleId).toBe(asRuleId("r-estate-ok"));
  });
});

/* ─────────────────────────── P2: read-then-commit snapshots ─────────────────────────── */

describe("P2 — UNLESS guards see the PRE-run snapshot of metrics WHEN already read", () => {
  it("same-metric 'changed' guard fires (old write-during-evaluation made it impossible)", () => {
    const guarded = card({
      id: "r-p2",
      scopeEntity: "web-1",
      when: [predicate("cpu", ">", valueThreshold(F(0.5), "percent"))],
      then: [action("page")],
      unless: [predicate("cpu", "changed", { kind: "event-name", name: "cpu-move" })],
      band: "inform",
    });
    const values = [F(0.6), F(0.4), F(0.9)]; // fire → unlatch → re-assert WITH a move
    const inputs = values.map((cpu, i) => {
      const tick = BigInt(i);
      const input = phaseInput(tick, observedOf([["web-1", "cpu", cpu]]), [guarded]);
      return { ...input, context: { ...input.context, tick, clocks: { ...input.context.clocks, simUs: tick * MIN_US } } };
    });
    let state = createRuntimeState();
    const stages: string[] = [];
    for (const input of inputs) {
      const result = runRulePhase(state, input, defaultEvaluationConfig);
      state = result.state;
      stages.push(...result.entries.map((e) => e.stage));
    }
    expect(stages).toEqual(["inform", "guard-blocked"]);
    // tick 2: cpu 0.9 re-asserts the trigger AND moved since 0.4 — the guard
    // must block. Under the old code WHEN's snapshot write blinded UNLESS.
  });
});

/* ─────────────────────────── P3: defensive kill switch ─────────────────────────── */

describe("P3 — freeze preserves consults; frozen verdicts wait for unfreeze", () => {
  it("frozen runs never expire pending consults; unfreezing resumes the TTL", () => {
    let state = runRulePhase(createRuntimeState(), at(consultInputs(1), 0), defaultEvaluationConfig).state;
    expect(at(state.pendingConsults, 0).pendingId).toBe("r-pin-consult@0");

    const frozenLate = { ...defaultEvaluationConfig, frozen: true };
    const stayed = runRulePhase(state, at(consultInputs(1, 40), 0), frozenLate); // 40 min > 30 min TTL
    expect(stayed.entries).toEqual([]);
    expect(stayed.state.pendingConsults).toHaveLength(1); // PRESERVED, not expired
    expect(stayed.out.intents).toEqual([]);

    const unfrozenLate = runRulePhase(stayed.state, at(consultInputs(1, 40), 0), defaultEvaluationConfig);
    expect(unfrozenLate.entries.some((e) => e.stage === "consult-expired")).toBe(true);
    expect(unfrozenLate.state.pendingConsults).toHaveLength(0);
  });

  it("a verdict given mid-freeze is recorded, dispatches nothing, and lands on unfreeze", () => {
    const state = runRulePhase(createRuntimeState(), at(consultInputs(1), 0), defaultEvaluationConfig).state;
    const frozenAnswer = resolveConsultation(state, "r-pin-consult@0", true, 10n * MIN_US, true);
    expect(frozenAnswer.intents).toEqual([]);
    expect(at(frozenAnswer.entries, 0).stage).toBe("consult-deferred");
    expect(frozenAnswer.state.pendingConsults).toHaveLength(0);
    expect(frozenAnswer.state.deferredResolutions).toHaveLength(1);

    // Shadow runs must NOT consume the player's decision.
    const shadowed = runRulePhase(frozenAnswer.state, at(consultInputs(1, 15), 0), shadowEvaluationConfig);
    expect(shadowed.state.deferredResolutions).toHaveLength(1);
    expect(shadowed.out.intents).toEqual([]);

    // First unfrozen LIVE run dispatches, in order, stamped at its own clock.
    const input = at(consultInputs(1, 20), 0);
    const live = runRulePhase(shadowed.state, input, { ...defaultEvaluationConfig, frozen: false });
    expect(live.out.intents).toHaveLength(1);
    expect(at(live.out.intents, 0).atUs).toBe(20n * MIN_US);
    expect(at(live.out.intents, 0).payload).toMatchObject({ kind: "verb", verb: "failover", target: "web-1" });
    const dispatched = live.entries.filter((e) => e.stage === "consult-dispatched");
    expect(dispatched).toHaveLength(1);
    expect(dispatched[0]?.tick).toBe(20n);
    expect(live.state.deferredResolutions).toHaveLength(0);
  });

  it("denials deferred during freeze are journaled, not dispatched", () => {
    const state = runRulePhase(createRuntimeState(), at(consultInputs(1), 0), defaultEvaluationConfig).state;
    const denied = resolveConsultation(state, "r-pin-consult@0", false, 10n * MIN_US, true);
    const live = runRulePhase(denied.state, at(consultInputs(1, 20), 0), defaultEvaluationConfig);
    expect(live.out.intents).toEqual([]);
    expect(live.entries.some((e) => e.stage === "consult-denied")).toBe(true);
  });
});

/* ─────────────────────────── P4: append-only log + ring hook ─────────────────────────── */

const GOLDEN_SCENARIO_BOOK: PolicyCard[] = [
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
    id: "r-guarded",
    scopeEntity: "web-1",
    when: [predicate("cpu", ">", valueThreshold(F(0.8), "percent"))],
    then: [action("page", F(1))],
    unless: [predicate("maintenance", ">", valueThreshold(F(0), "count"))],
    escalate: { to: "band", ref: "inform" },
    band: "execute",
  }),
  card({
    id: "r-fails",
    scopeEntity: "web-1",
    when: [predicate("drive-failures", "fails", { kind: "event-name", name: "drive-failure" })],
    then: [action("run-runbook", null, "swap-drive")],
    band: "execute",
  }),
];

/** Captured from the PRE-refactor implementation (2026-10-06, commit-worktree). */
const GOLDEN_FIRE_LOG = [
  "5|r-latency|live|consult|consult-pending|0|300000000",
  "5|r-latency|live|consult|consult-dispatched|1|420000000",
  "8|r-fails|live|execute|execute|1|480000000",
  "10|r-guarded|live|execute|execute|1|600000000",
  "12|r-autoscale|live|execute|execute|1|720000000",
  "12|r-costcap|live|execute|execute|1|720000000",
  "26|r-guarded|live|execute|execute|1|1560000000",
  "28|r-autoscale|live|execute|execute|1|1680000000",
  "30|r-fails|live|execute|execute|1|1800000000",
].join("\n");

function goldenScenario(): PolicyRuntimeState {
  let state = createRuntimeState();
  for (let t = 0; t < 40; t += 1) {
    const cpu = t <= 9 ? F(0.05 * t + 0.1) : t <= 20 ? F(0.95) : t <= 25 ? F(0.4) : t <= 35 ? F(0.92) : F(0.5);
    const cost = t <= 11 ? 400_000_000n : t <= 24 ? 1_200_000_000n : 300_000_000n;
    const p95 = t >= 5 && t <= 15 ? 260_000n : 120_000n;
    const failures = t >= 30 ? 2n : t >= 8 ? 1n : 0n;
    const maintenance = t === 12 ? F(1) : F(0);
    const observed = observedOf([
      ["web-1", "cpu", cpu],
      ["web-1", "cost", cost],
      ["web-1", "p95", p95],
      ["web-1", "drive-failures", failures],
      ["web-1", "maintenance", maintenance],
    ]);
    const result = runRulePhase(state, phaseInput(BigInt(t), observed, GOLDEN_SCENARIO_BOOK), defaultEvaluationConfig);
    state = result.state;
    if (t === 6 && state.pendingConsults.length > 0) {
      state = resolveConsultation(state, at(state.pendingConsults, 0).pendingId, true, 7n * MIN_US).state;
    }
  }
  return state;
}

describe("P4 — fire log is append-only, byte-stable, and ring-compactable", () => {
  it("serializeFireLog output is byte-identical to the pre-refactor golden", () => {
    expect(serializeFireLog(goldenScenario().fireLog)).toBe(GOLDEN_FIRE_LOG);
  });

  it("10k-tick run: unbounded prefix is stable, fireLogKeepLast bounds the journal", () => {
    const informer = card({
      id: "r-ring",
      scopeEntity: "web-1",
      when: [predicate("cpu", ">", valueThreshold(F(0.5), "percent"))],
      then: [action("page")],
      band: "inform",
    });
    const TICKS = 10_000;
    const inputs: RulePhaseIn[] = Array.from({ length: TICKS }, (_, i) => {
      const tick = BigInt(i);
      const input = phaseInput(tick, observedOf([["web-1", "cpu", i % 2 === 0 ? F(0.9) : F(0.4)]]), [informer]);
      return { ...input, context: { ...input.context, tick, clocks: { ...input.context.clocks, simUs: tick * MIN_US } } };
    });

    let open = createRuntimeState();
    for (const input of inputs) open = runRulePhase(open, input, defaultEvaluationConfig).state;
    expect(open.fireLog.total).toBe(TICKS / 2); // every even tick informs

    let capped = createRuntimeState();
    for (const input of inputs) {
      capped = runRulePhase(capped, input, { ...defaultEvaluationConfig, fireLogKeepLast: 100 }).state;
    }
    expect(capped.fireLog.total).toBeLessThanOrEqual(200); // ring held it down
    expect(capped.fireLog.compactedCount).toBeGreaterThan(TICKS / 2 - 200);
    // The retained window is exactly the TAIL of the unbounded journal —
    // compaction never mutates what it keeps.
    const openText = serializeFireLog(open.fireLog);
    const cappedText = serializeFireLog(capped.fireLog);
    expect(cappedText.length).toBeGreaterThan(0);
    expect(openText.endsWith(cappedText)).toBe(true);
  });

  it("compactFireLog keeps the last rows and counts the drops", () => {
    const rows = (n: number): PolicyFireEntry[] =>
      Array.from({ length: n }, (_, i) => ({
        ruleId: asRuleId(`r-${i}`),
        tick: BigInt(i),
        atUs: BigInt(i),
        mode: "live",
        band: "inform",
        stage: "inform",
        intents: 0,
      }));
    let log = emptyFireLog();
    log = appendFireLog(log, rows(4));
    log = appendFireLog(log, rows(4));
    const compacted = compactFireLog(log, 6);
    expect(compacted.total).toBe(6);
    expect(compacted.compactedCount).toBe(2);
    expect(fireLogEntries(compacted).length).toBe(6);
    expect(() => compactFireLog(log, -1)).toThrow(PolicyEvalError);
  });
});

/* ─────────────────────────── P5 + N2: routing ─────────────────────────── */

describe("P5 — routing validation rejects an empty escalation ref", () => {
  it("escalation {kind, ref:''} fails load with a RoutingError", () => {
    const table: AlertRoutingTable = {
      entries: [
        {
          id: "p5",
          severity: "sev-1",
          destination: { kind: "role", ref: "ic" },
          escalateAfterUs: 1n * MIN_US,
          escalation: { kind: "role", ref: "" },
        },
      ],
    };
    expect(() => validateRoutingTable(table)).toThrow(/escalation ref must be non-empty/);
  });
});

describe("N2 — escalation chain follows the table-order carrier, not a label heuristic", () => {
  it("a secondary entry sharing the destination cannot hijack the chain past the primary terminal", () => {
    const table: AlertRoutingTable = {
      entries: [
        { id: "m1", severity: "sev-1", destination: { kind: "role", ref: "ic" }, escalateAfterUs: 5n * MIN_US, escalation: { kind: "role", ref: "cto" } },
        { id: "m2", severity: "sev-2", destination: { kind: "role", ref: "cto" }, escalateAfterUs: 0n, escalation: null },
        { id: "m3", severity: "sev-3", destination: { kind: "role", ref: "cto" }, escalateAfterUs: 7n * MIN_US, escalation: { kind: "role", ref: "ceo" } },
      ],
    };
    validateRoutingTable(table);
    // The escalated alert lands on `role:cto`; the dispatch that would ACTUALLY
    // receive it is m2 (table-order first), which is terminal. The old
    // heuristic picked m3 and projected a page to ceo that would never send.
    expect(projectEscalationChain(table, "sev-1")).toEqual(["role:ic", "role:cto"]);
  });
});

/* ─────────────────────────── N1: store-bypass guard ─────────────────────────── */

describe("N1 — runRulePhase validates the book at the seam", () => {
  const broken = {
    id: asRuleId("r-broken"),
    scope: { kind: "estate", ref: null },
    when: [], // grammar tuple violation: WHEN must hold 1..3
    then: [{ id: "page", value: null, runbookName: null }],
    band: "inform",
    upkeepMicroUsd: asMoney(0n),
  } as unknown as PolicyCard;

  it("raw malformed books throw the grammar domain error, not a TypeError", () => {
    const input = phaseInput(0n, observedOf([["web-1", "cpu", F(0.9)]]), [broken]);
    expect(() => runRulePhase(createRuntimeState(), input, defaultEvaluationConfig)).toThrow(PolicyGrammarError);
    expect(() => runRulePhase(createRuntimeState(), input, defaultEvaluationConfig)).toThrow(/must hold 1\.\.3/);
  });

  it("validation runs before the frozen short-circuit — a frozen book must still be legal", () => {
    const input = phaseInput(0n, observedOf([["web-1", "cpu", F(0.9)]]), [broken]);
    expect(() =>
      runRulePhase(createRuntimeState(), input, { ...defaultEvaluationConfig, frozen: true }),
    ).toThrow(PolicyGrammarError);
  });
});
