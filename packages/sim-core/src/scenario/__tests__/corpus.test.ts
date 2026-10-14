/** corpus.test.ts — the waves-tableId traffic seam, proven end-to-end on
 *  the Metastable corpus twin.
 *
 *  Witness table (probe-derived 2026-10-13, seed base 904n, slices loaded
 *  fresh from packages/content/ by corpusFixtures):
 *
 *  | arm                       | offsets 0 / 1 / 2                      |
 *  |---------------------------|----------------------------------------|
 *  | win  (waves [1])          | won  win@240, won  win@240, won win@240 |
 *  | lose (waves [1,5] flip)   | guard:cascadeCollapse@80 / @81 / @85   |
 *
 *  Windows at offset 0: wave 1 → start 30 len 12 rate 204800/65536 =
 *  3.125 per min; wave 5 (stacked) → start 42 len 12 rate 1966080/65536 =
 *  30 per min. The envelopes carry the CONTENT's fields (role "wave",
 *  shape "ramp", family "malicious", telegraphed true/false) — not the
 *  organic plateau the segments path mints — which is what makes the
 *  citation real rather than re-typed.
 */
import { describe, expect, it } from "vitest";

import { asRunSeed } from "../../types.ts";
import type { RunSeed } from "../../types.ts";
import { encodeTaggedTree } from "../../internal/canonical.ts";
import { buildInvitations } from "../../waves/index.ts";
import type { BuildOp, ForeignThreatMeta, ThreatInvitations } from "../../waves/index.ts";
import { SHIPPED_SCENARIO_WIRES, ScenarioError, parseScenarioDoc, runScenario, shippedScenario } from "../index.ts";
import type { ScenarioReport, ScenarioWire } from "../index.ts";
import { gateCorpusWave, resolveCorpusWindows } from "../corpus.ts";
import type { CorpusAuthority, CorpusGeometry, CorpusWaveWindow } from "../corpus.ts";
import type { ScenarioCorpusTraffic } from "../doc.ts";
import { corpusAuthority, SHIPPED_G1_SLICE_STEM, FULL_BUILD_LOG, invitedCorpusAuthority, sharedWebInvitationLaw } from "./corpusFixtures.ts";

const BASE_SEED = asRunSeed(904n);

type MutableWire = {
  limits: { maxSimMinutes: number; guardrails?: unknown[] };
  contracts: unknown[];
  board: unknown;
  objectives: { win: unknown[]; lose: unknown[] };
  traffic: { tableId: string; waves?: number[]; waveStartMinute?: number; baselineRatePerMin?: number };
};

function twinWire(mutate?: (wire: MutableWire) => void): MutableWire {
  // Same law as runner.test flip(): clone the SHIPPED wire JSON, mutate ONE
  // field, re-cross the wall. (The wire literal, never the parsed doc —
  // the parsed board carries bigints and JSON has no bigint.)
  const wire = JSON.parse(JSON.stringify(SHIPPED_SCENARIO_WIRES["metastable-corpus"])) as MutableWire;
  mutate?.(wire);
  return wire;
}

function reportIdentity(report: ScenarioReport): string {
  return JSON.stringify(
    encodeTaggedTree(report as unknown as Record<string, unknown>, (problem) => {
      throw new Error(`scenario report not canonical: ${String(problem.kind)}`);
    }),
    (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v),
  );
}

function corpusTrafficOf(id: string): ScenarioCorpusTraffic {
  const traffic = shippedScenario(id).traffic;
  if (traffic.profile !== "corpus") throw new Error(`${id} must be a corpus doc`);
  return traffic;
}

/* ─────────────────────────── the wire wall ─────────────────────────── */

