/**
 * unattended/fastForward.ts — the OD-25(a) refuse-settlements witness lane
 * and the halt-on-dissolution opt-in.
 *
 * The float-insolvency death (economy/death.ts @ab0bf5c) only arms when a
 * host forwards `EconomyTickIn.refusedSettlements`; before this lane NO host
 * did, so the canonical float death was unreachable from the weekend. These
 * tests pin the three laws of the lane:
 *   1. ALIVE — a sustained zero-cash + refused-burn plant drives
 *      death-imminent → company-dissolved through the REAL engine.
 *   2. ISOLATED — the refusals themselves are the trigger: the same starved
 *      board WITHOUT any burn never dies (float needs refusedSettles ≥ 1),
 *      and the same plant with the float dial raised past the horizon never
 *      dies (churn dial stays raised in every plant so only the float lane
 *      can arm).
 *   3. INERT BY DEFAULT — deathHaltsRun absent ⇒ every pre-existing witness
 *      byte-identical (report identity), and TRUE ⇒ the dissolution stop is
 *      the standard never-mid-tick digest witness (clean-prefix equality).
 */
import { describe, expect, it } from "vitest";
import { defaultEconomyConfig } from "../../economy/index.ts";
import { encodeTaggedTree } from "../../internal/canonical.ts";
import { runUnattended } from "../index.ts";
import type { UnattendedReport, RunUnattendedConfig } from "../index.ts";
import { CALM_BOARD, RULE_BOOK_HASH, UA_SEED } from "./fixtures.ts";

/* EconomyConfig with the churn competitor dialled out of every plant: the
   starved boards carry ZERO contracts, so churn-collapse would otherwise
   arm on the same fold as float and the witness lane would not be isolated.
   1e6 days exceeds any representative weekend horizon by orders of
   magnitude — the dial simply never opens. */
function cfgWithoutChurn() {
  const base = defaultEconomyConfig();
  return Object.freeze({
    ...base,
    death: Object.freeze({ ...base.death, churnCollapseSustainedDays: 1_000_000 }),
  });
}

function cfgWithBothDialsRaised() {
  const base = cfgWithoutChurn();
  return Object.freeze({
    ...base,
    death: Object.freeze({ ...base.death, floatInsolvencySustainedDays: 1_000_000 }),
  });
}

/** Starved + refused: cash mints at ZERO and a payroll-sized burn is
 *  scheduled at EVERY minute of the plant — each burn bounces off the empty
 *  register (opex refusal, exact identity + amount) and the same-tick
 *  economy fold sees a live zero-cash spell with fresh refusal evidence.
 *  Clock math: the business clock runs ≈100 business-minutes per sim-minute
 *  (43,200 biz-min month / 7-day week), so the 4320-business-minute float
 *  gate (3 days) opens after ~43 ticks — imminent lands on tick 43, the
 *  dissolution on tick 44 (pinned below; measured, not guessed). */
const STARVE = Object.freeze({
  contracts: Object.freeze([]),
  initialFreeMicroUsd: 0n,
  opex: Object.freeze(
    Array.from({ length: 60 }, (_unused, m) => Object.freeze({
      atMinute: m + 1,
      amountMicroUsd: 1_000_000n,
      memo: `doom-${String(m + 1).padStart(2, "0")}`,
    })),
  ),
});

/** Starved but CALM: cash mints at zero and NOTHING is drafted — a bad day
 *  with no ledger say-so is not death (float requires refusedSettles ≥ 1). */
const STARVE_QUIET = Object.freeze({ ...STARVE, opex: Object.freeze([]) });

/* money is REQUIRED on the helper's input shape: every plant threads the
   money lane (the whole point of the witness), and NonNullable keeps the
   spread legal under exactOptionalPropertyTypes. */
function plant(money: NonNullable<RunUnattendedConfig["money"]>, overrides: Partial<RunUnattendedConfig> = {}): RunUnattendedConfig {
  return Object.freeze({
    runSeed: UA_SEED,
    ticks: 60n,
    board: CALM_BOARD,
    ruleBook: Object.freeze([]),
    ruleBookHash: RULE_BOOK_HASH,
    guards: Object.freeze([]),
    money,
    ...overrides,
  });
}

/* Mirrors fastForward.test.ts reportIdentity: the whole report as a
   canonical JSON string — digest, census, warns, stop, everything. */
function reportIdentity(report: UnattendedReport): string {
  const plain = {
    runSeed: report.runSeed,
    ticksRun: report.ticksRun,
    stop: report.stop,
    finalDigest: report.finalDigest,
    perCheckpoint: report.perCheckpoint,
    summary: { ...report.summary, invoiceEvents: [...report.summary.invoiceEvents] },
    hourlyBuckets: report.hourlyBuckets,
    warns: report.warns,
  };
  return JSON.stringify(encodeTaggedTree(plain, (problem) => {
    throw new Error(`unattended report not canonical: ${String(problem.kind)}`);
  }), (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v));
}

