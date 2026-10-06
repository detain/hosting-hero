import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { asCauseId, asEntityId, asMoney } from "../../types.js";
import { defaultEconomyConfig } from "../config.js";
import {
  billedMrc,
  dueMfnReprices,
  hasClause,
  markMfnFired,
  openContractEconomy,
  parseClauseRefs,
  queueMfnReprice,
  renewalPulseOpenMin,
  renewedContractGeometry,
  resolveRenewalCliff,
  revenueBar,
  setPhase,
  termYearsElapsed,
  bandFromTermMonths,
  type RevenueColourTags,
} from "../contract.js";
import { monthIndexOf } from "../state.js";
import { weekIndexOf } from "../errorBudget.js";
import { DAY, MONTH, TAGS } from "./helpers.js";

const cfg = defaultEconomyConfig();
const contract = {
  id: asEntityId("c-1"),
  customerEntityId: asEntityId("cust-1"),
  bundleId: "vps",
  mrcMicroUsd: asMoney(100_000_000n),
  tcvMicroUsd: asMoney(0n),
  acvMicroUsd: asMoney(0n),
  termStartMin: 0,
  termEndMin: 24 * MONTH,
  billingCycle: "monthly" as const,
  sla: {
    uptimeTarget: 0n,
    responseBudgetUs: 0n,
    creditRate: 0n,
    creditCap: 0n,
    claimWindowUs: 0n,
    autoRenew: false,
    noticePeriodMin: 0,
    threeBreachExitRight: false,
  },
  routingLocks: [],
  shedImmunityClassId: null,
  allocations: [],
};

function econOver(over: Partial<Parameters<typeof openContractEconomy>[0]> = {}) {
  return openContractEconomy(
    { contract, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, ...over },
    cfg,
  );
}

describe("clause table parse (P13 data refs)", () => {
  it("accepts the 13 canonical ids and rejects strangers loudly", () => {
    expect(parseClauseRefs(["mfn", "auto-renew"])).toEqual(["mfn", "auto-renew"]);
    expect(() => parseClauseRefs(["forever-free"])).toThrow(/unknown SLA clause/);
  });
});

describe("term structure + renewal pulse (90 d window, §6.4)", () => {
  it("pulse opens exactly 90 business days before term end", () => {
    expect(renewalPulseOpenMin(24 * MONTH, cfg)).toBe(24 * MONTH - 90 * DAY);
  });

  it("rejects inverted terms at construction (Law 4)", () => {
    expect(() =>
      openContractEconomy(
        { contract: { ...contract, termEndMin: 0 }, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS },
        cfg,
      ),
    ).toThrow(/at\/before start/);
  });
});

describe("phase machine", () => {
  it("allows documented edges only (suspend→terminate yes, terminate→active never)", () => {
    const active = econOver();
    const suspended = setPhase(active, "suspended", 10);
    expect(() => setPhase(suspended, "active", 20)).not.toThrow();
    const dead = setPhase(active, "terminated", 5);
    expect(() => setPhase(dead, "active", 6)).toThrow(/illegal phase edge/);
  });
});

describe("price composition: escalator / grandfather / MFN (§6.12)", () => {
  const escalator = { annualBps: 300n, firstApplicationYear: 1 };

  it("year 0 list price, year 1 escalated 3% exactly, year 2 compounded", () => {
    const econ = econOver({ clauseRefs: parseClauseRefs(["annual-escalator"]) });
    expect(billedMrc(contract, econ, 0, escalator, 0n, cfg)).toBe(asMoney(100_000_000n));
    expect(billedMrc(contract, econ, 12 * MONTH, escalator, 0n, cfg)).toBe(asMoney(103_000_000n));
    expect(billedMrc(contract, econ, 24 * MONTH, escalator, 0n, cfg)).toBe(asMoney(106_090_000n));
  });

  it("grandfather lock overrides escalator while active", () => {
    const econ = econOver({ grandfather: { lockedMrc: asMoney(80_000_000n), lockedThroughMin: 18 * MONTH } });
    expect(billedMrc(contract, econ, 13 * MONTH, escalator, 0n, cfg)).toBe(asMoney(80_000_000n));
    expect(billedMrc(contract, econ, 19 * MONTH, escalator, 0n, cfg)).toBe(asMoney(103_000_000n));
  });

  it("MFN discount applies after grandfather (§7.15)", () => {
    const econ = econOver();
    expect(billedMrc(contract, econ, 0, null, 500n, cfg)).toBe(asMoney(95_000_000n)); // 500 bps = 5%
  });
});

