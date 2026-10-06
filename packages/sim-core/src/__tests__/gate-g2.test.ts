/**
 * GATE G2 — "The Attack Surface Ledger" (§9.13 #2, §2.24 / L6133, L28162):
 * building a component VISIBLY changes the threat deck. This is the headless
 * acceptance proof, composed ONLY from public `waves/ledger` + `waves/generate`
 * primitives over the REAL content corpus (packages/content), deterministic
 * across 5 seeds:
 *
 *  1. Threat X is unspawnable until component C is built — zero planned X
 *     arrivals before, some after (wave 4 of the real g1-shared-web slice,
 *     X = vulnerable-plugin-compromise, C = homogeneous-cpanel-image).
 *  2. Removing C re-closes the pool only after the retirement lag
 *     ("attackers don't get the memo", §2.24).
 *  3. ledgerSnapshot at each build step = the exact invitation delta set
 *     (the sequence below is golden).
 *  4. Purchase-time contract: the pure preview composition
 *     (hypothetical build → spawnable-delta) answers "what would C add?"
 *     deterministically — the proto-side deriveInvitations.ts mirrors it.
 *  5. Mastery demotion: ≥5 counters flips the telegraph band to weather in
 *     the wave plan — existence untouched, no RNG involved (R-16).
 *
 * Corpus-derived, never corpus-edited (read-only consumer law).
 */

import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  asRunSeed,
  bandAfterMastery,
  buildInvitations,
  gateComposition,
  INITIAL_DIRECTOR_STATE,
  isThreatSpawnable,
  ledgerSnapshot,
  parseWaveTable,
  planWave,
  spawnableThreatIds,
  waveStream,
  DEFAULT_LEDGER_CONFIG,
  type BuildOp,
  type LedgerConfig,
  type LedgerSnapshot,
  type PressureParams,
  type RunSeed,
  type SimTick,
  type ThreatInvitations,
  type WavePlan,
  type WaveTable,
} from "../index.ts";

/* ═══════════════════════ corpus fixtures (read-only) ═══════════════════════ */

const CONTENT_ROOT = join(process.cwd(), "..", "..", "packages", "content");

function readCorpusJson(relPath: string): Record<string, unknown> {
  const abs = join(CONTENT_ROOT, relPath);
  if (!existsSync(abs)) {
    throw new Error(`gate-g2: content corpus missing at ${abs} — run from packages/sim-core`);
  }
  return JSON.parse(readFileSync(abs, "utf8")) as Record<string, unknown>;
}

interface CorpusThreat {
  readonly id: string;
  readonly family: string;
  readonly band: string;
  readonly denomination: string;
}

interface CorpusWaveEntry {
  readonly threat: string;
  readonly role: string;
  readonly pressurePct: number;
  readonly band: string;
}

interface CorpusWave {
  readonly n: number;
  readonly parPct: number;
  readonly trough?: boolean;
  readonly entries: readonly CorpusWaveEntry[];
}

/** Foreign wave-slice role names → the THREAT_ROLES vocabulary (table.ts). */
function canonicalRole(foreignRole: string): string {
  const head = foreignRole.split("/")[0]!.toLowerCase();
  return head === "healer" ? "healer" : head;
}

function corpusThreatIndex(): Map<string, CorpusThreat> {
  const registry = readCorpusJson("threats/registry-core.json");
  const threats = registry["threats"] as CorpusThreat[];
  return new Map(threats.map((t) => [t.id, t]));
}

/**
 * Adapt a foreign-schema g1 slice (keys: threat/role/pressurePct + wave-level
 * parPct) into parseWaveTable input. Geometry mirrors the integration smoke's
 * authored envelope; existence data (which threats, shares, bands) is verbatim
 * from the shipped slice.
 */