describe("corpus traffic wall", () => {
  it("names a tableId + waves, with documented defaults", () => {
    const doc = parseScenarioDoc({
      ...({
        schema: "hh-scenario@1",
        id: "seam-probe",
        name: "Seam Probe",
        brief: "A minimal corpus-cited doc proving the wire form parses with its defaults.",
        specRef: "§1.5 Metastable",
        specLine: 4076,
        board: twinWire().board,
        contracts: [],
        traffic: { tableId: SHIPPED_G1_SLICE_STEM, waves: [4] },
        objectives: { win: [{ kind: "survive-minutes", minutes: 240 }], lose: [] },
        limits: { maxSimMinutes: 240 },
      } as unknown) as ScenarioWire,
    });
    expect(doc.traffic.profile).toBe("corpus");
    if (doc.traffic.profile !== "corpus") return;
    expect(doc.traffic.waves).toEqual([4]);
    expect(doc.traffic.waveStartMinute).toBe(2);
    expect(doc.traffic.baselineRatePerMin).toBe(0);
  });

  it("refuses a traffic block naming BOTH segments and waves", () => {
    expect(() =>
      parseScenarioDoc({
        ...(twinWire((wire) => {
          (wire.traffic as Record<string, unknown>).segments = [{ fromMinute: 0, ratePerMin: 1 }];
        }) as unknown) as ScenarioWire,
      }),
    ).toThrow(/both `segments` and `waves`/);
  });

  it("refuses unknown traffic fields, non-ascending waves, and wave zero", () => {
    const ghost = twinWire();
    (ghost.traffic as Record<string, unknown>).stormFactor = 3;
    expect(() => parseScenarioDoc(ghost as unknown as ScenarioWire)).toThrow(/unknown field/);
    const descending = twinWire((w) => {
      w.traffic.waves = [5, 1];
    });
    expect(() => parseScenarioDoc(descending as unknown as ScenarioWire)).toThrow(/does not ascend/);
    const zero = twinWire((w) => {
      w.traffic.waves = [0];
    });
    expect(() => parseScenarioDoc(zero as unknown as ScenarioWire)).toThrow(/\[1,1000\]/);
    const empty = twinWire((w) => {
      w.traffic.waves = [];
    });
    expect(() => parseScenarioDoc(empty as unknown as ScenarioWire)).toThrow(/non-empty array/);
  });
});

/* ─────────────────── the resolver: shipped pipeline ─────────────────── */

describe("resolveCorpusWindows — the cited quarter through the shipped law", () => {
  it("offset 0 windows match the probe witnesses, content fields and all", () => {
    const windows = resolveCorpusWindows(corpusTrafficOf("metastable-corpus"), BASE_SEED, corpusAuthority());
    expect(windows).toHaveLength(1);
    const w = windows[0]!;
    expect([w.waveN, w.startMinute, w.windowMinutes]).toEqual([1, 30, 12]);
    expect(String(w.envelope.ratePerMin)).toBe("204800");
    // The content's own profile — role/shape/family/telegraph come from the
    // slice via planWave, NOT the organic plateau the segments path mints.
    expect(w.envelope.role).toBe("wave");
    expect(w.envelope.shape).toBe("ramp");
    expect(w.envelope.dominantFamily).toBe("malicious");
    expect(w.envelope.telegraphed).toBe(true);
    expect(w.envelope.tableId).toBe(`waves/${SHIPPED_G1_SLICE_STEM}`);
  });

  it("the cursor law stacks cited waves in consecutive windows", () => {
    const traffic = corpusTrafficOf("metastable-corpus");
    const stacked = resolveCorpusWindows({ ...traffic, waves: [1, 5] }, BASE_SEED, corpusAuthority());
    expect(stacked.map((w) => w.waveN)).toEqual([1, 5]);
    expect(stacked[0]!.startMinute).toBe(30);
    // wave 5's cursor opens only after wave 1's full window closes.
    expect(stacked[1]!.startMinute).toBeGreaterThanOrEqual(30 + stacked[0]!.windowMinutes);
    expect(String(stacked[1]!.envelope.ratePerMin)).toBe("1966080");
    expect(stacked[1]!.envelope.telegraphed).toBe(false);
  });

  it("resolution is a pure fold: same (traffic, seed, authority) ×100 identical", () => {
    const traffic = corpusTrafficOf("metastable-corpus");
    const seen = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      seen.add(JSON.stringify(resolveCorpusWindows(traffic, BASE_SEED, corpusAuthority()), (_k, v) => (typeof v === "bigint" ? `${String(v)}n` : v)));
    }
    expect(seen.size).toBe(1);
  });

  it("fail-loud: un-citable tableId, un-shipped wave number", () => {
    const traffic = corpusTrafficOf("metastable-corpus");
    expect(() =>
      resolveCorpusWindows({ ...traffic, tableId: "g1-shared-web-second-century" }, BASE_SEED, corpusAuthority()),
    ).toThrow(/not among the injected slices/);
    expect(() =>
      resolveCorpusWindows({ ...traffic, waves: [99] }, BASE_SEED, corpusAuthority()),
    ).toThrow(/ships no wave 99/);
  });
});

