/**
 * versus/match tests: full async resolution — determinism (×100
 * byte-identical finalDigest via the replay createHarness pattern),
 * cross-seed divergence, non-triviality (counters > 0 on BOTH arms),
 * weights-as-data scoring, reserve-intent door execution, and the OD pin:
 * getActiveScorecard/resolveActiveSheet must appear NOWHERE in the lane.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { asMoney, asRunSeed, asRuleId, type ExternalIntent, type PolicyCard } from "../../types.ts";
import { digestState } from "../../pipeline/index.ts";
import { createHarness } from "../../replay/index.ts";
import type { StampedIntent } from "../../replay/index.ts";
import type { ReplayContentHashes } from "../../types.ts";
import { cardContentFingerprint, createVersusRunner, defaultPolicyCardIndex, initialVersusRunState, versusRuleBookHash, pickDecisiveWave, threatFromWaveUnitId, type PerWaveOutcome, type VersusMatchConfig, type VersusReserveIntent, type VersusRunState } from "../match.ts";
import { fromInt, fromRatio } from "../../kernel/fixed.ts";
import { deckToWaveTable, resolveVersusMatch, scoreVersusMatch, stampReserveIntents } from "../match.ts";
import { parseDefenseDeck, feintBudgetViolations, VersusError } from "../deck.ts";
import { AFFIX_WAVE_DELTAS, foldShapePermille, foldWindowMinutes } from "../affixes.ts";
import type { MatchScoringWeights } from "../match.ts";
import { commitDeck } from "../commit.ts";
import {
  CENSUS,
  GAUGE_CARD,
  RAW_DECK_MAIN,
  RAW_DECK_WIDE,
 VERSUS_DEFENDER,
  VERSUS_PRESSURE,
  matchConfig,
  parseDeck,
  versusSeed,
} from "./fixtures.ts";

const HORIZON = 140;
const HARNESS_TICKS = 36n;

const REPLAY_HASHES: ReplayContentHashes = Object.freeze({
  rulesetCardHashes: Object.freeze({}),
  sheetsHash: "hh-versus-test-sheets",
  ruleBookHash: "hh-versus-test-book",
});

function laneSource(name: string): string {
  return readFileSync(join(process.cwd(), "src", "versus", name), "utf8");
}

describe("resolveVersusMatch — one full async resolution", () => {
  const result = resolveVersusMatch({
    seed: versusSeed(4242n),
    deck: parseDeck(RAW_DECK_MAIN),
    census: CENSUS,
    tableId: "versus-live",
    typeBundleId: "shared-web",
    defender: {
      engineVersion: "versus-test-1",
      sheetsHash: "hh-versus-test-sheets",
      ruleBook: [GAUGE_CARD],
      nodes: [
        { id: "edge", slots: 4, serviceTimeUs: 10_000_000n, inspectionDepth: "pass-through", dependencyId: null },
        { id: "origin", slots: 3, serviceTimeUs: 20_000_000n, inspectionDepth: "challenge", dependencyId: "edge" },
      ],
      routing: { expressPath: ["edge", "origin"], deepPath: ["edge", "origin"] },
      buildables: ["waf", "cache"],
      handCapacity: 2,
      reserveIntents: [
        { tick: 5, intent: { verb: "place-device", nodeId: "edge", deviceKind: "waf" } },
        { tick: 7, intent: { verb: "policy-card-commit", cardHash: GAUGE_CARD.id } },
        { tick: 9, intent: { verb: "place-device", nodeId: "edge", deviceKind: "flux-capacitor" } },
        { tick: 20, intent: { verb: "configure-node", nodeId: "edge", shedOrder: "lowest-value-first" } },
      ],
      doctrineGauge: { nodeId: "edge", metric: "incoming" },
      detectionRatio: fromRatio(7n, 10n),
      falsePositiveRatio: fromRatio(25n, 100n),
    },
    pressure: VERSUS_PRESSURE,
    unitsPerPressurePoint: 2,
    patienceMinutes: 10,
    matchTicks: HORIZON,
    customerBaseline: { tableId: "versus-crowd", unitsPerMinute: 2 },
  });

  test("counters > 0 on BOTH arms — a zero-resolving match is a dead gate", () => {
    expect(result.totals.blocked, "attack arm blocked").toBeGreaterThan(0);
    expect(result.totals.landed, "attack arm landed").toBeGreaterThan(0);
    expect(result.totals.served, "customer arm served").toBeGreaterThan(0);
    expect(result.totals.falsePositive, "customer arm false-positive").toBeGreaterThan(0);
  });

  test("eight timed wave rows + baseline, every wave saw traffic", () => {
    const waveRows = result.perWaveOutcomes.filter((row) => row.waveN !== null && row.label !== "unattributed");
    expect(waveRows).toHaveLength(8);
    expect(result.perWaveOutcomes.some((row) => row.label === "baseline")).toBe(true);
    // Honest bookkeeping: matured re-entries that overflow-bounce in their
    // OWN mint tick are unlabelable from outside the driver (no arrival
    // event, pruned before the sweep) — they land in "unattributed", which
    // may exist but must never swallow wave traffic.
    for (const row of waveRows) {
      expect(row.waveN).not.toBeNull();
      expect(row.served + row.blocked + row.falsePositive + row.landed).toBeGreaterThan(0);
    }
  });

  test("finalDigest is the pipeline digestState shape (32 hex)", () => {
    expect(result.finalDigest).toMatch(/^[0-9a-f]{32}$/);
  });

  test("decisive wave is a real 1..8 and the attribution reads like a sentence", () => {
    expect(result.decisiveWaveN).toBeGreaterThanOrEqual(1);
    expect(result.decisiveWaveN).toBeLessThanOrEqual(8);
    expect(result.attribution.startsWith(`Wave ${result.decisiveWaveN}:`)).toBe(true);
    expect(result.attributionCauseId).toContain("versus-live");
  });

  test("weights are DATA: two weight records → two scores", () => {
    const harsh: MatchScoringWeights = {
      landedValue: -500_000_000n,
      blockedValue: 1n,
      servedValue: 1n,
      falsePositivePenalty: -1n,
    };
    const forgiving: MatchScoringWeights = {
      landedValue: -1n,
      blockedValue: 100n,
      servedValue: 100n,
      falsePositivePenalty: -100n,
    };
    const a = scoreVersusMatch(result.totals, harsh);
    const b = scoreVersusMatch(result.totals, forgiving);
    expect(a).not.toBe(b);
    expect(a).toBe(BigInt(result.totals.landed) * -500_000_000n + BigInt(result.totals.blocked + result.totals.served) + BigInt(-1) * BigInt(result.totals.falsePositive));
  });

  test("the doctrine autopilot really fired cards (rule phase ran)", () => {
    expect(result.ruleFirings).toBeGreaterThan(0);
  });
});

describe("resolveVersusMatch — determinism (replay createHarness pattern)", () => {
  const config: VersusMatchConfig = {
    seed: versusSeed(4242n),
    deck: parseDeck(RAW_DECK_MAIN),
    census: CENSUS,
    tableId: "versus-harness",
    typeBundleId: "shared-web",
    defender: {
      engineVersion: "versus-test-1",
      sheetsHash: "hh-versus-test-sheets",
      ruleBook: [GAUGE_CARD],
      nodes: [
        { id: "edge", slots: 4, serviceTimeUs: 10_000_000n, inspectionDepth: "pass-through", dependencyId: null },
        { id: "origin", slots: 3, serviceTimeUs: 20_000_000n, inspectionDepth: "challenge", dependencyId: "edge" },
      ],
      routing: { expressPath: ["edge", "origin"], deepPath: ["edge", "origin"] },
      buildables: ["waf", "cache"],
      handCapacity: 2,
      reserveIntents: [
        { tick: 5, intent: { verb: "place-device", nodeId: "edge", deviceKind: "waf" } },
        { tick: 9, intent: { verb: "place-device", nodeId: "edge", deviceKind: "flux-capacitor" } },
      ],
      doctrineGauge: { nodeId: "edge", metric: "incoming" },
    },
    pressure: VERSUS_PRESSURE,
    matchTicks: Number(HARNESS_TICKS),
    customerBaseline: { tableId: "versus-crowd", unitsPerMinute: 4 },
  };

  test("×100 harness replays of the committed match land on ONE finalDigest", () => {
    const harness = createHarness<VersusRunState>({
      runner: createVersusRunner(config),
      initialState: initialVersusRunState(config),
      runSeed: config.seed,
      engineVersion: config.defender.engineVersion,
      contentHashes: REPLAY_HASHES,
      totalTicks: HARNESS_TICKS,
      snapshotEveryTicks: 12n,
      checkpointEveryTicks: 6n,
      embedState: false,
      digest: (state) => digestState(state.game),
      intents: stampReserveIntents(config.defender.reserveIntents ?? []) as readonly unknown[] as readonly StampedIntent[],
    });
    const doc = harness.capture();
    const digests = harness.replayDigests(100, doc);
    expect(digests).toHaveLength(100);
    expect(new Set(digests).size).toBe(1);
    expect(digests[0]).toMatch(/^[0-9a-f]{32}$/);
    // cross-seam agreement: the harness pin equals the live resolution digest
    expect(digests[0]).toBe(resolveVersusMatch(config).finalDigest);
  });

  test("two fresh resolutions byte-match (independent of the harness)", () => {
    const a = resolveVersusMatch(config);
    const b = resolveVersusMatch(config);
    expect(a.finalDigest).toBe(b.finalDigest);
    expect(a.matchScore).toBe(b.matchScore);
    expect(a.attribution).toBe(b.attribution);
    expect(a.perWaveOutcomes).toEqual(b.perWaveOutcomes);
  });

  test("cross-seed divergence: a different run seed changes the digest", () => {
    const baseline = resolveVersusMatch(config);
    const other = resolveVersusMatch({ ...config, seed: versusSeed(777n) });
    expect(other.finalDigest).not.toBe(baseline.finalDigest);
  });
});

describe("versus lane — OD-1/OD-2 pin (weights are data, never a scorecard)", () => {
  const SOURCES = ["deck.ts", "affixes.ts", "draft.ts", "commit.ts", "match.ts", "index.ts"];

  test("getActiveScorecard / resolveActiveSheet appear NOWHERE in src/versus", () => {
    for (const name of SOURCES) {
      const text = laneSource(name);
      expect(text, name).not.toContain("getActiveScorecard");
      expect(text, name).not.toContain("resolveActiveSheet");
    }
  });

  test("the lane never imports economy (structural version of the same pin)", () => {
    for (const name of SOURCES) {
      expect(laneSource(name), name).not.toContain('"../economy');
    }
  });
});

describe("review pins — conservation and the honest unattributed floor", () => {
  // Saturation probe (reviewer config shape): tight patience + heavy crowd
  // makes every matured re-entry bounce in its OWN mint tick — pruned
  // before any sweep sees it, with no arrival event to label it. Those
  // terminals are the honest floor: unlabelable from outside the driver.
  const COLUMNS = ["served", "blocked", "falsePositive", "landed"] as const;

  for (const seed of [4242n, 777n, 904n]) {
    test(`seed ${seed}: totals are the exact column-wise sum of the rows`, () => {
      const result = resolveVersusMatch(matchConfig({ seed: versusSeed(seed), matchTicks: 140 }));
      for (const column of COLUMNS) {
        const rowSum = result.perWaveOutcomes.reduce((total, row) => total + row[column], 0);
        expect(result.totals[column], `totals.${column}`).toBe(rowSum);
      }
    });

    test(`seed ${seed}: the unattributed row exists at its honest floor — all blocked, never a wave's traffic`, () => {
      const result = resolveVersusMatch(matchConfig({ seed: versusSeed(seed), matchTicks: 140 }));
      const stray = result.perWaveOutcomes.find((row) => row.label === "unattributed");
      expect(stray, "saturation probe must reproduce the mint-tick-bounce floor").toBeDefined();
      expect(stray?.waveN).toBeNull();
      expect(stray!.blocked).toBeGreaterThan(0);
      // Fingerprint from the forensic sweep: every floored terminal is a
      // retry child killed while blocked — the other columns stay empty.
      expect(stray!.served).toBe(0);
      expect(stray!.landed).toBe(0);
      expect(stray!.falsePositive).toBe(0);
      // wave traffic is never swallowed: every wave row carries terminals
      for (const row of result.perWaveOutcomes.filter((r) => r.waveN !== null)) {
        expect(row.served + row.blocked + row.falsePositive + row.landed).toBeGreaterThan(0);
      }
    });
  }
});

/* ═══════════════════ I-P V-2 — affixes are LIVE in the sim ═══════════════════
 * This describe INVERTS the former "review pins — affixes are inert in the
 * sim, live on the wire" block (2026-10-17, owner ruling "max features").
 * The inertness law is dead: every live slug now moves named fields of the
 * converted table. Each differential compares a deck against the IDENTICAL
 * plain base (RAW_DECK_MAIN with both original affixes stripped), so the
 * diff-path census IS the slug's semantic footprint. Slug 12 stays
 * data-only by law and its byte-identity is the pin that proves it.
 */

