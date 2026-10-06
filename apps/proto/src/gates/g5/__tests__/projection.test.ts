/**
 * GATE-G5 · projection adapter tests (node env, same Vite `?raw` wires the UI
 * consumes — doubling as the raw-import fidelity check: if `?raw` ever hands us
 * something other than the shipped JSON bytes, the bundle/wave identity pins
 * below fail immediately).
 */
import { describe, expect, it } from "vitest";
import sharedWebRaw from "../../../../../../packages/content/types/shared-web.json?raw";
import waveTableRaw from "../../../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import { BUCKET_IDS } from "@hh/sim-core/economy";
import { QUARTER_MINUTES, runQuarter, type QuarterResult } from "../quarter.ts";
import { BUCKET_LAWS, projectFrame, type ExplainPayload, type Gate5Frame } from "../projection.ts";
import { businessMinuteLabel, runQuarterSafe } from "../engine.ts";

const SEED = 55105n;

let cached: QuarterResult | null = null;
function theQuarter(): QuarterResult {
  cached ??= runQuarter({
    seed: SEED,
    sharedWebWire: JSON.parse(sharedWebRaw) as unknown,
    waveWire: JSON.parse(waveTableRaw) as unknown,
  });
  return cached;
}

function allExplainables(frame: Gate5Frame): readonly ExplainPayload[] {
  return [
    ...frame.buckets.map((r) => r.explain),
    ...frame.kanban.map((c) => c.explain),
    ...frame.kanban.flatMap((c) => c.cards.map((card) => card.explain)),
    ...frame.tape.map((r) => r.explain),
    ...frame.renewals.map((r) => r.explain),
    ...frame.dunning.map((r) => r.explain),
    ...frame.months.map((m) => m.explain),
    ...frame.budgets.map((b) => b.explain),
  ];
}

describe("g5 projection · wire fidelity (the UI's ?raw bytes ARE the shipped content)", () => {
  it("shared-web bundle parses to the anchor type id", () => {
    const wire = JSON.parse(sharedWebRaw) as { id: string; economy: { tuningSheet: string } };
    expect(wire.id).toBe("official:shared-web");
    expect(wire.economy.tuningSheet).toMatch(/PROVISIONAL/);
  });

  it("g1 wave table is the 5-wave quarter script", () => {
    const wire = JSON.parse(waveTableRaw) as { id: string; waves: unknown[] };
    expect(wire.id).toBe("waves/g1-shared-web-first-quarter");
    expect(wire.waves).toHaveLength(5);
  });

  it("runQuarterSafe reports ok for the shipped wires", () => {
    const attempt = runQuarterSafe({
      seed: SEED,
      sharedWebWire: JSON.parse(sharedWebRaw),
      waveWire: JSON.parse(waveTableRaw),
    });
    expect(attempt.ok).toBe(true);
  });

  it("businessMinuteLabel reads day + clock + minute", () => {
    expect(businessMinuteLabel(1500)).toBe("D1 01:00 · m1500");
  });
});

describe("g5 projection · bucket stack (as-of journal sums, six laws)", () => {
  it("stack rows equal the certified final cash, bucket for bucket", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    expect(frame.buckets).toHaveLength(6);
    for (const row of frame.buckets) {
      expect(row.amount).toBe(theQuarter().finalState.cash[row.law.bucket]);
      expect(BUCKET_LAWS[row.law.bucket]).toBe(row.law);
      expect(row.law.law.length).toBeGreaterThan(20);
    }
  });

  it("minute zero: founding capital + the whale's day-one auto-pay, nothing deferred or receivable", () => {
    const frame = projectFrame(theQuarter(), 0);
    const bucket = (b: string) => frame.buckets.find((r) => r.law.bucket === b)!;
    // $40k founding posted through the ledger, then c01's net-0 auto-pay settles
    // in the SAME tick — money you can touch — minus its 10 % rolling reserve.
    expect(bucket("free").amount).toBeGreaterThan(40_000_000_000n);
    expect(bucket("accountsReceivable").amount).toBe(0n); // issued AND collected at m0
    expect(bucket("deferred").amount).toBe(0n); // no annual prepay signed yet
    expect(bucket("backlog").amount).toBe(0n);
    expect(bucket("committedOut").amount).toBe(0n);
    expect(bucket("restricted").amount).toBeGreaterThan(0n); // the reserve parked on day one
  });
});

describe("g5 projection · kanban as-of truth", () => {
  it("at minute 0 only the whale is on the book (its 2-month cliff means the renewal window is open from day one)", () => {
    const frame = projectFrame(theQuarter(), 0);
    const offbook = frame.kanban.find((c) => c.column === "offbook")!;
    const lead = frame.kanban.find((c) => c.column === "lead")!;
    const renewal = frame.kanban.find((c) => c.column === "renewal")!;
    expect(renewal.cards.map((k) => k.contractId)).toEqual(["c01"]);
    expect(lead.cards).toHaveLength(11);
    expect(offbook.cards).toHaveLength(0);
  });

  it("at quarter close the whale and both doomed deals sit in the closed book", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    const offbook = frame.kanban.find((c) => c.column === "offbook")!;
    expect(offbook.cards.map((k) => k.contractId).sort()).toEqual(["c01", "c05", "c06"]);
    const renewal = frame.kanban.find((c) => c.column === "renewal")!;
    expect(renewal.cards.map((k) => k.contractId)).toEqual(["c12"]);
  });
});

