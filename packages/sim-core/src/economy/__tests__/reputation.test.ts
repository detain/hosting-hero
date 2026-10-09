/**
 * Reputation publisher tests (audit g17 #2 — the dead `company::reputation`
 * cell finally gets a producer).
 *
 * Three layers pinned here:
 *  1. the pure ledger fold (delta math, §5.10 floor, clamps, identity law),
 *  2. the tick wiring (which notices/inputs become signals; publish-on-change
 *     byte-identity for quiet hosts),
 *  3. the end-to-end producer→cell→consumer-contract round trip through the
 *     REAL ObservedStore, asserting exactly what chrome's metrics.ts needs
 *     (cell value is a bigint Fixed in [0, 1] — the difference between a
 *     number on the TopBar and the literal '?' it used to show).
 */

import { describe, expect, it } from "vitest";

import {
  asCauseId,
  asEntityId,
  asMoney,
  observedKey,
  ResolutionBand,
  type Contract,
  type EntityId,
} from "../../types.js";
import { FIXED_ONE, fromRatio } from "../../kernel/fixed.js";
import { ObservedStore } from "../../observed/store.js";
import { defaultEconomyConfig, type EconomyConfig } from "../config.js";
import {
  REPUTATION_BPS_SCALE,
  REPUTATION_INITIAL_BPS,
  REPUTATION_PROPERTY,
  applyReputationSignals,
  initialReputationLedger,
  reputationDeltaBps,
  reputationFixed,
  reputationObservedWrite,
  type ReputationSignal,
} from "../reputation.js";
import { runEconomyTick, type EconomyTickIn, type EconomyTickOut } from "../tick.js";
import { emptyEconomyState, registerContractEconomy, type EconomyState } from "../state.js";
import { DAY, MONTH, SEED, TAGS, contractOf, ctxAt, stateWithCash } from "./helpers.js";

const cfg = defaultEconomyConfig();
const company = asEntityId("company");
const signal = (kind: ReputationSignal["kind"]): ReputationSignal => ({
  kind,
  causeId: asCauseId(`test:${kind}`),
});

/* ─────────────────────────── pure fold ─────────────────────────────────── */

