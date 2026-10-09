/**
 * GATE-G5 · "one quarter of business must be PLAYABLE and LEGIBLE"
 * (§9.13 gate #5) — headless proof, composed entirely from REAL shared-web
 * content + the economy module + the deterministic business clock.
 *
 * The scenario engine lives in apps/proto/src/gates/g5/quarter.ts (owned by
 * this lane on both sides): the UI and this test drive the SAME code path —
 * what the player will see is what the CI gate certifies. Under sim-core's
 * rootDir that cross-package import is illegal for `tsc`, so this test loads
 * a byte-identical mirror (./g5-quarter-fixture.ts) whose header pins the
 * sync law; the proto panel keeps compiling the upstream original directly.
 *
 * OD-1 RATIFIED 2026-10-09 (choice (c) commitment-convergence, ADR-0009):
 * the gate STILL runs WITHOUT the scorecard by design. It consumes only
 * ledger primitives (journal, buckets, invoices, phases, error budgets,
 * notices). Group 0 pins that the default now RESOLVES (sheet B / the C
 * candidate) while this gate keeps never needing either accessor. Group 0b
 * enforces that law by source-scan: the accessor names may live in these
 * files' COMMENT prose, but in CODE they appear nowhere.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { asEntityId } from "@hh/sim-core/types";
import { type EconomyNotice } from "@hh/sim-core/economy";
import { defaultScorecardConfig, getActiveScorecard } from "@hh/sim-core/economy";
import { resolveActiveSheet } from "@hh/sim-core/waves";

import {
  attributionTrail,
  buildContract,
  DECLINE_MINUTES,
  DOOMED_IDS,
  E2_RECOVERY_MIN,
  emptyJournal,
  GATE5_SCRIPT,
  INCIDENT_MIN,
  MINUTES_PER_DAY,
  MINUTES_PER_MONTH,
  QUARTER_MINUTES,
  RENEWER_CLIFF_MIN,
  RENEWER_ID,
  replayQuarterDigest,
  runQuarter,
  settleMinutes,
  usd,
  WHALE_CLIFF_MIN,
  WHALE_ID,
  WHALE_LAPSE_CAUSE,
  type QuarterResult,
} from "./g5-quarter-fixture";

const SHARED_WEB_WIRE = JSON.parse(
  readFileSync(join(process.cwd(), "..", "content", "types", "shared-web.json"), "utf8"),
);
const WAVE_WIRE = JSON.parse(
  readFileSync(
    join(process.cwd(), "..", "content", "waves", "g1-shared-web-first-quarter.json"),
    "utf8",
  ),
);

const SEED = 55_105n; // "GATE-5" on a phone pad

/** The whole quarter, once, with the per-minute conservation audit on. */
let quarter: QuarterResult;
function theQuarter(): QuarterResult {
  quarter ??= runQuarter({
    seed: SEED,
    sharedWebWire: SHARED_WEB_WIRE,
    waveWire: WAVE_WIRE,
    withMinuteAudit: true,
  });
  return quarter;
}

function noticesFor(state: QuarterResult, kind: EconomyNotice["kind"]): readonly EconomyNotice[] {
  return state.noticesByKind[kind] ?? [];
}

/* ═══════════════ Group 0 · OD-1 ratified; the gate still runs scorecard-less ═══════════════ */

describe("G5 group 0 — scorecard is ratified (OD-1, 2026-10-09), and this gate never needs it", () => {
  it("defaultScorecardConfig.active resolves to the ratified choice", () => {
    expect(defaultScorecardConfig.active).toBe("commitment-convergence");
  });

  it("the default getter resolves (was a throw pre-ratification); G5 still consumes ledger primitives only", () => {
    expect(getActiveScorecard(defaultScorecardConfig).id).toBe("commitment-convergence");
  });

  it("resolveActiveSheet resolves sheet B (OD-2 flip) — G5 carries the wire's PROVISIONAL marker, never resolves it", () => {
    expect(resolveActiveSheet().id).toBe("B");
    expect(theQuarter().tuningSheetMarker).toMatch(/^PROVISIONAL/);
  });

  it("the quarter is composed from the REAL shared-web content, parsed at the boundary", () => {
    const q = theQuarter();
    expect(q.bundleId).toBe("official:shared-web");
    expect(q.incidentWindow.id).toBe("waves/g1-shared-web-first-quarter");
    expect(q.incidentWindow.type).toBe("official:shared-web");
    expect(q.incidentWindow.waveCount).toBe(5);
  });
});

