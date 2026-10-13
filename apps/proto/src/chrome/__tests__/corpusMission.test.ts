/**
 * corpusMission — the proto host leg of the waves-tableId seam (@5df5586).
 * These are the scenario suite's OWN witnesses (corpus.test.ts, probe-derived
 * 2026-10-13, base seed 904n) reproduced through the BROWSER-side authority:
 * ?raw slice JSON + registry sealed into a CorpusAuthority, fs never touched.
 * If the shipped content moves, these pins move with it — that is the point
 * of the seam being real content rather than re-typed numbers.
 */
import { describe, expect, it } from "vitest";
import {
  CORPUS_MISSION_ID,
  CORPUS_MISSION_SEED,
  G1_SLICE_STEM,
  corpusMissionDoc,
  corpusMissionFlipDoc,
  missionRows,
  protoCorpusAuthority,
  runCorpusMission,
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
