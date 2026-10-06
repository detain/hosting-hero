/** Attack-Surface Ledger (gate G2): a threat is unspawnable until its
 *  invitation is built; retirement lags; mastery demotes to weather. */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LEDGER_CONFIG,
  bandAfterMastery,
  buildInvitations,
  gateComposition,
  isThreatSpawnable,
  ledgerSnapshot,
  spawnableThreatIds,
} from "../ledger.js";
import { cleanTable } from "./fixtures.js";

// buildInvitations takes the content shape {buildable: threatIds[]}.
const INV = buildInvitations({
  "cdn-shield": ["layer7-flood"],
  "rate-limiter": ["layer7-flood", "brute-squad"],
});

describe("buildInvitations", () => {
  it("inverts with sorted deterministic pools", () => {
    const inv = buildInvitations({ "rate-limiter": ["brute-squad", "layer7-flood"], "cdn-shield": ["layer7-flood"] });
    expect(inv.get("layer7-flood")).toEqual(["cdn-shield", "rate-limiter"]);
    expect(inv.get("brute-squad")).toEqual(["rate-limiter"]);
  });
});

describe("ledgerSnapshot — last-op-wins + retirement lag", () => {
  it("nothing exists before any build", () => {
    const snap = ledgerSnapshot([{ atTick: 10n, buildableId: "cdn-shield", op: "build" }], 5n);
    expect(snap.existingBuildables.size).toBe(0);
  });
  it("exists after build", () => {
    const snap = ledgerSnapshot([{ atTick: 10n, buildableId: "cdn-shield", op: "build" }], 10n);
    expect(snap.existingBuildables.has("cdn-shield")).toBe(true);
  });
  it("removal only lands after the retirement lag ('attackers don't get the memo')", () => {
    const ops = [
      { atTick: 10n, buildableId: "cdn-shield", op: "build" as const },
      { atTick: 20n, buildableId: "cdn-shield", op: "remove" as const },
    ];
    expect(ledgerSnapshot(ops, 20n, DEFAULT_LEDGER_CONFIG).existingBuildables.has("cdn-shield")).toBe(true);
    expect(ledgerSnapshot(ops, 79n, DEFAULT_LEDGER_CONFIG).existingBuildables.has("cdn-shield")).toBe(true);
    expect(ledgerSnapshot(ops, 80n, DEFAULT_LEDGER_CONFIG).existingBuildables.has("cdn-shield")).toBe(false);
  });
  it("re-build after remove resets the ghost", () => {
    const ops = [
      { atTick: 5n, buildableId: "x", op: "build" as const },
      { atTick: 10n, buildableId: "x", op: "remove" as const },
      { atTick: 12n, buildableId: "x", op: "build" as const },
    ];
    expect(ledgerSnapshot(ops, 30n).existingBuildables.has("x")).toBe(true);
  });
});

describe("spawnability gating", () => {
  const built = ledgerSnapshot(
    [
      { atTick: 1n, buildableId: "rate-limiter", op: "build" },
    ],
    50n,
  );
  const empty = ledgerSnapshot([], 0n);

  it("ungated threats are always spawnable; gated need an inviter", () => {
    expect(isThreatSpawnable("organic-visitor", empty, INV)).toBe(true);
    expect(isThreatSpawnable("layer7-flood", empty, INV)).toBe(false);
    expect(isThreatSpawnable("layer7-flood", built, INV)).toBe(true);
  });
  it("spawnableThreatIds is sorted and stable", () => {
    const all = ["zeta", "alpha", "brute-squad", "layer7-flood"];
    // rate-limiter alone invites BOTH brute-squad and layer7-flood (any-inviter rule).
    expect(spawnableThreatIds(all, built, INV)).toEqual(["alpha", "brute-squad", "layer7-flood", "zeta"]);
    expect(spawnableThreatIds(all, empty, INV)).toEqual(["alpha", "zeta"]);
  });
});

describe("mastery demotion data hook (§2.24)", () => {
  it("at/after threshold → weather, whatever the authored band", () => {
    const counts = new Map([["brute-squad", 5]]);
    expect(bandAfterMastery("brute-squad", "storm", counts, DEFAULT_LEDGER_CONFIG)).toBe("weather");
    expect(bandAfterMastery("brute-squad", "hunter", counts, DEFAULT_LEDGER_CONFIG)).toBe("weather");
    expect(bandAfterMastery("brute-squad", "entropy", counts, DEFAULT_LEDGER_CONFIG)).toBe("weather");
  });
  it("below threshold and untracked keep the authored band", () => {
    const counts = new Map([["brute-squad", 4]]);
    expect(bandAfterMastery("brute-squad", "storm", counts, DEFAULT_LEDGER_CONFIG)).toBe("storm");
    expect(bandAfterMastery("untracked", "hunter", counts, DEFAULT_LEDGER_CONFIG)).toBe("hunter");
  });
  it("weather stays weather", () => {
    expect(bandAfterMastery("t", "weather", new Map([["t", 99]]))).toBe("weather");
  });
});

describe("gateComposition", () => {
  it("withholds uninvited entries deterministically, keeps order of the rest", () => {
    const table = cleanTable();
    const w2 = table.waves[1]!;
    const invitations = buildInvitations({ "cash-guard": ["cash-burner"] });
    const snap = ledgerSnapshot([], 0n);
    const gated = gateComposition(w2.entries, snap, invitations);
    expect(gated.deferred).toEqual(["cash-burner"]);
    expect(gated.spawnable.map((e) => e.threatId)).toEqual(["brute-squad"]);
    // build it → gate opens, same function, zero RNG anywhere:
    const open = gateComposition(w2.entries, ledgerSnapshot([{ atTick: 1n, buildableId: "cash-guard", op: "build" }], 2n), invitations);
    expect(open.spawnable.length).toBe(2);
    expect(open.deferred).toEqual([]);
  });
  it("entry() fixture default table is fully ungated", () => {
    const gated = gateComposition(cleanTable().waves[0]!.entries, ledgerSnapshot([], 0n), new Map());
    expect(gated.deferred).toEqual([]);
    expect(gated.spawnable.length).toBe(2);
  });
});