/* ═══════════ Group 0b · "ledger primitives only" enforced by source scan ═══════════ */

describe("G5 group 0b — CODE never calls getActiveScorecard/resolveActiveSheet (comment-prose exempt)", () => {
  // OD-1 resolved 2026-10-09, so the pre-ratification throwing-accessors that
  // used to police this lane are gone — the law was left comment-only. This
  // group makes it falsifiable again. Both scan targets legitimately MENTION
  // the accessor names inside truthful "never calls" docblocks, so a raw-text
  // scan would be vacuously red: strip comments first and assert on CODE.
  // FALSIFICATION STORY: if anyone reverts quarter.ts (or its byte-identical
  // fixture mirror) to importing or calling either accessor, the name rides
  // OUTSIDE comments, survives the strip, and the first test goes red — the
  // armed probe in the second test proves a planted call would be caught.
  const SCAN_TARGETS = [
    {
      label: "apps/proto/src/gates/g5/quarter.ts",
      path: join(process.cwd(), "..", "..", "apps", "proto", "src", "gates", "g5", "quarter.ts"),
    },
    {
      label: "src/__tests__/g5-quarter-fixture.ts",
      path: join(process.cwd(), "src", "__tests__", "g5-quarter-fixture.ts"),
    },
  ] as const;

  const BANNED_ACCESSORS = ["getActiveScorecard", "resolveActiveSheet"] as const;

  /** Block comments then line comments (neither file carries "//" inside a
   *  string — verified zero "://" occurrences; newlines are kept so a
   *  swallowed-body scenario stays visible in any diff of the probe). */
  function stripComments(source: string): string {
    return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  }

  it("the banned names survive comment-stripping NOWHERE in either engine body", () => {
    for (const target of SCAN_TARGETS) {
      const raw = readFileSync(target.path, "utf8");
      const code = stripComments(raw);
      // Canary: the strip left a real, sizeable code body standing — the scan
      // is never accidentally green by emptiness.
      expect(code, target.label).toContain("export function runQuarter");
      expect(code.split("\n").length, target.label).toBeGreaterThan(400);
      for (const accessor of BANNED_ACCESSORS) {
        expect(code, `${target.label} (code)`).not.toContain(accessor);
        // Honesty witness: the raw file DOES mention each name — inside the
        // docblocks that state this very law (this lane owns both sides).
        expect(raw, `${target.label} (prose)`).toContain(accessor);
      }
    }
  });

  it("armed probe: a planted CALL survives the strip; a planted docblock mention does not", () => {
    const plantedCall = stripComments(
      'import { getActiveScorecard } from "@hh/sim-core/economy";\nconst s = resolveActiveSheet(); /* resolveActiveSheet */',
    );
    expect(plantedCall).toContain("getActiveScorecard");
    expect(plantedCall).toContain("resolveActiveSheet"); // rode the real call, not the comment
    expect(stripComments("/** it never calls getActiveScorecard **/")).not.toContain("getActiveScorecard");
  });
});

/* ═══════════════ Group 1 · the scripted cast walks the whole ladder ═══════════════ */