/** RAW_DECK_MAIN with every affix field removed — the per-slug baseline. */
const PLAIN_BASE = Object.freeze({
  id: RAW_DECK_MAIN.id,
  budgetBps: RAW_DECK_MAIN.budgetBps,
  entries: RAW_DECK_MAIN.entries.map((entry) => Object.freeze({
    threatId: entry.threatId,
    weightBps: entry.weightBps,
    costBps: entry.costBps,
  })),
});

/** RAW_DECK_MAIN with per-threat affixes replaced (undefined = stripped). */
function baseWith(affixes: Readonly<Record<string, string | undefined>>): unknown {
  return deckWith(RAW_DECK_MAIN, affixes);
}

/** Any raw deck with per-threat affixes replaced (undefined = stripped). */
function deckWith(
  raw: { readonly id: string; readonly budgetBps: number; readonly entries: readonly { readonly threatId: string; readonly weightBps: number; readonly costBps: number }[] },
  affixes: Readonly<Record<string, string | undefined>>,
): unknown {
  return Object.freeze({
    id: raw.id,
    budgetBps: raw.budgetBps,
    entries: Object.freeze(raw.entries.map((entry) => {
      const affix = affixes[entry.threatId];
      const stripped = Object.freeze({
        threatId: entry.threatId,
        weightBps: entry.weightBps,
        costBps: entry.costBps,
      });
      return affix === undefined ? stripped : Object.freeze({ ...stripped, affix });
    })),
  });
}

