/**
 * OD-25(a) company-death state machine tests (economy/death.ts + tick step
 * 12.6): the three canonical deaths — float-insolvency, covenant-default,
 * churn-collapse — each with its LIVE → DEATH NOTICE → DISSOLVED phasing,
 * the §9.6 warning-before-death ordering law, the §6.10 escape law, the
 * terminal no-op-preserve law, and the byte-identity arms (healthy runs and
 * present-but-idle configs write NOTHING death-shaped).
 */

import { describe, expect, it } from "vitest";

import {
  asCauseId,
  asEntityId,
  asMoney,
  type Contract,
  type EntityId,
} from "../../types.js";
import { defaultEconomyConfig, type DeathConfig, type EconomyConfig } from "../config.js";
import {
  advanceDeathWatch,
  churnCollapseEvidence,
  COMPANY_DEATH_CAUSES,
  covenantDefaultEvidence,
  deathEvidenceFor,
  deathPhaseOf,
  emptyDeathWatch,
  floatInsolvencyEvidence,
  isIdleDeathWatch,
  type DeathWatch,
  type RefusedSettlement,
} from "../death.js";
import { runEconomyTick, type EconomyTickIn, type EconomyTickOut } from "../tick.js";
import { registerContractEconomy, type EconomyState } from "../state.js";
import type { Covenant } from "../runway.js";
import { DAY, MONTH, SEED, TAGS, contractOf, ctxAt, digest, stateWithCash } from "./helpers.js";

function deathCfg(patch: Partial<DeathConfig>): EconomyConfig {
  const base = defaultEconomyConfig();
  return { ...base, death: { ...base.death, ...patch } };
}

const IDLE_CONTRACTS = new Map<EntityId, Contract>();

const minHealth: Covenant = {
  id: "min-eb-health",
  metricId: "errorBudgetHealthBps",
  floorBps: 1n,
  direction: "min",
};

function dtick(
  prior: EconomyState,
  minute: number,
  contracts: ReadonlyMap<EntityId, Contract>,
  cfg: EconomyConfig,
  over: Partial<Pick<EconomyTickIn, "refusedSettlements" | "renewalDecisions" | "outageSecs" | "covenants">> = {},
): EconomyTickOut {
  return runEconomyTick({
    context: ctxAt(minute, BigInt(Math.floor(minute / 60))),
    runSeed: SEED,
    contracts,
    prior,
    cfg,
    ...over,
  });
}

function hasKey(state: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(state, key);
}

function harness(contracts: readonly Contract[], free = 500_000_000n): { map: Map<EntityId, Contract>; state: EconomyState } {
  const cfg = defaultEconomyConfig();
  let s = stateWithCash(free);
  for (const c of contracts) {
    s = registerContractEconomy(
      s,
      { contract: c, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, commitmentBps: 9990n },
      cfg,
    );
  }
  return { map: new Map(contracts.map((c) => [c.id, c])), state: s };
}

const REFUSAL: RefusedSettlement = {
  contractId: asEntityId("settle:bandwidth"),
  amountMicroUsd: asMoney(96_800_000n),
};

/* ─────────────────────────── pure watch machinery ─────────────────────── */