describe("G5 group 1 — twelve signings, two full dunning deaths, one E-2 resurrection, one minute-exact cliff lapse", () => {
  it("twelve contracts sign across the quarter, one per script day", () => {
    expect(GATE5_SCRIPT).toHaveLength(12);
    const days = GATE5_SCRIPT.map((s) => s.signDay);
    expect(new Set(days).size).toBe(12); // distinct days ⇒ distinct cycle grids
    expect(Math.max(...days)).toBeLessThan(30); // all inside month 1
    const phases = [...theQuarter().finalState.contractEconomy.values()];
    expect(phases).toHaveLength(12);
  });

  it("c05 and c06 walk the ENTIRE ladder failed→retry→reminder→warning→suspend→written-off", () => {
    const q = theQuarter();
    for (const id of DOOMED_IDS) {
      const mine = q.allNotices.filter((n) => n.contractId === id);
      // The ladder steps retry/reminder/warning as dunning-stage notices;
      // the suspend rung speaks as its OWN 'suspended' notice (§6.4 E-2 gate).
      const stages = mine.filter((n) => n.kind === "dunning-stage").map((n) => n.stage);
      expect(mine.some((n) => n.kind === "invoice-failed")).toBe(true);
      expect(stages).toEqual(["retry", "reminder", "warning"]);
      expect(mine.some((n) => n.kind === "suspended")).toBe(true);
      const off = mine.find((n) => n.kind === "written-off");
      expect(off).toBeDefined();
      // §6.4 ladder: decline at anchor (day d), terminate at +20 days.
      const declineMin = DECLINE_MINUTES.find(([c]) => c === id)![1];
      expect(off!.atBusinessMin).toBe(declineMin + 20 * MINUTES_PER_DAY);
      expect(q.finalState.contractEconomy.get(id)!.phase).toBe("terminated");
      // their final invoices reversed out of AR
      const lastInvoice = q.finalState.invoices.find((i) => i.contractId === id)!;
      expect(lastInvoice.state).toBe("written-off");
      expect(lastInvoice.dunningStage).toBe("terminate");
    }
    void E2_RECOVERY_MIN;
  });

  it("c07 recovers POST-SUSPENSION (E-2 path): suspended, then lifted back to active", () => {
    const q = theQuarter();
    const mine = q.allNotices.filter((n) => n.contractId === SURVIVOR);
    expect(mine.some((n) => n.kind === "suspended")).toBe(true);
    const recovered = mine.find((n) => n.kind === "dunning-recovered");
    const lifted = mine.find((n) => n.kind === "suspension-lifted");
    expect(recovered).toBeDefined();
    expect(lifted).toBeDefined();
    expect(recovered!.stage).toBe("terminate"); // resurrected at the LAST rung
    expect(recovered!.atBusinessMin).toBe(E2_RECOVERY_MIN);
    expect(q.finalState.contractEconomy.get(SURVIVOR)!.phase).toBe("active");
    // and it keeps billing afterwards: cycle-1 invoice settles post-recovery
    const later = q.finalState.invoices.filter((i) => i.contractId === SURVIVOR && i.cycleIndex === 1);
    expect(later.length).toBe(1);
    expect(later[0]!.state).toBe("paid");
  });

  it("the whale lapses at its renewal cliff to the EXACT minute, by scripted cause", () => {
    const q = theQuarter();
    expect(WHALE_CLIFF_MIN).toBe(2 * MINUTES_PER_MONTH); // term-exactness
    const cliff = noticesFor(q, "cliff-lapsed");
    expect(cliff).toHaveLength(1);
    expect(cliff[0]!.contractId).toEqual(WHALE_ID);
    expect(cliff[0]!.atBusinessMin).toBe(WHALE_CLIFF_MIN);
    expect(`${cliff[0]!.causeId}`).toBe(WHALE_LAPSE_CAUSE);
    expect(q.finalState.contractEconomy.get(WHALE_ID)!.phase).toBe("terminated");
    // no zombie invoice: the cliff runs BEFORE the calendar, so cycle 2 never bills
    expect(q.finalState.invoices.filter((i) => i.contractId === WHALE_ID).map((i) => i.cycleIndex)).toEqual([0, 1]);
  });

  it("c12 renews at its cliff (evergreen extension) and bills again the same minute", () => {
    const q = theQuarter();
    const renewed = noticesFor(q, "cliff-renewed");
    expect(renewed).toHaveLength(1);
    expect(renewed[0]!.contractId).toEqual(RENEWER_ID);
    expect(renewed[0]!.atBusinessMin).toBe(RENEWER_CLIFF_MIN);
    const econ = q.finalState.contractEconomy.get(RENEWER_ID)!;
    expect(econ.phase).toBe("active");
    expect(econ.cycleAnchorMin).toBe(RENEWER_CLIFF_MIN); // anchor re-clocked to the cliff
    // §6.12: a term renews AT ITS OWN LENGTH (termMonths 2 here; the 12-month
    // evergreen extension only applies to open-ended term-0 deals).
    expect(econ.termEndMin).toBe(RENEWER_CLIFF_MIN + 2 * MINUTES_PER_MONTH);
    // pulse opened long before (a 2-month term lives inside the 90-day lead)
    expect(renewed[0] !== undefined && econ.renewalPulseOpened).toBe(true);
    expect(noticesFor(q, "renewal-pulse").some((n) => n.contractId === RENEWER_ID)).toBe(true);
  });
});

const SURVIVOR = asEntityId("c07");

/* ═══════════════ Group 2 · money conservation, EVERY business minute ═══════════════ */

