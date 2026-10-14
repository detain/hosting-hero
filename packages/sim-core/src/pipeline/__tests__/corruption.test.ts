/**
 * §3.1 `corrupts` patience mode (R25 "corrupt-not-bounce") — the silent
 * corruption channel v0. Heading home: "Patience as HP — the unified visitor
 * spec (the reverse creep)" (hosting_game.md:11436, under "## 3.1 The visitor
 * model" :11434).
 *
 * Pins:
 *  - ACTIVATION: only an authored `corrupts` row arms the channel; every
 *    other table (and the bare run) keeps the HISTORICAL step output shape,
 *    the same digests, and no `TickResult.corruptions` key (×100 chain);
 *  - an armed-but-never-exhausted run digests byte-identically to bare —
 *    arming is not firing;
 *  - ONE exhaustion roll per unit, on a NEW "corrupt" stream: a false verdict
 *    is never re-cast (a re-rolling implementation flips it — proven by the
 *    non-vacuity probe against the very streams a naive loop would draw);
 *  - the mode DELAYS death, never prevents it: hard-ceiling sheds still
 *    terminate (roster drains), and every corruption rides a `served`
 *    terminal in the SAME tick — bounced exits never corrupt;
 *  - counter accuracy: lifetime state count == Σ TickResult corruptions ==
 *    observed `::corruptedCount` cells;
 *  - the frozen SimEvent union stays untouched: no event ever carries a
 *    `corruption:` cause — the channel is TickResult-side only.
 */