describe("g5 projection · dunning ladders as-of the notice trail", () => {
  it("mid-climb c05 shows retry reached but no suspension yet", () => {
    const frame = projectFrame(theQuarter(), 20_000);
    const c05 = frame.dunning.find((r) => r.contractId === "c05")!;
    const reached = c05.pips.filter((p) => p.reached).map((p) => p.stage);
    expect(reached).toEqual(["failed", "retry", "reminder", "warning"]);
    expect(reached).not.toContain("terminate");
    expect(c05.outcome).toBe("on the ladder");
  });

  it("c07 hits the terminate pip and is flagged RESURRECTED (E-2)", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    const c07 = frame.dunning.find((r) => r.contractId === "c07")!;
    expect(c07.pips.every((p) => p.reached)).toBe(true);
    expect(c07.outcome).toBe("RESURRECTED (E-2)");
  });

  it("c05 and c06 walk to write-off; nobody else is on a ladder", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    expect(frame.dunning.map((r) => r.contractId).sort()).toEqual(["c05", "c06", "c07"]);
    for (const id of ["c05", "c06"]) {
      expect(frame.dunning.find((r) => r.contractId === id)!.outcome).toBe("written off");
    }
  });
});

describe("g5 projection · renewal strip + cliffs", () => {
  it("whale lapses, c12 renews, and the strip says so at close", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    expect(frame.renewals.find((r) => r.contractId === "c01")!.status).toBe("lapsed");
    expect(frame.renewals.find((r) => r.contractId === "c12")!.status).toBe("renewed");
    expect(frame.renewals.find((r) => r.contractId === "c01")!.cliffMinute).toBe(86_400);
  });
});

describe("g5 projection · cash-vs-profit two-pane (the category axiom)", () => {
  it("month 1 books a profit while free cash craters — both panes see it", () => {
    // Scripted on purpose: 12 signings bill $4,158 of accrual revenue in month
    // 1, but the prepaid annuals sit in DEFERRED and the B2B net-30+15 in AR,
    // while $4,000 of payroll hits FREE the same month. Profit +$158, Δfree −.
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    const m1 = frame.months.find((m) => m.label === "Month 1")!;
    expect(m1.profitPositive).toBe(true);
    expect(m1.cashCratering).toBe(true);
    const lesson = m1.explain.inputs.find((i) => i.name === "lesson")!;
    expect(lesson.value).toContain("PROFIT POSITIVE, CASH CRATERING");
  });

  it("month 2 keeps cratering (payroll + the incident surge) even as more bills arrive", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    const m2 = frame.months.find((m) => m.label === "Month 2")!;
    expect(m2.accrualText).not.toBe("$0.00");
    expect(m2.cashCratering).toBe(true);
  });
});

describe("g5 projection · budgets + tape + ticker", () => {
  it("the incident survivor shows locked-deploy and the final remaining figure", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    const c07 = frame.budgets.find((r) => r.contractId === "c07")!;
    expect(c07.lockedAtMinute).toBe(77_760);
    expect(c07.burned).toBe(true);
    expect(c07.remainingSec).toMatch(/final/);
    const quiet = frame.budgets.find((r) => r.contractId === "c02")!;
    expect(quiet.burned).toBe(false);
  });

  it("mid-scrub budgets refuse to pretend they know the future", () => {
    const frame = projectFrame(theQuarter(), 20_000);
    for (const row of frame.budgets) expect(row.remainingSec).toBe("— final at quarter close");
  });

  it("the tape carries issues, landings, declines and write-offs, newest first", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    const events = new Set(frame.tape.map((r) => r.event));
    expect(events.has("landed")).toBe(true);
    expect([...frame.tape].sort((a, b) => b.minute - a.minute).map((r) => r.minute)).toEqual(
      frame.tape.map((r) => r.minute),
    );
  });

  it("ticker is capped and newest-first", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    expect(frame.ticker.length).toBeLessThanOrEqual(24);
    for (let i = 1; i < frame.ticker.length; i++) {
      expect(frame.ticker[i - 1]!.minute).toBeGreaterThanOrEqual(frame.ticker[i]!.minute);
    }
  });
});

describe("g5 projection · every number carries its law", () => {
  it("every ExplainPayload in a late frame has a formula and real inputs", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    const payloads = allExplainables(frame);
    expect(payloads.length).toBeGreaterThan(30);
    for (const p of payloads) {
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.formula.length).toBeGreaterThan(15);
      expect(p.inputs.length).toBeGreaterThanOrEqual(2);
      for (const input of p.inputs) {
        expect(input.name.length).toBeGreaterThan(0);
        expect(input.value.length).toBeGreaterThan(0);
      }
    }
  });

  it("bucket rows agree with the certified bucket-id order", () => {
    const frame = projectFrame(theQuarter(), QUARTER_MINUTES);
    expect(frame.buckets.map((r) => r.law.bucket)).toEqual([...BUCKET_IDS]);
  });
});
