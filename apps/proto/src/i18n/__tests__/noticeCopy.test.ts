/**
 * i18n noticeCopy — the G5 seams where a pack key replaces chrome prose 1:1
 * (cliff-lapse → alert.churn-fuse; annual issue → terms.prepay-lock;
 * contract-activated / chargeback-posted → their alert.* keys, the
 * rest-proto-final flip), plus the honest nulls for every declined fit.
 */
import { describe, expect, it } from "vitest";
import { noticeWireCopy, prepayLockCopy } from "../noticeCopy.ts";

describe("i18n/noticeCopy · the fitted seams", () => {
  it("cliff-lapsed + a customer label → the churn-fuse line", () => {
    expect(noticeWireCopy("cliff-lapsed", "MegaBlog Ltd (WHALE)")).toBe(
      "Cancellation in progress: MegaBlog Ltd (WHALE). The fuse tripped before renewal; the stated reason is in the ledger.",
    );
  });

  it("contract-activated + a customer label → the pack line (handoff #2 flip)", () => {
    expect(noticeWireCopy("contract-activated", "birdsong.page")).toBe(
      "Contract live: birdsong.page. The signed term starts billing from this minute; the backlog it promised now drains into revenue.",
    );
  });

  it("chargeback-posted + a customer label → the pack line (handoff #2 flip)", () => {
    expect(noticeWireCopy("chargeback-posted", "birdsong.page")).toBe(
      "Chargeback posted: birdsong.page. A settled payment was reversed after the fact; the fee is charged and the reversal is booked where reputation is scored.",
    );
  });

  it("the three alert keys live in shared-web only — the game pack declines them", () => {
    expect(noticeWireCopy("contract-activated", "x", "game")).toBeNull();
    expect(noticeWireCopy("chargeback-posted", "x", "game")).toBeNull();
  });

  /* OD-25(a) canonical-death pair (lane L4): authored ZERO-SLOT precisely
     because the covenant finding above has no answer for the company's own
     collapse — the sentence needs no name tag, so the ticker's
     contractId:"company" rows (customerLabel null) resolve the pack voice. */
  it("death-imminent resolves WITHOUT any label (zero-slot pack line)", () => {
    expect(noticeWireCopy("death-imminent", null)).toBe(
      "Death watch armed: the register has stayed empty and the ledger has kept refusing what is owed, day after day. This is the visible beat before the end — cover the burn now, or the next fold dissolves the company.",
    );
  });

  it("company-dissolved resolves WITHOUT any label (zero-slot pack line)", () => {
    expect(noticeWireCopy("company-dissolved", null)).toBe(
      "The company is dissolved. The ledger stops at its last entry: no settle, no accrual, no new notice. What ran here belongs to the replay now.",
    );
  });

  it("the death keys are era-flat: 1998 and 2026 resolve byte-identically", () => {
    for (const kind of ["death-imminent", "company-dissolved"]) {
      expect(noticeWireCopy(kind, null, "shared-web", 1998)).toBe(
        noticeWireCopy(kind, null, "shared-web", 2026),
      );
    }
  });

  it("the death keys live in shared-web only — the game pack declines them", () => {
    expect(noticeWireCopy("death-imminent", null, "game")).toBeNull();
    expect(noticeWireCopy("company-dissolved", null, "game")).toBeNull();
  });

  it("covenant-breached DECLINES until a company-label seam exists ({company} cannot be invented)", () => {
    // The key EXISTS (alert.covenant-breached {company}); what's missing is a
    // company display name in the ticker's data path. The provisional voice in
    // gates/g5/noticeSurface.ts keeps the row honest meanwhile.
    expect(noticeWireCopy("covenant-breached", "birdsong.page")).toBeNull();
  });

  it("annual issue → the prepay-lock law (intro price + term are slots)", () => {
    expect(prepayLockCopy("$3,600", 12)).toBe(
      "Annual prepay holds $3,600 for 12 months. Renewal prices at the sheet current on that date — the cliff is in the calendar, not the contract.",
    );
  });
});

describe("i18n/noticeCopy · the declined fits stay null (no forced prose)", () => {
  it.each([
    "dunning-stage",
    "invoice-failed",
    "written-off",
    "suspended",
    "clean-week-refund",
    "sla-credit-due",
    "budget-locked",
    "renewed",
    "pulse-open",
  ])("no pack analogue for notice kind %s", (kind) => {
    expect(noticeWireCopy(kind, "birdsong.page")).toBeNull();
  });

  it("cliff-lapsed WITHOUT a customer label declines (slot cannot be invented)", () => {
    expect(noticeWireCopy("cliff-lapsed", null)).toBeNull();
  });

  it("the churn-fuse/prepay keys live in shared-web only — the game pack declines too", () => {
    expect(noticeWireCopy("cliff-lapsed", "x", "game")).toBeNull();
    expect(prepayLockCopy("$1", 1, "game")).toBeNull();
  });
});