describe("death watch (pure advanceDeathWatch)", () => {
  it("the empty watch is the idle sentinel", () => {
    const w = emptyDeathWatch();
    expect(isIdleDeathWatch(w)).toBe(true);
    expect(w).toEqual({
      floatZeroSinceBusinessMin: null,
      refusedSettles: 0,
      refusedMicroUsd: 0n,
      churnBelowFloorSinceBusinessMin: null,
    });
  });

  it("float spell: starts at the first zero fold, carries refusals, resets on break", () => {
    const cfg = defaultEconomyConfig();
    const start = advanceDeathWatch(emptyDeathWatch(), { now: 0, freeCash: asMoney(0n), activeCustomers: 5, refusedSettlements: [REFUSAL] }, cfg);
    expect(start.floatZeroSinceBusinessMin).toBe(0);
    expect(start.refusedSettles).toBe(1);
    expect(start.refusedMicroUsd).toBe(96_800_000n);
    // A quiet fold INSIDE the spell carries the counters untouched.
    const carry = advanceDeathWatch(start, { now: DAY, freeCash: asMoney(0n), activeCustomers: 5, refusedSettlements: [] }, cfg);
    expect(carry.floatZeroSinceBusinessMin).toBe(0);
    expect(carry.refusedSettles).toBe(1);
    expect(carry.refusedMicroUsd).toBe(96_800_000n);
    // Free cash returns → spell breaks, slate wiped.
    const break1 = advanceDeathWatch(carry, { now: 2 * DAY, freeCash: asMoney(1n), activeCustomers: 5, refusedSettlements: [REFUSAL] }, cfg);
    expect(break1.floatZeroSinceBusinessMin).toBeNull();
    expect(break1.refusedSettles).toBe(0);
    expect(break1.refusedMicroUsd).toBe(0n);
    // A fresh spell starts from zero on the next zero fold.
    const restart = advanceDeathWatch(break1, { now: 3 * DAY, freeCash: asMoney(0n), activeCustomers: 5, refusedSettlements: [REFUSAL] }, cfg);
    expect(restart.floatZeroSinceBusinessMin).toBe(3 * DAY);
    expect(restart.refusedSettles).toBe(1);
  });

  it("churn spell: starts below the floor, clears at/above it", () => {
    const cfg = defaultEconomyConfig(); // churnFloor 1
    const below = advanceDeathWatch(emptyDeathWatch(), { now: 10, freeCash: asMoney(1n), activeCustomers: 0, refusedSettlements: [] }, cfg);
    expect(below.churnBelowFloorSinceBusinessMin).toBe(10);
    const still = advanceDeathWatch(below, { now: 20, freeCash: asMoney(1n), activeCustomers: 0, refusedSettlements: [] }, cfg);
    expect(still.churnBelowFloorSinceBusinessMin).toBe(10);
    // ONE customer back = floor met (1 < 1 is false) — extinction, not a downturn.
    const recovered = advanceDeathWatch(still, { now: 30, freeCash: asMoney(1n), activeCustomers: 1, refusedSettlements: [] }, cfg);
    expect(recovered.churnBelowFloorSinceBusinessMin).toBeNull();
    expect(isIdleDeathWatch(recovered)).toBe(true);
  });

  it("refusal garbage fails loud at the boundary", () => {
    const cfg = defaultEconomyConfig();
    const base = { now: 0, freeCash: asMoney(0n), activeCustomers: 5 };
    expect(() => advanceDeathWatch(emptyDeathWatch(), { ...base, refusedSettlements: [{ contractId: "" as never, amountMicroUsd: asMoney(5n) }] }, cfg))
      .toThrow(/non-empty contractId/);
    expect(() => advanceDeathWatch(emptyDeathWatch(), { ...base, refusedSettlements: [{ contractId: asEntityId("x"), amountMicroUsd: -1n as never }] }, cfg))
      .toThrow(/must be >= 0/);
    expect(() => advanceDeathWatch(emptyDeathWatch(), { ...base, refusedSettlements: [{ contractId: asEntityId("x"), amountMicroUsd: 5 as never }] }, cfg))
      .toThrow(/must be a bigint/);
  });
});

/* ─────────────────────────── gated evidence ───────────────────────────── */

function watchWith(patch: Partial<DeathWatch>): DeathWatch {
  return { ...emptyDeathWatch(), ...patch };
}

