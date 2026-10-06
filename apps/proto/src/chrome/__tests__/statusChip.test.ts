/**
 * Status chip vocabulary (§8.2, §8.15) — the twelve, the two-channel law,
 * and greyscale survivability asserted structurally (distinct geometry per
 * state, not just distinct words).
 */
import { describe, expect, it } from "vitest";
import {
  STATUS_VALUES,
  allStatusChips,
  isStatusValue,
  notchDash,
  notchPath,
  statusChipFor,
} from "../statusChip";

describe("the vocabulary", () => {
  it("is EXACTLY the twelve — no thirteenth may be invented", () => {
    expect(STATUS_VALUES).toEqual([
      "HEALTHY", "DEGRADED", "DOWN", "DRAINING", "PATCHING", "COMPROMISED",
      "SEALED", "EXPIRED", "OVERDUE", "AT RISK", "PENDING", "UNVERIFIED",
    ]);
    expect(STATUS_VALUES.length).toBe(12);
  });

  it("off-vocabulary lookups fail loudly (renderer never freestyles)", () => {
    expect(() => statusChipFor("PROBABLY-FINE" as never)).toThrow(/12-value vocabulary/);
    expect(isStatusValue("AT RISK")).toBe(true);
    expect(isStatusValue("at risk")).toBe(false); // exact case — the wire is precise
  });
});

describe("two-channel law (§8.15): colour AND shape, greyscale-survivable", () => {
  it("all twelve notches are DISTINCT shapes — colour stripped, meaning stays", () => {
    const notches = allStatusChips().map((c) => c.notch);
    expect(new Set(notches).size).toBe(12);
  });

  it("all twelve notches are distinct GLYPHS (path + stroke pattern), not aliased copies", () => {
    // UNVERIFIED's dashed ring deliberately reuses the circle geometry with a
    // dash pattern — greyscale-distinct AS PAINTED, so glyph identity = path+dash.
    const glyphs = allStatusChips().map((c) => `${notchPath(c.notch)}|${notchDash(c.notch) ?? ""}`);
    expect(new Set(glyphs).size).toBe(12);
  });

  it("every chip has a tone AND a notch (both channels always set)", () => {
    for (const chip of allStatusChips()) {
      expect(chip.tone.length).toBeGreaterThan(0);
      expect(chip.notch.length).toBeGreaterThan(0);
      expect(chip.meaning.length).toBeGreaterThan(0);
    }
  });

  it("the dashed-ring channel marks fog visually (dasharray paints)", () => {
    expect(notchDash("dashed-ring")).toBe("1.6 1.2");
    expect(notchDash("circle")).toBeUndefined();
  });

  it("unknown notch geometry throws rather than painting blank", () => {
    expect(() => notchPath("star" as never)).toThrow(/unknown notch/);
  });
});
