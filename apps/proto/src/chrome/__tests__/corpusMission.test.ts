/**
 * corpusMission — the proto host leg of the waves-tableId seam (@5df5586).
 * These are the scenario suite's OWN witnesses (corpus.test.ts, probe-derived
 * 2026-10-13, base seed 904n) reproduced through the BROWSER-side authority:
 * ?raw slice JSON + registry sealed into a CorpusAuthority, fs never touched.
 * If the shipped content moves, these pins move with it — that is the point
 * of the seam being real content rather than re-typed numbers.
 */
import { describe, expect, it } from "vitest";
import { resolveCorpusWindows } from "@hh/sim-core/scenario";
import {
  CORPUS_MISSION_ID,
  CORPUS_MISSION_SEED,
  G1_SLICE_STEM,
  authorityForSurface,
  corpusMissionDoc,
  corpusMissionFlipDoc,
  missionRows,
  missionVerdicts,
  protoCorpusAuthority,
  protoFullBuildLog,
  protoInvitations,
  runCorpusMission,
  verdictRows,
} from "../corpusMission";

describe("protoCorpusAuthority (the browser host's injection)", () => {
  it("is one frozen, memoized authority carrying the real g1 slice", () => {
    const a = protoCorpusAuthority();
    expect(a).toBe(protoCorpusAuthority()); // same object, parsed once
    expect(Object.isFrozen(a)).toBe(true);
    const slice = a.slices.get(G1_SLICE_STEM) as { id?: string; type?: string };
    expect(slice.id).toBe("waves/g1-shared-web-first-quarter");
    expect(typeof slice.type).toBe("string");
  });

  it("threatMeta resolves registry families and answers undefined off-registry", () => {
    const meta = protoCorpusAuthority().threatMeta("scanner-drizzle");
    expect(meta).toBeDefined();
    expect(typeof meta?.family).toBe("string");
    expect(typeof meta?.denomination).toBe("string");
    expect(protoCorpusAuthority().threatMeta("not-a-threat-id")).toBeUndefined();
  });
});

describe("the 11th mission runs from proto — win arm (waves [1])", () => {
  it.each([0, 1, 2])("offset %i wins at the authored bar win@240", (offset) => {
    const outcome = runCorpusMission("win", offset);
    expect(outcome.error).toBeUndefined();
    const r = outcome.report!;
    expect(r.scenarioId).toBe(CORPUS_MISSION_ID);
    expect(r.outcome).toBe("won");
    expect(r.stopReason).toBe("win@240");
    expect(r.endMinute).toBe(240);
    expect(r.objectives.win[0]?.holds).toBe(true);
  });

  it("seed 904 digest matches the scenario suite's off-0 witness", () => {
    expect(runCorpusMission("win", 0).report!.endDigest).toBe("6546099a54b8b96b6f016a6795ae7beb");
  });

  it("the run is byte-repeatable (pure synchronous composition, no host state)", () => {
    const first = missionRows(runCorpusMission("win", 1));
    const again = missionRows(runCorpusMission("win", 1));
    expect(again).toEqual(first);
  });
});

describe("the ONE-field wire flip loses (waves [1,5] — the 30/min corpus wave stacked)", () => {
  it.each([
    [0, "guard:cascadeCollapse@80"],
    [1, "guard:cascadeCollapse@81"],
    [2, "guard:cascadeCollapse@85"],
  ] as const)("offset %i dies %s — the suite's own seed-divergent band", (offset, stop) => {
    const outcome = runCorpusMission("lose-flip", offset);
    const r = outcome.report!;
    expect(r.outcome).toBe("lost");
    expect(r.stopReason).toBe(stop);
  });

  it("the flip doc differs from the shipped doc only by the wire mutation", () => {
    expect(corpusMissionDoc().id).toBe(corpusMissionFlipDoc().id);
    const win = corpusMissionDoc().traffic;
    const flip = corpusMissionFlipDoc().traffic;
    expect(win.profile === "corpus" && win.waves).toEqual([1]);
    expect(flip.profile === "corpus" && flip.waves).toEqual([1, 5]);
  });
});