describe("evidence gates (pure)", () => {
  it("float needs zero cash + >=1 refusal + the sustained window; then snapshots exactly", () => {
    const cfg = defaultEconomyConfig(); // 3d = 4320 min
    const watch = watchWith({ floatZeroSinceBusinessMin: 0, refusedSettles: 1, refusedMicroUsd: asMoney(96_800_000n) });
    expect(floatInsolvencyEvidence(asMoney(1n), watch, 9999, cfg)).toBeNull(); // cash back
    expect(floatInsolvencyEvidence(asMoney(0n), emptyDeathWatch(), 9999, cfg)).toBeNull(); // no spell
    expect(floatInsolvencyEvidence(asMoney(0n), watchWith({ floatZeroSinceBusinessMin: 0 }), 9999, cfg)).toBeNull(); // zero-refusal bad day
    expect(floatInsolvencyEvidence(asMoney(0n), watch, 4319, cfg)).toBeNull(); // window not elapsed
    expect(floatInsolvencyEvidence(asMoney(0n), watch, 4320, cfg)).toEqual({
      cause: "float-insolvency",
      freeCash: asMoney(0n),
      refusedSettles: 1,
      refusedMicroUsd: 96_800_000n,
      watchSinceBusinessMin: 0,
      sustainedBusinessMin: 4320,
    });
  });

  it("covenant arms only on a STILL-LATCHED breach past the cure grace; earliest first", () => {
    const cfg = defaultEconomyConfig(); // 10d grace = 14400
    const breachA = { covenantId: "min-eb-health", atBusinessMin: MONTH, causeId: asCauseId("economy:covenant:min-eb-health:m1") };
    const breachB = { covenantId: "min-runway", atBusinessMin: 2 * MONTH, causeId: asCauseId("economy:covenant:min-runway:m2") };
    expect(covenantDefaultEvidence([], [breachA], 10 * MONTH, cfg)).toBeNull(); // nothing latched
    expect(covenantDefaultEvidence(["min-eb-health"], [breachA], MONTH + 14_399, cfg)).toBeNull(); // inside grace
    expect(covenantDefaultEvidence(["min-recovered"], [breachA], 10 * MONTH, cfg)).toBeNull(); // old row, recovered
    expect(covenantDefaultEvidence(["min-eb-health"], [breachA], MONTH + 14_400, cfg)).toEqual({
      cause: "covenant-default",
      covenantId: "min-eb-health",
      breachCauseId: "economy:covenant:min-eb-health:m1",
      breachAtBusinessMin: MONTH,
      graceBusinessMin: 14_400,
    });
    // Two lapsed latches ⇒ the EARLIEST breach carries the story, whichever
    // order the log rows arrive in (order-independent scan).
    expect(covenantDefaultEvidence(["min-eb-health", "min-runway"], [breachB, breachA], 3 * MONTH, cfg)?.covenantId).toBe("min-eb-health");
    expect(covenantDefaultEvidence(["min-eb-health", "min-runway"], [breachA, breachB], 3 * MONTH, cfg)?.covenantId).toBe("min-eb-health");
  });

  it("churn arms below the floor after the sustained window; floor is exclusive", () => {
    const cfg = defaultEconomyConfig(); // floor 1, 3d
    const watch = watchWith({ churnBelowFloorSinceBusinessMin: 0 });
    expect(churnCollapseEvidence(1, watch, 9999, cfg)).toBeNull(); // 1 >= 1: not extinct
    expect(churnCollapseEvidence(0, watch, 4319, cfg)).toBeNull();
    expect(churnCollapseEvidence(0, watch, 4320, cfg)).toEqual({
      cause: "churn-collapse",
      activeCustomers: 0,
      churnFloor: 1,
      watchSinceBusinessMin: 0,
      sustainedBusinessMin: 4320,
    });
  });

  it("deathEvidenceFor follows the canonical order when several arm at once", () => {
    expect([...COMPANY_DEATH_CAUSES]).toEqual(["float-insolvency", "covenant-default", "churn-collapse"]);
    const cfg = defaultEconomyConfig();
    const watch = watchWith({
      floatZeroSinceBusinessMin: 0,
      refusedSettles: 1,
      refusedMicroUsd: asMoney(1n),
      churnBelowFloorSinceBusinessMin: 0,
    });
    const breach = { covenantId: "min-eb-health", atBusinessMin: 0, causeId: asCauseId("economy:covenant:x:m1") };
    const all = { now: 10 * MONTH, watch, freeCash: asMoney(0n), activeCustomers: 0, breachedCovenantIds: ["min-eb-health"], covenantBreachLog: [breach] };
    expect(deathEvidenceFor(all, cfg)?.cause).toBe("float-insolvency");
    expect(deathEvidenceFor({ ...all, watch: watchWith({ churnBelowFloorSinceBusinessMin: 0 }), freeCash: asMoney(1n) }, cfg)?.cause).toBe("covenant-default");
    expect(deathEvidenceFor({ ...all, watch, freeCash: asMoney(1n), breachedCovenantIds: [] }, cfg)?.cause).toBe("churn-collapse");
    expect(deathEvidenceFor({ ...all, watch: emptyDeathWatch(), freeCash: asMoney(1n), breachedCovenantIds: [] }, cfg)).toBeNull();
  });

  it("deathPhaseOf reads the phase from the state-shaped record set", () => {
    expect(deathPhaseOf({})).toBe("live");
    expect(deathPhaseOf({ deathWarning: undefined, companyDeath: undefined })).toBe("live");
    const warning = { cause: "churn-collapse" as const, atBusinessMinute: 1, evidence: churnCollapseEvidence(0, watchWith({ churnBelowFloorSinceBusinessMin: 0 }), 4320, defaultEconomyConfig())! };
    expect(deathPhaseOf({ deathWarning: warning })).toBe("notice");
    expect(deathPhaseOf({ deathWarning: warning, companyDeath: { cause: "churn-collapse", atBusinessMinute: 2, warnedAtBusinessMin: 1, evidence: warning.evidence } })).toBe("dissolved");
  });
});