import { describe, expect, it } from "vitest";
import type { Contract, EntityId, PatienceMode, QueueWait, SourceRef, Unit } from "../../types";
import { asEntityId, asRunSeed, observedKey } from "../../types";
import { FIXED_UNIT, FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed";
import { MICROS_PER_MIN as MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createInitialState, createTickDriver, type TickInputs } from "../driver";
import { createDefaultSlots, digestState } from "../index";
import { createPatienceCheckStep, type PatienceCheckOutExt } from "../defaults";
import {
  CORRUPTION_OUTAGE_SEC,
  corruptionCauseId,
  corruptionOutageSecs,
  foldCorruptionTerminals,
} from "../corruption";
import { rollUnder } from "../internal.ts";
import { DEFAULT_CLASSES, freshClocks, NO_RETRY, envelope, node, testConfig, tickInputs } from "./helpers";

const SEED = asRunSeed(777n);

function source(): SourceRef {
  return Object.freeze({ identity: "corrupt:s0", reputation: FIXED_UNIT });
}

function queuedUnit(overrides: {
  id: string;
  type?: string;
  patienceUs: bigint;
  elapsedUs?: bigint;
}): Unit {
  return Object.freeze({
    id: asEntityId(overrides.id),
    type: overrides.type ?? "corrupt:probe",
    sizeCost: fromInt(1),
    patienceUs: overrides.patienceUs,
    trueIntent: "customer" as const,
    source: source(),
    retryOf: null,
    arrivedAtTick: 1n,
    accumulatedLatencyUs: overrides.elapsedUs ?? 0n,
    inspectionCostUs: 0n,
    confidence: FIXED_ZERO,
    qosClassId: null,
    routeHops: Object.freeze([asEntityId("edge")]),
    waitingOn: null,
  });
}

function stepContext(minute: number) {
  return Object.freeze({ tick: BigInt(minute), minute, clocks: freshClocks() });
}

function runStep(
  config: Parameters<typeof createPatienceCheckStep>[0],
  units: readonly Unit[],
  waitUs: bigint,
  corruption?: PatienceCheckOutExt["corruption"],
  minute = 10,
): PatienceCheckOutExt {
  const step = createPatienceCheckStep(config);
  return step(
    Object.freeze({
      context: stepContext(minute),
      units,
      waits: units.map((u) => Object.freeze({ unitId: u.id, queueWaitUs: waitUs }) as QueueWait),
      ...(corruption !== undefined ? { corruption } : {}),
    }),
  ) as PatienceCheckOutExt;
}

const corruptsCfg = {
  runSeed: SEED,
  patienceModeByType: { "corrupt:probe": "corrupts" as const },
};

/* ═══════════════════════ step 9 — exhaustion marks ═══════════════════════ */

describe("step 9 corrupts marking (certain default, zero bounce)", () => {
  it("exhausted unit gets a TRUE mark; budget-fit and unlisted types stay clean; NOTHING bounces", () => {
    const exhausted = queuedUnit({ id: "cx-over", patienceUs: 10n * MIN, elapsedUs: 8n * MIN });
    const inside = queuedUnit({ id: "cx-under", patienceUs: 10n * MIN, elapsedUs: 1n * MIN });
    const unlisted = queuedUnit({ id: "cx-lut", type: "browser", patienceUs: 10n * MIN, elapsedUs: 95n * MIN });
    const out = runStep(corruptsCfg, [exhausted, inside, unlisted], 4n * MIN);
    // only the UNLISTED browser type faces the LUT (and leaves with
    // certainty at 9.9× budget) — the corrupts type never patience-bounces:
    expect(out.bounced.map(String)).toStrictEqual(["cx-lut"]);
    expect(out.corruption).toBeDefined();
    const marks = out.corruption?.marks;
    expect(marks?.get(asEntityId("cx-over"))).toBe(true); // certain default, no roll
    expect(marks?.has(asEntityId("cx-under"))).toBe(false);
    expect(marks?.get(asEntityId("cx-lut"))).toBeUndefined();
    expect(out.corruption?.corruptedCount).toBe(0); // the fold, not the step, counts
  });

  it("armed-but-inert output keeps the HISTORICAL shape — no corruption key at all", () => {
    const inside = queuedUnit({ id: "inert-1", patienceUs: 10n * MIN, elapsedUs: 1n * MIN });
    const out = runStep(corruptsCfg, [inside], 1n * MIN);
    expect(Object.keys(out)).toStrictEqual(["bounced"]); // byte-identity witness
    // …and the LUT twin at the same budget point DOES roll bounces (non-vacuity:
    // the unit would have left without the mode).
    const lut = runStep({ runSeed: SEED }, [inside], 9n * MIN);
    expect(lut.bounced).toStrictEqual(["inert-1"]);
  });

  it("probability 0 ⇒ every exhaustion records FALSE (resident-with-paper-trail)", () => {
    const cfg = { ...corruptsCfg, corruptionProbability: FIXED_ZERO };
    const units = Array.from({ length: 15 }, (_, k) =>
      queuedUnit({ id: `p0-${k}`, patienceUs: 10n * MIN, elapsedUs: 95n * MIN }),
    );
    const out = runStep(cfg, units, 5n * MIN);
    expect(out.bounced).toStrictEqual([]);
    expect([...(out.corruption?.marks.values() ?? [])]).toStrictEqual(new Array(15).fill(false));
  });

  it("ONE roll per exhausted unit — a false verdict is never re-cast", () => {
    const half = fromRatio(1n, 2n);
    const cfg = { ...corruptsCfg, corruptionProbability: half };
    const unit = queuedUnit({ id: "once-only", patienceUs: 10n * MIN, elapsedUs: 95n * MIN });
    const first = runStep(cfg, [unit], 5n * MIN, undefined, 10);
    const verdict = first.corruption?.marks.get(asEntityId("once-only"));
    expect(verdict).toBeDefined();
    // Non-vacuity: a naive per-tick re-roll over minutes 10..40 WOULD flip the
    // verdict (probe the very "corrupt" streams the re-roll would consult).
    let anyFlip = false;
    for (let m = 10; m <= 40; m += 1) {
      if (rollUnder(half, streamFor(SEED, "corrupt", m, unit.id).nextU32()) !== (verdict === true)) {
        anyFlip = true;
        break;
      }
    }
    expect(anyFlip).toBe(true);
    // Sticky discipline: carry the slice forward; the verdict never changes.
    let carry = first.corruption;
    for (let m = 11; m <= 40; m += 1) {
      const again = runStep(cfg, [unit], 5n * MIN, carry, m);
      expect(again.corruption?.marks.get(asEntityId("once-only"))).toBe(verdict);
      expect(again.corruption?.marks.size).toBe(1);
      carry = again.corruption;
    }
  });

  it("the corrupt stream never touches the bounce stream (blast-radius census)", () => {
    // Same units, same minute: the bounce draws of a sigmoid run are
    // bit-identical whether or not a sibling corrupts unit rolled corrupt.
    const sigmoid = queuedUnit({ id: "bs-lut", type: "browser", patienceUs: 10n * MIN, elapsedUs: 6n * MIN });
    const corruptBuddy = queuedUnit({ id: "bs-cx", patienceUs: 10n * MIN, elapsedUs: 95n * MIN });
    const half = fromRatio(1n, 2n);
    const twin = runStep({ runSeed: SEED, patienceModeByType: { browser: "sigmoid-budget" as const } }, [sigmoid], 4n * MIN);
    const mixed = runStep({ ...corruptsCfg, corruptionProbability: half }, [sigmoid, corruptBuddy], 4n * MIN);
    expect(mixed.bounced).toStrictEqual(twin.bounced); // bounce dice untouched
    expect(mixed.corruption?.marks.get(asEntityId("bs-cx"))).toBeDefined();
  });
});

/* ═══════════════════════ pure terminal fold ═══════════════════════ */

function slice(unitId: string, willCorrupt: boolean, count = 0) {
  return Object.freeze({ marks: Object.freeze(new Map([[asEntityId(unitId), willCorrupt]])), corruptedCount: count });
}

describe("foldCorruptionTerminals (pure)", () => {
  it("served + true mark ⇒ one CorruptOutcome, named cause, mark consumed", () => {
    const fold = foldCorruptionTerminals(slice("fx-1", true), [{ unitId: asEntityId("fx-1"), terminal: "served" }], 500n, 7);
    expect(fold.corruptions).toHaveLength(1);
    expect(fold.corruptions[0]?.causeId).toBe(corruptionCauseId(asEntityId("fx-1"), 7));
    expect(String(fold.corruptions[0]?.causeId)).toBe("corruption:fx-1:7");
    expect(fold.corruptions[0]?.atUs).toBe(500n);
    expect(fold.state?.marks.size).toBe(0);
    expect(fold.state?.corruptedCount).toBe(1); // lifetime persists past the mark
  });

  it("served + FALSE mark ⇒ quiet completion, no damage, count stays 0 ⇒ slice drains to absent", () => {
    const fold = foldCorruptionTerminals(slice("fx-2", false), [{ unitId: asEntityId("fx-2"), terminal: "served" }], 1n, 2);
    expect(fold.corruptions).toHaveLength(0);
    expect(fold.state).toBeUndefined(); // absent-while-idle law
  });

  it("EVERY non-served terminal clears its mark with ZERO damage (delays death, never prevents)", () => {
    for (const terminal of ["bounced", "landed", "blocked-false-positive"] as const) {
      const fold = foldCorruptionTerminals(slice("fx-3", true), [{ unitId: asEntityId("fx-3"), terminal }], 1n, 2);
      expect(fold.corruptions).toHaveLength(0);
      expect(fold.state).toBeUndefined();
    }
  });

  it("unmarked terminals and undefined prior are inert (default-off)", () => {
    const untouched = foldCorruptionTerminals(
      slice("fx-4", true),
      [{ unitId: asEntityId("other"), terminal: "served" }],
      1n,
      2,
    );
    expect(untouched.corruptions).toHaveLength(0);
    expect(untouched.state?.marks.has(asEntityId("fx-4"))).toBe(true); // mark waits for its unit
    const off = foldCorruptionTerminals(undefined, [{ unitId: asEntityId("fx-5"), terminal: "served" }], 1n, 2);
    expect(off.state).toBeUndefined();
    expect(off.corruptions).toHaveLength(0);
  });
});

/* ═══════════════════════ economy consume-site adapter ═══════════════════════ */

describe("corruptionOutageSecs (errorBudget adapter)", () => {
  const contract = asEntityId("c-one");
  const books = new Map<EntityId, Contract>([
    [contract, {} as Contract],
    [asEntityId("c-two"), {} as Contract],
  ]);
  const corrupt = (id: string) => ({
    unitId: asEntityId(id),
    atUs: 0n,
    causeId: corruptionCauseId(asEntityId(id), 1),
  });

  it("empty corruptions or empty books ⇒ null (the host map stays untouched)", () => {
    expect(corruptionOutageSecs([], books)).toBeNull();
    expect(corruptionOutageSecs([corrupt("a")], new Map())).toBeNull();
  });

  it("N corruptions fan 60s×N (PROVISIONAL, lands-twin constant) to EVERY contract", () => {
    expect(CORRUPTION_OUTAGE_SEC).toBe(60n);
    const fan = corruptionOutageSecs([corrupt("a"), corrupt("b"), corrupt("c")], books);
    expect(fan?.get(contract)).toBe(180n);
    expect(fan?.get(asEntityId("c-two"))).toBe(180n);
    expect(fan?.size).toBe(2);
  });
});

/* ═══════════════════════ driver-level witnesses ═══════════════════════ */

type ChainFrame = {
  readonly digest: string;
  readonly corruptionPresent: boolean;
  readonly corruptions: readonly { unitId: EntityId; causeId: string }[];
  readonly servedUnitIds: readonly EntityId[];
  readonly bouncedUnitIds: readonly EntityId[];
  readonly rosterSize: number;
};

function chain(
  opts: {
    patienceModeByType?: Readonly<Record<string, PatienceMode>>;
    rate?: number;
    hardCeiling?: boolean;
    patienceUs?: bigint;
    ticks?: number;
    seed?: bigint;
  } = {},
): ChainFrame[] {
  const ids = { edge: asEntityId("edge"), origin: asEntityId("origin") } as const;
  const config = testConfig({
    runSeed: asRunSeed(opts.seed ?? 31n),
    defaultPatienceUs: opts.patienceUs ?? 3n * MIN,
    expressPath: Object.freeze([ids.edge, ids.origin]),
    deepPath: Object.freeze([ids.edge, ids.origin]),
    ...(opts.patienceModeByType !== undefined ? { patienceModeByType: opts.patienceModeByType } : {}),
  });
  const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
    purgeTargetedMinNodes: 0,
  });
  let state = createInitialState({
    runSeed: config.runSeed,
    engineVersion: "corruption-test",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "corruption-test", ruleBookHash: "" },
    clocks: freshClocks(),
    nodes: Object.freeze([
      opts.hardCeiling === true
        ? node(ids.edge, { slots: 1, serviceUs: MIN, discipline: "hard-ceiling" })
        : node(ids.edge, { slots: 1, serviceUs: MIN }), // congested: queues, waits, patience
      node(ids.origin, { slots: 8, serviceUs: MIN }),
    ]),
  });
  const frames: ChainFrame[] = [];
  for (let t = 0; t < (opts.ticks ?? 24); t += 1) {
    const inputs: TickInputs = tickInputs({
      envelopes: Object.freeze([envelope("corr:probe", fromInt(opts.rate ?? 6))]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: NO_RETRY,
      classes: DEFAULT_CLASSES,
    });
    const result = driver.advance(state, inputs);
    state = result.state;
    frames.push({
      digest: digestState(state),
      corruptionPresent: "corruptions" in result,
      corruptions: (result.corruptions ?? []).map((c) => ({ unitId: c.unitId, causeId: String(c.causeId) })),
      servedUnitIds: result.outcomes.filter((o) => o.terminal === "served").map((o) => o.unitId),
      bouncedUnitIds: result.outcomes.filter((o) => o.terminal === "bounced").map((o) => o.unitId),
      rosterSize: state.units.size,
    });
  }
  return frames;
}