describe("reputation ledger (pure, §2.10/§5.10)", () => {
  it("opens at the neutral PROVISIONAL score and rejects out-of-range seeds", () => {
    expect(initialReputationLedger()).toEqual({
      overallBps: REPUTATION_INITIAL_BPS,
      honestHostFloor: false,
      lifetimeEvents: 0,
    });
    expect(() => initialReputationLedger(-1n)).toThrow(RangeError);
    expect(() => initialReputationLedger(REPUTATION_BPS_SCALE + 1n)).toThrow(RangeError);
  });

  it("no signals ⇒ the ledger returns BY IDENTITY (the zero-publish pin)", () => {
    const ledger = initialReputationLedger();
    expect(applyReputationSignals(ledger, [], cfg)).toBe(ledger);
  });

  it("every kind maps to its config delta — negatives dock, positives earn", () => {
    expect(reputationDeltaBps("written-off", cfg)).toBe(cfg.reputation.writtenOffChurnBps);
    expect(reputationDeltaBps("voluntary-churn", cfg)).toBe(cfg.reputation.voluntaryChurnBps);
    expect(reputationDeltaBps("dunning-recovered", cfg)).toBe(cfg.reputation.dunningRecoveredBps);
    expect(reputationDeltaBps("chargeback", cfg)).toBe(cfg.reputation.chargebackBps);
    expect(reputationDeltaBps("major-incident", cfg)).toBe(cfg.reputation.majorIncidentBps);
    expect(reputationDeltaBps("honest-postmortem", cfg)).toBe(cfg.reputation.honestPostmortemBps);
    expect(reputationDeltaBps("written-off", cfg)).toBeLessThan(0n);
    expect(reputationDeltaBps("dunning-recovered", cfg)).toBeGreaterThan(0n);
  });

  it("folds in list order and counts lifetime events", () => {
    const after = applyReputationSignals(
      initialReputationLedger(),
      [signal("written-off"), signal("dunning-recovered")],
      cfg,
    );
    expect(after.overallBps).toBe(REPUTATION_INITIAL_BPS + cfg.reputation.writtenOffChurnBps + cfg.reputation.dunningRecoveredBps);
    expect(after.lifetimeEvents).toBe(2);
  });

  it("§5.10 transparency insurance: a post-mortem is permanent and halves ONLY incident damage", () => {
    const floored = applyReputationSignals(initialReputationLedger(), [signal("honest-postmortem")], cfg);
    expect(floored.honestHostFloor).toBe(true);

    const incident = applyReputationSignals(floored, [signal("major-incident")], cfg);
    const halved = -((-cfg.reputation.majorIncidentBps) / 2n);
    expect(incident.overallBps).toBe(floored.overallBps + halved);

    // churn/chargebacks stay at FULL price — the floor buys forgiveness for
    // bad days, not for bad customers.
    const charged = applyReputationSignals(floored, [signal("chargeback")], cfg);
    expect(charged.overallBps).toBe(floored.overallBps + cfg.reputation.chargebackBps);
  });

  it("clamps at both ends — a dead brand cannot go negative, glory caps at 10000", () => {
    const nines = applyReputationSignals(
      initialReputationLedger(100n),
      Array.from({ length: 5 }, () => signal("written-off")),
      cfg,
    );
    expect(nines.overallBps).toBe(0n);
    const capped = applyReputationSignals(
      initialReputationLedger(REPUTATION_BPS_SCALE - 100n),
      Array.from({ length: 5 }, () => signal("dunning-recovered")),
      cfg,
    );
    expect(capped.overallBps).toBe(REPUTATION_BPS_SCALE);
  });

  it("reputationFixed is the exact bps→Fixed boundary parse (5000 bps = 0.5)", () => {
    expect(reputationFixed(initialReputationLedger())).toBe(FIXED_ONE / 2n);
    expect(reputationFixed(initialReputationLedger(REPUTATION_BPS_SCALE))).toBe(FIXED_ONE);
    expect(reputationFixed(initialReputationLedger(0n))).toBe(0n);
  });

  it("the observed write carries the house exact-cell shape on company::reputation", () => {
    const write = reputationObservedWrite(initialReputationLedger(4600n));
    expect(write.key).toBe(observedKey(company, REPUTATION_PROPERTY));
    expect(write.cell.value).toBe(fromRatio(4600n, 10_000n));
    expect(write.cell.fidelity).toBe(ResolutionBand.Exact);
    expect(write.cell.freshnessUs).toBe(0n);
    expect(write.cell.status).toBe("live");
    expect(Object.isFrozen(write) && Object.isFrozen(write.cell)).toBe(true);
  });
});

/* ───────────────────────── tick wiring ─────────────────────────────────── */

function quietHarness(): { contracts: Map<EntityId, Contract>; state: EconomyState } {
  const A = contractOf("A", { termEndMin: 6 * MONTH });
  let s = stateWithCash(500_000_000n);
  s = registerContractEconomy(
    { ...s, reputation: initialReputationLedger() },
    { contract: A, atBusinessMin: 0, clauseRefs: [], grandfather: null, revenueTags: TAGS, commitmentBps: 9990n },
    cfg,
  );
  return { contracts: new Map([[A.id, A]]), state: s };
}

