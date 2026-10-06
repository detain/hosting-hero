import { describe, expect, it } from "vitest";

import type { PolicyCard } from "../../types";
import { detectConflicts } from "../conflicts";
import { action, card, predicate, valueThreshold, F } from "./fixtures";

const rule = (id: string, metric: string, comparator: ">", value: bigint, unit: "percent" | "ms" | "micro-usd" | "count" | "ratio", verb: Parameters<typeof action>[0]): PolicyCard =>
  card({
    id,
    when: [predicate(metric, comparator, valueThreshold(value, unit))],
    then: [action(verb)],
    band: "execute",
  });

describe("static conflict detector (save-time, Appendix B §2.4)", () => {
  it("catches the planted scale-out / cost-cap oscillator (acceptance 3)", () => {
    const book = [
      rule("r-autoscale", "cpu", ">", F(0.85), "percent", "scale-out"),
      rule("r-costcap", "cost", ">", F(500), "micro-usd", "drain"),
    ];
    const findings = detectConflicts(book);
    const cycles = findings.filter((f) => f.kind === "oscillation-cycle");
    expect(cycles).toHaveLength(1);
    expect(cycles[0]?.ruleIds.map(String)).toEqual(["r-autoscale", "r-costcap"]);
    expect(cycles[0]?.detail).toContain("capacity");
    // The archetype ALSO trips (a): contradictory verbs on a shared trigger.
    expect(findings.some((f) => f.kind === "contradictory-actions")).toBe(true);
  });

  it("zero false flags on 10 clean pairs (acceptance 3)", () => {
    const pairs: readonly (readonly PolicyCard[])[] = [
      [rule("c1a", "cpu", ">", F(0.85), "percent", "scale-out"), rule("c1b", "suspicion", ">", F(0.7), "ratio", "page")],
      [rule("c2a", "load", ">", F(0.9), "percent", "shed-class"), rule("c2b", "tickets", ">", F(5), "count", "open-ticket")],
      [rule("c3a", "p95", ">", F(300), "ms", "failover"), rule("c3b", "suspicion", ">", F(0.7), "ratio", "page")],
      [rule("c4a", "inspection-blocks", ">", F(0.2), "ratio", "raise-inspection-depth"), rule("c4b", "tickets", ">", F(5), "count", "open-ticket")],
      [rule("c5a", "queue-depth", ">", F(50), "count", "run-runbook"), rule("c5b", "suspicion", ">", F(0.7), "ratio", "page")],
      [rule("c6a", "utilization", ">", F(0.15), "ratio", "drain"), rule("c6b", "tickets", ">", F(5), "count", "open-ticket")],
      [rule("c7a", "cpu", ">", F(0.85), "percent", "scale-out"), rule("c7b", "suspicion", ">", F(0.7), "ratio", "page")],
      [rule("c8a", "p95", ">", F(300), "ms", "failover"), rule("c8b", "tickets", ">", F(5), "count", "open-ticket")],
      [rule("c9a", "queue-depth", ">", F(50), "count", "run-runbook"), rule("c9b", "suspicion", ">", F(0.7), "ratio", "page")],
      [rule("c10a", "load", ">", F(0.9), "percent", "shed-class"), rule("c10b", "queue-depth", ">", F(100), "count", "queue-change")],
    ];
    for (const pair of pairs) {
      const findings = detectConflicts(pair);
      expect(findings, `${String(pair[0]?.id)}+${String(pair[1]?.id)}: ${JSON.stringify(findings)}`).toEqual([]);
    }
  });

  it("flags order-shadowing: earlier rule consumes the later rule's trigger", () => {
    const book = [
      rule("s-first", "cpu", ">", F(0.85), "percent", "scale-out"),
      rule("s-second", "cpu", ">", F(0.85), "percent", "page"),
    ];
    const findings = detectConflicts(book);
    const shadow = findings.filter((f) => f.kind === "order-shadowing");
    expect(shadow).toHaveLength(1);
    expect(shadow[0]?.ruleIds.map(String)).toEqual(["s-first", "s-second"]);
    // No oscillation: the pager cannot feed the CPU trigger back.
    expect(findings.some((f) => f.kind === "oscillation-cycle")).toBe(false);
  });

  it("flags resource contention: overlapping scope + same hand/budget pool", () => {
    const book = [
      rule("p-a", "cpu", ">", F(0.85), "percent", "scale-out"),
      rule("p-b", "p95", ">", F(300), "ms", "failover"),
    ];
    const findings = detectConflicts(book);
    expect(findings.some((f) => f.kind === "resource-contention" && f.detail.includes("hands"))).toBe(true);
  });

  it("a single rule feeding its own trigger is NOT an oscillation (len≥2 only)", () => {
    const selfFeed = rule("self", "cpu", ">", F(0.85), "percent", "scale-out");
    expect(detectConflicts([selfFeed])).toEqual([]);
  });

  it("object scopes on different refs do not overlap", () => {
    const book = [
      card({ id: "o-a", scopeEntity: "web-1", when: [predicate("cpu", ">", valueThreshold(F(0.85), "percent"))], then: [action("scale-out")] }),
      card({ id: "o-b", scopeEntity: "db-1", when: [predicate("cpu", ">", valueThreshold(F(0.85), "percent"))], then: [action("drain")] }),
    ];
    expect(detectConflicts(book)).toEqual([]);
  });

  it("output order is deterministic across runs", () => {
    const book = [
      rule("d-1", "cpu", ">", F(0.85), "percent", "scale-out"),
      rule("d-2", "cost", ">", F(500), "micro-usd", "drain"),
      rule("d-3", "cpu", ">", F(0.85), "percent", "page"),
    ];
    const first = JSON.stringify(detectConflicts(book));
    const second = JSON.stringify(detectConflicts(book));
    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(10); // non-empty and compared for real
  });

  it("host-extended metric table wires custom nouns into the graph", () => {
    const book = [
      rule("x-1", "gpu-heat", ">", F(0.9), "ratio", "scale-out"),
      rule("x-2", "gpu-power", ">", F(0.9), "ratio", "drain"),
    ];
    // unknown metrics: conservative — no interference edges, no false cycle
    const plain = detectConflicts(book);
    expect(plain.filter((f) => f.kind === "oscillation-cycle")).toEqual([]);
    const extended = detectConflicts(book, {
      metricTokens: { "gpu-heat": ["capacity"], "gpu-power": ["capacity", "budget"] },
    });
    expect(extended.some((f) => f.kind === "oscillation-cycle")).toBe(true);
  });
});