describe("fail-loud arm — the seam refuses to fake a storm without its host", () => {
  it("withholding config.corpus throws CORPUS_UNRESOLVED before tick 1", () => {
    const outcome = runCorpusMission("no-authority", 0);
    expect(outcome.report).toBeUndefined();
    expect(outcome.error).toBe("CORPUS_UNRESOLVED at 'config.corpus'");
    expect(missionRows(outcome)[0]).toContain("threw CORPUS_UNRESOLVED");
  });

  it("the mission seed base is the suite's 904n", () => {
    expect(CORPUS_MISSION_SEED.toString()).toBe("904");
  });
});

describe("missionRows rendering", () => {
  it("names outcome, stop witness, digest and the raw trace census", () => {
    const rows = missionRows(runCorpusMission("win", 0));
    expect(rows[1]).toContain("outcome won — stop win@240 at m240");
    expect(rows[2]).toMatch(/digest [0-9a-f]{32}/);
    expect(rows[3]).toContain("trace: arrivals");
    expect(rows[rows.length - 1]).toContain("win objective: held 65536/65536");
  });
});

/* ─────────── the REAL invitation law (browser twin of @bc11697) ─────────── */

describe("protoInvitations — the shared-web law, joined browser-side", () => {
  it("inverts the type bundle into exactly the five gated threats", () => {
    const inv = protoInvitations();
    expect([...inv.keys()].sort()).toEqual([
      "hoarder-noisy-neighbor",
      "noisy-query-table-scan",
      "scanner-drizzle",
      "vulnerable-plugin-compromise",
      "wp-login-brute-squad",
    ]);
    // Drift pin vs the sim-core suite's own gateCorpusWave witnesses
    // (corpus.test.ts wave-five block): same law, same sorted pools.
    expect(inv.get("scanner-drizzle")).toEqual(["public-whois-listing"]);
    expect(inv.get("wp-login-brute-squad")).toEqual(["homogeneous-cpanel-image"]);
    expect(inv.get("hoarder-noisy-neighbor")).toEqual(["unmetered-wordpress-default"]);
    expect(inv.get("noisy-query-table-scan")).toEqual(["unmetered-wordpress-default"]);
    expect(inv.get("vulnerable-plugin-compromise")).toEqual(["homogeneous-cpanel-image"]);
    // Ungated threats carry no pool — the authored-ungated stance.
    expect(inv.get("layer7-mimic")).toBeUndefined();
  });

  it("the seeded buildLog builds every law buildable at tick 0", () => {
    const log = protoFullBuildLog();
    expect(log.map((op) => op.buildableId)).toEqual([
      "homogeneous-cpanel-image",
      "public-whois-listing",
      "unmetered-wordpress-default",
    ]);
    expect(log.every((op) => op.atTick === 0n && op.op === "build")).toBe(true);
    expect(authorityForSurface("seeded-surface").buildLog).toEqual(log);
    expect(authorityForSurface("empty-surface").invitations).toBe(protoInvitations());
    expect(authorityForSurface("off")).toBe(protoCorpusAuthority());
  });
});