function corpusWaveTable(slicePath: string, typeBundleId: string): WaveTable {
  const slice = readCorpusJson(slicePath);
  const index = corpusThreatIndex();
  const waves = (slice["waves"] as CorpusWave[]).map((w) => ({
    n: w.n,
    windowMinutes: 12,
    rampMin: 3,
    plateauMin: 3,
    decayMin: 2,
    parPct: w.parPct,
    hard: w.trough !== true,
    entries: w.entries.map((e) => {
      const meta = index.get(e.threat);
      if (meta === undefined) throw new Error(`gate-g2: slice threat "${e.threat}" absent from registry-core`);
      return {
        threatId: e.threat,
        role: canonicalRole(e.role),
        family: meta.family,
        band: e.band,
        sharePct: e.pressurePct,
        denominations: [meta.denomination],
        targets: ["origin"],
      };
    }),
  }));
  return parseWaveTable({
    id: String(slice["id"]),
    typeBundleId,
    tuningSheet: "B",
    unitsPerPressurePoint: 1,
    waves,
  });
}

function corpusInvitations(bundlePath: string): ThreatInvitations {
  const bundle = readCorpusJson(bundlePath);
  const threats = bundle["threats"] as { unlockedByBuildables: Record<string, readonly string[]> };
  return buildInvitations(threats.unlockedByBuildables);
}

function corpusUniverse(table: WaveTable): readonly string[] {
  const ids = new Set<string>();
  for (const wave of table.waves) for (const entry of wave.entries) ids.add(entry.threatId);
  return [...ids].sort();
}

const SHARED_WEB_TABLE = corpusWaveTable("waves/g1-shared-web-first-quarter.json", "official:shared-web");
const SHARED_WEB_INVITATIONS = corpusInvitations("types/shared-web.json");
const SHARED_WEB_UNIVERSE = corpusUniverse(SHARED_WEB_TABLE);
const GAME_SERVERS_INVITATIONS = corpusInvitations("types/game-servers.json");

/* ═══════════════════════ the scripted build sequence ═══════════════════════ */

/** The G2 story in one table: (tick, op) → the exact spawnable pool it yields.
 *  GOLDEN: any corpus or ledger-semantics drift fails this test loudly. */
const SCRIPT: readonly {
  readonly label: string;
  readonly ops: readonly BuildOp[];
  readonly atTick: SimTick;
  readonly existing: readonly string[];
  readonly spawnable: readonly string[];
}[] = [
  {
    label: "bare metal — only authored-ungated threats exist",
    ops: [],
    atTick: 0n,
    existing: [],
    spawnable: ["layer7-mimic", "slowloris-sipper", "ticket-avalanche-hydra", "xmlrpc-pingback-amplifier"],
  },
  {
    label: "public whois listing goes up",
    ops: [{ atTick: 10n, buildableId: "public-whois-listing", op: "build" }],
    atTick: 10n,
    existing: ["public-whois-listing"],
    spawnable: [
      "layer7-mimic",
      "scanner-drizzle",
      "slowloris-sipper",
      "ticket-avalanche-hydra",
      "xmlrpc-pingback-amplifier",
    ],
  },
  {
    label: "the cPanel image lands — plugin compromise + brute squad invited",
    ops: [
      { atTick: 10n, buildableId: "public-whois-listing", op: "build" },
      { atTick: 30n, buildableId: "homogeneous-cpanel-image", op: "build" },
    ],
    atTick: 30n,
    existing: ["homogeneous-cpanel-image", "public-whois-listing"],
    spawnable: [
      "layer7-mimic",
      "scanner-drizzle",
      "slowloris-sipper",
      "ticket-avalanche-hydra",
      "vulnerable-plugin-compromise",
      "wp-login-brute-squad",
      "xmlrpc-pingback-amplifier",
    ],
  },
  {
    label: "unmetered WordPress default — noisy neighbours arrive",
    ops: [
      { atTick: 10n, buildableId: "public-whois-listing", op: "build" },
      { atTick: 30n, buildableId: "homogeneous-cpanel-image", op: "build" },
      { atTick: 50n, buildableId: "unmetered-wordpress-default", op: "build" },
    ],
    atTick: 50n,
    existing: ["homogeneous-cpanel-image", "public-whois-listing", "unmetered-wordpress-default"],
    spawnable: [
      "hoarder-noisy-neighbor",
      "layer7-mimic",
      "noisy-query-table-scan",
      "scanner-drizzle",
      "slowloris-sipper",
      "ticket-avalanche-hydra",
      "vulnerable-plugin-compromise",
      "wp-login-brute-squad",
      "xmlrpc-pingback-amplifier",
    ],
  },
  {
    label: "cPanel torn down — threats keep haunting (retirement lag)",
    ops: [
      { atTick: 10n, buildableId: "public-whois-listing", op: "build" },
      { atTick: 30n, buildableId: "homogeneous-cpanel-image", op: "build" },
      { atTick: 50n, buildableId: "unmetered-wordpress-default", op: "build" },
      { atTick: 70n, buildableId: "homogeneous-cpanel-image", op: "remove" },
    ],
    atTick: 100n, // 100 < 70 + 60 → still haunted
    existing: ["homogeneous-cpanel-image", "public-whois-listing", "unmetered-wordpress-default"],
    spawnable: [
      "hoarder-noisy-neighbor",
      "layer7-mimic",
      "noisy-query-table-scan",
      "scanner-drizzle",
      "slowloris-sipper",
      "ticket-avalanche-hydra",
      "vulnerable-plugin-compromise",
      "wp-login-brute-squad",
      "xmlrpc-pingback-amplifier",
    ],
  },
  {
    label: "memo delivered — pool re-closes after the lag",
    ops: [
      { atTick: 10n, buildableId: "public-whois-listing", op: "build" },
      { atTick: 30n, buildableId: "homogeneous-cpanel-image", op: "build" },
      { atTick: 50n, buildableId: "unmetered-wordpress-default", op: "build" },
      { atTick: 70n, buildableId: "homogeneous-cpanel-image", op: "remove" },
    ],
    atTick: 130n, // 130 ≥ 70 + 60 → retired
    existing: ["public-whois-listing", "unmetered-wordpress-default"],
    spawnable: [
      "hoarder-noisy-neighbor",
      "layer7-mimic",
      "noisy-query-table-scan",
      "scanner-drizzle",
      "slowloris-sipper",
      "ticket-avalanche-hydra",
      "xmlrpc-pingback-amplifier",
    ],
  },
];