/* ─────────────────── the runner: twin mission witnesses ─────────────────── */

describe("Metastable corpus twin — win, one-flip-lose, determinism", () => {
  const twin = () => shippedScenario("metastable-corpus");

  it("the shipped arm (waves [1]) is won@240 on offsets 0–2", () => {
    for (const offset of [0, 1, 2]) {
      const report = runScenario(twin(), BASE_SEED, { seedOffset: offset, corpus: corpusAuthority() });
      expect(report.outcome, `${report.stopReason}`).toBe("won");
      expect(report.stopReason).toBe("win@240");
    }
  });

  it("offset 0 carries the exact probe census (traffic really rode the content)", () => {
    const report = runScenario(twin(), BASE_SEED, { corpus: corpusAuthority() });
    expect(report.trace.arrivals).toBe(998);
    expect(report.trace.served).toBe(956);
    expect(report.trace.bounced).toBe(26);
    expect(report.endDigest).toBe("6546099a54b8b96b6f016a6795ae7beb");
  });

  it("the ONE-FIELD flip waves [1] → [1,5] cascades at the probe-pinned minute", () => {
    const expected = ["guard:cascadeCollapse@80", "guard:cascadeCollapse@81", "guard:cascadeCollapse@85"];
    for (const offset of [0, 1, 2]) {
      const flipped = parseScenarioDoc((twinWire((w) => {
        w.traffic.waves = [1, 5];
      }) as unknown) as ScenarioWire);
      const report = runScenario(flipped, BASE_SEED, { seedOffset: offset, corpus: corpusAuthority() });
      expect(report.outcome).toBe("lost");
      expect(report.stopReason).toBe(expected[offset]);
    }
  });

  it("citing without config.corpus fails loud — never silently calm", () => {
    try {
      runScenario(twin(), BASE_SEED);
      throw new Error("expected ScenarioError");
    } catch (cause) {
      expect(cause).toBeInstanceOf(ScenarioError);
      expect((cause as ScenarioError).code).toBe("CORPUS_UNRESOLVED");
      expect((cause as Error).message).toContain("config.corpus");
    }
  });

  it("the twin arm is byte-identical ×100 (12-minute cap)", () => {
    const digests = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      digests.add(reportIdentity(runScenario(twin(), BASE_SEED, { tickCap: 12, corpus: corpusAuthority() })));
    }
    expect(digests.size).toBe(1);
  });

  it("seed divergence is honest: offset 3's full run differs from offset 0's", () => {
    const a = runScenario(twin(), BASE_SEED, { seedOffset: 0, corpus: corpusAuthority() });
    const b = runScenario(twin(), BASE_SEED, { seedOffset: 3, corpus: corpusAuthority() });
    const seedOf = (s: RunSeed) => String(s);
    expect(seedOf(a.runSeed)).not.toBe(seedOf(b.runSeed));
  });
});