describe("driver corrupts witnesses", () => {
  it("congested corrupts run: marks form, every corruption rides a SAME-TICK served terminal, counters close", () => {
    const frames = chain({ patienceModeByType: { "corr:probe": "corrupts" }, ticks: 30 });
    const total = frames.reduce((n, f) => n + f.corruptions.length, 0);
    expect(total).toBeGreaterThan(0); // congestion + 3-min patience ⇒ damage happens
    for (const frame of frames) {
      for (const c of frame.corruptions) {
        expect(frame.servedUnitIds).toContain(c.unitId); // served only…
        expect(frame.bouncedUnitIds).not.toContain(c.unitId); // …never alongside a bounce
        expect(c.causeId).toMatch(/^corruption:corr:probe@\d+#\d+\.\d+:\d+$/); // house naming
      }
    }
    const last = frames[frames.length - 1];
    if (last === undefined) throw new Error("chain produced no frames");
    expect(last.corruptionPresent).toBe(true);
  });

  it("corruption NEVER enters the frozen event union (TickResult-side channel)", () => {
    const frames = chain({ patienceModeByType: { "corr:probe": "corrupts" }, ticks: 12 });
    expect(frames.some((f) => f.corruptions.length > 0)).toBe(true);
    // Structural proof: re-run one tick capturing the FULL result, assert no
    // event carries a corruption cause and no event kind exists for it.
    const ids = { edge: asEntityId("edge"), origin: asEntityId("origin") } as const;
    const config = testConfig({
      runSeed: asRunSeed(31n),
      defaultPatienceUs: 3n * MIN,
      patienceModeByType: { "corr:probe": "corrupts" },
    });
    const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
      purgeTargetedMinNodes: 0,
    });
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "corruption-events",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "corruption-events", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: Object.freeze([
        node(ids.edge, { slots: 1, serviceUs: MIN }),
        node(ids.origin, { slots: 8, serviceUs: MIN }),
      ]),
    });
    let sawCorruptionFrame = false;
    for (let t = 0; t < 12; t += 1) {
      const result = driver.advance(
        state,
        tickInputs({
          envelopes: Object.freeze([envelope("corr:probe", fromInt(6))]),
          dependencyEdges: Object.freeze([]),
          retryPolicy: NO_RETRY,
          classes: DEFAULT_CLASSES,
        }),
      );
      state = result.state;
      for (const event of result.events) {
        expect(String(event.causeId)).not.toMatch(/^corruption:/);
        expect((event as { kind: string }).kind).not.toBe("corruption");
      }
      if ((result.corruptions ?? []).length > 0) sawCorruptionFrame = true;
    }
    expect(sawCorruptionFrame).toBe(true); // the witness rode the CHANNEL, not events
  });

  it("lifetime count == Σ TickResult corruptions == observed corruptedCount cells", () => {
    const ids = { edge: asEntityId("edge"), origin: asEntityId("origin") } as const;
    const config = testConfig({
      runSeed: asRunSeed(31n),
      defaultPatienceUs: 3n * MIN,
      patienceModeByType: { "corr:probe": "corrupts" },
    });
    const driver = createTickDriver(createDefaultSlots(config), streamFor(config.runSeed, "root", 0), freshClocks(), {
      purgeTargetedMinNodes: 0,
    });
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "corruption-counters",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "corruption-counters", ruleBookHash: "" },
      clocks: freshClocks(),
      nodes: Object.freeze([
        node(ids.edge, { slots: 1, serviceUs: MIN }),
        node(ids.origin, { slots: 8, serviceUs: MIN }),
      ]),
    });
    let total = 0;
    for (let t = 0; t < 30; t += 1) {
      const result = driver.advance(
        state,
        tickInputs({
          envelopes: Object.freeze([envelope("corr:probe", fromInt(6))]),
          dependencyEdges: Object.freeze([]),
          retryPolicy: NO_RETRY,
          classes: DEFAULT_CLASSES,
        }),
      );
      state = result.state;
      total += result.corruptions?.length ?? 0;
      for (const c of result.corruptions ?? []) {
        const cell = state.observed.get(observedKey(c.unitId, "corruptedCount"));
        expect(cell?.value).toBe(1); // per-response truth cell
      }
    }
    expect(total).toBeGreaterThan(0);
    expect(state.corruption?.corruptedCount).toBe(total);
    // Marks in flight at the end are live queue-dwellers only:
    for (const marked of state.corruption?.marks.keys() ?? []) {
      expect(state.units.has(marked)).toBe(true); // no stranded marks
    }
  });

  it("hard ceiling still drains the roster: the mode delays death, never prevents it", () => {
    const frames = chain({
      patienceModeByType: { "corr:probe": "corrupts" },
      hardCeiling: true,
      rate: 4,
      ticks: 40,
    });
    const bounced = frames.reduce((n, f) => n + f.bouncedUnitIds.length, 0);
    expect(bounced).toBeGreaterThan(0); // the ceiling is orthogonal to patience
    // No immortal factories: the roster stays BOUNDED — steady state is one
    // tick of un-shed arrivals, not the +6/tick pile the no-ceiling board
    // produces (shed-terminal's golden law, re-pinned against this mode).
    const tail = frames[frames.length - 1];
    if (tail === undefined) throw new Error("chain produced no frames");
    expect(tail.rosterSize).toBeLessThanOrEqual(8);
    // Every corruption (if any) still rides a same-tick served terminal, and
    // no bounced exit ever carries damage:
    for (const frame of frames) {
      for (const c of frame.corruptions) {
        expect(frame.servedUnitIds).toContain(c.unitId);
        expect(frame.bouncedUnitIds).not.toContain(c.unitId);
      }
    }
    // Shed exits leave NO damage trail: a corruption needs a COMPLETED
    // response, and under the ceiling the marked-in-queue units die queued.
    const servedClean = frames.reduce(
      (n, f) => n + f.servedUnitIds.filter((id) => !f.corruptions.some((c) => c.unitId === id)).length,
      0,
    );
    const damaged = frames.reduce((n, f) => n + f.corruptions.length, 0);
    expect(servedClean + damaged).toBeGreaterThan(0); // the served pipeline still moves
  });

  it("activation census — bare / empty / explicit-sigmoid / ARMED-IDLE digest byte-identically (×100)", () => {
    const bare = chain({ ticks: 12 });
    expect(chain({ patienceModeByType: {}, ticks: 12 })).toStrictEqual(bare);
    expect(chain({ patienceModeByType: { "corr:probe": "sigmoid-budget" }, ticks: 12 })).toStrictEqual(bare);
    // ARMED but idle: instant service ⇒ nobody queues ⇒ nobody exhausts ⇒
    // the channel never materializes — same digests AND no corruption key.
    const idle = chain({ patienceModeByType: { "corr:probe": "corrupts" }, rate: 1, patienceUs: 1_000n * MIN, ticks: 12 });
    const bareIdle = chain({ rate: 1, patienceUs: 1_000n * MIN, ticks: 12 });
    expect(idle.map((f) => f.digest)).toStrictEqual(bareIdle.map((f) => f.digest));
    expect(idle.every((f) => !f.corruptionPresent && f.corruptions.length === 0)).toBe(true);
    // ×100 replay discipline on the bare final digest (fresh driver each time):
    const final = bare[bare.length - 1]?.digest;
    for (let i = 0; i < 100; i += 1) {
      expect(chain({ ticks: 12 })[11]?.digest).toBe(final);
    }
  }, 120_000);

  it("disclosed: an ARMED congested run diverges from bare (config-gated only)", () => {
    const bare = chain({ ticks: 12 }).map((f) => f.digest);
    const armed = chain({ patienceModeByType: { "corr:probe": "corrupts" }, ticks: 12 });
    expect(armed.map((f) => f.digest)).not.toStrictEqual(bare); // units stay, damage accrues
    expect(armed.some((f) => f.corruptionPresent)).toBe(true);
  });
});