const X = "vulnerable-plugin-compromise"; // the gated threat under test
const C = "homogeneous-cpanel-image"; // its sole inviter in shared-web

/* Small explicit pressure sheet (same convention as the integration smoke):
 * 6 points at wave 1, growth 1.115^wave, flat sawtooth. At wave 4, par 75%
 * and share 45% this yields a positive unit count without sheet ratification. */
const G2_PRESSURE: PressureParams = {
  baseMicro: 6n * 1_000_000n,
  growthNum: 223n,
  growthDen: 200n,
  sawtoothMicro: [1_000_000n],
};

const SEEDS: readonly RunSeed[] = [101n, 102n, 103n, 104n, 105n].map((s) => asRunSeed(s));

function planWave4At(snapshot: LedgerSnapshot, seed: RunSeed, startMinute: number): WavePlan {
  return planWave(SHARED_WEB_TABLE, 4, {
    startMinute,
    tick: snapshot.asOfTick,
    rng: waveStream(seed, 4, startMinute),
    director: INITIAL_DIRECTOR_STATE,
    ledger: snapshot,
    invitations: SHARED_WEB_INVITATIONS,
    entropyForecastPurchased: false,
    pressureParams: G2_PRESSURE,
  });
}

function countPlanned(plan: WavePlan, threatId: string): number {
  return plan.arrivals.filter((a) => a.threatId === threatId).length;
}

/* ═══════════════════════ the gate ═══════════════════════ */