function tick(
  prior: EconomyState,
  minute: number,
  contracts: ReadonlyMap<EntityId, Contract>,
  over: Partial<Pick<EconomyTickIn, "outageSecs" | "spends" | "chargebacks" | "majorIncidents" | "honestPostmortems" | "creditLineDrawn">> = {},
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

describe("reputation inside the economy tick", () => {
  it("a quiet tick publishes NOTHING and the ledger is untouched (byte-identity)", () => {
    const { contracts, state } = quietHarness();
    const out = tick(state, DAY, contracts);
    expect(out.observedWrites.length).toBe(0);
    expect(out.state.reputation).toBe(state.reputation); // identity, not just equality
  });

  it("a chargeback consumes the dead fee knob, docks the score, and publishes once", () => {
    const { contracts, state } = quietHarness();
    const control = tick(state, DAY, contracts); // same tick WITHOUT the dispute
    const out = tick(state, DAY, contracts, { chargebacks: [asEntityId("A")] });
    // Pin the fee as a DELTA vs the control (the tick also settles a real
    // invoice, so absolute free-cash would not isolate the chargeback).
    expect(out.state.cash.free).toBe(asMoney(control.state.cash.free - cfg.fees.chargebackFeeMicroUsd));
    expect(out.notices.some((n) => n.kind === "chargeback-posted")).toBe(true);
    expect(out.state.reputation.overallBps).toBe(REPUTATION_INITIAL_BPS + cfg.reputation.chargebackBps);
    expect(out.observedWrites.length).toBe(1);
  });

  it("chargeback on an un-primed contract throws fail-loud", () => {
    const { contracts, state } = quietHarness();
    expect(() => tick(state, DAY, contracts, { chargebacks: [asEntityId("ghost")] })).toThrow(/un-primed/);
  });

  it("an SLA credit due (major incident) docks reputation through the notice fold", () => {
    const { contracts, state } = quietHarness();
    // Reality first: the outage tips the meter negative (never locked)...
    const drained = tick(state, DAY, contracts, {
      outageSecs: new Map<EntityId, bigint>([[asEntityId("A"), 10n ** 12n]]),
    });
    expect(drained.observedWrites.length).toBe(0); // the DRAIN itself is score-neutral
    // ...then a deliberate non-risky spend surfaces the overrun as sla-credit-due.
    const out = tick(drained.state, 2 * DAY, contracts, {
      spends: [{ contractId: asEntityId("A"), action: "shed" as const, seconds: 1n }],
    });
    expect(out.notices.some((n) => n.kind === "sla-credit-due")).toBe(true);
    expect(out.state.reputation.overallBps).toBe(
      drained.state.reputation.overallBps + cfg.reputation.majorIncidentBps,
    );
    expect(out.observedWrites.length).toBe(1);
  });

  it("host-reported incidents and post-mortems fold without moving money", () => {
    const { contracts, state } = quietHarness();
    const control = tick(state, DAY, contracts);
    const out = tick(state, DAY, contracts, {
      majorIncidents: [asCauseId("ops:incident-1")],
      honestPostmortems: [asCauseId("ops:postmortem-1")],
    });
    expect(out.state.cash.free).toBe(control.state.cash.free);
    expect(out.state.reputation.honestHostFloor).toBe(true);
    expect(out.state.reputation.overallBps).toBe(
      REPUTATION_INITIAL_BPS + cfg.reputation.majorIncidentBps + cfg.reputation.honestPostmortemBps,
    );
  });

  it("publish-on-change: the second quiet tick after a dock does not re-publish", () => {
    const { contracts, state } = quietHarness();
    const first = tick(state, DAY, contracts, { majorIncidents: [asCauseId("ops:i")] });
    expect(first.observedWrites.length).toBe(1);
    const second = tick(first.state, 2 * DAY, contracts);
    expect(second.observedWrites.length).toBe(0);
    expect(second.state.reputation).toBe(first.state.reputation);
  });
});

/* ─────────────── end-to-end: producer → store → chrome contract ─────────── */

describe("company::reputation end-to-end through the real ObservedStore", () => {
  it("chrome's read path sees a live bigint Fixed cell — never '?'", () => {
    const { contracts, state } = quietHarness();
    const out = tick(state, DAY, contracts, { majorIncidents: [asCauseId("ops:big-outage")] });

    const store = new ObservedStore();
    store.applyObservedWrites(out.observedWrites, 1n);

    // Exactly what apps/proto/src/chrome/metrics.ts HUD_PERMANENT_METRICS does:
    // lookup(projection, "company", "reputation") → value must be a bigint.
    const cell = store.toObservedMap().get(observedKey(company, REPUTATION_PROPERTY));
    expect(cell).toBeDefined();
    expect(typeof cell!.value).toBe("bigint"); // 'undefined'/non-bigint ⇒ chrome shows '?'
    const value = cell!.value as bigint;
    expect(value).toBeGreaterThanOrEqual(0n);
    expect(value).toBeLessThanOrEqual(FIXED_ONE);
    expect(value).toBe(fromRatio(REPUTATION_INITIAL_BPS + cfg.reputation.majorIncidentBps, 10_000n));
    expect(cell!.status).toBe("live");
    expect(store.causeOf(observedKey(company, REPUTATION_PROPERTY))).toContain("economy:reputation");
  });

  it("emptyEconomyState opens the cell producer-ready at the neutral score", () => {
    const fresh = emptyEconomyState();
    expect(fresh.reputation.overallBps).toBe(REPUTATION_INITIAL_BPS);
    expect(fresh.covenants.length).toBe(0);
    expect(fresh.committedOutTarget).toBe(asMoney(0n));
  });
});
