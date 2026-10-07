/**
 * i18n noticeCopy — the two G5 seams where a pack key replaces chrome prose
 * 1:1 (cliff-lapse → alert.churn-fuse; annual issue → terms.prepay-lock),
 * plus the honest nulls for every kind without a key.
 */
import { describe, expect, it } from "vitest";
import { noticeWireCopy, prepayLockCopy } from "../noticeCopy.ts";

describe("i18n/noticeCopy · the fitted seams", () => {
  it("cliff-lapsed + a customer label → the churn-fuse line", () => {
    expect(noticeWireCopy("cliff-lapsed", "MegaBlog Ltd (WHALE)")).toBe(
      "Cancellation in progress: MegaBlog Ltd (WHALE). The fuse tripped before renewal; the stated reason is in the ledger.",
    );
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