describe("G5 group 2 — the six buckets + AR + deferred balance the journal at every business minute", () => {
  it("per-minute audit (0…129600) reports zero violations", () => {
    expect(theQuarter().minuteAuditViolations).toEqual([]);
  });

  it("final cash equals the journal replay; nothing entered or left through a side door", () => {
    const q = theQuarter();
    const totals: Record<string, bigint> = {};
    for (const e of q.allEntries) {
      for (const [bucket, amount] of Object.entries(e.delta)) {
        totals[bucket] = (totals[bucket] ?? 0n) + (amount as bigint);
      }
    }
    for (const [bucket, value] of Object.entries(q.finalState.cash)) {
      expect(value, bucket).toBe((totals[bucket] ?? 0n) as typeof value);
      expect(typeof value).toBe("bigint");
      expect(value >= 0n, bucket).toBe(true);
    }
  });

  it("every money entry has a causeId and a legal business minute (legibility precond.)", () => {
    for (const e of theQuarter().allEntries) {
      expect(`${e.causeId}`.length).toBeGreaterThan(0);
      expect(e.atBusinessMin).toBeGreaterThanOrEqual(0);
      expect(e.atBusinessMin).toBeLessThanOrEqual(QUARTER_MINUTES);
    }
  });
});

/* ═══════════════ Group 3 · the churned whale explains itself (P10) ═══════════════ */

describe("G5 group 3 — attribution: the whale's ledger chain tells the story in one sentence", () => {
  it("the trail carries its billing cycles and its cliff cause", () => {
    const q = theQuarter();
    const trail = attributionTrail(q, WHALE_ID);
    expect(trail.entries.length).toBeGreaterThanOrEqual(4); // 2× issue + 2× settle
    expect(trail.invoices.map((i) => i.cycleIndex)).toEqual([0, 1]);
    expect(trail.notices.some((n) => n.kind === "cliff-lapsed")).toBe(true);
  });

  it("one sentence contains the cliff AND the non-renewal cause (P10 proof)", () => {
    const trail = attributionTrail(theQuarter(), WHALE_ID);
    expect(trail.oneSentence).toMatch(/cliff/i);
    expect(trail.oneSentence).toContain(WHALE_LAPSE_CAUSE); // price-increase-refused
    expect(trail.oneSentence).toContain(String(WHALE_CLIFF_MIN));
  });

  it("the doomed customer's sentence names the full ladder and the write-off minute", () => {
    const trail = attributionTrail(theQuarter(), asEntityId("c05"));
    expect(trail.oneSentence).toMatch(/dunning ladder/i);
    expect(trail.oneSentence).toMatch(/written off/i);
  });

  it("the survivor's sentence explains the resurrection", () => {
    const trail = attributionTrail(theQuarter(), SURVIVOR);
    expect(trail.oneSentence).toMatch(/resurrected|came back to life/i);
  });
});

/* ═══════════════ Group 4 · the quarter replays byte-identical ×100 ═══════════════ */

describe("G5 group 4 — determinism: the same seed replays the same quarter, 100 times over", () => {
  it("100 lean replays share one digest", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i++) {
      digests.add(replayQuarterDigest(SEED, SHARED_WEB_WIRE, WAVE_WIRE));
    }
    expect(digests.size).toBe(1);
    expect(digests.values().next().value).toBe(theQuarter().digest);
  });

  it("a different seed still replays identically to itself (digest keys on the run)", () => {
    const a = replayQuarterDigest(SEED + 1n, SHARED_WEB_WIRE, WAVE_WIRE);
    const b = replayQuarterDigest(SEED + 1n, SHARED_WEB_WIRE, WAVE_WIRE);
    expect(a).toBe(b); // same content here (fate is scripted) — the seed rides every stream key
  });
});

/* ═══════════════ Group 5 · error budget: incident burn + multi-week refunds (E-9) ═══════════════ */