/** Dotted JSON-path census of every leaf that differs between two values. */
function diffPaths(a: unknown, b: unknown, prefix = ""): string[] {
  if (Object.is(a, b)) return [];
  if (Array.isArray(a) && Array.isArray(b)) {
    const out: string[] = [];
    for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
      out.push(...diffPaths(a[i], b[i], `${prefix}[${i}]`));
    }
    return out;
  }
  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    const keys = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
    return keys.flatMap((key) => diffPaths((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], prefix === "" ? key : `${prefix}.${key}`));
  }
  return [prefix];
}

const slugOpts = { census: CENSUS, tableId: "versus-affix-live", typeBundleId: "shared-web" };

/** Plain base vs slowloris-sipper (the lone occupant of wave 8) affixed. */
function slugDiff(affix: string): { readonly paths: readonly string[]; readonly table: ReturnType<typeof deckToWaveTable>["table"] } {
  const table = deckToWaveTable(parseDeck(baseWith({ "slowloris-sipper": affix })), slugOpts).table;
  const base = deckToWaveTable(parseDeck(PLAIN_BASE), slugOpts).table;
  return { paths: Object.freeze(diffPaths(base, table)), table };
}

describe("I-P V-2 — affix semantics live in the converter (INVERTED inertness pins)", () => {
  test("low-slow doubles its wave's window — exactly one field moves", () => {
    const { paths, table } = slugDiff("low-slow");
    expect(paths).toEqual(["waves[7].windowMinutes"]);
    const wave = table.waves[7];
    expect(wave?.windowMinutes).toBe(24);
    expect(wave?.rampMin).toBe(4); // profile legs untouched by a window-only delta
  });

  test("bounded halves the window AND rescales the profile to fit (parse-door law)", () => {
    const { paths, table } = slugDiff("bounded");
    // 12→6 shrinks under the 4+4+4 profile sum — the legs rescale
    // proportionally (floor ramp/decay, plateau absorbs the remainder).
    expect(paths).toEqual([
      "waves[7].decayMin", "waves[7].plateauMin",
      "waves[7].rampMin", "waves[7].windowMinutes",
    ]);
    expect(table.waves[7]).toMatchObject({ windowMinutes: 6, rampMin: 2, plateauMin: 2, decayMin: 2 });
  });

  test("distributed is targets-everywhere — the converter's BASE shape; v0 delta asserts only", () => {
    // §2.13 promises "hits every target at once". The converter always
    // handed every entry the full committed targets pool, so distributed
    // cannot DIFFER from the base — its law is that it STAYS pinned to the
    // pool even if the base default ever narrows. With a multi-target pool
    // both arms carry every target; the semantic holds without a diff path.
    const multi = Object.freeze({ ...slugOpts, targets: Object.freeze(["origin", "edge"]) });
    const table = deckToWaveTable(parseDeck(baseWith({ "slowloris-sipper": "distributed" })), multi).table;
    for (const entry of table.waves[7]?.entries ?? []) {
      expect(entry.targets).toEqual(["origin", "edge"]);
    }
    expect(diffPaths(deckToWaveTable(parseDeck(PLAIN_BASE), multi).table, table)).toEqual([]);
  });

  test("encrypted overrides the band to hunter — exactly one field moves", () => {
    const { paths, table } = slugDiff("encrypted");
    expect(paths).toEqual(["waves[7].entries[0].band"]);
    expect(table.waves[7]?.entries[0]?.band).toBe("hunter");
  });

  test("adaptive overrides the band to entropy (director budget factor rides the band)", () => {
    const { paths, table } = slugDiff("adaptive");
    expect(paths).toEqual(["waves[7].entries[0].band"]);
    expect(table.waves[7]?.entries[0]?.band).toBe("entropy");
  });

  test("timed tail-leans the profile [92,4,4] onto the effective window", () => {
    const { paths, table } = slugDiff("timed");
    expect(paths).toEqual(["waves[7].decayMin", "waves[7].plateauMin", "waves[7].rampMin"]);
    expect(table.waves[7]).toMatchObject({ rampMin: 11, plateauMin: 1, decayMin: 0 });
  });

  test("a shape contributor OWNS the profile — host ramp/plateau/decay options lose to it", () => {
    const opts = Object.freeze({ ...slugOpts, rampMinutes: 6, plateauMinutes: 3, decayMinutes: 3 });
    const table = deckToWaveTable(parseDeck(baseWith({ "slowloris-sipper": "timed" })), opts).table;
    expect(table.waves[7]).toMatchObject({ rampMin: 11, plateauMin: 1, decayMin: 0 });
    // …while a WINDOW-only contributor still honors the host options:
    const plainish = deckToWaveTable(parseDeck(baseWith({ "slowloris-sipper": "low-slow" })), opts).table;
    expect(plainish.waves[7]).toMatchObject({ windowMinutes: 24, rampMin: 6, plateauMin: 3, decayMin: 3 });
  });

  test("piggyback: weather band + mid-heaviest [17,66,17] profile", () => {
    const { paths, table } = slugDiff("piggyback");
    expect(paths).toEqual([
      "waves[7].decayMin", "waves[7].entries[0].band",
      "waves[7].plateauMin", "waves[7].rampMin",
    ]);
    expect(table.waves[7]?.entries[0]?.band).toBe("weather");
    expect(table.waves[7]).toMatchObject({ rampMin: 2, plateauMin: 8, decayMin: 2 });
  });

  test("mimic: weather band + full targets pool — distinct tuple from piggyback", () => {
    const { paths, table } = slugDiff("mimic");
    expect(paths).toEqual(["waves[7].entries[0].band"]);
    expect(table.waves[7]?.entries[0]?.band).toBe("weather");
    // distinctness law (§2.13 mix-ins differ): mimic ≠ piggyback ≠ distributed
    expect(AFFIX_WAVE_DELTAS.mimic).not.toEqual(AFFIX_WAVE_DELTAS.piggyback);
    expect(AFFIX_WAVE_DELTAS.mimic).not.toEqual(AFFIX_WAVE_DELTAS.distributed);
  });

  test("persistent: wave secondIncident flag + rules multipliers 1.8/2.5 (no feints key)", () => {
    const { paths, table } = slugDiff("persistent");
    expect(paths).toEqual(["rules", "waves[7].secondIncident"]);
    expect(table.waves[7]?.secondIncident).toBe(true);
    expect(table.rules?.secondIncidentMultiplierDuringIncident).toBe(1.8);
    expect(table.rules?.secondIncidentMultiplierDuringRecovery).toBe(2.5);
    expect(table.rules?.feints).toBeUndefined();
  });

  test("off-hours-only folds the SAME tail-lean as timed (roster half is §4.7 unbuilt)", () => {
    expect(diffPaths(
      slugDiff("off-hours-only").table,
      slugDiff("timed").table,
    )).toEqual([]);
    expect(slugDiff("off-hours-only").paths).toEqual(slugDiff("timed").paths);
  });

  test("ramped: pure rising profile [100,0,0]", () => {
    const { paths, table } = slugDiff("ramped");
    expect(paths).toEqual(["waves[7].decayMin", "waves[7].plateauMin", "waves[7].rampMin"]);
    expect(table.waves[7]).toMatchObject({ rampMin: 12, plateauMin: 0, decayMin: 0 });
  });

  test("targeted-at-one-customer: head of the targets pool (single pool ⇒ inert by shape)", () => {
    expect(slugDiff("targeted-at-one-customer").paths).toEqual([]);
    const multi = Object.freeze({ ...slugOpts, targets: Object.freeze(["origin", "edge"]) });
    const table = deckToWaveTable(parseDeck(baseWith({ "slowloris-sipper": "targeted-at-one-customer" })), multi).table;
    const base = deckToWaveTable(parseDeck(PLAIN_BASE), multi).table;
    expect(diffPaths(base, table)).toEqual(["waves[7].entries[0].targets[1]"]);
    expect(table.waves[7]?.entries[0]?.targets).toEqual(["origin"]);
  });

  test("piggybacked-on-a-maintenance-window: DATA-ONLY — byte-identical table, hash still binds", () => {
    const affix = "piggybacked-on-a-maintenance-window" as const;
    const table = deckToWaveTable(parseDeck(baseWith({ "slowloris-sipper": affix })), slugOpts).table;
    const base = deckToWaveTable(parseDeck(PLAIN_BASE), slugOpts).table;
    expect(JSON.stringify(table)).toBe(JSON.stringify(base));
    // The wire + cost law holds even while the sim ignores it (V-1):
    const spiced = commitDeck(parseDeck(baseWith({ "slowloris-sipper": affix }))).deckHash;
    const plain = commitDeck(parseDeck(PLAIN_BASE)).deckHash;
    expect(spiced).not.toBe(plain);
    expect(AFFIX_WAVE_DELTAS[affix].live).toBe(false);
  });

  test("two-stage: wave feint flag + rules.feints block (no SI key)", () => {
    const { paths, table } = slugDiff("two-stage");
    expect(paths).toEqual(["rules", "waves[7].feint"]);
    expect(table.waves[7]?.feint).toBe(true);
    expect(table.rules?.feints).toEqual({ maxPerLevel: 1, neverTwoLevelsInRow: true, namedInPostmortem: true });
    expect(table.rules?.secondIncidentMultiplierDuringIncident).toBeUndefined();
  });

  test("rate-shaped: 75%-cut share with +1-per-point renormalization to the non-cut entries", () => {
    // wave 1 carries scanner-drizzle(50) xmlrpc-pingback-amplifier(30)
    // mod-update-day(20); cut scanner: 50→37, surplus 13 goes code-unit
    // order mod-update-day first: +7 → 27, xmlrpc +6 → 36. Σ100 holds.
    const table = deckToWaveTable(parseDeck(baseWith({ "scanner-drizzle": "rate-shaped" })), slugOpts).table;
    const base = deckToWaveTable(parseDeck(PLAIN_BASE), slugOpts).table;
    expect(diffPaths(base, table)).toEqual([
      "waves[0].entries[0].sharePct", "waves[0].entries[1].sharePct", "waves[0].entries[2].sharePct",
    ]);
    const shares = (table.waves[0]?.entries ?? []).map((entry) => entry.sharePct);
    expect(shares).toEqual([37, 36, 27]);
    expect(shares.reduce((a, b) => a + b, 0)).toBe(100);
  });

  test("rate-shaped alone in a wave is INERT — the all-cut surplus has nowhere lawful to go", () => {
    expect(slugDiff("rate-shaped").paths).toEqual([]);
  });

  test("diurnal: bell profile [25,50,25] (peak-tracking half unbuilt — gap-note)", () => {
    const { paths, table } = slugDiff("diurnal");
    expect(paths).toEqual(["waves[7].decayMin", "waves[7].plateauMin", "waves[7].rampMin"]);
    expect(table.waves[7]).toMatchObject({ rampMin: 3, plateauMin: 6, decayMin: 3 });
  });

  test("THE DISCIPLINE LAW: a fully plain deck's table omits every V-2 key", () => {
    // (the frozen-literal half of this law lives in schedule.test — the
    // byte-comparison discipline has always had its home there)
    const table = deckToWaveTable(parseDeck(PLAIN_BASE), slugOpts).table;
    expect("rules" in table).toBe(false);
    for (const wave of table.waves) {
      expect("feint" in wave).toBe(false);
      expect("secondIncident" in wave).toBe(false);
    }
  });

  test("the FULL match moves: spiced MAIN vs plain MAIN diverge (digest literal NOT pinned)", () => {
    // low-slow doubles wave 8's window; wave 8 opens at tick 2+7×12=86, so
    // the divergence needs the full 140-tick horizon to reach the digest.
    const spiced = resolveVersusMatch(matchConfig({ deck: parseDeck(RAW_DECK_MAIN), matchTicks: 140 }));
    const plain = resolveVersusMatch(matchConfig({ deck: parseDeck(PLAIN_BASE), matchTicks: 140 }));
    expect(spiced.finalDigest).not.toBe(plain.finalDigest);
    // both arms still resolve law-clean with traffic:
    for (const result of [spiced, plain]) {
      expect(result.perWaveOutcomes.some((row) => row.served + row.blocked + row.landed + row.falsePositive > 0)).toBe(true);
    }
  }, 30_000);

  test("the affixes still bind in the commit hash (carried forward from the V-1 pins)", () => {
    const spiced = commitDeck(parseDeck(RAW_DECK_MAIN)).deckHash;
    const plain = commitDeck(parseDeck(PLAIN_BASE)).deckHash;
    expect(spiced).not.toBe(plain);
  });
});

