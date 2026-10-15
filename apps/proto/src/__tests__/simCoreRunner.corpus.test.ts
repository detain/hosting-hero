/**
 * CORPUS DRIVE MODE — the mainline runner leg of the §1.5 corpus seam
 * (resolveCorpusWindows @5df5586 + the invitation gate @bc11697), cited
 * through the public `@hh/sim-core/scenario` surface only.
 *
 * Proven caller twin: chrome/corpusMission.ts drives the same authority
 * helpers; this suite pins that the RUNNER resolves the same citation the
 * same way (envelope byte-identity vs a direct seam call) and that the
 * default-off path is a byte-identical twin of the plain runner. The money
 * goldens (25_005_307_300n / 25_109_732_500n) live in simCoreRunner.test.ts
 * and are re-run untouched by the gates — nothing here re-pins them.
 *
 * Digest honesty: the scenario-suite witness 6546099a… is run-scoped to the
 * scenario runner's own board/money and cannot recur at mainline runner
 * scale; the faithful reproduction is envelope byte-identity vs the seam
 * (below), which is what feeds every arrival downstream.
 */
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import { resolveCorpusWindows } from "@hh/sim-core/scenario";
import { encodeProjection } from "../shared/protocol";
import { SimCoreRunner } from "../runner/index";
import {
  CORPUS_MISSION_SEED,
  G1_SLICE_STEM,
  authorityForSurface,
  protoCorpusAuthority,
} from "../chrome/corpusMission";

const SEED = Number(CORPUS_MISSION_SEED); // 904 — the mission seed

function corpusRunner(corpus: ConstructorParameters<typeof SimCoreRunner>[0]["corpus"], extra = {}): SimCoreRunner {
  return new SimCoreRunner({ seed: SEED, corpus, ...extra });
}

function frameDigests(runner: SimCoreRunner, ticks: number): string[] {
  const digests: string[] = [];
  for (let i = 0; i < ticks; i += 1) {
    digests.push(canonicalDigest(encodeProjection(runner.headlessStep(10))));
  }
  return digests;
}

describe("corpus drive mode is default-off", () => {
  it("a plain runner is a byte-identical twin across 60 frames and answers no corpus plan", () => {
    const a = new SimCoreRunner({ seed: SEED });
    const b = new SimCoreRunner({ seed: SEED });
    expect(a.corpusPlan()).toBeNull();
    expect(a.corpusTraffic()).toBeNull();
    expect(frameDigests(a, 60)).toEqual(frameDigests(b, 60));
  });
});

describe("runner-scale seam witness (law-off citation [1])", () => {
  it("the cited envelope is byte-identical to a direct resolveCorpusWindows call", () => {
    const authority = protoCorpusAuthority();
    const traffic = {
      profile: "corpus" as const,
      tableId: G1_SLICE_STEM,
      waves: [1],
      waveStartMinute: 30,
      baselineRatePerMin: 0,
    };
    const [window] = resolveCorpusWindows(traffic, CORPUS_MISSION_SEED, authority);
    expect(window).toBeDefined();
    const runner = corpusRunner({ authority, waves: [1], waveStartMinute: 30 });
    expect(runner.waveEnvelopes().get(1)).toEqual(window!.envelope);
    expect(runner.corpusTraffic()).toEqual({
      profile: "corpus",
      tableId: G1_SLICE_STEM,
      waves: [1],
      waveStartMinute: 30,
      baselineRatePerMin: 0,
    });
    const [row] = runner.corpusPlan()!;
    expect(row).toEqual({
      wave: 1,
      judgedAtMinute: 30,
      scheduled: true,
      startMinute: window!.startMinute,
      windowMinutes: window!.windowMinutes,
      excluded: [],
    });
  });

  it("win-arm frames advance real terminals (cited storms really arrive)", () => {
    // The cited g1 wave-1 storm is fully adversarial (dominantFamily
    // malicious) — on this board adversarial terminals are bounced/landed,
    // never `served` (the mazing suite's "mix-on ⇒ served=0" law). The
    // runner-scale witness is therefore the same non-dead-queue law the
    // default-mode suite pins: terminals strictly increase inside the
    // cited window.
    const runner = corpusRunner({ authority: protoCorpusAuthority(), waves: [1] });
    let terminals = 0;
    for (let i = 0; i < 60; i += 1) {
      const { served, bounced, blockedFalsePositive, landed } = runner.headlessStep(10).counters;
      terminals = served + bounced + blockedFalsePositive + landed;
    }
    expect(terminals).toBeGreaterThan(0);
  });

  it("corpus mode never fakes the internal B4 plan witness but still answers waveEnvelopes()", () => {
    const runner = corpusRunner({ authority: protoCorpusAuthority(), waves: [1] });
    runner.headlessStep(10);
    expect(runner.wavePlan(1)).toBeUndefined(); // plans were minted INSIDE the seam
    expect(runner.waveEnvelopes().get(1)).toBeDefined();
  });

  it("familyOverride labels the cited envelope too (test seam unchanged)", () => {
    const runner = corpusRunner({ authority: protoCorpusAuthority(), waves: [1] }, { familyOverride: "organic" });
    expect(runner.waveEnvelopes().get(1)!.dominantFamily).toBe("organic");
  });
});

describe("invitation law rides the authority (seeded-vs-empty pair on [1,5])", () => {
  it("an empty surface excludes the gated wave-1 storm and packs wave-5 to the SAME judged cursor (no hole)", () => {
    const runner = corpusRunner({ authority: authorityForSurface("empty-surface"), waves: [1, 5] });
    const [first, fifth] = runner.corpusPlan()!;
    expect(first).toEqual({
      wave: 1,
      judgedAtMinute: 2,
      scheduled: false,
      startMinute: null,
      windowMinutes: 12,
      excluded: ["scanner-drizzle"],
    });
    // CURSOR LAW: wave 5 is judged at cursor 2 (not 14) — the excluded storm
    // advanced nothing — and its ungated entry still spawns.
    expect(fifth).toEqual({
      wave: 5,
      judgedAtMinute: 2,
      scheduled: true,
      startMinute: 4,
      windowMinutes: 12,
      excluded: ["noisy-query-table-scan", "vulnerable-plugin-compromise"],
    });
  });

  it("a seeded surface schedules both cited waves with the packed 12-minute cursor hop", () => {
    const runner = corpusRunner({ authority: authorityForSurface("seeded-surface"), waves: [1, 5] });
    const [first, fifth] = runner.corpusPlan()!;
    expect(first).toMatchObject({ wave: 1, judgedAtMinute: 2, scheduled: true, excluded: [] });
    expect(fifth).toMatchObject({ wave: 5, judgedAtMinute: 14, scheduled: true, startMinute: 14, excluded: [] });
  });

  it("a fully-starved citation fails loud before tick 1", () => {
    expect(() => corpusRunner({ authority: authorityForSurface("empty-surface"), waves: [1] })).toThrow(
      /uninvited at the attack surface/,
    );
  });
});

describe("corpus drive boundary wall", () => {
  it("refuses a non-ascending / empty / bad-integer citation at the constructor", () => {
    const authority = protoCorpusAuthority();
    expect(() => corpusRunner({ authority, waves: [] })).toThrow(/at least one/);
    expect(() => corpusRunner({ authority, waves: [5, 1] })).toThrow(/strictly ascending/);
    expect(() => corpusRunner({ authority, waves: [0] })).toThrow(/integers ≥ 1/);
    expect(() => corpusRunner({ authority, waves: [1], waveStartMinute: 2.5 })).toThrow(/waveStartMinute/);
  });
});
