/**
 * R8 review F-2 · hard-ceiling shed TERMINATES units (behavioral lane).
 *
 * RED-FIRST WITNESS (authored against HEAD c06aa9b, BEFORE the driver fix):
 * the step-10 roster loop pushed every non-bounced unit — including the
 * `serveOut.shed` members — as a null-preset candidate FIRST, and
 * `candidateSeen` then dropped the shed loop's "bounced" preset. The shed
 * units resolved to no terminal, survived the purge, re-joined the queue
 * next tick, and were shed again — immortal roster growth (measured on
 * exactly this board: 4 arrivals/tick × 10 → 30 of 40 mints immortalised,
 * arrival-phase roster 33 vs the fixed 3, ZERO bounce terminals). That
 * violates §7.13 R-06 ("if queue at depth, SHED according
 * to the shed order" — shed units exit silently like bounces) and the
 * driver's own comment at the shed branch.
 *
 * The fix hoists the shed loop ABOVE the roster loop so the "bounced"
 * preset wins — every unit that hard-ceiling sheds now terminates in the
 * SAME tick it is shed, with the byte-identical patience-bounce observable
 * shape: terminal "bounced", causeId `outcome:<unitId>`, event kind
 * "bounced" naming the shedding node — the R-06 silent idiom (no
 * explosion, no alarm; patience bounces already honor it, and backpressure
 * R-12 documents "benign bounced / false-positive / SHED outcomes" as the
 * storm's re-entry feed).
 *
 * This file pins the FIXED contract. Every behavioral assertion below was
 * proven red on the unfixed driver (roster 33 + zero bounces + digest
 * mismatch, 5/7 assertions failing at c06aa9b); the shape-parity and
 * innocence tests are green-both-ways by design — they document the
 * contract the fix must not break.
 */

import { describe, expect, it } from "vitest";
import type { EntityId, GameState, NodeRecord, SimEvent } from "../../types";
import { asRunSeed } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import type { DefaultPipelineConfig } from "../defaults";
import { IDS, MIN, envelope, freshClocks, node, testConfig, tickInputs } from "./helpers";

/* ═══════════════════════════ probe board ═══════════════════════════ */

/** One-slot hard-ceiling edge × 4 arrivals/min: every tick admits 1 and
 *  sheds 3 (tick ≡ 1 sim-minute). Origin is wide + patient so nothing ever
 *  queues behind it — the ONLY terminal pressure in this fixture is the
 *  hard ceiling (F-2's exact mechanism, isolated). */
const SHED_NODES = Object.freeze([
  node(IDS.edge, { slots: 1, serviceUs: MIN, discipline: "hard-ceiling" }),
  node(IDS.origin, { slots: 8, serviceUs: MIN }),
]);

/** Hockey-stick twin: identical capacity, ceiling discipline removed. */
const PLAIN_NODES = Object.freeze([
  node(IDS.edge, { slots: 1, serviceUs: MIN }),
  node(IDS.origin, { slots: 8, serviceUs: MIN }),
]);

/** 1,000,000 minutes of patience over a 40-tick run: the elapsed/patience
 *  ratio never reaches one basis point, so the R-60 LUT returns exact zero
 *  probability for every roll (`bounceProbability` floors below the first
 *  50-bps grid step) — the NEVER_BOUNCE branch is arithmetic, not luck. */
const NEVER_BOUNCE_US = 1_000_000n * MIN;

const ARRIVALS_PER_MIN = 4;
const ARRIVAL_TICKS = 10;
const DRAIN_TICKS = 30;

function shedConfig(overrides: Partial<DefaultPipelineConfig> = {}): DefaultPipelineConfig {
  return testConfig({ defaultPatienceUs: NEVER_BOUNCE_US, ...overrides });
}

function arrivalInputs(): TickInputs {
  return tickInputs({
    envelopes: Object.freeze([envelope("shed-terminal:probe", fromInt(ARRIVALS_PER_MIN))]),
    dependencyEdges: Object.freeze([]), // plain two-hop geometry, no hold games
  });
}

function quietInputs(): TickInputs {
  return tickInputs({ envelopes: Object.freeze([]), dependencyEdges: Object.freeze([]) });
}

interface ShedRun {
  readonly chain: readonly string[];
  readonly events: readonly SimEvent[];
  readonly final: GameState;
  readonly driver: TickDriver;
  /** Live roster the instant the arrival phase ends (tick ARRIVAL_TICKS). */
  readonly rosterAfterArrivals: number;
}

