import { describe, expect, it } from "vitest";

import { asEntityId, asRuleId, type PlayerIntent, type PolicyCard, type RulePhaseIn } from "../../types";
import {
  createRuntimeState,
  defaultEvaluationConfig,
  runRulePhase,
  resolveConsultation,
  serializeFireLog,
  shadowEvaluationConfig,
  DEFAULT_CONSULT_EXPIRY_US,
  type PolicyEvaluationConfig,
} from "../evaluator";
import { PolicyEvalError, type RulePhaseResult } from "../evaluator";
import { action, at, card, observedOf, phaseInput, predicate, valueThreshold, F, MIN_US } from "./fixtures";

interface FlattenedRun {
  readonly state: ReturnType<typeof createRuntimeState>;
  readonly out: RulePhaseResult["out"];
  readonly entries: RulePhaseResult["entries"];
  readonly intents: readonly PlayerIntent[];
}

function run(book: readonly PolicyCard[], inputs: readonly RulePhaseIn[], config: PolicyEvaluationConfig) {
  if (book.length === 0) throw new Error("fixture: run() needs a non-empty book");
  let state = createRuntimeState();
  const outs: FlattenedRun[] = [];
  for (const input of inputs) {
    const result = runRulePhase(state, input, config);
    state = result.state;
    outs.push({ state, out: result.out, entries: result.entries, intents: result.out.intents });
  }
  return { state, outs };
}