/* ─────────────── the invitation law — synthetic planted slice ─────────────── */
/* The shipped slices carry NO invitation markers (the law lives in the
 * type-bundle's threats.unlockedByBuildables, joined by threat-id) and
 * packages/content/** is off-limits to this lane — so the law is proven on
 * a synthetic slice planted right here, never on shipped JSON. */

const SYNTH_STEM = "synthetic-invitation-law";

/** Registry stand-in: family + denomination per synthetic threat id. */
const SYNTH_META: Record<string, ForeignThreatMeta> = {
  "drizzle-scout": { family: "systemic", denomination: "bandwidth" },
  "mimic-tide": { family: "malicious", denomination: "bandwidth" },
  "ember-siege": { family: "entropic", denomination: "concurrency" },
  "quiet-sapper": { family: "systemic", denomination: "data-integrity" },
  "fold-parasite": { family: "human", denomination: "cash" },
};

const SYNTH_SLICE = {
  id: `waves/${SYNTH_STEM}`,
  waves: [
    // 1: ungated drizzle — lands under any law.
    { n: 1, parPct: 25, entries: [{ threat: "drizzle-scout", role: "Stealth", pressurePct: 100, band: "weather" }] },
    // 2: whole storm gated behind shield-station.
    { n: 2, parPct: 50, entries: [{ threat: "mimic-tide", role: "Mimic", pressurePct: 100, band: "storm" }] },
    // 3: mixed — ungated 60 + gated 40 (the engine's per-entry defer rides).
    {
      n: 3, parPct: 50, entries: [
        { threat: "drizzle-scout", role: "Stealth", pressurePct: 60, band: "weather" },
        { threat: "mimic-tide", role: "Mimic", pressurePct: 40, band: "storm" },
      ],
    },
    // 4: FIVE entries — over the §2.24 authoring cap (4). The foreign
    // adapter drops the cap; the seam re-enforces it.
    {
      n: 4, parPct: 60, entries: [
        { threat: "drizzle-scout", role: "Stealth", pressurePct: 20, band: "weather" },
        { threat: "mimic-tide", role: "Mimic", pressurePct: 20, band: "storm" },
        { threat: "ember-siege", role: "Siege", pressurePct: 20, band: "hunter" },
        { threat: "quiet-sapper", role: "Sapper", pressurePct: 20, band: "entropy" },
        { threat: "fold-parasite", role: "Parasite", pressurePct: 20, band: "storm" },
      ],
    },
  ],
};

/** The authored law: only shield-station invites mimic-tide. */
const SYNTH_LAW: ThreatInvitations = buildInvitations({ "shield-station": ["mimic-tide"] });
const SYNTH_BUILD: readonly BuildOp[] = [{ atTick: 36n, op: "build", buildableId: "shield-station" }];

function synthAuthority(extra?: Partial<CorpusAuthority>): CorpusAuthority {
  const base: CorpusAuthority = {
    slices: new Map([[SYNTH_STEM, SYNTH_SLICE]]),
    threatMeta: (threatId: string) => SYNTH_META[threatId],
  };
  return extra === undefined ? base : Object.freeze({ ...base, ...extra });
}

const synthTraffic = (waves: readonly number[], startMinute = 30): ScenarioCorpusTraffic =>
  Object.freeze({ profile: "corpus", tableId: SYNTH_STEM, waves, waveStartMinute: startMinute, baselineRatePerMin: 0 });

const J = (v: unknown) => JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? `${String(x)}n` : x));

/** Windows minus the additive `plan` field — the exact pre-gate shape, so
 *  the shipped witnesses can be re-asserted byte-for-byte after the seam. */
const withoutPlans = (windows: readonly CorpusWaveWindow[]) =>
  J(windows.map(({ plan: _plan, ...rest }) => rest));