describe("revenue colour: the bar the valuation reads (§4.4)", () => {
  const neutral: RevenueColourTags = { margin: "green", churnRisk: "green", term: "green", concentration: "green", abuse: "green" };
  it("worst tag wins", () => {
    expect(revenueBar(neutral)).toBe("green");
    expect(revenueBar({ ...neutral, abuse: "red" })).toBe("red");
    expect(revenueBar({ ...neutral, term: "amber", concentration: "blue" })).toBe("amber");
  });
  it("term band maps months to quality (short term = hot revenue)", () => {
    expect(bandFromTermMonths(30)).toBe("gold");
    expect(bandFromTermMonths(0)).toBe("red");
  });
});

describe("MFN repricing queue with lag (§7.15 '3 levels later')", () => {
  it("queues firesAt = now + 3 levels and only fires due entries once", () => {
    const ev = queueMfnReprice(contract.id, 500n, 1000, cfg, asCauseId("trigger"));
    expect(ev.firesAtMin).toBe(1000 + 3 * MONTH);
    expect(dueMfnReprices([ev], ev.firesAtMin - 1)).toEqual([]);
    expect(dueMfnReprices([ev], ev.firesAtMin).length).toBe(1);
    const fired = markMfnFired([ev], contract.id);
    expect(dueMfnReprices([...fired], ev.firesAtMin + 1)).toEqual([]);
    expect(hasClause(["mfn"], "mfn")).toBe(true);
  });

  it("rejects discounts outside [0,10000] bps", () => {
    expect(() => queueMfnReprice(contract.id, 20_000n, 0, cfg, asCauseId("x"))).toThrow(/outside/);
  });
});

describe("renewal cliff resolution as data (Gate-5)", () => {
  it("fires exactly at term end once; double-fire throws", () => {
    const econ = { ...econOver(), termMonths: 12 };
    const renew = resolveRenewalCliff(econ, { choice: "renew", causeId: asCauseId("r"), escalatedMrc: null }, 24 * MONTH, cfg);
    expect(renew.kind).toBe("renewed");
    if (renew.kind !== "renewed") return;
    expect(renew.econ.cycleAnchorMin).toBe(24 * MONTH);
    expect(renew.econ.termEndMin).toBe(36 * MONTH);
    expect(() =>
      resolveRenewalCliff({ ...renew.econ, cliffFired: true }, { choice: "renew", causeId: asCauseId("r"), escalatedMrc: null }, 25 * MONTH, cfg),
    ).toThrow(/already fired/);
  });

  it("early decision throws; lapse terminates; escalate requires MRC", () => {
    const econ = econOver();
    expect(() => resolveRenewalCliff(econ, { choice: "renew", causeId: asCauseId("r"), escalatedMrc: null }, 1, cfg)).toThrow(/before term end/);
    const lapsed = resolveRenewalCliff(econ, { choice: "lapse", causeId: asCauseId("l"), escalatedMrc: null }, 24 * MONTH, cfg);
    expect(lapsed.kind).toBe("lapsed");
    if (lapsed.kind === "lapsed") expect(lapsed.econ.phase).toBe("terminated");
    expect(() =>
      resolveRenewalCliff(econ, { choice: "escalate-and-renew", causeId: asCauseId("e"), escalatedMrc: null }, 24 * MONTH, cfg),
    ).toThrow(/missing new MRC/);
  });
});

/* ───────────────────── E-12 — integer calendar boundaries ──────────────── */