describe("missionVerdicts — the walk mirrors the seam's own plans (drift pin)", () => {
  it.each([
    ["authored", false, [1]],
    ["one-flip", true, [1, 5]],
  ] as const)("%s citation × every surface: plans agree with resolveCorpusWindows", (_label, flip, _waves) => {
    const doc = flip ? corpusMissionFlipDoc() : corpusMissionDoc();
    const traffic = doc.traffic;
    if (traffic.profile !== "corpus") throw new Error("mission docs must cite the corpus profile");
    expect(traffic.waves).toEqual([..._waves]);
    for (const surface of ["off", "empty-surface", "seeded-surface"] as const) {
      const verdicts = missionVerdicts(doc, surface);
      let windows: ReturnType<typeof resolveCorpusWindows>;
      try {
        windows = resolveCorpusWindows(traffic, CORPUS_MISSION_SEED, authorityForSurface(surface));
      } catch (error) {
        // The seam's all-starved refusal is itself the display case: zero
        // scheduled windows, every verdict excluded.
        expect(String(error)).toContain("uninvited at the attack surface");
        windows = [];
      }
      const scheduled = verdicts.filter((v) => v.scheduled);
      expect(scheduled.map((v) => v.waveN)).toEqual(windows.map((w) => w.waveN));
      for (const window of windows) {
        const v = scheduled.find((x) => x.waveN === window.waveN)!;
        expect([v.startMinute, v.gatedThreatIds, v.invitedThreatIds, v.spawns]).toEqual([
          window.startMinute,
          window.plan.gatedThreatIds,
          window.plan.invitedThreatIds,
          window.plan.spawns,
        ]);
      }
      expect(verdicts.map((v) => v.waveN)).toEqual([...traffic.waves]);
    }
  });

  it("probe truth: wave 1 is fully gated, wave 5 rides its ungated layer7-mimic", () => {
    const fresh = missionVerdicts(corpusMissionFlipDoc(), "empty-surface");
    // The CURSOR LAW with the content's own numbers: the starved wave 1
    // leaves no hole, so wave 5 gates at the citation head (m30) and its
    // placement dice, re-rolled at that cursor, storm the field at m34
    // instead of the law-off m42.
    expect(fresh[0]).toMatchObject({ waveN: 1, scheduled: false, startMinute: 30, gatedThreatIds: ["scanner-drizzle"], invitedThreatIds: [] });
    expect(fresh[1]).toMatchObject({ waveN: 5, scheduled: true, startMinute: 34, gatedThreatIds: ["noisy-query-table-scan", "vulnerable-plugin-compromise"], invitedThreatIds: [] });
    const seeded = missionVerdicts(corpusMissionFlipDoc(), "seeded-surface");
    expect(seeded.map((v) => [v.waveN, v.scheduled, v.startMinute])).toEqual([
      [1, true, 30],
      [5, true, 42],
    ]);
    expect(seeded[0]?.invitedThreatIds).toEqual(["scanner-drizzle"]);
    expect(seeded[1]?.invitedThreatIds).toEqual(["noisy-query-table-scan", "vulnerable-plugin-compromise"]);
    // verdictRows renders the same truth as words, refusal line included.
    const authoredFresh = verdictRows(corpusMissionDoc(), "empty-surface");
    expect(authoredFresh[0]).toContain("EXCLUDED @ m30 (nothing spawnable)");
    expect(authoredFresh[1]).toContain("citation refused — CORPUS_UNRESOLVED");
    const authoredSeeded = verdictRows(corpusMissionDoc(), "seeded-surface");
    expect(authoredSeeded[0]).toContain("invited 1/1");
    expect(authoredSeeded[0]).toContain("LANDS @ m30");
  });
});

describe("law arms — seeded replays the pinned witnesses, empty surface refuses/shifts", () => {
  it("law-seeded-win is byte-ident to the law-off witness (default-off honesty)", () => {
    const seeded = runCorpusMission("law-seeded-win", 0);
    const plain = runCorpusMission("win", 0);
    expect(seeded.report!.endDigest).toBe(plain.report!.endDigest);
    expect(seeded.report!.endDigest).toBe("6546099a54b8b96b6f016a6795ae7beb");
    expect(seeded.report!.stopReason).toBe("win@240");
  });

  it.each([
    [0, "guard:cascadeCollapse@80"],
    [1, "guard:cascadeCollapse@81"],
    [2, "guard:cascadeCollapse@85"],
  ])("law-seeded-flip reproduces the suite's band at offset %i", (offset, stop) => {
    expect(runCorpusMission("law-seeded-flip", offset).report!.stopReason).toBe(stop);
  });

  it("the fresh board starves the fully-gated authored citation — fail loud, never silence", () => {
    const outcome = runCorpusMission("law-empty-win", 0);
    expect(outcome.report).toBeUndefined();
    expect(outcome.error).toBe("CORPUS_UNRESOLVED at 'traffic.waves'");
    expect(missionRows(outcome)[0]).toContain("threw CORPUS_UNRESOLVED at 'traffic.waves'");
  });

  it("the one-flip citation still lands on a fresh board (wave 5 is part-ungated)", () => {
    const outcome = runCorpusMission("law-empty-flip", 0);
    expect(outcome.error).toBeUndefined();
    const r = outcome.report!;
    expect(r.scenarioId).toBe(CORPUS_MISSION_ID);
    // Packed cursor: wave 5's dice re-roll at m30 and the storm lands at
    // m34 (law-off it rides m42), so the guard band shifts off the law-off
    // pins — the earlier kill is the honest gated display, not a break.
    expect(r.outcome).toBe("lost");
    expect(r.stopReason).toBe("guard:cascadeCollapse@62");
    expect(r.endMinute).toBe(62);
  });
});
