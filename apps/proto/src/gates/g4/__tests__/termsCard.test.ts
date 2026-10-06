/**
 * termsCard · the commit-before-consequence contract (§9.13 #4): the card
 * always prices bandwidth/cost/latency, the SLA squeeze follows link.ts's
 * timeout law (outer ≥ latency + inner timeout + 1µs), and the thin g2
 * attack-surface shim fires deterministically per relation.
 */
import { describe, expect, it } from "vitest";
import { fromRatio } from "@hh/sim-core/kernel";
import { canonicalDigest } from "@hh/sim-core/replay";
import { buildTermsCard, type TermsBuild } from "../termsCard.ts";
import { latencyDeltaUs } from "../latencyDelta.ts";

const serverHop = Object.freeze({ label: "web-1 service", serviceTimeUs: 45_000n, rho: fromRatio(2n, 10n) });
const switchHop = Object.freeze({ label: "sw-1 service", serviceTimeUs: 20_000n, rho: fromRatio(5n, 100n) });
const delta = latencyDeltaUs([serverHop], [serverHop, switchHop]);

const BASE: TermsBuild = Object.freeze({
  relation: "data",
  edgeId: "edge:data:web-1->sw-1",
  fromLabel: "web-1 · eth0",
  toLabel: "sw-1 · panel-in",
  latency: delta,
  ratedMbps: 1_000,
  monthlyCostMicroUsd: 4_000_000n,
  downstreamTimeoutUs: 400_000n,
  upstreamTimeoutUs: 900_000n,
});

describe("buildTermsCard · the whole price on one card", () => {
  it("carries bandwidth, money, milliseconds and SLA rows", () => {
    const card = buildTermsCard(BASE);
    expect(card.edgeId).toBe(BASE.edgeId);
    expect(card.headline).toBe("Depend on sw-1 · panel-in from web-1 · eth0");
    const labels = card.rows.map((r) => r.label);
    expect(labels).toStrictEqual(["Bandwidth", "Monthly cost", "Latency", "SLA math"]);
    expect(card.rows[0]?.value).toBe("1000 Mbps rated");
    expect(card.rows[1]?.value).toBe("$4.00/mo");
    expect(card.rows[2]?.value).toMatch(/^\+\d+\.\d+ ms$/);
    expect(card.commit).toStrictEqual({ hands: 1, busyTicks: 3 });
  });

  it("SLA verdicts trace the timeout law: fits / squeezes / violates", () => {
    const required = delta.deltaUs + 400_000n + 1n;
    expect(buildTermsCard({ ...BASE, upstreamTimeoutUs: required * 2n }).sla.verdict).toBe("fits");
    expect(buildTermsCard({ ...BASE, upstreamTimeoutUs: required }).sla.verdict).toBe("squeezes");
    expect(buildTermsCard({ ...BASE, upstreamTimeoutUs: required - 1n }).sla.verdict).toBe("violates");
    expect(buildTermsCard({ ...BASE, upstreamTimeoutUs: null }).sla.verdict).toBe("unknown");
    expect(buildTermsCard({ ...BASE, downstreamTimeoutUs: null }).sla.requiredUpstreamUs).toBeNull();
  });

  it("attack surface is per relation — power and control are NOT data (thin g2 shim)", () => {
    const surface = (relation: TermsBuild["relation"]) =>
      buildTermsCard({ ...BASE, relation }).attackSurface.map((a) => a.family);
    expect(surface("data")).toStrictEqual(["network", "software"]);
    expect(surface("power")).toStrictEqual(["physical"]);
    expect(surface("control")).toStrictEqual(["actuation"]);
    expect(surface("trust")).toStrictEqual(["auth"]);
  });

  it("zero-latency edge displays +0 ms, never '+0.000'", () => {
    const card = buildTermsCard({ ...BASE, latency: latencyDeltaUs([serverHop], [serverHop]) });
    expect(card.rows[2]?.value).toBe("+0 ms");
  });

  it("pure: same build ⇒ byte-identical card (digest-equal, twice)", () => {
    const a = buildTermsCard(BASE);
    const b = buildTermsCard(BASE);
    expect(canonicalDigest(a)).toBe(canonicalDigest(b));
  });

  it("the card is frozen all the way down (no panel can scribble on terms)", () => {
    const card = buildTermsCard(BASE);
    expect(Object.isFrozen(card)).toBe(true);
    expect(Object.isFrozen(card.rows)).toBe(true);
    expect(Object.isFrozen(card.rows[0])).toBe(true);
    expect(Object.isFrozen(card.attackSurface)).toBe(true);
  });
});
