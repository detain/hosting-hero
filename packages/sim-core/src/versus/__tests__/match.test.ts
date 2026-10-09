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
import { cardContentFingerprint, createVersusRunner, defaultPolicyCardIndex, initialVersusRunState, versusRuleBookHash, type VersusMatchConfig, type VersusReserveIntent, type VersusRunState } from "../match.ts";
import { fromInt, fromRatio } from "../../kernel/fixed.ts";
import { deckToWaveTable, resolveVersusMatch, scoreVersusMatch, stampReserveIntents } from "../match.ts";
import { parseDefenseDeck } from "../deck.ts";
import type { MatchScoringWeights } from "../match.ts";
import { commitDeck } from "../commit.ts";
import {
  CENSUS,
  GAUGE_CARD,
  RAW_DECK_MAIN,
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
  const SOURCES = ["deck.ts", "draft.ts", "commit.ts", "match.ts", "index.ts"];

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

describe("review pins — affixes are inert in the sim, live on the wire", () => {
  const STRIPPED = Object.freeze({
    id: RAW_DECK_MAIN.id,
    budgetBps: RAW_DECK_MAIN.budgetBps,
    entries: RAW_DECK_MAIN.entries.map((entry) => Object.freeze({
      threatId: entry.threatId,
      weightBps: entry.weightBps,
    })),
  });

  test("deckToWaveTable output is byte-identical with and without affixes", () => {
    const opts = { census: CENSUS, tableId: "versus-affix-inert", typeBundleId: "shared-web" };
    const spiced = JSON.stringify(deckToWaveTable(parseDeck(RAW_DECK_MAIN), opts).table);
    const plain = JSON.stringify(deckToWaveTable(parseDeck(STRIPPED), opts).table);
    expect(spiced).toBe(plain);
  });

  test("the affixes still bind in the commit hash (bytes are not ignored)", () => {
    const spiced = commitDeck(parseDeck(RAW_DECK_MAIN)).deckHash;
    const plain = commitDeck(parseDeck(STRIPPED)).deckHash;
    expect(spiced).not.toBe(plain);
  });

  test("a full match resolves on the identical digest/score/rows either way", () => {
    const spiced = resolveVersusMatch(matchConfig({ deck: parseDeck(RAW_DECK_MAIN), matchTicks: 60 }));
    const plain = resolveVersusMatch(matchConfig({ deck: parseDeck(STRIPPED), matchTicks: 60 }));
    expect(spiced.finalDigest).toBe(plain.finalDigest);
    expect(spiced.matchScore).toBe(plain.matchScore);
    expect(spiced.perWaveOutcomes).toEqual(plain.perWaveOutcomes);
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