describe("policy evaluator — WHEN/FOR/THEN/UNLESS/ELSE at step 12.5", () => {
  const scaleOut = card({
    id: "r-scale",
    scopeEntity: "web-1",
    when: [predicate("cpu", ">", valueThreshold(F(0.85), "percent"))],
    forUs: 2n * MIN_US,
    then: [action("scale-out", F(2))],
    band: "execute",
  });

  it("FOR-debounces, fires once sustained, emits a rule-origin intent, then latches", () => {
    // ticks 0..5: cpu [0.5, 0.9, 0.9, 0.9, 0.5, 0.9]
    const series = [F(0.5), F(0.9), F(0.9), F(0.9), F(0.5), F(0.9)].map((cpu) =>
      phaseInput(0n, observedOf([["web-1", "cpu", cpu]]), [scaleOut]),
    );
    const inputs = series.map((input, tick) => ({
      ...input,
      context: { ...input.context, tick: BigInt(tick), minute: tick, clocks: { ...input.context.clocks, simUs: BigInt(tick) * MIN_US } },
    }));
    const { outs } = run([scaleOut], inputs, defaultEvaluationConfig);

    expect(at(outs, 0).entries).toEqual([]); // below threshold
    expect(at(outs, 1).entries).toEqual([]); // first sustained tick — debounce starts
    expect(at(outs, 2).entries).toEqual([]); // 1 min sustained < 2 min
    expect(at(outs, 3).entries).toHaveLength(1);
    expect(at(outs, 3).entries[0]?.stage).toBe("execute");
    expect(at(outs, 3).intents).toHaveLength(1);
    expect(at(outs, 3).intents[0]).toMatchObject({ origin: "rule", ruleId: asRuleId("r-scale"), clock: "sim" });
    expect(at(outs, 3).intents[0]?.payload).toMatchObject({ kind: "verb", verb: "scale-out", target: "web-1", value: F(2) });
    expect(String(at(outs, 3).out.firings[0]?.causeId)).toBe("rule:r-scale:3:live");
    expect(at(outs, 4).entries).toEqual([]); // trigger false → unlatched
    expect(at(outs, 5).entries).toEqual([]); // re-asserted, debounce restarted, not fired
  });

  it("UNLESS guard + ELSE escalate-to-band inform → no intent, guard-escalated row", () => {
    const guarded = card({
      id: "r-guard",
      scopeEntity: "web-1",
      when: [predicate("p95", ">", valueThreshold(F(200), "ms"))],
      then: [action("page", F(1))],
      unless: [predicate("cost", ">", valueThreshold(F(500), "micro-usd"))],
      escalate: { to: "band", ref: "inform" },
      band: "execute",
    });
    const input = phaseInput(1n, observedOf([["web-1", "p95", 300_000n], ["web-1", "cost", 600_000_000n]]), [guarded]);
    const { outs } = run([guarded], [input], defaultEvaluationConfig);
    expect(at(outs, 0).entries[0]?.stage).toBe("guard-escalated");
    expect(at(outs, 0).intents).toHaveLength(0);
    expect(at(outs, 0).out.firings[0]?.band).toBe("inform");
  });

  it("UNLESS guard with no ELSE → silent guard-blocked row, latched", () => {
    const guarded = card({
      id: "r-silent",
      scopeEntity: "web-1",
      when: [predicate("p95", ">", valueThreshold(F(200), "ms"))],
      then: [action("page")],
      unless: [predicate("maintenance", ">", valueThreshold(F(0), "count"))],
    });
    const input = phaseInput(1n, observedOf([["web-1", "p95", 300_000n], ["web-1", "maintenance", F(1)]]), [guarded]);
    const { outs } = run([guarded], [input], defaultEvaluationConfig);
    expect(at(outs, 0).entries[0]?.stage).toBe("guard-blocked");
    expect(at(outs, 0).out.firings).toHaveLength(0);
  });

  it("consult band pends, then EXPIRES unanswered (G10/D-12)", () => {
    const consultRule = card({
      id: "r-consult",
      scopeEntity: "web-1",
      when: [predicate("suspicion", ">", valueThreshold(F(0.5), "ratio"))],
      then: [action("failover")],
      band: "consult",
    });
    const observed = observedOf([["web-1", "suspicion", F(0.9)]]);
    const expiryTicks = Number(DEFAULT_CONSULT_EXPIRY_US / MIN_US);
    const inputs = Array.from({ length: expiryTicks + 1 }, (_, t) => {
      const input = phaseInput(BigInt(t), observed, [consultRule]);
      return { ...input, context: { ...input.context, tick: BigInt(t), clocks: { ...input.context.clocks, simUs: BigInt(t) * MIN_US } } };
    });
    const { outs } = run([consultRule], inputs, defaultEvaluationConfig);
    expect(at(outs, 0).entries[0]?.stage).toBe("consult-pending");
    expect(at(outs, 1).entries).toEqual([]); // still pending, latched
    const last = at(outs, expiryTicks).entries;
    expect(last.some((e) => e.stage === "consult-expired")).toBe(true);
    expect(at(outs, expiryTicks).intents).toHaveLength(0);
  });

  it("consult approval dispatches the THEN actions", () => {
    const consultRule = card({
      id: "r-ask",
      scopeEntity: "web-1",
      when: [predicate("suspicion", ">", valueThreshold(F(0.5), "ratio"))],
      then: [action("failover"), action("open-ticket")],
      band: "consult",
    });
    const input = phaseInput(1n, observedOf([["web-1", "suspicion", F(0.9)]]), [consultRule]);
    const first = runRulePhase(createRuntimeState(), input, defaultEvaluationConfig);
    const pending = first.state.pendingConsults[0];
    expect(pending?.pendingId).toBe("r-ask@1");
    const approved = resolveConsultation(first.state, pending?.pendingId as string, true, 5n * MIN_US);
    expect(approved.intents).toHaveLength(2);
    expect(approved.intents.every((i) => i.origin === "rule" && i.atUs === 5n * MIN_US)).toBe(true);
    expect(approved.state.pendingConsults).toHaveLength(0);
    expect(() => resolveConsultation(approved.state, "r-ask@1", true, 6n)).toThrow(PolicyEvalError);
    const denied = resolveConsultation(first.state, "r-ask@1", false, 6n * MIN_US);
    expect(denied.intents).toHaveLength(0);
    expect(denied.entries[0]?.stage).toBe("consult-denied");
  });

  it("Kill Switch freezes everything; suppressed skips one rule only (R18)", () => {
    const informer = card({
      id: "r-inform",
      when: [predicate("cpu", ">", valueThreshold(F(0.5), "percent"))],
      then: [action("page")],
      band: "inform",
    });
    const input = phaseInput(0n, observedOf([["web-1", "cpu", F(0.9)]]), [scaleOut, informer]);
    const frozen = runRulePhase(createRuntimeState(), input, { ...defaultEvaluationConfig, frozen: true });
    expect(frozen.entries).toEqual([]);
    expect(frozen.out.firings).toEqual([]);
    expect(frozen.out.intents).toEqual([]);

    const partial = runRulePhase(createRuntimeState(), input, defaultEvaluationConfig);
    // scaleOut needs a second sustained tick (FOR) — informer (no FOR) fires now.
    expect(partial.entries.map((e) => e.stage)).toEqual(["inform"]);

    const suppressed = runRulePhase(createRuntimeState(), { ...input, suppressed: [asRuleId("r-inform")] }, defaultEvaluationConfig);
    expect(suppressed.entries).toEqual([]);
  });

  it("infeasible firings log and RETRY without latching (D-4b, R7 fight)", () => {
    let attempts = 0;
    const config: PolicyEvaluationConfig = {
      ...defaultEvaluationConfig,
      feasibility: () => {
        attempts += 1;
        return attempts >= 3;
      },
    };
    const informer = card({
      id: "r-fee",
      when: [predicate("cpu", ">", valueThreshold(F(0.5), "percent"))],
      then: [action("drain")],
      band: "inform",
    });
    const observed = observedOf([["web-1", "cpu", F(0.9)]]);
    const inputs = [0n, 1n, 2n].map((tick) => {
      const input = phaseInput(tick, observed, [informer]);
      return { ...input, context: { ...input.context, tick, clocks: { ...input.context.clocks, simUs: tick * MIN_US } } };
    });
    const { outs } = run([informer], inputs, config);
    expect(at(outs, 0).entries[0]?.stage).toBe("infeasible");
    expect(at(outs, 1).entries[0]?.stage).toBe("infeasible");
    expect(at(outs, 2).entries[0]?.stage).toBe("inform");
    expect(at(outs, 2).out.firings).toHaveLength(1);
  });

  it("event counters: 'fails' fires only when the engine counter advances", () => {
    const ticketRule = card({
      id: "r-fails",
      scopeEntity: "web-1",
      when: [predicate("drive-failures", "fails", { kind: "event-name", name: "drive-failure" })],
      then: [action("open-ticket")],
      band: "inform",
    });
    const values = [3n, 3n, 4n];
    const inputs = values.map((count, i) => {
      const input = phaseInput(BigInt(i), observedOf([["web-1", "drive-failures", count]]), [ticketRule]);
      return { ...input, context: { ...input.context, tick: BigInt(i), clocks: { ...input.context.clocks, simUs: BigInt(i) * MIN_US } } };
    });
    const { outs } = run([ticketRule], inputs, defaultEvaluationConfig);
    expect(at(outs, 0).entries).toEqual([]); // first sight = baseline (D-6b)
    expect(at(outs, 1).entries).toEqual([]); // no advance
    expect(at(outs, 2).entries[0]?.stage).toBe("inform"); // counter advanced
  });

  it("fog silences: value-null / unknown-status cells never satisfy (D-6)", () => {
    const informer = card({
      id: "r-fog",
      when: [predicate("cpu", ">", valueThreshold(F(0.5), "percent"))],
      then: [action("page")],
      band: "inform",
    });
    const fogged = phaseInput(0n, observedOf([["web-1", "cpu", null], ["db-1", "cpu", F(0.9), "unknown"]]), [informer]);
    const result = runRulePhase(createRuntimeState(), fogged, defaultEvaluationConfig);
    expect(result.entries).toEqual([]);
  });

  it("role/query/class scopes fail loud without an injected resolver (G4)", () => {
    const scoped = card({
      id: "r-scope",
      scopeKind: "role",
      scopeEntity: "web-tier",
      when: [predicate("cpu", ">", valueThreshold(F(0.5), "percent"))],
      then: [action("page")],
      band: "inform",
    });
    const input = phaseInput(0n, observedOf([["web-1", "cpu", F(0.9)]]), [scoped]);
    expect(() => runRulePhase(createRuntimeState(), input, defaultEvaluationConfig)).toThrow(/ScopeResolver/);
    const withResolver: PolicyEvaluationConfig = {
      ...defaultEvaluationConfig,
      scopeResolver: (scope) => (scope.ref === "web-tier" ? [asEntityId("web-1")] : []),
    };
    const ok = runRulePhase(createRuntimeState(), input, withResolver);
    expect(ok.entries[0]?.stage).toBe("inform");
  });

  it("run-runbook embeds the name inside the closed verb prefix", () => {
    const rb = card({
      id: "r-rb",
      when: [predicate("drive-failures", "fails", { kind: "event-name", name: "drive-failure" })],
      then: [action("run-runbook", null, "swap-drive")],
      band: "execute",
    });
    const i0 = phaseInput(0n, observedOf([["web-1", "drive-failures", 0n]]), [rb]);
    const i1Input = phaseInput(1n, observedOf([["web-1", "drive-failures", 1n]]), [rb]);
    const i1 = { ...i1Input, context: { ...i1Input.context, tick: 1n, clocks: { ...i1Input.context.clocks, simUs: 1n * MIN_US } } };
    const { outs } = run([rb], [i0, i1], defaultEvaluationConfig);
    const payload = at(outs, 1).intents[0]?.payload;
    expect(payload?.kind === "verb" && payload.verb).toBe("run-runbook:swap-drive");
  });

  it("shadow mode logs would-fire rows but emits no intents and no pends (R15)", () => {
    const consultRule = card({
      id: "r-shadow",
      when: [predicate("cpu", ">", valueThreshold(F(0.5), "percent"))],
      then: [action("scale-out", F(2))],
      band: "consult",
    });
    const input = phaseInput(0n, observedOf([["web-1", "cpu", F(0.9)]]), [consultRule]);
    const result = runRulePhase(createRuntimeState(), input, shadowEvaluationConfig);
    expect(result.entries[0]?.stage).toBe("consult-pending");
    expect(result.entries[0]?.mode).toBe("shadow");
    expect(result.out.intents).toHaveLength(0);
    expect(result.state.pendingConsults).toHaveLength(0);
    expect(serializeFireLog(result.entries)).toContain("|shadow|");
  });
});
