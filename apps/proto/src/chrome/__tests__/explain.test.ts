/**
 * Explain-This-Number mechanism (§8.8) — registry upsert semantics and the
 * guarded recursion trail.
 */
import { describe, expect, it } from "vitest";
import {
  ExplainRegistry,
  MAX_EXPLAIN_DEPTH,
  stepBackTrail,
  stepIntoTrail,
} from "../explainRegistry";

const payload = (title: string) => ({ title, formula: "x = y", inputs: [{ name: "y", value: "1" }] });

describe("ExplainRegistry", () => {
  it("upserts: live figures re-register with fresh values, newest wins", () => {
    const r = new ExplainRegistry();
    r.register({ id: "rho", payload: payload("v1") });
    r.register({ id: "rho", payload: payload("v2") });
    expect(r.size).toBe(1);
    expect(r.lookup("rho")?.payload.title).toBe("v2");
  });

  it("maps input names to child ids for recursive drill (§8.8 inputs clickable)", () => {
    const r = new ExplainRegistry();
    r.register({ id: "rho", payload: payload("ρ"), inputRefs: { "queue depth": "queue" } });
    r.register({ id: "queue", payload: payload("L = λW") });
    expect(r.childIdFor("rho", "queue depth")).toBe("queue");
    expect(r.childIdFor("queue", "queue depth")).toBeUndefined();
    expect(r.childIdFor("missing", "x")).toBeUndefined();
  });

  it("empty id fails at the boundary, not downstream", () => {
    const r = new ExplainRegistry();
    expect(() => r.register({ id: "", payload: payload("nope") })).toThrow(/empty id/);
  });

  it("unregister/clear keep long-lived apps leak-free", () => {
    const r = new ExplainRegistry();
    r.register({ id: "a", payload: payload("a") });
    r.unregister("a");
    expect(r.lookup("a")).toBeUndefined();
    r.clear();
    expect(r.size).toBe(0);
  });
});

describe("drill trail — recursion with a seatbelt", () => {
  it("steps in, building a new trail (purity: inputs untouched)", () => {
    const trail = ["rho"];
    const result = stepIntoTrail(trail, "queue");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.trail).toEqual(["rho", "queue"]);
    expect(trail).toEqual(["rho"]);
  });

  it("refuses cycles: an input pointing back up the trail is refused, not followed", () => {
    const deep = ["rho", "queue", "arrivals"];
    expect(stepIntoTrail(deep, "rho")).toEqual({ ok: false, reason: "cycle" });
  });

  it("refuses runaway depth at MAX_EXPLAIN_DEPTH", () => {
    const atLimit = Array.from({ length: MAX_EXPLAIN_DEPTH }, (_, i) => `id-${i}`);
    expect(stepIntoTrail(atLimit, "one-more")).toEqual({ ok: false, reason: "depth" });
  });

  it("stepBack pops the last hop; empty trail stays empty (never negative)", () => {
    expect(stepBackTrail(["a", "b"])).toEqual(["a"]);
    expect(stepBackTrail([])).toEqual([]);
  });
});