/* ─────────────────────────── the tick fold ────────────────────────────── */

describe("runEconomyTick death fold (12.6)", () => {
  it("healthy run writes NOTHING death-shaped — keys absent, serialization unchanged", () => {
    const cfg = defaultEconomyConfig();
    const A = contractOf("A", { termEndMin: 12 * MONTH });
    const { map, state } = harness([A]);
    let s = state;
    for (const minute of [0, DAY, MONTH, 2 * MONTH]) {
      const out = dtick(s, minute, map, cfg);
      s = out.state;
      expect(hasKey(s, "deathWatch")).toBe(false);
      expect(hasKey(s, "deathWarning")).toBe(false);
      expect(hasKey(s, "companyDeath")).toBe(false);
      expect(out.notices.some((n) => n.kind === "death-imminent" || n.kind === "company-dissolved")).toBe(false);
    }
  });

  it("float-insolvency: refusal at zero ⇒ warning at +3d ⇒ dissolution next fold, ordering proven", () => {
    const cfg = deathCfg({ churnFloor: 0 }); // isolate the float lane
    const f0 = dtick(stateWithCash(0n), 0, IDLE_CONTRACTS, cfg, { refusedSettlements: [REFUSAL] });
    expect(hasKey(f0.state, "deathWatch")).toBe(true);
    expect(f0.state.deathWatch!.refusedSettles).toBe(1);
    expect(f0.notices.some((n) => n.kind === "death-imminent")).toBe(false); // not yet sustained

    const f1 = dtick(f0.state, 3 * DAY, IDLE_CONTRACTS, cfg);
    const warn = f1.notices.filter((n) => n.kind === "death-imminent");
    expect(warn.length).toBe(1);
    expect(warn[0]!.contractId).toBe(asEntityId("company"));
    expect(warn[0]!.causeId).toBe("economy:death:imminent:float-insolvency:4320");
    expect(f1.state.deathWarning!.cause).toBe("float-insolvency");
    expect(hasKey(f1.state, "companyDeath")).toBe(false);

    const f2 = dtick(f1.state, 4 * DAY, IDLE_CONTRACTS, cfg);
    const dead = f2.notices.filter((n) => n.kind === "company-dissolved");
    expect(dead.length).toBe(1); // exactly once, ever
    expect(dead[0]!.causeId).toBe("economy:death:dissolved:float-insolvency:5760");
    expect(f2.notices.some((n) => n.kind === "death-imminent")).toBe(false);
    const rec = f2.state.companyDeath!;
    expect(rec.cause).toBe("float-insolvency");
    expect(rec.warnedAtBusinessMin).toBe(3 * DAY); // §9.6: warning strictly BEFORE death
    expect(rec.atBusinessMinute).toBe(4 * DAY);
    expect(rec.evidence).toEqual({
      cause: "float-insolvency",
      freeCash: asMoney(0n),
      refusedSettles: 1,
      refusedMicroUsd: 96_800_000n,
      watchSinceBusinessMin: 0,
      sustainedBusinessMin: 5760,
    });
    expect(hasKey(f2.state, "deathWarning")).toBe(false); // notice consumed by the record
  });

  it("terminal law: after dissolution the tick refuses CLEAN — same state identity, zero output", () => {
    const cfg = deathCfg({ churnFloor: 0 });
    const f0 = dtick(stateWithCash(0n), 0, IDLE_CONTRACTS, cfg, { refusedSettlements: [REFUSAL] });
    const f1 = dtick(f0.state, 3 * DAY, IDLE_CONTRACTS, cfg);
    const f2 = dtick(f1.state, 4 * DAY, IDLE_CONTRACTS, cfg);
    const dissolved = f2.state;
    const after = dtick(dissolved, 10 * DAY, IDLE_CONTRACTS, cfg, {
      refusedSettlements: [REFUSAL],
      covenants: [minHealth],
      outageSecs: new Map([[asEntityId("A"), 10n ** 12n]]),
    });
    expect(after.state).toBe(dissolved); // byte identity — no accrual, no settle
    expect(after.entries.length).toBe(0);
    expect(after.notices.length).toBe(0);
    expect(after.events.length).toBe(0);
    expect(after.observedWrites.length).toBe(0);
  });

  it("escape law (§6.10): free cash returning inside the notice window lifts the warning", () => {
    const cfg = deathCfg({ churnFloor: 0 });
    const f0 = dtick(stateWithCash(0n), 0, IDLE_CONTRACTS, cfg, { refusedSettlements: [REFUSAL] });
    const f1 = dtick(f0.state, 3 * DAY, IDLE_CONTRACTS, cfg);
    expect(f1.state.deathWarning!.cause).toBe("float-insolvency");
    const funded: EconomyState = { ...f1.state, cash: { ...f1.state.cash, free: asMoney(1_000_000_000n) } };
    const f2 = dtick(funded, 4 * DAY, IDLE_CONTRACTS, cfg);
    expect(f2.notices.some((n) => n.kind === "company-dissolved")).toBe(false);
    expect(f2.notices.some((n) => n.kind === "death-imminent")).toBe(false);
    expect(hasKey(f2.state, "companyDeath")).toBe(false);
    expect(hasKey(f2.state, "deathWarning")).toBe(false); // lifted
    expect(hasKey(f2.state, "deathWatch")).toBe(false); // idle again ⇒ key gone
  });

  it("covenant-default: grace-0 breach dissolves on the next still-latched fold", () => {
    const cfg = deathCfg({ covenantCureGraceDays: 0, churnFloor: 0 });
    const A = contractOf("A", { termEndMin: 12 * MONTH });
    const { map, state } = harness([A]);
    const storm = new Map<EntityId, bigint>([[A.id, 10n ** 12n]]);

    const t0 = dtick(state, 0, map, cfg, { covenants: [minHealth] });
    const t1 = dtick(t0.state, DAY, map, cfg, { outageSecs: storm });
    const t2 = dtick(t1.state, MONTH, map, cfg); // roll latches the breach; 12.6 sees elapsed 0 >= grace 0
    expect(t2.notices.some((n) => n.kind === "covenant-breached")).toBe(true);
    const warn = t2.notices.filter((n) => n.kind === "death-imminent");
    expect(warn.length).toBe(1);
    expect(warn[0]!.causeId).toBe("economy:death:imminent:covenant-default:43200");
    expect(t2.state.deathWarning!.cause).toBe("covenant-default");

    const t3 = dtick(t2.state, MONTH + DAY, map, cfg); // still latched (no roll, no recovery)
    const rec = t3.state.companyDeath!;
    expect(rec.cause).toBe("covenant-default");
    expect(rec.warnedAtBusinessMin).toBe(MONTH);
    expect(rec.atBusinessMinute).toBe(MONTH + DAY);
    expect(rec.evidence).toEqual({
      cause: "covenant-default",
      covenantId: "min-eb-health",
      breachCauseId: "economy:covenant:min-eb-health:m1",
      breachAtBusinessMin: MONTH,
      graceBusinessMin: 0,
    });
    expect(t3.notices.filter((n) => n.kind === "company-dissolved").length).toBe(1);
  });

  it("covenant escape: the cure grace + a clean month roll clears the latch BEFORE the dissolve check", () => {
    const cfg = deathCfg({ churnFloor: 0 }); // default 10d grace
    const A = contractOf("A", { termEndMin: 12 * MONTH });
    const { map, state } = harness([A]);
    const storm = new Map<EntityId, bigint>([[A.id, 10n ** 12n]]);

    const t0 = dtick(state, 0, map, cfg, { covenants: [minHealth] });
    const t1 = dtick(t0.state, DAY, map, cfg, { outageSecs: storm });
    const t2 = dtick(t1.state, MONTH, map, cfg);
    expect(hasKey(t2.state, "deathWarning")).toBe(false); // elapsed 0 < grace: silent
    const t3 = dtick(t2.state, MONTH + 10 * DAY, map, cfg);
    expect(t3.notices.some((n) => n.kind === "death-imminent")).toBe(true); // grace elapsed
    // The m2 roll re-granted a HEALTHY budget ⇒ the review lifts the latch
    // inside the same fold, before 12.6 — the bank forgives, the company lives.
    const t4 = dtick(t3.state, 2 * MONTH, map, cfg);
    expect(t4.notices.some((n) => n.kind === "company-dissolved")).toBe(false);
    expect(hasKey(t4.state, "companyDeath")).toBe(false);
    expect(hasKey(t4.state, "deathWarning")).toBe(false);
    expect(t4.state.breachedCovenantIds).toEqual([]);
  });

  it("churn-collapse: extinction (0 active) sustained 3d warns, next fold dissolves", () => {
    const cfg = defaultEconomyConfig();
    const A = contractOf("A", { termEndMin: DAY });
    const { map, state } = harness([A]);
    const lapse = [{ contractId: A.id, decision: { choice: "lapse" as const, causeId: asCauseId("test:cliff:lapse"), escalatedMrc: null } }];

    const t0 = dtick(state, 0, map, cfg);
    expect(hasKey(t0.state, "deathWatch")).toBe(false); // one active customer
    const t1 = dtick(t0.state, DAY, map, cfg, { renewalDecisions: lapse });
    expect(t1.notices.some((n) => n.kind === "cliff-lapsed")).toBe(true);
    expect(t1.state.deathWatch!.churnBelowFloorSinceBusinessMin).toBe(DAY); // spell starts
    const t2 = dtick(t1.state, 4 * DAY, map, cfg); // sustained 4320
    const warn = t2.notices.filter((n) => n.kind === "death-imminent");
    expect(warn[0]!.causeId).toBe("economy:death:imminent:churn-collapse:5760");
    const t3 = dtick(t2.state, 5 * DAY, map, cfg);
    const rec = t3.state.companyDeath!;
    expect(rec.cause).toBe("churn-collapse");
    // The terminal record re-snapshots evidence FRESH at the dissolve fold —
    // sustained grows to the full 4320+DAY span the company actually spent dead-beat.
    expect(rec.evidence).toEqual({
      cause: "churn-collapse",
      activeCustomers: 0,
      churnFloor: 1,
      watchSinceBusinessMin: DAY,
      sustainedBusinessMin: 5760,
    });
  });

  it("floor-1 law: one surviving customer is a downturn, never a churn-collapse", () => {
    const cfg = defaultEconomyConfig();
    const A = contractOf("A", { termEndMin: 12 * MONTH });
    const B = contractOf("B", { termEndMin: DAY });
    const { map, state } = harness([A, B]);
    const lapse = [{ contractId: B.id, decision: { choice: "lapse" as const, causeId: asCauseId("test:cliff:lapseB"), escalatedMrc: null } }];
    let s = dtick(state, 0, map, cfg).state;
    s = dtick(s, DAY, map, cfg, { renewalDecisions: lapse }).state;
    expect(s.contractEconomy.get(B.id)!.phase).toBe("terminated");
    for (const minute of [2 * DAY, 10 * DAY, 30 * DAY]) {
      const out = dtick(s, minute, map, cfg);
      s = out.state;
      expect(hasKey(s, "deathWarning")).toBe(false); // active 1 >= floor 1
      expect(out.notices.some((n) => n.kind === "death-imminent" || n.kind === "company-dissolved")).toBe(false);
    }
  });

  it("×10 determinism: config present but idle replays byte-identical and death-silent", () => {
    const cfg = deathCfg({ churnCollapseSustainedDays: 1, floatInsolvencySustainedDays: 1 }); // armed dials, idle inputs
    const A = contractOf("A", { termEndMin: 12 * MONTH });
    function run(): string {
      const { map, state } = harness([A]);
      let s = state;
      const trail: unknown[] = [];
      for (const minute of [0, DAY, MONTH, MONTH + DAY, 2 * MONTH]) {
        const out = dtick(s, minute, map, cfg);
        s = out.state;
        trail.push({ notices: out.notices, entries: out.entries, events: out.events });
      }
      trail.push(s);
      return digest(trail);
    }
    const a = run();
    const b = run();
    expect(a).toBe(b); // ×2 here; the CI ×100 harness re-runs the same fold pattern
    expect(a.includes("death-imminent")).toBe(false);
    expect(a.includes("deathWatch")).toBe(false);
  });

  it("re-arming a DIFFERENT cause replaces the warning — one death story at a time", () => {
    // float warning armed, then cash returns AND the book empties: churn takes
    // the narrative from scratch (its own warning fold), never a dissolve.
    const cfg = deathCfg({ churnFloor: 1 });
    const f0 = dtick(stateWithCash(0n), 0, IDLE_CONTRACTS, cfg, { refusedSettlements: [REFUSAL] });
    const f1 = dtick(f0.state, 3 * DAY, IDLE_CONTRACTS, cfg);
    expect(f1.state.deathWarning!.cause).toBe("float-insolvency");
    const funded: EconomyState = { ...f1.state, cash: { ...f1.state.cash, free: asMoney(1_000_000_000n) } };
    const f2 = dtick(funded, 4 * DAY, IDLE_CONTRACTS, cfg); // churn spell has run since fold 0 (active 0 < 1)
    expect(f2.notices.some((n) => n.kind === "company-dissolved")).toBe(false);
    const warn = f2.notices.filter((n) => n.kind === "death-imminent");
    expect(warn.length).toBe(1);
    expect(warn[0]!.causeId).toBe("economy:death:imminent:churn-collapse:5760");
    expect(f2.state.deathWarning!.cause).toBe("churn-collapse"); // float record never minted
  });
});
