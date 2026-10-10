/**
 * B4 — wave-rules host inputs (runner/waveRules.ts + the simCoreRunner wiring
 * point). Unit tests for every pure derivation, plus the LIVENESS gates the
 * ticket demands on shipped g1 data:
 *
 *  · secondIncident follow-ons appear in the runner's wave-4 PLAN on seed 42
 *    (10 arrivals where the par budget alone draws 6 — the +4 follow-on rows
 *    only exist while the incident clock reads "active" at entry);
 *  · the copycat rescale MOVES the family share when the deep lane's census
 *    is dominant-human (seed 42 wave 5: 3/3/3) and leaves it authored when
 *    the census matches nothing (seed 33 wave 5: 4/3/3);
 *  · oversell 8:1 (OD-24 starting proposal) is supplied on the shared-web
 *    scenario because the bundle DECLARES the slider.
 *
 * Feint: shipped slices author NO `feint` marker (consumer is structurally
 * live, data-inert — disclosed). Proven here through the injectable-table
 * seam: same slice JSON with one planted marker re-parks the first-quarter
 * ordinals on the entry minute.
 */
import { describe, expect, it } from "vitest";
import { fromInt, streamFor } from "@hh/sim-core/kernel";
import { asRunSeed, type Fixed, type RunSeed } from "@hh/sim-core/types";
import {
  INITIAL_DIRECTOR_STATE,
  buildInvitations,
  directorPropose,
  ledgerSnapshot,
  planWave,
  waveStream,
} from "@hh/sim-core/waves";
import {
  bundleDeclaresOversellSlider,
  buildSharedWebG1Table,
  dominantFamilyOfCensus,
  homogeneityMicroFromClassMix,
  INCIDENT_ACTIVE_MINUTES,
  INCIDENT_BURST_WINDOW_MIN,
  INCIDENT_RECOVERING_MINUTES,
  INITIAL_INCIDENT_CLOCK,
  OVERSELL_RATIO_MICRO,
  planWaveWindowSchedule,
  SHARED_WEB_G1_TABLE,
  stepIncidentClock,
  threatFamilyOfIntent,
  incidentStateOf,
  type IncidentClock,
} from "../runner/waveRules.ts";
import { SimCoreRunner } from "../runner/simCoreRunner.ts";
// SSOT: the same shipped texts the adapter reads at module load.
import g1SliceRawText from "../../../../packages/content/waves/g1-shared-web-first-quarter.json?raw";
import sharedWebBundleRaw from "../../../../packages/content/types/shared-web.json?raw";

function quietClock(): IncidentClock {
  return INITIAL_INCIDENT_CLOCK;
}

function minutes(clock: IncidentClock, count: number, bounced = 0, landed = 0): IncidentClock {
  let c = clock;
  for (let i = 0; i < count; i += 1) c = stepIncidentClock(c, { bounced, landed });
  return c;
}