describe("I-P V-2 — collision folds (deterministic total)", () => {
  test("window scales MULTIPLY in slot order: two low-slow faces on one wave ×4", () => {
    // scanner-drizzle and mod-update-day share wave 1 (slot order:
    // scanner, xmlrpc, mod) — 12 → 24 → 48, no clamp in range.
    const table = deckToWaveTable(parseDeck(baseWith({
      "scanner-drizzle": "low-slow",
      "mod-update-day": "low-slow",
    })), slugOpts).table;
    expect(table.waves[0]?.windowMinutes).toBe(48);
  });

  test("window fold clamps at [1, 96] — bounded×4 floor to 1, low-slow×6 pins 96", () => {
    expect(foldWindowMinutes(12, [50, 50, 50, 50])).toBe(1);
    expect(foldWindowMinutes(12, Array.from({ length: 6 }, () => 200))).toBe(96);
    expect(foldWindowMinutes(12, [])).toBe(12); // empty ⇒ identity (byte-identity leg)
  });

  test("shape triples fold element-wise MAX: diurnal ⊔ piggyback = [25,66,25]", () => {
    // scanner-drizzle and xmlrpc-pingback-amplifier share MAIN wave 1;
    // their shape contributors fold to one profile for the wave.
    const table = deckToWaveTable(parseDeck(baseWith({
      "scanner-drizzle": "diurnal",
      "xmlrpc-pingback-amplifier": "piggyback",
    })), slugOpts).table;
    const wave = table.waves[0];
    // MAX([25,50,25],[17,66,17]) = [25,66,25] → Σ116: ramp floor(12×25/116)=2,
    // decay floor(12×25/116)=2, plateau 8.
    expect(wave).toMatchObject({ rampMin: 2, plateauMin: 8, decayMin: 2 });
    // bands stay per-entry (piggyback weather on xmlrpc; diurnal carries no
    // bandOverride so scanner keeps its census band):
    expect(wave?.entries[1]?.band).toBe("weather");
  });

  test("shape fold MAX is commutative by construction (element-wise)", () => {
    expect(foldShapePermille([[25, 50, 25], [17, 66, 17]]))
      .toEqual(foldShapePermille([[17, 66, 17], [25, 50, 25]]));
    expect(foldShapePermille([])).toBeNull();
  });

  test("feint flags OR within a wave — one flag, one decoy", () => {
    // WIDE wave 1 carries four singleton threats (fill-cycling does not
    // repeat them elsewhere) — the pair stays on exactly one wave.
    const table = deckToWaveTable(parseDeck(deckWith(RAW_DECK_WIDE, {
      "scanner-drizzle": "two-stage",
      "layer7-mimic": "two-stage",
    })), slugOpts).table;
    const feinted = table.waves.filter((wave) => wave.feint === true);
    expect(feinted.length).toBe(1);
    expect(feinted[0]?.n).toBe(1);
    expect(table.waves.filter((wave) => wave.secondIncident === true).length).toBe(0);
  });
});