describe("integer calendar math — bigint divisions, float-free (E-12)", () => {
  /** Oracle: floor(n/d) and half-up round(n/d) computed independently in
   *  bigint — the same answers the float path gave for every well-behaved
   *  input, plus correctness at the k×period−1 edges float division can flip. */
  const oracleFloor = (n: number, d: number): number => Number(BigInt(n) / BigInt(d));
  const oracleRound = (n: number, d: number): number =>
    Number((2n * BigInt(n) + BigInt(d)) / (2n * BigInt(d)));

  it("termMonths matches the bigint round-half-up oracle at exact and off-grid terms", () => {
    for (const months of [1, 6, 12, 24, 36]) {
      const econ = openContractEconomy(
        { contract: { ...contract, termEndMin: months * MONTH }, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS },
        cfg,
      );
      expect(econ.termMonths, `termMonths(${months}m)`).toBe(oracleRound(months * MONTH, MONTH));
      expect(Number.isInteger(econ.termMonths)).toBe(true);
    }
    // The boundary float division used to blur: one minute shy of 12 months.
    const off = openContractEconomy(
      { contract: { ...contract, termEndMin: 12 * MONTH - 1 }, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS },
      cfg,
    );
    expect(off.termMonths).toBe(oracleRound(12 * MONTH - 1, MONTH));
    expect(off.termMonths).toBe(12); // rounds half-up to 12, never 13
  });

  it("monthIndexOf agrees with the bigint floor oracle exactly at month edges", () => {
    for (const k of [0, 1, 2, 11, 12, 24]) {
      for (const delta of [-1, 0, 1]) {
        const min = k * MONTH + delta;
        if (min < 0) continue;
        expect(monthIndexOf(min, cfg), `monthIndexOf(${min})`).toBe(oracleFloor(min, MONTH));
      }
    }
  });

  it("termYearsElapsed / billedMrc anniversary year floor match the oracle at year edges", () => {
    const YEAR = 12 * MONTH;
    for (const k of [1, 2, 3]) {
      for (const delta of [-1, 0, 1]) {
        const econ = { ...openContractEconomy({ contract, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS }, cfg) };
        const min = k * YEAR + delta;
        expect(termYearsElapsed(econ, min, cfg), `years@${min}`).toBe(oracleFloor(min - econ.cycleAnchorMin, YEAR));
        const escalator = { annualBps: 300n, firstApplicationYear: 1 };
        const mrc = billedMrc(contract, econ, min, escalator, 0n, cfg);
        expect(typeof mrc).toBe("bigint");
        // Crossing the anniversary boundary bumps exactly once more than the
        // last instant of the previous year; inside a year the price is flat.
        const prior = billedMrc(contract, econ, k * YEAR - 1, escalator, 0n, cfg);
        if (k > 1) {
          if (min >= k * YEAR) expect(mrc > prior, `crossing ${k}Y bumps`).toBe(true);
          else expect(mrc, `inside year ${k} is flat`).toBe(prior);
        }
      }
    }
  });

  it("renewedContractGeometry extension months survive the oracle at an odd term", () => {
    const odd: typeof contract = { ...contract, termStartMin: 3, termEndMin: 3 + 12 * MONTH + 7 };
    const geo = renewedContractGeometry(odd, odd.termEndMin, cfg);
    const months = oracleRound(odd.termEndMin - odd.termStartMin, MONTH);
    expect(geo.termEndMin).toBe(odd.termEndMin + months * MONTH);
    // Terms that round to ZERO months now fall back to the evergreen
    // extension (the old `Math.max(1, …) || evergreen` made that branch
    // unreachable; half-up means the cutoff is half a month, not one).
    const tiny: typeof contract = { ...contract, termStartMin: 0, termEndMin: Math.floor(MONTH / 2) - 1 };
    const geoTiny = renewedContractGeometry(tiny, tiny.termEndMin, cfg);
    expect(geoTiny.termEndMin - tiny.termEndMin).toBe(cfg.contracts.evergreenExtensionMonths * MONTH);
  });

  it("grep-pin: no float division remains where persisted period fields are computed", () => {
    for (const rel of ["../contract.ts", "../state.ts", "../errorBudget.ts", "../intMath.ts"] as const) {
      const src = readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
      expect(src, `${rel} must stay float-free`).not.toMatch(/Math\.floor\s*\([^)]*\//);
      expect(src, `${rel} must stay float-free`).not.toMatch(/Math\.round\s*\([^)]*\//);
    }
  });
});