describe("gate G2 (headless): the attack-surface ledger over the real content corpus", () => {
  it("corpus sanity — the scripted invitations come from shipped data", () => {
    // X's only shared-web inviter is C, exactly as authored in the type bundle.
    expect(SHARED_WEB_INVITATIONS.get(X)).toEqual([C]);
    // cPanel invites exactly the pair the type bundle declares.
    const cpanelInvites = [...SHARED_WEB_INVITATIONS.entries()]
      .filter(([, inviters]) => inviters.includes(C))
      .map(([threatId]) => threatId)
      .sort();
    expect(cpanelInvites).toEqual(["vulnerable-plugin-compromise", "wp-login-brute-squad"]);
    // The table under test really authors X into wave 4 (existence is content's).
    const wave4 = SHARED_WEB_TABLE.waves.find((w) => w.n === 4);
    expect(wave4?.entries.some((e) => e.threatId === X)).toBe(true);
  });

  /* ── acceptance (3): golden snapshot sequence ── */

  it("ledgerSnapshot at every scripted step matches the golden existing + spawnable sets", () => {
    for (const step of SCRIPT) {
      const snapshot = ledgerSnapshot(step.ops, step.atTick);
      expect([...snapshot.existingBuildables].sort(), step.label).toEqual(step.existing);
      expect(spawnableThreatIds(SHARED_WEB_UNIVERSE, snapshot, SHARED_WEB_INVITATIONS), step.label).toEqual(
        step.spawnable,
      );
    }
  });

  it("each build step adds EXACTLY its invitation delta — never more", () => {
    let priorPool: readonly string[] = [];
    for (const step of SCRIPT) {
      if (step.ops.length === 0) {
        priorPool = step.spawnable;
        continue;
      }
      const lastOp = step.ops[step.ops.length - 1]!;
      const pool = spawnableThreatIds(SHARED_WEB_UNIVERSE, ledgerSnapshot(step.ops, step.atTick), SHARED_WEB_INVITATIONS);
      const added = pool.filter((t) => !priorPool.includes(t));
      const removed = priorPool.filter((t) => !pool.includes(t));
      if (lastOp.op === "build") {
        const invitedBy = [...SHARED_WEB_INVITATIONS.entries()]
          .filter(([, inviters]) => inviters.includes(lastOp.buildableId))
          .map(([threatId]) => threatId);
        // a build adds only its still-uncovered invites (a 2nd inviter adds nothing new)
        expect(added.every((t) => invitedBy.includes(t)), step.label).toBe(true);
        expect(removed, step.label).toEqual([]);
      }
      priorPool = pool;
    }
  });

  /* ── acceptance (1): zero X arrivals before C, some after — across 5 seeds ── */

  it("threat X plans ZERO arrivals while its invitation C is unbuilt (5 seeds)", () => {
    for (const seed of SEEDS) {
      const snapshot = ledgerSnapshot(SCRIPT[1]!.ops, SCRIPT[1]!.atTick); // whois only
      const plan = planWave4At(snapshot, seed, 40);
      expect(countPlanned(plan, X), `seed ${seed}`).toBe(0);
      expect(plan.deferredThreatIds, `seed ${seed}`).toContain(X);
      // ungated wave-mates still arrive: the pool gates, it does not suppress.
      expect(countPlanned(plan, "ticket-avalanche-hydra"), `seed ${seed}`).toBeGreaterThan(0);
    }
  });

  it("threat X plans SOME arrivals once C is built (5 seeds) and grows the deck", () => {
    const before = planWave4At(ledgerSnapshot(SCRIPT[1]!.ops, 10n), SEEDS[0]!, 40);
    const after = planWave4At(ledgerSnapshot(SCRIPT[2]!.ops, 30n), SEEDS[0]!, 40);
    expect(after.arrivals.length).toBeGreaterThan(before.arrivals.length);
    for (const seed of SEEDS) {
      const plan = planWave4At(ledgerSnapshot(SCRIPT[2]!.ops, 30n), seed, 40);
      expect(countPlanned(plan, X), `seed ${seed}`).toBeGreaterThan(0);
      expect(plan.deferredThreatIds, `seed ${seed}`).not.toContain(X);
    }
  });

  it("R-16: seeds move TIMING only — the threat multiset is seed-invariant", () => {
    const snapshot = ledgerSnapshot(SCRIPT[3]!.ops, 50n);
    const multisets = SEEDS.map((seed) => JSON.stringify(planWave4At(snapshot, seed, 40).unitsByThreat));
    expect(new Set(multisets).size).toBe(1);
  });

  /* ── acceptance (2): removal re-closes the pool AFTER the retirement lag ── */

  it("removing C keeps X spawnable through the lag, then the deck re-closes", () => {
    const cfg: LedgerConfig = DEFAULT_LEDGER_CONFIG;
    const snapshotMid = ledgerSnapshot(SCRIPT[4]!.ops, SCRIPT[4]!.atTick, cfg); // tick 100, lag 60
    const snapshotLate = ledgerSnapshot(SCRIPT[5]!.ops, SCRIPT[5]!.atTick, cfg); // tick 130
    expect(isThreatSpawnable(X, snapshotMid, SHARED_WEB_INVITATIONS), "mid-lag").toBe(true);
    expect(isThreatSpawnable(X, snapshotLate, SHARED_WEB_INVITATIONS), "post-lag").toBe(false);
    for (const seed of SEEDS) {
      expect(countPlanned(planWave4At(snapshotMid, seed, 40), X), `mid-lag seed ${seed}`).toBeGreaterThan(0);
      expect(countPlanned(planWave4At(snapshotLate, seed, 40), X), `post-lag seed ${seed}`).toBe(0);
    }
  });

  it("deleting is a defensive move — gateComposition defers exactly the uncovered invites", () => {
    const wave4 = SHARED_WEB_TABLE.waves.find((w) => w.n === 4)!;
    const gated = gateComposition(wave4.entries, ledgerSnapshot(SCRIPT[5]!.ops, 130n), SHARED_WEB_INVITATIONS);
    expect(gated.deferred).toEqual([X]); // hydra stays (ungated), plugin retires
    expect(gated.spawnable.map((e) => e.threatId)).toEqual(["ticket-avalanche-hydra"]);
  });

  /* ── acceptance (4): the purchase-time contract (pure preview) ── */

  function previewBuild(
    componentTemplateId: string,
    snapshot: LedgerSnapshot,
    invitations: ThreatInvitations,
    universe: Iterable<string>,
  ): readonly string[] {
    const projected: LedgerSnapshot = {
      asOfTick: snapshot.asOfTick,
      existingBuildables: new Set([...snapshot.existingBuildables, componentTemplateId]),
    };
    const before = new Set(spawnableThreatIds(universe, snapshot, invitations));
    return spawnableThreatIds(universe, projected, invitations).filter((t) => !before.has(t));
  }

  it("preview answers 'what would C add?' before a single op is written", () => {
    const bare = ledgerSnapshot([], 0n);
    // GOLDEN: each palette component's purchase-time delta, cold start.
    expect(previewBuild("public-whois-listing", bare, SHARED_WEB_INVITATIONS, SHARED_WEB_UNIVERSE)).toEqual([
      "scanner-drizzle",
    ]);
    expect(previewBuild(C, bare, SHARED_WEB_INVITATIONS, SHARED_WEB_UNIVERSE)).toEqual([
      "vulnerable-plugin-compromise",
      "wp-login-brute-squad",
    ]);
    expect(previewBuild("unmetered-wordpress-default", bare, SHARED_WEB_INVITATIONS, SHARED_WEB_UNIVERSE)).toEqual([
      "hoarder-noisy-neighbor",
      "noisy-query-table-scan",
    ]);
    // The preview mutates nothing: the real snapshot is untouched afterwards.
    expect([...bare.existingBuildables]).toEqual([]);
  });

  it("two inviters, one risk — a second inviter adds nothing new (game-servers)", () => {
    // open-resolver-reflection is invited by BOTH listings; only the first purchase opens it.
    expect(GAME_SERVERS_INVITATIONS.get("open-resolver-reflection")).toEqual([
      "default-udp-game-image",
      "public-server-browser-listing",
    ]);
    const bare = ledgerSnapshot([], 0n);
    expect(previewBuild("public-server-browser-listing", bare, GAME_SERVERS_INVITATIONS, ["open-resolver-reflection"])).toEqual([
      "open-resolver-reflection",
    ]);
    const withOne = ledgerSnapshot([{ atTick: 5n, buildableId: "public-server-browser-listing", op: "build" }], 5n);
    expect(previewBuild("default-udp-game-image", withOne, GAME_SERVERS_INVITATIONS, ["open-resolver-reflection"])).toEqual([]);
  });

  /* ── acceptance (5): mastery demotion flips the BAND, never EXISTENCE ── */

  it("mastery ≥5 demotes the authored storm band to weather (pure, no rng)", () => {
    const counts4 = new Map([[X, 4]]);
    const counts5 = new Map([[X, 5]]);
    expect(bandAfterMastery(X, "storm", counts4)).toBe("storm");
    expect(bandAfterMastery(X, "storm", counts5)).toBe("weather");
    // already-weather threats are untouched by counters
    expect(bandAfterMastery("scanner-drizzle", "weather", counts5)).toBe("weather");
  });

  it("the wave plan shows the demotion in its telegraph, with identical unit existence", () => {
    const snapshot = ledgerSnapshot(SCRIPT[3]!.ops, 50n);
    const plain = planWave4At(snapshot, SEEDS[0]!, 40);
    const mastered = planWave(SHARED_WEB_TABLE, 4, {
      startMinute: 40,
      tick: 50n,
      rng: waveStream(SEEDS[0]!, 4, 40),
      director: INITIAL_DIRECTOR_STATE,
      ledger: snapshot,
      invitations: SHARED_WEB_INVITATIONS,
      masteryCounts: new Map([[X, 5]]),
      entropyForecastPurchased: false,
      pressureParams: G2_PRESSURE,
    });
    const plainBand = plain.envelope.composition.find((e) => e.threatId === X)?.band;
    const masteredBand = mastered.envelope.composition.find((e) => e.threatId === X)?.band;
    expect(plainBand).toBe("storm"); // authored band (g1 slice)
    expect(masteredBand).toBe("weather"); // demoted dimmer
    // existence untouched: same multiset of units, same deferral list
    expect(mastered.unitsByThreat).toEqual(plain.unitsByThreat);
    expect(mastered.deferredThreatIds).toEqual(plain.deferredThreatIds);
    // and it holds seed-invariantly, since mastery is data, not draws
    const masteredOtherSeed = planWave(SHARED_WEB_TABLE, 4, {
      startMinute: 40,
      tick: 50n,
      rng: waveStream(SEEDS[4]!, 4, 40),
      director: INITIAL_DIRECTOR_STATE,
      ledger: snapshot,
      invitations: SHARED_WEB_INVITATIONS,
      masteryCounts: new Map([[X, 5]]),
      entropyForecastPurchased: false,
      pressureParams: G2_PRESSURE,
    });
    expect(masteredOtherSeed.envelope.composition.find((e) => e.threatId === X)?.band).toBe("weather");
  });

  /* ── determinism umbrella: whole scripted run replays byte-identical ── */

  it("the full scripted sequence replays byte-identical (fresh primitives, 5 seeds)", () => {
    const fingerprint = (seed: RunSeed): string =>
      SCRIPT.map((step, i) => {
        const snapshot = ledgerSnapshot(step.ops, step.atTick);
        const plan = planWave4At(snapshot, seed, 40 + i);
        return `${step.atTick}|${[...snapshot.existingBuildables].sort().join(",")}|${JSON.stringify(plan.unitsByThreat)}|${plan.deferredThreatIds.join(",")}`;
      }).join("\n");
    for (const seed of SEEDS) {
      expect(fingerprint(seed), `replay seed ${seed}`).toBe(fingerprint(seed));
    }
    // seeds genuinely differ somewhere (timing draws are live, not frozen)
    const distinct = new Set(SEEDS.map((seed) => fingerprint(seed)));
    // existence is seed-invariant, so fingerprints collide only if minutes collide —
    // the fingerprint intentionally excludes timing; assert seeds diverge ON ARRIVAL MINUTES:
    const snapshot = ledgerSnapshot(SCRIPT[3]!.ops, 50n);
    const minuteSignatures = new Set(
      SEEDS.map((seed) => planWave4At(snapshot, seed, 40).arrivals.map((a) => a.minute).join(",")),
    );
    expect(minuteSignatures.size).toBeGreaterThan(1);
    expect(distinct.size).toBe(1);
  });
});