describe("I-P V-2 — feint-budget deck law + storm-cap door", () => {
  test("two live two-stage faces on DIFFERENT waves refuse as schedule.feint-budget", () => {
    expect(() => deckToWaveTable(parseDeck(baseWith({
      "scanner-drizzle": "two-stage",   // wave 1
      "slowloris-sipper": "two-stage",  // wave 8
    })), slugOpts))
      .toThrow(/schedule\.feint-budget|FEINT_BUDGET_EXCEEDED|feint budget/);
  });

  test("the same-wave two-stage PAIR is legal (one flag) — refusal is schedule-shaped, not count-shaped", () => {
    // Same witnesses as the feint-OR test: WIDE wave 1's two singleton
    // threats. Count = 2 entries, distinct feint waves = 1 → legal.
    expect(() => deckToWaveTable(parseDeck(deckWith(RAW_DECK_WIDE, {
      "scanner-drizzle": "two-stage",
      "layer7-mimic": "two-stage",
    })), slugOpts)).not.toThrow();
  });

  test("feintBudgetViolations is pure data (legality-as-Data precedent)", () => {
    expect(feintBudgetViolations([])).toEqual([]);
    expect(feintBudgetViolations([4, 4])).toEqual([]); // same wave, repeated: legal
    const rows = feintBudgetViolations([8, 1]);        // unsorted in
    expect(rows.length).toBe(1);
    expect(rows[0]?.code).toBe("FEINT_BUDGET_EXCEEDED");
    expect(rows[0]?.detail).toContain("[1, 8]");      // sorted in the detail
  });

  test("storm witness: a persistent wave whose body+follow-on breaches D-7 PROPAGATES the parse door verbatim", () => {
    // wp-login-brute-squad occupies wave 7 (par 70% — the peak face). At
    // 3 units/pressure point the flagged body ≈ 711/min plus its 1.5×
    // follow-on crosses 1024; the SAME deck without persistent converts
    // clean — the throw is affix-caused, the door is the waves parser's,
    // NOT re-wrapped (the affix that breaks the cap is refused exactly
    // like an authored wave that breaks the cap).
    const armed = baseWith({ "wp-login-brute-squad": "persistent" });
    const stormOpts = Object.freeze({ ...slugOpts, unitsPerPressurePoint: 3 });
    expect(() => deckToWaveTable(parseDeck(armed), stormOpts))
      .toThrow(/storm budget .* exceeds the D-7 ceiling/);
    expect(() => deckToWaveTable(parseDeck(armed), stormOpts)).not.toThrow(VersusError);
    // differential arm: identical deck, affix gone, same upp — converts.
    expect(() => deckToWaveTable(parseDeck(baseWith({ "wp-login-brute-squad": undefined })), stormOpts))
      .not.toThrow();
  });
});