describe("gateCorpusWave — the pure decision", () => {
  it("empty law gates nothing: spawns, no pools", () => {
    const plan = gateCorpusWave(2, ["mimic-tide", "drizzle-scout"], 42, buildInvitations({}), []);
    expect(plan.spawns).toBe(true);
    expect(plan.gatedThreatIds).toEqual([]);
    expect(plan.invitedThreatIds).toEqual([]);
    expect(plan.scheduledStartMinute).toBe(42);
  });

  it("law without a build excludes a whole gated storm", () => {
    const plan = gateCorpusWave(2, ["mimic-tide"], 42, SYNTH_LAW, []);
    expect(plan.gatedThreatIds).toEqual(["mimic-tide"]);
    expect(plan.invitedThreatIds).toEqual([]);
    expect(plan.spawns).toBe(false);
  });

  it("a build before the gate-time invites it in; a later build does not", () => {
    expect(gateCorpusWave(2, ["mimic-tide"], 42, SYNTH_LAW, SYNTH_BUILD).spawns).toBe(true);
    expect(gateCorpusWave(2, ["mimic-tide"], 30, SYNTH_LAW, SYNTH_BUILD).spawns).toBe(false);
  });

  it("one spawnable entry saves the storm; ids are deduped and sorted", () => {
    const plan = gateCorpusWave(3, ["mimic-tide", "drizzle-scout", "mimic-tide"], 54, SYNTH_LAW, []);
    expect(plan.spawns).toBe(true); // ungated drizzle always spawnable
    expect(plan.gatedThreatIds).toEqual(["mimic-tide"]); // dedup + code-unit sort
  });
});