describe("OD-25(a) refuse-settlements forwarding (float death reachable)", () => {
  it("a sustained zero + refused burn drives death-imminent → company-dissolved, once each", () => {
    const report = runUnattended(plant({ ...STARVE, cfg: cfgWithoutChurn() }));
    const census = report.summary.invoiceEvents;
    expect(census.get("death-imminent")).toBe(1);
    expect(census.get("company-dissolved")).toBe(1);
    /* No contracts ⇒ the two death kinds are the ONLY economy notices. */
    expect([...census.keys()]).toEqual(["company-dissolved", "death-imminent"]);
    /* Default posture: the weekend runs ON through the dissolved ledger
       (terminal fold no-ops honestly; the death census must not re-fire). */
    expect(report.stop).toBeNull();
    expect(report.ticksRun).toBe(60n);
    expect(report.warns.some((w) => w.startsWith("OPEX-REFUSED"))).toBe(true);
  });

  it("the refusals are the trigger: starved-but-never-drafted never dies", () => {
    const report = runUnattended(plant({ ...STARVE_QUIET, cfg: cfgWithoutChurn() }));
    expect(report.summary.invoiceEvents.get("death-imminent")).toBeUndefined();
    expect(report.summary.invoiceEvents.get("company-dissolved")).toBeUndefined();
  });

  it("the dial is the gate: with float raised past the horizon, the same plant stays alive", () => {
    const report = runUnattended(plant({ ...STARVE, cfg: cfgWithBothDialsRaised() }));
    expect(report.summary.invoiceEvents.get("death-imminent")).toBeUndefined();
    expect(report.summary.invoiceEvents.get("company-dissolved")).toBeUndefined();
  });

  it("the forwarding is deterministic: identical plants yield identical reports", () => {
    const a = runUnattended(plant({ ...STARVE, cfg: cfgWithoutChurn() }));
    const b = runUnattended(plant({ ...STARVE, cfg: cfgWithoutChurn() }));
    expect(reportIdentity(a)).toBe(reportIdentity(b));
  });
});

describe("deathHaltsRun opt-in (default FALSE ⇒ byte-ident witnesses)", () => {
  it("absent flag changes NOTHING on a run that could have dissolved", () => {
    const base = plant({ ...STARVE, cfg: cfgWithoutChurn() });
    const plain = runUnattended(base);
    const flagged = runUnattended(plant({ ...STARVE, cfg: cfgWithoutChurn() }, { deathHaltsRun: false }));
    expect(reportIdentity(plain)).toBe(reportIdentity(flagged));
    /* And on a quiet funded weekend (never approaches dissolution). NOTE the
       raised dials: with contracts:[] the CHURN watch arms on tick 1 (an
       empty book is below churnFloor 1) — churn death needs no refusals at
       all, which is exactly why the float plants dial it out. */
    const calm = {
      contracts: Object.freeze([]),
      initialFreeMicroUsd: 50_000_000_000n,
      cfg: cfgWithBothDialsRaised(),
    };
    expect(reportIdentity(runUnattended(plant(calm))))
      .toBe(reportIdentity(runUnattended(plant(calm, { deathHaltsRun: true }))));
  });

  it("TRUE halts on the dissolution fold as the FIRST terminal stop", () => {
    const report = runUnattended(plant({ ...STARVE, cfg: cfgWithoutChurn() }, { deathHaltsRun: true }));
    expect(report.stop).not.toBeNull();
    expect(report.stop?.reason).toBe("company-dissolved");
    expect(report.stop?.triggered).toEqual([]);
    /* zero+refused spell from tick 1 → sustained crosses 4320 business min
       at tick 43 (death-imminent) → still armed at tick 44 → dissolved →
       halt. Measured figures, see the STARVE docblock clock math. */
    expect(report.stop?.atTick).toBe(44n);
    expect(report.ticksRun).toBe(44n);
    const census = report.summary.invoiceEvents;
    expect(census.get("death-imminent")).toBe(1);
    expect(census.get("company-dissolved")).toBe(1);
  });

  it("the halt digest is the standard clean-prefix witness (never-mid-tick law)", () => {
    const halted = runUnattended(plant({ ...STARVE, cfg: cfgWithoutChurn() }, { deathHaltsRun: true }));
    const stop = halted.stop;
    expect(stop).not.toBeNull();
    const clean = runUnattended(
      plant({ ...STARVE, cfg: cfgWithoutChurn() }, {
        ...(stop?.atTick !== undefined ? { ticks: stop.atTick } : {}),
      }),
    );
    expect(clean.stop).toBeNull();
    expect(clean.finalDigest).toBe(stop?.snapshotDigest);
  });
});