/* ═══════════ I-P V-2 — the structural law: deltas cannot reach the self-check legs ═══════════ */

describe("I-P V-2 — no delta touches parPct, entry counts, denominations, or anchor cadence", () => {
  test("a heavily spiced deck shares the plain deck's skeleton field-for-field", () => {
    // Six DIFFERENT live slugs across the deck — window, band, shape, and
    // share contributors all firing at once. parse+enforce run INSIDE
    // deckToWaveTable as its self-check: reaching the assertions at all
    // is the proof the enforceWaveTable legs stayed unreachable.
    const plain = deckToWaveTable(parseDeck(PLAIN_BASE), slugOpts).table;
    const spiced = deckToWaveTable(parseDeck(baseWith({
      "scanner-drizzle": "low-slow",
      "wp-login-brute-squad": "encrypted",
      "slowloris-sipper": "timed",
      "xmlrpc-pingback-amplifier": "piggyback",
      "grudge-booter": "rate-shaped",
      "mod-update-day": "diurnal",
    })), slugOpts).table;
    expect(spiced.waves.length).toBe(plain.waves.length);
    for (let i = 0; i < spiced.waves.length; i += 1) {
      const s = spiced.waves[i] as (typeof spiced.waves)[number];
      const p = plain.waves[i] as (typeof plain.waves)[number];
      expect(s.n).toBe(p.n); // anchor cadence — waves keep their numbers
      expect(s.parPct).toBe(p.parPct);
      expect(s.entries.length).toBe(p.entries.length);
      for (let j = 0; j < s.entries.length; j += 1) {
        const se = s.entries[j] as (typeof s.entries)[number];
        const pe = p.entries[j] as (typeof p.entries)[number];
        expect(se.threatId).toBe(pe.threatId);
        expect(se.role).toBe(pe.role);
        expect(se.family).toBe(pe.family);
        expect(se.denominations).toEqual(pe.denominations);
      }
    }
    // shares still sum to 100 on EVERY wave (the rate-shaped leg's debt):
    for (const wave of spiced.waves) {
      expect(wave.entries.reduce((sum, e) => sum + e.sharePct, 0)).toBe(100);
    }
  });
});

/* ═══════════════ I-P decision 5/6 — ratified laws pinned as data ═══════════════ */

function outcomeRow(waveN: number | null, over: Partial<PerWaveOutcome> = {}): PerWaveOutcome {
  return Object.freeze({
    label: waveN === null ? "baseline" : `wave-${waveN}`,
    waveN,
    served: 0,
    blocked: 0,
    falsePositive: 0,
    landed: 0,
    ...over,
  });
}

describe("I-P decision 5 — the decisive-wave tie law, extracted and truth-tabled", () => {
  test("landed is major: the heavier-breach wave carries the match", () => {
    const rows = Object.freeze([
      outcomeRow(1, { landed: 2, blocked: 9 }),
      outcomeRow(2, { landed: 5 }),
    ]);
    expect(pickDecisiveWave(rows).waveN).toBe(2);
  });

  test("equal landed → most blocked wins", () => {
    const rows = Object.freeze([
      outcomeRow(1, { landed: 4, blocked: 1 }),
      outcomeRow(6, { landed: 4, blocked: 7 }),
    ]);
    expect(pickDecisiveWave(rows).waveN).toBe(6);
  });

  test("full tie → LOWEST n (earlier face keeps the crown — strict-> replacement)", () => {
    const rows = Object.freeze([
      outcomeRow(3, { landed: 4, blocked: 7, served: 1 }),
      outcomeRow(6, { landed: 4, blocked: 7, served: 9 }),
    ]);
    expect(pickDecisiveWave(rows).waveN).toBe(3);
  });

  test("baseline and unattributed rows can NEVER be decisive", () => {
    const rows = Object.freeze([
      outcomeRow(1, { landed: 1 }),
      outcomeRow(null, { label: "baseline", landed: 99, blocked: 99 }),
      outcomeRow(null, { label: "unattributed", landed: 99, blocked: 99 }),
    ]);
    expect(pickDecisiveWave(rows).waveN).toBe(1);
  });

  test("all-zero outcomes → wave 1, never a null verdict", () => {
    const rows = Object.freeze([outcomeRow(1), outcomeRow(2), outcomeRow(3)]);
    expect(pickDecisiveWave(rows).waveN).toBe(1);
  });

  test("the empty roster is a fail-loud contract violation, not a silent null", () => {
    expect(() => pickDecisiveWave(Object.freeze([]))).toThrow(VersusError);
  });

  test("resolveVersusMatch agrees with the extracted law on the live rows", () => {
    const result = resolveVersusMatch(matchConfig({ matchTicks: 60 }));
    const live = result.perWaveOutcomes.filter((row) => row.waveN !== null);
    expect(result.decisiveWaveN).toBe(pickDecisiveWave(live).waveN ?? 1);
  });
});