describe("resolveCorpusWindows — invitation-gated storms on the synthetic slice", () => {
  it("default-off authority: every wave schedules, every plan is clear", () => {
    const windows = resolveCorpusWindows(synthTraffic([1, 2, 3]), BASE_SEED, synthAuthority());
    expect(windows.map((w) => w.waveN)).toEqual([1, 2, 3]);
    for (const w of windows) {
      expect(w.plan.spawns).toBe(true);
      expect(w.plan.gatedThreatIds).toEqual([]);
    }
  });

  it("whole-storm exclusion leaves no hole: [1,2,3] under law packs like [1,3]", () => {
    const law = synthAuthority({ invitations: SYNTH_LAW });
    const packed = resolveCorpusWindows(synthTraffic([1, 2, 3]), BASE_SEED, law);
    expect(packed.map((w) => w.waveN)).toEqual([1, 3]);
    const direct = resolveCorpusWindows(synthTraffic([1, 3]), BASE_SEED, law);
    expect(withoutPlans(packed)).toBe(withoutPlans(direct)); // same cursor, same dice
  });

  it("every cited storm uninvited ⇒ fail-loud, never a quiet season", () => {
    expect(() =>
      resolveCorpusWindows(synthTraffic([2]), BASE_SEED, synthAuthority({ invitations: SYNTH_LAW })),
    ).toThrow(/uninvited at the attack surface/);
  });

  it("the build invites the storm: fully-invited wave replays the authored envelope byte-ident", () => {
    const authored = resolveCorpusWindows(synthTraffic([1, 2]), BASE_SEED, synthAuthority());
    const invited = resolveCorpusWindows(
      synthTraffic([1, 2]),
      BASE_SEED,
      synthAuthority({ invitations: SYNTH_LAW, buildLog: SYNTH_BUILD }),
    );
    expect(withoutPlans(invited)).toBe(withoutPlans(authored)); // the content-lane promise
    const w2 = invited[1]!;
    expect(w2.plan.gatedThreatIds).toEqual(["mimic-tide"]);
    expect(w2.plan.invitedThreatIds).toEqual(["mimic-tide"]);
    expect(w2.plan.spawns).toBe(true);
  });

  it("mixed wave: included by its spawnable entry, deferred remainder reshapes the envelope", () => {
    const authored = resolveCorpusWindows(synthTraffic([3]), BASE_SEED, synthAuthority());
    const gated = resolveCorpusWindows(synthTraffic([3]), BASE_SEED, synthAuthority({ invitations: SYNTH_LAW }));
    expect(gated[0]!.plan.gatedThreatIds).toEqual(["mimic-tide"]);
    expect(gated[0]!.plan.spawns).toBe(true);
    expect(gated[0]!.startMinute).toBe(authored[0]!.startMinute);
    // The uninvited 40% share is deferred by the engine's own gateComposition.
    expect(String(gated[0]!.envelope.ratePerMin)).not.toBe(String(authored[0]!.envelope.ratePerMin));
    expect(BigInt(gated[0]!.envelope.ratePerMin)).toBeLessThan(BigInt(authored[0]!.envelope.ratePerMin));
  });

  it("retirement haunting: 60-tick lag keeps the storm in at 99, out at 100", () => {
    const log: readonly BuildOp[] = [
      { atTick: 10n, op: "build", buildableId: "shield-station" },
      { atTick: 40n, op: "remove", buildableId: "shield-station" },
    ];
    const geometry = (windowMinutes: number): CorpusGeometry =>
      Object.freeze({ windowMinutes, rampMin: 3, plateauMin: 3, decayMin: 2 });
    // wave 1 window 69 → wave 2 gates at 30+69=99 (< 40+60): haunted, in.
    const haunted = resolveCorpusWindows(
      synthTraffic([1, 2]), BASE_SEED,
      synthAuthority({ invitations: SYNTH_LAW, buildLog: log, geometry: geometry(69) }),
    );
    expect(haunted.map((w) => w.waveN)).toEqual([1, 2]);
    // window 70 → gates at exactly 100: the removal has settled, out.
    const gone = resolveCorpusWindows(
      synthTraffic([1, 2]), BASE_SEED,
      synthAuthority({ invitations: SYNTH_LAW, buildLog: log, geometry: geometry(70) }),
    );
    expect(gone.map((w) => w.waveN)).toEqual([1]);
  });

  it("composition cap: an over-cap wave throws naming the §2.24 law", () => {
    expect(() => resolveCorpusWindows(synthTraffic([4]), BASE_SEED, synthAuthority())).toThrow(
      /composes 5 threats .* caps a wave at 4/,
    );
  });

  it("gated resolution is pure: same inputs ×100, byte-ident plans", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 100; i += 1) {
      seen.add(J(resolveCorpusWindows(synthTraffic([1, 2, 3]), BASE_SEED,
        synthAuthority({ invitations: SYNTH_LAW, buildLog: SYNTH_BUILD }))));
    }
    expect(seen.size).toBe(1);
  });
});

/* ─────────── default-off byte-identity: the shipped witnesses ─────────── */