describe("G5 group 5 — the quarter's one scripted incident burns c07's budget; frozen weeks refund together", () => {
  it("the outage blows the 99.9% budget and locks the risky deploy, owing an SLA credit", () => {
    const q = theQuarter();
    const settle = q.settles.find((s) => s.minute === INCIDENT_MIN)!;
    expect(settle.notices.some((n) => n.kind === "budget-locked" && n.contractId === SURVIVOR)).toBe(true);
    const owed = settle.notices.find((n) => n.kind === "sla-credit-due" && n.contractId === SURVIVOR);
    expect(owed).toBeDefined();
    expect(owed!.seconds! > 0n).toBe(true); // the meter sits in the red (§6.1)
  });

  it("E-9 multi-week: the settlement freeze ends with weeks 8, 9, 10 refunding in ONE settle", () => {
    const q = theQuarter();
    // the incident week (7) closed DIRTY for c07 at day 56 while everyone
    // else collected their single clean-week refund for w7...
    const day56 = q.settles.find((s) => s.minute === 56 * MINUTES_PER_DAY)!;
    const w7 = day56.notices.filter((n) => n.kind === "clean-week-refund");
    expect(w7.some((n) => n.contractId === SURVIVOR)).toBe(false);
    expect(w7.some((n) => `${n.contractId}` === "c02")).toBe(true);
    // ...then the freeze (days 61–78 skipped) resumes with THREE weeks closing
    // in one rollWeek catch-up, per budget — E-9's multi-week path.
    const resume = q.settles.find((s) => s.minute === 79 * MINUTES_PER_DAY)!;
    const refunds = resume.notices.filter((n) => n.kind === "clean-week-refund");
    for (const s of GATE5_SCRIPT) {
      const weeks = refunds
        .filter((n) => `${n.contractId}` === s.contractId)
        .map((n) => `${n.causeId}`.match(/w(\d+)$/)?.[1]);
      expect(weeks, s.contractId).toEqual(["8", "9", "10"]);
    }
    expect(refunds).toHaveLength(12 * 3);
    const survivorRefunds = refunds.filter((n) => n.contractId === SURVIVOR);
    expect(survivorRefunds.every((n) => n.seconds === 60n)).toBe(true);
  });

  it("the incident sits inside the content wave-4 window and pays its own mitigation opex", () => {
    const q = theQuarter();
    expect(INCIDENT_MIN).toBeGreaterThanOrEqual(q.incidentWindow.incidentStartMin);
    expect(INCIDENT_MIN).toBeLessThan(q.incidentWindow.incidentEndMin);
    const surge = q.allEntries.find((e) => `${e.causeId}` === "gate5:opex:incident-mitigation");
    expect(surge?.delta.free).toBe(-2_500_000_000n);
  });
});

/* ═══════════════ Group 6 · the cash-vs-profit lesson renders from the fixture ═══════════════ */

describe("G5 group 6 — month 2 books a profit while cash craters (the category axiom)", () => {
  it("month 2 (days 30–60): accrual revenue > 0, Δfree < 0", () => {
    const months = theQuarter().months;
    expect(months).toHaveLength(3);
    const m2 = months[1]!;
    expect(m2.accrualRevenue).toBeGreaterThan(0n);
    expect(m2.deltaFree).toBeLessThan(0n);
    // and the crater has named causes: payroll + incident surge, AR still collecting
    expect(m2.opex).toBe(4_000_000_000n + 2_500_000_000n);
    // and the crater has a named cause: the big B2B annual settled as
    // DEFERRED revenue (prepaid-negative cash-timing, the bundle's own law),
    // not as this month's free cash.
    const q = theQuarter();
    expect(q.finalState.cash.deferred).toBeGreaterThan(0n);
  });

  it("deferred revenue exists on the books (prepaid recognition schedule is live)", () => {
    const q = theQuarter();
    const schedules = q.finalState.unlockSchedules.filter(
      (s) => s.reason === "deferred-recognition",
    );
    expect(schedules.length).toBeGreaterThan(0); // annual prepay → 1/12 monthly
    expect(schedules.some((s) => s.released > 0n)).toBe(true); // month rolls released slices
  });

  it("a rolling reserve is hostage in `restricted` for the net-0 card money", () => {
    expect(theQuarter().finalState.cash.restricted).toBeGreaterThan(0n);
  });
});

/* ═══════════════ Group 7 · clock landings + engine guards ═══════════════ */

describe("G5 group 7 — the deterministic business clock lands minute-exact at every settle", () => {
  it("settle grid is strictly increasing and inside the quarter", () => {
    const mins = settleMinutes();
    expect(mins[0]).toBe(0);
    expect(mins[mins.length - 1]).toBe(QUARTER_MINUTES);
    for (let i = 1; i < mins.length; i++) expect(mins[i]! > mins[i - 1]!).toBe(true);
  });

  it("the engine refuses a contract map that skips registration (built contracts are well-formed)", () => {
    const c = buildContract(GATE5_SCRIPT[0]!, "official:shared-web");
    expect(c.termEndMin).toBe(WHALE_CLIFF_MIN);
    expect(usd(c.mrcMicroUsd)).toBe("$2,500.00");
    expect(emptyJournal.entries).toHaveLength(0);
  });

  it("content drift guard: a wave table without 5 slots rejects the script", () => {
    expect(() =>
      runQuarter({
        seed: SEED,
        sharedWebWire: SHARED_WEB_WIRE,
        waveWire: { ...WAVE_WIRE, waves: WAVE_WIRE.waves.slice(0, 4) },
      }),
    ).toThrow(/slot|content drift/i);
  });
});