describe("I-P decision 6 — three-tag key-space pin + ruleBookHash id-inclusion", () => {
  const deckHash = commitDeck(parseDeck(RAW_DECK_MAIN)).deckHash;
  const bookHash = versusRuleBookHash([GAUGE_CARD]);
  const cardHash = cardContentFingerprint(GAUGE_CARD);

  test("the three domain tags are pairwise distinct and every hash carries its own", () => {
    expect(deckHash.startsWith("hh-versus-deck-v2:")).toBe(true);
    expect(bookHash.startsWith("hh-versus-book-v1:")).toBe(true);
    expect(cardHash.startsWith("hh-card-v1:")).toBe(true);
    expect(new Set([deckHash, bookHash, cardHash]).size).toBe(3);
  });

  test("versusRuleBookHash absorbs card.id DELIBERATELY — labels are part of the doctrine snapshot", () => {
    const reIded = Object.freeze({ ...GAUGE_CARD, id: asRuleId("r-versus-gauge-RENAMED") });
    // per-card identity law: content only, id stripped → SAME fingerprint…
    expect(cardContentFingerprint(reIded)).toBe(cardHash);
    // …whole-book commit law: id included → DIFFERENT hash (the docblock
    // calls this intentional; this test is its falsifiable witness).
    expect(versusRuleBookHash([reIded])).not.toBe(bookHash);
  });
});

describe("I-P decision 6 — the unattributed floor is grammar-forced", () => {
  test("attribution demands the `${tableId}~n~threat~ordinal` grammar — re-mint ids cannot wear it", () => {
    // Driver re-minted units are `re<mint>@<tick>` ids — no tableId, no
    // `~` — so their terminals can ONLY reach the "unattributed" row.
    // The live floor (all-blocked, never a wave's traffic) is pinned
    // behaviorally by the conservation tests above; this is the
    // structural half: the floor is FORCED BY GRAMMAR, not a label-map
    // accident. Widening attribution (re-mint stamps riding the arrival
    // lineage) is a CROSS-LANE pipeline ticket — out of program.
    expect(threatFromWaveUnitId("versus-live~3~grudge-booter~0", "versus-live")).toBe("grudge-booter");
    expect(threatFromWaveUnitId("re7@99", "versus-live")).toBeNull();
    expect(threatFromWaveUnitId("re2@3", "versus-live")).toBeNull();
    // a DIFFERENT table's units are not this table's traffic either:
    expect(threatFromWaveUnitId("versus-crowd@0#1.0", "versus-live")).toBeNull();
    expect(threatFromWaveUnitId("versus-other~1~grudge-booter~0", "versus-live")).toBeNull();
  });
});

describe("door decoupling through the defense parser", () => {
  test("parseDefenseDeck + deckToWaveTable agree on a real registry deck", () => {
    // hh-card-v1 law (owner-ratified 2026-10-09): policyCardHashes entries
    // are CONTENT FINGERPRINTS, not card ids.
    const defense = parseDefenseDeck(
      { id: "keep", buildables: ["waf", "cache"], policyCardHashes: [cardContentFingerprint(GAUGE_CARD)], doctrineRef: "defense:absorb", handCapacity: 2 },
      { buildableUniverse: new Set(["waf", "cache", "meter"]) },
    );
    expect(defense.policyCardHashes).toEqual([cardContentFingerprint(GAUGE_CARD)]);
    const { table } = deckToWaveTable(parseDeck(RAW_DECK_MAIN), { census: CENSUS, tableId: "versus-paired", typeBundleId: "shared-web" });
    expect(table.waves).toHaveLength(8);
  });
});

/* ═══════════ card content fingerprint — hh-card-v1 keying (ADR-0009 ratification 2026-10-09) ═══════════ */

describe("cardContentFingerprint — identity is bytes of content, ids are labels", () => {
  test("scheme stamp + determinism across repeated and freshly-built encodes", () => {
    const fp = cardContentFingerprint(GAUGE_CARD);
    expect(fp).toMatch(/^hh-card-v1:[0-9a-f]{16}$/);
    expect(cardContentFingerprint(GAUGE_CARD)).toBe(fp);
    // Reordered insertion + unfrozen twin: the canonical fold sorts keys by
    // code unit, so the encoding cannot depend on how the card was written.
    const rebuilt: PolicyCard = {
      upkeepMicroUsd: GAUGE_CARD.upkeepMicroUsd,
      then: GAUGE_CARD.then,
      ...(GAUGE_CARD.for !== undefined ? { for: GAUGE_CARD.for } : {}),
      band: GAUGE_CARD.band,
      when: GAUGE_CARD.when,
      scope: GAUGE_CARD.scope,
      id: GAUGE_CARD.id,
    };
    expect(cardContentFingerprint(rebuilt)).toBe(fp);
  });

  test("GOLDEN: GAUGE_CARD folds to the captured fingerprint", () => {
    // captured @fingerprint-flip (2026-10-09) — the scheme's byte contract;
    // a drift here means the fold changed, which needs a NEW version tag.
    expect(cardContentFingerprint(GAUGE_CARD)).toBe("hh-card-v1:cd1296c54df0e9c6");
  });

  test("(a) same content, different id → SAME fingerprint", () => {
    const renamed = { ...GAUGE_CARD, id: asRuleId("r-versus-renamed-label") };
    expect(cardContentFingerprint(renamed)).toBe(cardContentFingerprint(GAUGE_CARD));
  });

  test("(b) different content, same id → DIFFERENT fingerprint (no impersonation)", () => {
    const reauthored = { ...GAUGE_CARD, upkeepMicroUsd: asMoney(11n) };
    expect(cardContentFingerprint(reauthored)).not.toBe(cardContentFingerprint(GAUGE_CARD));
    const retuned: PolicyCard = {
      ...GAUGE_CARD,
      then: Object.freeze([Object.freeze({ id: "scale-out" as const, runbookName: null, value: fromInt(3) })]),
    };
    expect(cardContentFingerprint(retuned)).not.toBe(cardContentFingerprint(GAUGE_CARD));
  });

  test("(c) the id itself never enters the fold (card-id-collision stays the id-space guard)", () => {
    // Two ids, one content: identical keys by law (a); the door's collision
    // guard still speaks ids — the two spaces are deliberately independent.
    const twinA = { ...GAUGE_CARD, id: asRuleId("r-twin-a") };
    const twinB = { ...GAUGE_CARD, id: asRuleId("r-twin-b") };
    expect(cardContentFingerprint(twinA)).toBe(cardContentFingerprint(twinB));
  });
});

