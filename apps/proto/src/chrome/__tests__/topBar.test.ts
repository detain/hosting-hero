/**
 * Manual pin override (§1.4) + the generalized top-bar candidate registry.
 * New behaviors ride alongside the pinned originals in promotion.test.ts —
 * planPromotion itself is untouched.
 */
import { describe, expect, it } from "vitest";
import { MockSimRunner } from "../../runner/mockSimRunner";
import { planPromotion, toggleUserPin, type MetricCandidate } from "../promotion";
import { buildHudCandidates, hudPermanentRows } from "../metrics";

const cand = (over: Partial<MetricCandidate> & { id: string }): MetricCandidate => ({
  label: over.id,
  kind: "promotable",
  value: 50,
  threshold: 100,
  direction: "up",
  span: 100,
  ...over,
});

describe("toggleUserPin", () => {
  const list = [cand({ id: "a" }), cand({ id: "b" }), cand({ id: "cash", kind: "permanent" })];
  const slots = { promotedSlots: 2 };

  it("pins, then unpins, round-trip pure (inputs never mutated)", () => {
    const pinned = toggleUserPin(list, "a", slots);
    expect(pinned.outcome).toBe("pinned");
    expect(pinned.candidates.find((c) => c.id === "a")?.userPinned).toBe(true);
    expect(list.find((c) => c.id === "a")?.userPinned).toBeUndefined();
    const unpinned = toggleUserPin(pinned.candidates, "a", slots);
    expect(unpinned.outcome).toBe("unpinned");
    expect(unpinned.candidates.find((c) => c.id === "a")?.userPinned).toBe(false);
  });

  it("capacity refusal: a third pin over 2 slots is REFUSED, not a silent eviction", () => {
    const one = toggleUserPin(list, "a", slots).candidates;
    const two = toggleUserPin(one, "b", slots);
    expect(two.outcome).toBe("pinned");
    const attempted = [...two.candidates, cand({ id: "c" })];
    const three = toggleUserPin(attempted, "c", slots);
    expect(three.outcome).toBe("capacity-refused");
    expect(three.candidates).toBe(attempted); // identity: literally untouched
    expect(attempted.find((c) => c.id === "c")?.userPinned).toBeUndefined();
  });

  it("permanents and unknown ids fail loud — the law's four are not negotiable", () => {
    expect(() => toggleUserPin(list, "cash", slots)).toThrow(/permanents cannot be unpinned/);
    expect(() => toggleUserPin(list, "ghost", slots)).toThrow(/unknown metric/);
  });

  it("pins participate in planPromotion: pinned first, capacity counted honestly", () => {
    const pinned = toggleUserPin([...list, cand({ id: "hot", value: 99 })], "a", slots).candidates;
    const plan = planPromotion(pinned, slots);
    expect(plan.promoted[0]?.id).toBe("a"); // user choice beats proximity
    expect(plan.promoted.map((m) => m.id)).toEqual(["a", "hot"]);
  });
});

describe("buildHudCandidates + hudPermanentRows (live mock stream)", () => {
  const runner = new MockSimRunner(101);
  let p = runner.headlessStep(100);
  for (let i = 0; i < 20; i++) p = runner.headlessStep(100);

  it("permanent four + five promotable instruments = nine candidates", () => {
    const all = buildHudCandidates(p);
    expect(all.length).toBe(9);
    expect(all.filter((c) => c.kind === "permanent").map((c) => c.id))
      .toEqual(["cash", "mrr", "reputation", "clock"]);
    expect(all.every((c) => c.kind === "permanent" || c.threshold !== null)).toBe(true);
  });

  it("cash is a live permanent; fogged MRR/reputation read '?' not 0", () => {
    const rows = hudPermanentRows(p);
    const cash = rows.find((r) => r.id === "cash");
    expect(cash?.state).toBe("live");
    expect(cash?.value).toMatch(/^\$|^\u2212\$/);
    // The mock projects no company ledger cells → honest fog rows:
    const mrr = rows.find((r) => r.id === "mrr");
    expect(mrr?.value).toBe("?");
    expect(mrr?.state).toBe("no-data");
  });

  it("null projection (boot, no frames yet) is all-'?' permanents, never a crash", () => {
    expect(hudPermanentRows(null).every((r) => r.value === "?")).toBe(true);
  });

  it("plan over the registry: permanents pass through, 2 slots promote, +N honest", () => {
    const all = buildHudCandidates(p);
    const plan = planPromotion(all, { promotedSlots: 2 });
    expect(plan.permanent.length).toBe(4);
    expect(plan.promoted.length).toBeLessThanOrEqual(2);
    expect(plan.promoted.every((m) => m.kind === "promotable")).toBe(true);
    const measurable = all.filter((c) => c.kind === "promotable" && c.value !== null).length;
    expect(plan.collapsedCount).toBe(Math.max(0, measurable - plan.promoted.length));
  });
});