describe("the shipped metastable witnesses survive the gate (default-off)", () => {
  // Captured from resolveCorpusWindows BEFORE the invitation seam landed
  // (tip 16c6add, seed 904n) — envelopes and schedule re-asserted verbatim.
  const PRE_W1 =
    '[{"waveN":1,"startMinute":30,"windowMinutes":12,"envelope":{"tableId":"waves/g1-shared-web-first-quarter","role":"wave","shape":"ramp","ratePerMin":"204800n","telegraphed":true,"dominantFamily":"malicious"}}]';
  const PRE_W15 =
    '[{"waveN":1,"startMinute":30,"windowMinutes":12,"envelope":{"tableId":"waves/g1-shared-web-first-quarter","role":"wave","shape":"ramp","ratePerMin":"204800n","telegraphed":true,"dominantFamily":"malicious"}},{"waveN":5,"startMinute":42,"windowMinutes":12,"envelope":{"tableId":"waves/g1-shared-web-first-quarter","role":"wave","shape":"ramp","ratePerMin":"1966080n","telegraphed":false,"dominantFamily":"malicious"}}]';

  it("waves [1] strips to the pre-gate witness byte-for-byte; plan is clear", () => {
    const windows = resolveCorpusWindows(corpusTrafficOf("metastable-corpus"), BASE_SEED, corpusAuthority());
    expect(withoutPlans(windows)).toBe(PRE_W1);
    expect(windows[0]!.plan).toEqual({
      waveN: 1, scheduledStartMinute: 30, gatedThreatIds: [], invitedThreatIds: [], spawns: true,
    });
  });

  it("waves [1,5] stacks to the pre-gate witness byte-for-byte", () => {
    const stacked = resolveCorpusWindows({ ...corpusTrafficOf("metastable-corpus"), waves: [1, 5] }, BASE_SEED, corpusAuthority());
    expect(withoutPlans(stacked)).toBe(PRE_W15);
  });

  it("end-to-end through the runner: invited storm runs, uninvited citation fails pre-tick-1", () => {
    const toSynthetic = (wire: MutableWire) => {
      wire.traffic.tableId = SYNTH_STEM;
      wire.traffic.waves = [1, 2];
    };
    // The law alone starves wave 2; wave 1 still rides, so the run lives —
    // and with the build, both storms land on the very same clock. Full
    // 240-minute clock: the wave-1 storm opens at minute 30.
    const starved = runScenario(parseScenarioDoc((twinWire(toSynthetic) as unknown) as ScenarioWire), BASE_SEED, {
      corpus: synthAuthority({ invitations: SYNTH_LAW }),
    });
    expect(starved.trace.arrivals).toBeGreaterThan(0);
    expect(() =>
      runScenario(parseScenarioDoc((twinWire((w) => {
        w.traffic.tableId = SYNTH_STEM;
        w.traffic.waves = [2];
      }) as unknown) as ScenarioWire), BASE_SEED, { corpus: synthAuthority({ invitations: SYNTH_LAW }) }),
    ).toThrow(/uninvited at the attack surface/);
    const invited = runScenario(parseScenarioDoc((twinWire(toSynthetic) as unknown) as ScenarioWire), BASE_SEED, {
      corpus: synthAuthority({ invitations: SYNTH_LAW, buildLog: SYNTH_BUILD }),
    });
    expect(invited.trace.arrivals).toBeGreaterThan(starved.trace.arrivals);
  });
});

/* ─────────── the REAL attack-surface law over the shipped g1 quarter ─────────── */