describe("defaultPolicyCardIndex — the key space is fingerprints, never ids (revert guard)", () => {
  test("default index is fingerprint-keyed, never id-keyed (revert of the 2026-10-09 flip goes red HERE)", () => {
    // THE falsification pin. Under the OLD id-keyed default the two asserts
    // below swap verdicts: `index.get(id)` returned the card (not undefined)
    // and `index.get(fingerprint)` missed. Reverting match.ts's fallback line
    // to key on card.id is a one-line edit that turns BOTH lines red — and it
    // is the ONLY test in the lane that reads the DEFAULT map's key space
    // directly (the door-wiring tests below always inject their own explicit
    // `policyCardsByHash`, so they never exercise the fallback).
    const index = defaultPolicyCardIndex([GAUGE_CARD]);
    expect(index.get(GAUGE_CARD.id as string)).toBeUndefined();
    expect(index.get(cardContentFingerprint(GAUGE_CARD))).toBe(GAUGE_CARD);
  });

  test("content-identical twins under different ids collapse to ONE fingerprint slot (fold drops id)", () => {
    // The fold strips card.id, so two twins share one key. Map insert order
    // gives the later pair the slot — pinned honestly as twinB (a last-write
    // wins collapse, not a throw), never silently distinguished by id.
    const twinA = { ...GAUGE_CARD, id: asRuleId("r-versus-twin-a") };
    const twinB = { ...GAUGE_CARD, id: asRuleId("r-versus-twin-b") };
    const index = defaultPolicyCardIndex([twinA, twinB]);
    const fp = cardContentFingerprint(GAUGE_CARD);
    expect(cardContentFingerprint(twinA)).toBe(fp);
    expect(cardContentFingerprint(twinB)).toBe(fp);
    expect(index.size).toBe(1);
    expect(index.get(fp)).toBe(twinB);
    // Neither id is ever a key.
    expect(index.get(twinA.id as string)).toBeUndefined();
    expect(index.get(twinB.id as string)).toBeUndefined();
  });
});

describe("versus door wiring — cards resolve by CONTENT fingerprint, not by id", () => {
  function runToTick(config: VersusMatchConfig, tick: number): VersusRunState {
    const runner = createVersusRunner(config, { memoize: false });
    return runner({
      initialState: initialVersusRunState(config),
      runSeed: config.seed,
      targetTick: BigInt(tick),
      intentsUpToTick: stampReserveIntents(config.defender.reserveIntents ?? []) as readonly unknown[] as readonly StampedIntent[],
    });
  }

  const commitAt = (cardHash: string): readonly VersusReserveIntent[] =>
    Object.freeze([
      Object.freeze({ tick: 5, intent: Object.freeze({ verb: "policy-card-commit" as const, cardHash }) }),
    ]);

  test("default index: an id-shaped hash finds nothing — the book stays untouched", () => {
    const config = matchConfig({
      matchTicks: 12,
      customerBaseline: null,
      defender: { ...VERSUS_DEFENDER, reserveIntents: commitAt(GAUGE_CARD.id as string) },
    });
    const at5 = runToTick(config, 4);
    const after = runToTick(config, 8);
    // Refusal is state-inert (door law): nothing executed.
    expect(after.game.ruleBook.map((card) => card.id)).toEqual(["r-versus-gauge"]);
    expect(after.game.ruleBookHash).toBe(at5.game.ruleBookHash);
    expect(after.game.ruleBookHash).toBe(versusRuleBookHash([GAUGE_CARD]));
  });

  test("default index: a fingerprint-commit of a book card hits the lookup and refuses as id-collision — book unchanged", () => {
    // Lane reality pinned: the DEFAULT map is the ruleBook itself, so every
    // resolvable fingerprint belongs to an already-committed id → the only
    // honest verdict is card-id-collision (a refusal), never a re-execution.
    const config = matchConfig({
      matchTicks: 12,
      customerBaseline: null,
      defender: { ...VERSUS_DEFENDER, reserveIntents: commitAt(cardContentFingerprint(GAUGE_CARD)) },
    });
    const after = runToTick(config, 8);
    expect(after.game.ruleBook).toHaveLength(1);
    expect(after.game.ruleBookHash).toBe(versusRuleBookHash([GAUGE_CARD]));
  });

  test("fingerprint-keyed host map executes an off-book card (the ratification's live path)", () => {
    const decoy: PolicyCard = {
      ...GAUGE_CARD,
      id: asRuleId("r-versus-off-book-decoy"),
      then: [Object.freeze({ id: "page" as const, runbookName: null, value: null })],
    };
    const config = matchConfig({
      matchTicks: 12,
      customerBaseline: null,
      defender: {
        ...VERSUS_DEFENDER,
        policyCardsByHash: new Map([[cardContentFingerprint(decoy), decoy]]),
        reserveIntents: commitAt(cardContentFingerprint(decoy)),
      },
    });
    const before = runToTick(config, 4);
    const after = runToTick(config, 8);
    expect(after.game.ruleBook).toHaveLength(2);
    expect((after.game.ruleBook[1] as typeof GAUGE_CARD).id).toBe("r-versus-off-book-decoy");
    expect(after.game.ruleBookHash).not.toBe(before.game.ruleBookHash);
    // The door re-folds its OWN M3 book hash on execution — versusRuleBookHash
    // is the commit-time doctrine identity, not the door's runtime fold; both
    // must simply agree that the book changed.
    expect(before.game.ruleBookHash).toBe(versusRuleBookHash([GAUGE_CARD]));
  });

  test("re-authored card cannot impersonate its old fingerprint (bytes bind)", () => {
    const original = { ...GAUGE_CARD, id: asRuleId("r-versus-original") };
    const reauthored = { ...original, upkeepMicroUsd: asMoney(999n) };
    const config = matchConfig({
      matchTicks: 12,
      customerBaseline: null,
      defender: {
        ...VERSUS_DEFENDER,
        // Host bound the ORIGINAL bytes under the original fingerprint…
        policyCardsByHash: new Map([[cardContentFingerprint(original), Object.freeze(original)]]),
        // …and the player commits the RE-AUTHORED card's fingerprint.
        reserveIntents: commitAt(cardContentFingerprint(reauthored)),
      },
    });
    const after = runToTick(config, 8);
    // Different content → different key → lookup misses → unknown-card-hash
    // refusal, state-inert. This host map is EXPLICIT and fingerprint-keyed,
    // so it never touches the default index's key space — the default-map
    // revert guard lives in the `defaultPolicyCardIndex` pin above, not here.
    expect(after.game.ruleBook).toHaveLength(1);
    expect(after.game.ruleBookHash).toBe(versusRuleBookHash([GAUGE_CARD]));
  });
});