function runShed(nodes: readonly NodeRecord[], seed: bigint): ShedRun {
  const config = shedConfig({ runSeed: asRunSeed(seed) });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    purgeTargetedMinNodes: 0, // 2-node fixture: pin the index arm on
  });
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "shed-terminal",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "shed-terminal", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes,
  });
  const chain: string[] = [];
  const events: SimEvent[] = [];
  for (let t = 0; t < ARRIVAL_TICKS; t += 1) {
    const result = driver.advance(state, arrivalInputs());
    state = result.state;
    events.push(...result.events);
    chain.push(digestState(state));
  }
  const rosterAfterArrivals = state.units.size;
  for (let t = 0; t < DRAIN_TICKS; t += 1) {
    const result = driver.advance(state, quietInputs());
    state = result.state;
    events.push(...result.events);
    chain.push(digestState(state));
  }
  return { chain, events, final: state, driver, rosterAfterArrivals };
}

const TERMINAL_TOTAL = ARRIVALS_PER_MIN * ARRIVAL_TICKS; // 40 minted, NO_RETRY: none re-enter

/* ═══════════════════ 1 · the leak, red-first, then closed ═══════════════════ */

describe("hard-ceiling shed terminals (R8 F-2, red-first on c06aa9b)", () => {
  it("every shed unit terminates in the tick it is shed — zero immortals", () => {
    const run = runShed(SHED_NODES, 42n);
    // The F-2 leak signature at HEAD: the shed channel never terminalized —
    // every arrival-phase unit that was shed instead of admitted stayed on
    // the roster forever (measured on exactly this board: arrival-phase
    // roster 33, ZERO bounce terminals; fixed: roster 3, bounced 30,
    // served 10).
    expect(run.rosterAfterArrivals).toBeLessThanOrEqual(6); // admitted + in-service only
    expect(run.final.units.size).toBe(0); // drain phase + NO_RETRY: full drain
    const bounced = run.events.filter((event) => event.kind === "bounced");
    const landed = run.events.filter((event) => event.kind === "landed");
    const served = run.events.filter((event) => event.kind === "served");
    expect(landed).toHaveLength(0); // organic baseline: nobody lands
    expect(bounced.length).toBeGreaterThan(0); // the shed channel fires
    // Conservation: every minted unit exits through exactly one terminal.
    expect(bounced.length + served.length).toBe(TERMINAL_TOTAL);
  });

  it("the shed storm is front-loaded: ≥ 3 bounces on EVERY arrival tick", () => {
    const run = runShed(SHED_NODES, 42n);
    // 4 arrivals/min on a 1-slot ceiling: admission takes the head, the
    // other 3 shed (tick 1 sheds 3, later ticks also re-drain their own
    // joins; the head admitted on tick t may itself re-queue downstream —
    // never a bounce source). 3/tick is the structural floor.
    for (let t = 1; t <= ARRIVAL_TICKS; t += 1) {
      const tick = BigInt(t);
      const bounced = run.events.filter(
        (event) => event.kind === "bounced" && event.tick === tick,
      );
      expect(bounced.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("patience innocence: the twin run with NEVER_BOUNCE patience and NO ceiling never bounces", () => {
    // Same mint schedule on hockey-stick nodes: nothing queues long enough
    // against the million-minute budget to earn an R-60 roll. If this ever
    // bounces, the shed-terminal counts above are NOT pure ceiling
    // attribution and the fixture must be re-isolated.
    const run = runShed(PLAIN_NODES, 42n);
    expect(run.events.filter((event) => event.kind === "bounced")).toHaveLength(0);
    // The REAL discipline contrast pin (R10: the old `>= hard.final` was
    // vacuous — hard.final==0 is pinned in test 1 and a roster size can
    // never dip below zero, so the clause could not fail). Exact census
    // measured 2026-10-08 at tree b501e53 on the CURRENT driver: the plain
    // twin retains 3 live units at run end (37 of the 40 mints served, 0
    // bounced — the 4/min × 10-tick burst outlives the 30-tick drain at
    // one edge-completion per tick, so 3 units are still mid two-hop path).
    // The fixed hard-ceiling twin drains to ZERO (pinned in test 1 + the
    // vendored digests): that is the real contrast — plain holds a live
    // tail of 3 where the ceiling board terminalizes 30 sheds. This pin is
    // falsifiable on the plain side: any retention drift trips the exact
    // number. (Cross-witness: the plain arrival-phase roster is 33, the
    // very figure the c06aa9b leak produced on the ceiling board — pre-fix,
    // hard behaved exactly like plain: no terminations.)
    expect(run.final.units.size).toBe(3);
  });
});

/* ═══════════════ 2 · observable shape == patience-bounce idiom ═══════════════ */

describe("shed terminals speak the exact patience-bounce vocabulary", () => {
  it("shed bounces: kind bounced, nodeId = shedding node, causeId = outcome:<unitId>", () => {
    const run = runShed(SHED_NODES, 42n);
    const bounced = run.events.filter((event) => event.kind === "bounced");
    expect(bounced.length).toBeGreaterThan(0);
    const seen = new Set<EntityId>();
    for (const event of bounced) {
      expect(event.nodeId).toBe(IDS.edge); // the hard-ceiling node that shed it
      expect(event.causeId).toBe(`outcome:${event.unitId}`); // silent preset family
      expect(seen.has(event.unitId)).toBe(false); // dies once — no re-shed
      seen.add(event.unitId);
    }
  });

  it("word-for-word parity with a real patience-bounce event", () => {
    // Patience arm: 1-slot hockey-stick edge, 1-minute patience → R-60
    // rolls fire. Compare the EVENT FIELD SETS (not values) between the
    // two bounce sources: downstream (counters, causality, HUD) must not
    // be able to tell them apart except through attribution it already
    // reads (nodeId) — that is the R-06 "terminal like a bounce" contract.
    const patienceRun = (() => {
      const config = shedConfig({ runSeed: asRunSeed(7n), defaultPatienceUs: MIN, patienceJitterPct: 0 });
      const driver = createTickDriver(
        createDefaultSlots(config),
        streamFor(config.runSeed, "root", 0),
        freshClocks(),
        { purgeTargetedMinNodes: 0 },
      );
      let state = createInitialState({
        runSeed: config.runSeed,
        engineVersion: "shed-terminal-patience",
        contentHashes: { rulesetCardHashes: {}, sheetsHash: "shed-terminal", ruleBookHash: "" },
        clocks: freshClocks(),
        nodes: PLAIN_NODES,
      });
      const out: SimEvent[] = [];
      for (let t = 0; t < ARRIVAL_TICKS; t += 1) {
        const result = driver.advance(state, arrivalInputs());
        state = result.state;
        out.push(...result.events);
      }
      return out.filter((event) => event.kind === "bounced");
    })();
    expect(patienceRun.length).toBeGreaterThan(0); // the arm really bounces
    const shedBounce = runShed(SHED_NODES, 42n).events.find((event) => event.kind === "bounced");
    expect(shedBounce).toBeDefined();
    expect(Object.keys(shedBounce!).sort()).toStrictEqual(Object.keys(patienceRun[0]!).sort());
    for (const event of patienceRun) {
      expect(String(event.causeId).startsWith(`outcome:${event.unitId}`)).toBe(true);
    }
  });
});

/* ═══════════════════ 3 · determinism + vendored goldens ═══════════════════ */

describe("shed-firing run is deterministic and pinned", () => {
  it("twin runs agree byte-for-byte (×2 chains)", () => {
    const a = runShed(SHED_NODES, 42n);
    const b = runShed(SHED_NODES, 42n);
    expect(a.chain).toStrictEqual(b.chain);
  });

  it("VENDORED shed-run digests (fixed behavior)", () => {
    // Derived 2026-10-08 against the FIXED tree at the R8 F-2 driver change:
    // seed 42, SHED_NODES (edge 1-slot hard-ceiling 1min, origin 8-slot
    // 1min), 4/min plateau × 10 arrival ticks then 30 quiet ticks, NO_RETRY,
    // NEVER_BOUNCE patience, purgeTargetedMinNodes 0. chain[k] = digestState
    // after tick k+1. If any of these moves, shed terminalization changed
    // observable state — re-audit against this file's mechanism assertions,
    // never casually re-pin.
    const run = runShed(SHED_NODES, 42n);
    // t10 — shed storm in full flight; t20 — arrivals stopped, in-service
    // draining; t40 — roster empty, queues drained.
    expect(run.chain[9]).toBe("be7347e304abeea9f2729c0c21dc0999");
    expect(run.chain[19]).toBe("19226de0e3551e51add203f1a4dcce5f");
    expect(run.chain[39]).toBe("4ce12efd6f7b7698add203f1a4dcce5f");
    // Census pin: exactly 30 shed-bounces + 10 admitted-serves = 40 mints.
    expect(run.events.filter((event) => event.kind === "bounced")).toHaveLength(30);
    expect(run.events.filter((event) => event.kind === "served")).toHaveLength(10);
  });
});