describe("g1 adapter: shipped slice → engine table", () => {
  it("parses the shipped slice into five 12-minute waves", () => {
    expect(SHARED_WEB_G1_TABLE.waves).toHaveLength(5);
    for (const wave of SHARED_WEB_G1_TABLE.waves) {
      expect(wave.windowMinutes).toBe(12);
    }
  });

  it("carries the §2.24 rules block from the slice", () => {
    const rules = SHARED_WEB_G1_TABLE.rules;
    expect(rules).toBeDefined();
    expect(rules?.copycatReservePct).toEqual([10, 15]);
    expect(rules?.secondIncidentMultiplierDuringIncident).toBe(1.8);
    expect(rules?.secondIncidentMultiplierDuringRecovery).toBe(2.5);
  });

  it("MARKER CENSUS (disclosed): only wave-4 is secondIncident, no wave feints", () => {
    const marked = SHARED_WEB_G1_TABLE.waves.filter((w) => w.secondIncident === true);
    expect(marked.map((w) => w.n)).toEqual([4]);
    const feinting = SHARED_WEB_G1_TABLE.waves.filter((w) => w.feint === true);
    expect(feinting).toEqual([]); // consumer live, data inert — see feint seam test
  });

  it("window schedule runs back-to-back from the opening minute (fastForward cursor law)", () => {
    const schedule = planWaveWindowSchedule(SHARED_WEB_G1_TABLE, 2);
    expect(schedule.map((w) => w.cursor)).toEqual([2, 14, 26, 38, 50]);
    expect(schedule.map((w) => w.n)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("feint seam: planted marker re-parks the first quarter (shipped data has none)", () => {
  it("buildSharedWebG1Table honors an injected feint marker and the plan folds it", () => {
    const sliced = JSON.parse(g1SliceRawText) as {
      waves: { n: number; feint?: boolean }[];
    };
    const wave2 = sliced.waves.find((w) => w.n === 2);
    expect(wave2).toBeDefined();
    wave2!.feint = true;
    const table = buildSharedWebG1Table(sliced);
    expect(table.waves[1]?.feint).toBe(true);

    // Plan-level proof: the feinted wave parks its first-quarter ordinals on
    // the entry minute; the shipped twin spreads them across the window.
    const feinted = planWave(table, 2, planInputFor(2, 14));
    const authored = planWave(SHARED_WEB_G1_TABLE, 2, planInputFor(2, 14));
    const atEntry = (plan: typeof feinted): number =>
      plan.arrivals.filter((a) => a.minute === plan.startMinute).length;
    // Probe-derived (seed 7, deterministic): feinted 2-at-entry vs twin 0.
    expect(atEntry(feinted)).toBeGreaterThan(atEntry(authored));
    expect(feinted.arrivals.length).toBe(authored.arrivals.length); // timing-only law
  });
});

/* Mirror of the runner's deterministic plan call shape for direct plan tests
 * (seed 7 — a TEST seed, not the mainline 42): the director chain is folded
 * over the same four windows so wave n sees the same DirectorState the
 * mainline schedule would give it. */
const PROBE_SEED: RunSeed = asRunSeed(7n);

function planInputFor(n: number, cursor: number) {
  let director = INITIAL_DIRECTOR_STATE;
  for (const c of [2, 14, 26, 38, 50].slice(0, n)) {
    director = directorPropose(director, BigInt(c), streamFor(PROBE_SEED, "director", c)).next;
  }
  return {
    startMinute: cursor,
    tick: BigInt(cursor),
    rng: waveStream(PROBE_SEED, n, cursor),
    director,
    ledger: ledgerSnapshot([], 0n),
    invitations: buildInvitations({}),
    entropyForecastPurchased: false,
  } as never;
}

describe("oversell (OD-24)", () => {
  it("the shared-web bundle declares the slider — so the host must supply the value", () => {
    expect(bundleDeclaresOversellSlider(JSON.parse(sharedWebBundleRaw))).toBe(true);
    expect(bundleDeclaresOversellSlider({ scarce: { commercialSlider: "attention" } })).toBe(false);
    expect(bundleDeclaresOversellSlider({})).toBe(false);
  });

  it("ratio row is 8:1 in micro units and above the provable-zero ceiling", () => {
    expect(OVERSELL_RATIO_MICRO).toBe(8_000_000n);
    expect(OVERSELL_RATIO_MICRO).toBeGreaterThan(1_000_000n); // ≤1 ⇒ P = 0n by law
  });

  it("homogeneity: empty pool = fully homogeneous; dominant QoS class share otherwise", () => {
    expect(homogeneityMicroFromClassMix({})).toBe(1_000_000n);
    expect(homogeneityMicroFromClassMix({ gold: fromInt(1) as Fixed })).toBe(1_000_000n);
    expect(homogeneityMicroFromClassMix({ gold: 16_384n as Fixed, silver: 16_384n as Fixed })).toBe(250_000n);
  });
});

describe("incident clock fold", () => {
  it("quiet at rest; one landed breach flips it active", () => {
    expect(incidentStateOf(quietClock())).toBe("quiet");
    expect(incidentStateOf(stepIncidentClock(quietClock(), { bounced: 0, landed: 1 }))).toBe("active");
  });

  it("a bounce burst inside the window triggers; a lone bounce does not", () => {
    expect(incidentStateOf(stepIncidentClock(quietClock(), { bounced: 1, landed: 0 }))).toBe("quiet");
    expect(
      incidentStateOf(stepIncidentClock(stepIncidentClock(quietClock(), { bounced: 1, landed: 0 }), { bounced: 1, landed: 0 })),
    ).toBe("active"); // 2 losses inside a 5-minute window ⇒ INCIDENT_TRIGGER_BURST
    // outside the window the singles never sum: the array is exactly the window
    expect(INCIDENT_BURST_WINDOW_MIN).toBe(5);
  });

  it("expiry walks active → recovering → quiet (6 then 12 PROVISIONAL minutes)", () => {
    const hot = stepIncidentClock(quietClock(), { bounced: 0, landed: 1 });
    const tail = minutes(hot, INCIDENT_ACTIVE_MINUTES);
    expect(incidentStateOf(tail)).toBe("recovering");
    const healed = minutes(tail, INCIDENT_RECOVERING_MINUTES);
    expect(incidentStateOf(healed)).toBe("quiet");
  });

  it("a re-trigger inside the tail extends active life (duck-envelope law)", () => {
    const hot = stepIncidentClock(quietClock(), { bounced: 0, landed: 1 });
    const decayed = minutes(hot, 2); // activeLeft would be 4 without the bump
    const bumped = stepIncidentClock(decayed, { bounced: 2, landed: 0 });
    expect(bumped.activeLeft).toBe(INCIDENT_ACTIVE_MINUTES);
    expect(incidentStateOf(bumped)).toBe("active");
  });
});

describe("defense census → copycat input", () => {
  it("intent → family reverse map (benign intents are not a defense family)", () => {
    expect(threatFamilyOfIntent("malicious")).toBe("malicious");
    expect(threatFamilyOfIntent("human-error")).toBe("human");
    expect(threatFamilyOfIntent("abuser")).toBe("customerAsThreat");
    expect(threatFamilyOfIntent("entropic")).toBe("entropic");
    expect(threatFamilyOfIntent("systemic")).toBe("systemic");
    expect(threatFamilyOfIntent("customer")).toBeNull();
    expect(threatFamilyOfIntent("prospect")).toBeNull();
    expect(threatFamilyOfIntent("automaton")).toBeNull();
  });

  it("dominant = biggest count, ties break by code-unit order, empties report nothing", () => {
    expect(dominantFamilyOfCensus({})).toBeUndefined();
    expect(dominantFamilyOfCensus({ human: 0 })).toBeUndefined();
    expect(dominantFamilyOfCensus({ malicious: 2, human: 5 })).toBe("human");
    expect(dominantFamilyOfCensus({ malicious: 2, human: 2 })).toBe("human");
  });
});

describe("LIVENESS on shipped g1 data (mainline runner, seed 42)", () => {
  const storm = new SimCoreRunner({ seed: 42 });
  for (let tick = 0; tick < 100; tick += 1) storm.headlessStep(1_000);

  it("wave 4 enters ACTIVE and its plan carries the secondIncident follow-ons", () => {
    const inputs = storm.waveRuleInputs(4);
    expect(inputs?.incidentState).toBe("active"); // probe: breaches keep the clock hot
    const plan = storm.wavePlan(4);
    // Probe-derived census (seed 42): par alone draws 6 units {hydra 3, plugin 3};
    // the ×1.8 follow-on law adds the 4 extra arrival rows ⇒ 10 total. The quiet
    // 6-vs-10 arithmetic at PLAN level is pinned in sim-core waves/foreign.test.ts.
    expect(plan?.arrivals).toHaveLength(10);
    expect(plan?.unitsByThreat).toEqual({ "ticket-avalanche-hydra": 3, "vulnerable-plugin-compromise": 3 });
  });

  it("wave 5 copycats the dominant human defense (rescaled 3/3/3, not authored 4/3/3)", () => {
    const inputs = storm.waveRuleInputs(5);
    expect(inputs?.dominantDefenseFamily).toBe("human"); // deep lane engaged human-error units
    const plan = storm.wavePlan(5);
    // Authored 40/30/30 over 9 units would split 4/3/3 (see the s33 twin below);
    // the 10% copycat reserve for "human" pulls one unit off layer7-mimic.
    expect(plan?.unitsByThreat).toEqual({
      "layer7-mimic": 3,
      "noisy-query-table-scan": 3,
      "vulnerable-plugin-compromise": 3,
    });
  });

  it("the no-match twin keeps AUTHORED shares (seed 33 wave 5: census customerAsThreat, 4/3/3)", () => {
    const calm = new SimCoreRunner({ seed: 33 });
    for (let tick = 0; tick < 100; tick += 1) calm.headlessStep(1_000);
    const inputs = calm.waveRuleInputs(5);
    expect(inputs?.dominantDefenseFamily).toBe("customerAsThreat"); // matches no wave-5 entry
    expect(calm.wavePlan(5)?.unitsByThreat).toEqual({
      "layer7-mimic": 4,
      "noisy-query-table-scan": 3,
      "vulnerable-plugin-compromise": 3,
    });
  });

  it("oversell rides every minted plan because the bundle declares the slider", () => {
    const inputs = storm.waveRuleInputs(1);
    expect(inputs?.oversell?.ratioMicro).toBe(OVERSELL_RATIO_MICRO);
    expect(inputs?.oversell?.homogeneityMicro).toBe(1_000_000n); // PROVISIONAL: empty pool pre-storm
  });

  it("the rule inputs are deterministic across fresh instances", () => {
    const twin = new SimCoreRunner({ seed: 42 });
    for (let tick = 0; tick < 100; tick += 1) twin.headlessStep(1_000);
    for (const n of [1, 2, 3, 4, 5]) {
      expect(twin.waveRuleInputs(n)).toEqual(storm.waveRuleInputs(n));
      expect(twin.wavePlan(n)?.arrivals).toEqual(storm.wavePlan(n)?.arrivals);
    }
  });
});