describe("the real shared-web law gates the shipped quarter (wave-five join)", () => {
  // The shipped g1 slices carry NO invitation markers in their wave
  // entries — the law lives in the TYPE BUNDLE (packages/content/types/
  // shared-web.json threats.unlockedByBuildables) and joins the quarter by
  // threat-id. This block runs the gate over the REAL slice with the REAL
  // law: waves 1–2 are fully gated storms (scanner-drizzle behind
  // public-whois-listing; wp-login-brute-squad + hoarder-noisy-neighbor
  // behind the cpanel/wordpress buildables), so an unbuilt surface leaves
  // ONLY the ungated wave 3 — the packed-cursor law with the content's own
  // numbers, not a synthetic stand-in.
  const law = buildInvitations(sharedWebInvitationLaw());
  const slice = (corpusAuthority().slices.get(SHIPPED_G1_SLICE_STEM) as unknown) as {
    waves: { n: number; entries: { threat: string }[] }[];
  };
  const threatsOf = (waveN: number): string[] =>
    (slice.waves.find((w) => w.n === waveN)?.entries ?? []).map((e) => e.threat);

  it("the law is on disk: three gated storms the quarter can no longer open with", () => {
    expect(threatsOf(1)).toEqual(["scanner-drizzle"]);
    // Wave 2 is fully gated; wave 3 is the first fully-ungated storm.
    expect(gateCorpusWave(2, threatsOf(2), 30, law, []).spawns).toBe(false);
    expect(gateCorpusWave(3, threatsOf(3), 30, law, []).spawns).toBe(true);
  });

  it("waves [1,2,3] under the bare law schedule ONLY wave 3 — the storm season the unbuilt surface gets", () => {
    const gated = resolveCorpusWindows(
      { ...corpusTrafficOf("metastable-corpus"), waves: [1, 2, 3] },
      BASE_SEED,
      { ...corpusAuthority(), invitations: law },
    );
    // One window lands, and it carries WAVE 3's identity — the excluded
    // storms leave no cursor hole, so 3 rides the cursor 1 would have had:
    // byte-ident to a bare [3] citation on the law-free authority.
    expect(gated.length).toBe(1);
    expect(gated[0]?.waveN).toBe(3);
    const solo = resolveCorpusWindows(
      { ...corpusTrafficOf("metastable-corpus"), waves: [3] },
      BASE_SEED,
      corpusAuthority(),
    );
    expect(withoutPlans(gated)).toBe(withoutPlans(solo));
    expect(gated[0]?.startMinute).toBe(solo[0]?.startMinute);
    // The gated plans say WHY: wave 1 names scanner-drizzle, wave 2 its pair.
    const plans = resolveCorpusWindows(
      { ...corpusTrafficOf("metastable-corpus"), waves: [1, 2, 3] },
      BASE_SEED,
      { ...corpusAuthority(), invitations: law, buildLog: FULL_BUILD_LOG },
    );
    expect(plans.map((w) => w.waveN)).toEqual([1, 2, 3]);
    expect(plans[0]?.plan?.gatedThreatIds).toEqual(["scanner-drizzle"]);
    expect(plans[1]?.plan?.invitedThreatIds).toEqual(["hoarder-noisy-neighbor", "wp-login-brute-squad"]);
    expect(plans[2]?.plan?.gatedThreatIds).toEqual([]); // wave 3 was never gated
  });

  it("fully built surface replays the AUTHORED quarter byte-ident (default-off honesty)", () => {
    const plain = resolveCorpusWindows(
      { ...corpusTrafficOf("metastable-corpus"), waves: [1, 2, 3] },
      BASE_SEED,
      corpusAuthority(),
    );
    const invited = resolveCorpusWindows(
      { ...corpusTrafficOf("metastable-corpus"), waves: [1, 2, 3] },
      BASE_SEED,
      { ...corpusAuthority(), invitations: law, buildLog: FULL_BUILD_LOG },
    );
    // Same dice, same cursor, same envelopes — the gate only decides
    // WHETHER a storm lands; when every storm is invited it changes nothing.
    expect(withoutPlans(invited)).toBe(withoutPlans(plain));
  });

  it("end-to-end through the runner: the shipped twin under the bare law starves to its wave-3 citation", () => {
    // The SHIPPED metastable-corpus doc cites waves [1] — a fully gated
    // storm. Under the bare law that citation resolves to NOTHING, and
    // the run fails loud pre-tick-1 (never a quiet season by accident);
    // with the whois listing built, the authored storm lands and the run
    // matches the plain-authority witness.
    const starved = twinWire((w) => {
      w.traffic.waves = [2]; // wave 2: fully gated, cites real content
    });
    expect(() =>
      runScenario(parseScenarioDoc(starved as unknown as ScenarioWire), BASE_SEED, {
        corpus: { ...invitedCorpusAuthority(), buildLog: [] },
      }),
    ).toThrow(/uninvited at the attack surface/);
    const built = runScenario(parseScenarioDoc(twinWire() as unknown as ScenarioWire), BASE_SEED, {
      corpus: { ...invitedCorpusAuthority(), buildLog: FULL_BUILD_LOG },
    });
    const plain = runScenario(shippedScenario("metastable-corpus"), BASE_SEED, {
      corpus: corpusAuthority(),
    });
    expect(reportIdentity(built)).toBe(reportIdentity(plain)); // wave 1 invited = authored byte-ident
  });
});
