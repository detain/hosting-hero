import { describe, expect, it } from "vitest";

import { asEntityId, asMoney, type Contract } from "../../types.js";
import { toNumber } from "../../kernel/fixed.js";
import {
  arAgingTrays,
  cycleGross,
  daysPastDue,
  invoiceDueAtMin,
  issueInvoice,
  nextUnlockAt,
  openRecognitionSchedule,
  planRefund,
  type Invoice,
} from "../billing.js";
import { openContractEconomy, parseClauseRefs } from "../contract.js";
import { defaultEconomyConfig } from "../config.js";
import { DAY, MONTH, TAGS, contractOf, makeInvoice } from "./helpers.js";

const cfg = defaultEconomyConfig();

function econFor(contract: Contract, clauseRefs: readonly string[] = []) {
  return openContractEconomy(
    { contract, atBusinessMin: 0, clauseRefs, grandfather: null, revenueTags: TAGS },
    cfg,
  );
}

describe("invoice calendar + net-terms clock (§6.4)", () => {
  it("net-0 card cycle is due at issue; net-60 slips to net-75 (§6.4 'really net-75')", () => {
    expect(invoiceDueAtMin(0, { netTermsDays: 0, annualPrepay: false }, cfg)).toBe(0);
    expect(invoiceDueAtMin(0, { netTermsDays: 60, annualPrepay: false }, cfg)).toBe(75 * DAY);
  });

  it("monthly gross = MRC; hourly = MRC/720 exact-integer; annual = 12×MRC −15%", () => {
    const monthly = contractOf("b-m");
    const econ = econFor(monthly);
    expect(cycleGross(monthly, econ, 0, { netTermsDays: 0, annualPrepay: false }, 0n, cfg)).toBe(asMoney(100_000_000n));

    const hourly = contractOf("b-h", { billingCycle: "hourly" });
    expect(cycleGross(hourly, econFor(hourly), 0, { netTermsDays: 0, annualPrepay: false }, 0n, cfg)).toBe(asMoney(138_889n)); // 1e8/720 = 138888.8̄ → 138889

    const annual = contractOf("b-a", { billingCycle: "annual" });
    // $100 × 12 × 0.85 = $1,020 — LIVE 15% prepay discount (§6.13)
    expect(cycleGross(annual, econFor(annual), 0, { netTermsDays: 30, annualPrepay: true }, 0n, cfg)).toBe(asMoney(1_020_000_000n));
  });

  it("retail card fee = 2.9% + $0.30 on net-0; wire-invoiced drops the fixed leg (§6.13)", () => {
    const c = contractOf("b-fee");
    const card = issueInvoice(c, econFor(c), 0, 0, { netTermsDays: 0, annualPrepay: false }, 0n, cfg);
    expect(card.gross).toBe(asMoney(100_000_000n));
    expect(card.fee).toBe(asMoney(3_200_000n)); // $2.90 + $0.30 — the "fees=13% of $3 plan" anchor scale
    expect(card.net).toBe(asMoney(96_800_000n));
    const wire = issueInvoice(c, econFor(c), 0, 0, { netTermsDays: 60, annualPrepay: false }, 0n, cfg);
    expect(wire.fee).toBe(asMoney(2_900_000n));
    expect(wire.dueAtMin).toBe(75 * DAY);
  });

  it("invoice ids are deterministic per (contract, cycle)", () => {
    const c = contractOf("b-id");
    const a = issueInvoice(c, econFor(c), 3, 0, { netTermsDays: 0, annualPrepay: false }, 0n, cfg);
    const b = issueInvoice(c, econFor(c), 3, 999, { netTermsDays: 0, annualPrepay: false }, 0n, cfg);
    expect(a.id).toBe(b.id);
    expect(a.id).toBe(asEntityId("inv:b-id:3"));
  });
});

describe("deferred recognition + refund punishment (§6.13)", () => {
  it("releases 1/12 per month and closes exactly on the remainder", () => {
    const total = asMoney(1_200_000_000n); // $1,200 prepaid year
    let schedule = openRecognitionSchedule(asEntityId("rec-1"), asEntityId("c-1"), total, 0, cfg);
    let released = 0n;
    for (let month = 1; month <= 13; month += 1) {
      const release = nextUnlockAt(schedule, month * MONTH);
      if (release === null) continue;
      released += release.amount;
      schedule = release.schedule;
    }
    expect(released).toBe(total); // no 13th-month over-release, no dust left
    expect(nextUnlockAt(schedule, 100 * MONTH)).toBeNull();
  });

  it("planRefund pulls deferred first, clawing recognized dust from free", () => {
    const total = asMoney(1_200_000_000n);
    let schedule = openRecognitionSchedule(asEntityId("rec-2"), asEntityId("c-2"), total, 0, cfg);
    for (let month = 1; month <= 3; month += 1) {
      const r = nextUnlockAt(schedule, month * MONTH);
      if (r !== null) schedule = r.schedule;
    } // 300 recognized, 900 unreleased
    expect(planRefund(schedule, asMoney(500_000_000n))).toEqual({
      fromDeferred: asMoney(500_000_000n),
      fromFree: asMoney(0n),
    });
    expect(planRefund(schedule, asMoney(1_000_000_000n))).toEqual({
      fromDeferred: asMoney(900_000_000n),
      fromFree: asMoney(100_000_000n), // the punishment
    });
    expect(() => planRefund(schedule, asMoney(-1n))).toThrow(/negative refund/);
  });
});

describe("AR aging — four trays + DSO (§6.13)", () => {
  const mk = (id: string, dueAtMin: number, gross: bigint): Invoice =>
    makeInvoice({ id: asEntityId(id), contractId: asEntityId(`c-${id}`), dueAtMin, gross: asMoney(gross), state: "issued" });

  it("places open invoices by days-past-due into 0-30/31-60/61-90/90+", () => {
    const now = 200 * DAY;
    const invoices = [
      mk("i0", now - 10 * DAY, 10n),
      mk("i1", now - 45 * DAY, 20n),
      mk("i2", now - 75 * DAY, 30n),
      mk("i3", now - 200 * DAY, 40n),
      mk("i4", 0, 111n), // settled: ignored
    ];
    invoices[4] = { ...invoices[4]!, state: "paid" };
    const aging = arAgingTrays(invoices, now, cfg);
    expect(aging.trays).toEqual([10n, 20n, 30n, 40n]);
    expect(aging.openCount).toBe(4);
    // DSO midpoint = (15×10+45×20+75×30+120×40)/100 = 8100/100 = 81 exactly
    expect(toNumber(aging.dsoDays)).toBeCloseTo(81, 3);
  });

  it("empty book yields zero trays and zero DSO", () => {
    const aging = arAgingTrays([], 0, cfg);
    expect(aging.trays).toEqual([0n, 0n, 0n, 0n]);
    expect(aging.dsoDays).toBe(0n);
  });

  it("daysPastDue counts whole business days, negative on credit", () => {
    const inv = makeInvoice({ id: asEntityId("d1"), contractId: asEntityId("c"), dueAtMin: 10 * DAY });
    expect(daysPastDue(inv, 12 * DAY + 1439, cfg)).toBe(2);
    expect(daysPastDue(inv, 9 * DAY, cfg)).toBe(-1);
  });

  it("escalator clause membership drives billedMrc via cycleGross (integration seam)", () => {
    const c = contractOf("b-esc");
    const econ = econFor(c, parseClauseRefs(["annual-escalator"]));
    expect(cycleGross(c, econ, 12 * MONTH, { netTermsDays: 0, annualPrepay: false }, 0n, cfg)).toBe(asMoney(103_000_000n));
  });
});
