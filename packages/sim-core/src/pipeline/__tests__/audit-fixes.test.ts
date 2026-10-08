/**
 * Pins for the 2026-10-08 comment-audit fix lane (F6 / F5 / O1).
 *
 *  - F6 · checkpoint depth survival: exportPending/importPending carry the
 *    LIVE units' retry depths, so a restored run continues the storm with
 *    the same depths (and the same maxRetries gate biting) as the
 *    uninterrupted run. Derived from probe P5.
 *  - F5 · validator snapshot stamping: with a zero-cost verb the placement
 *    validator must see THIS pass's TickContext in `query.state`, while the
 *    identity law (all-refused ⇒ same state object) stays intact. Derived
 *    from probes P4 + P3 (P3 also pins the documented exception the F4
 *    wording now names: a due hand token materializes the hands slice).
 *  - O1 · evidence order: the canonical fold order extends to `value`, so
 *    DUPLICATE (unitId, metric) pairs are permutation-invariant too.
 *    Derived from probe P1 (raw fold proven order-sensitive first).
 */

import { describe, expect, it } from "vitest";
import type { GameState, RunSeed, Unit } from "../../types";
import { FIXED_UNIT, clampUnit, mul, sub } from "../../kernel/fixed";
import { initialClocks } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots, defaultScoringStep } from "../defaults";
import { createInitialState, createTickDriver } from "../driver";
import { applyIntentDoor } from "../intent-door";

const S = FIXED_UNIT; // 65536n Q16.16 unit
const MIN = 60_000_000n;

/* ═══════════════════ O1 · duplicate-pair permutation invariance ═══════════ */

describe("canonicalEvidenceOrder total tie-break (O1)", () => {
  const scoringContext = {
    tick: 5n,
    minute: 5,
    clocks: { realUs: 5_000_000n, simUs: 300_000_000n, businessUs: 0n, wallUs: 0n },
  } as never;

  const probeUnit = {
    id: "u1",
    type: "t",
    sizeCost: 65536n,
    patienceUs: 1n,
    trueIntent: "customer",
    source: { identity: "s", reputation: 0n },
    retryOf: null,
    arrivedAtTick: 0n,
    accumulatedLatencyUs: 0n,
    inspectionCostUs: 0n,
    confidence: 0n,
    qosClassId: null,
    routeHops: [],
    waitingOn: null,
  } as unknown as Unit;

  /** The first (unitId, metric)-tied triple whose RAW fold is order-sensitive
   *  (control: without such a triple the pin below would be vacuous). */
  function orderSensitiveTriple(): [bigint, bigint, bigint] {
    const fold = (acc: bigint, v: bigint) => mul(acc, clampUnit(sub(S, v)));
    for (let a = 1000n; a < 60000n; a += 4177n) {
      for (let b = 1000n; b < 60000n; b += 5209n) {
        for (let c = 1000n; c < 60000n; c += 6301n) {
          const one = fold(fold(fold(S, a), b), c);
          const two = fold(fold(fold(S, c), a), b);
          const three = fold(fold(fold(S, b), c), a);
          if (!(one === two && two === three)) return [a, b, c];
        }
      }
    }
    throw new Error("O1 control failed: no order-sensitive dup-key triple in the search grid");
  }

  const contribution = (value: bigint) => ({ unitId: "u1" as never, metric: "m" as never, value });

  it("raw fold over the pinned triple is order-sensitive (control)", () => {
    const [a, b, c] = orderSensitiveTriple();
    const fold = (acc: bigint, v: bigint) => mul(acc, clampUnit(sub(S, v)));
    expect(fold(fold(fold(S, a), b), c)).not.toBe(fold(fold(fold(S, c), a), b));
  });

  it("scoring is permutation-invariant for duplicate (unitId, metric) pairs", () => {
    const [a, b, c] = orderSensitiveTriple();
    const score = (values: readonly bigint[]) =>
      defaultScoringStep({
        context: scoringContext,
        units: [probeUnit],
        evidence: values.map(contribution),
      } as never).units[0]?.confidence;
    const baseline = score([a, b, c]);
    // all five other permutations of the same multiset must agree byte-wise
    expect(score([c, a, b])).toBe(baseline);
    expect(score([b, c, a])).toBe(baseline);
    expect(score([a, c, b])).toBe(baseline);
    expect(score([c, b, a])).toBe(baseline);
    expect(score([b, a, c])).toBe(baseline);
    // identical-content duplicates commute trivially
    expect(score([a, a, b])).toBe(score([a, b, a]));
  });
});

/* ═══════════════ F5 · zero-cost validator snapshot sees this pass ═══════════ */

describe("intent-door validator snapshot stamping (F5)", () => {
  const origin = {
    runSeed: 7n,
    engineVersion: "e",
    contentHashes: { sheetsHash: "", rulesetCardHashes: {} },
    // the ORIGIN carries the PRIOR tick's context (tick 3)
    context: {
      tick: 3n,
      minute: 3,
      clocks: { realUs: 3_000_000n, simUs: 180_000_000n, businessUs: 0n, wallUs: 0n },
    },
    units: Object.freeze(new Map()),
    nodes: Object.freeze(new Map()),
    lanes: Object.freeze(new Map()),
    observed: Object.freeze(new Map()),
    cash: {},
    ledgerSeq: 0,
    contracts: Object.freeze(new Map()),
    ruleBook: Object.freeze([]),
    ruleBookHash: "",
  } as unknown as GameState;

  const passContext = {
    tick: 5n,
    minute: 5,
    clocks: { realUs: 5_000_000n, simUs: 300_000_000n, businessUs: 0n, wallUs: 0n },
  } as const;

  it("cost-0 place-device: query.state.context is THIS pass, not the origin's", () => {
    let seenTick: bigint | null = null;
    let seenSimUs: bigint | null = null;
    const entry = {
      tick: 5n,
      intent: {
        seq: 1,
        atUs: 0n,
        clock: "sim",
        origin: "player",
        payload: {
          kind: "player-verb",
          args: { verb: "place-device", nodeId: "n1", deviceKind: "web", template: null },
        },
      },
    } as never;
    applyIntentDoor(origin, passContext as never, [entry], {
      handCost: { "place-device": 0 },
      occupancyTicks: { "place-device": 0 },
      canPlaceDevice: (query: { state: GameState }) => {
        seenTick = query.state.context.tick;
        seenSimUs = query.state.context.clocks.simUs;
        return null; // accept — the pin is what the validator SAW
      },
    } as never);
    expect(seenTick).toBe(5n); // pre-fix: 3n — the stale origin context
    expect(seenSimUs).toBe(300_000_000n);
  });

  it("identity law holds for all-refused with no hands slice and no due tokens", () => {
    const refused = {
      tick: 5n,
      intent: {
        seq: 1,
        atUs: 0n,
        clock: "sim",
        origin: "player",
        payload: { kind: "player-verb", args: { verb: "toggle-speed", speedX: 2.5 } },
      },
    } as never;
    const res = applyIntentDoor(origin, passContext as never, [refused], {});
    expect(res.state).toBe(origin); // zero-cost refusal touched no slice ⇒ origin identity
    expect(res.receipts.length).toBe(1);
    expect(String(res.receipts[0]?.outcome)).toBe("refused");
  });

  it("documented exception (F4 wording): a DUE token releases and materializes hands", () => {
    const dueToken = Object.freeze({ index: 0, busyUntilTick: 5n, busyCauseId: "intent:9" });
    const withHands = Object.freeze({
      ...origin,
      hands: Object.freeze({ capacity: 1, tokens: Object.freeze([dueToken]) }),
    });
    const refused = {
      tick: 5n,
      intent: {
        seq: 1,
        atUs: 0n,
        clock: "sim",
        origin: "player",
        payload: { kind: "player-verb", args: { verb: "communicate", target: null, note: "" } },
      },
    } as never;
    const res = applyIntentDoor(withHands as never, passContext as never, [refused], {});
    expect(String(res.receipts[0]?.outcome)).toBe("refused"); // all refused…
    // …yet the due-token release materialized the hands slice: identity
    // changes. This is exactly what the qualified identity law now states
    // ("…and no hand tokens due for release").
    expect(res.state).not.toBe(withHands);
    expect(res.state.hands?.tokens[0]?.busyCauseId).toBeNull();
  });
});

/* ═══════════════════ F6 · retry depths cross the checkpoint ═══════════════ */

describe("exportPending/importPending carry live retry depths (F6)", () => {
  // Multi-hop storm: a fast EDGE feeding a jammed ORIGIN. Units bounce at the
  // origin's queue-join (patience < projected wait), re-enter the edge at
  // rising retry depths, and get served there — so at the checkpoint tick the
  // depth-carrying units are LIVE in the edge, not pending. Pre-F6 the
  // checkpoint shipped only `pending` + the mint counter, so a restored run
  // silently zeroed their depths: the storm gets a fresh maxRetries budget
  // across THE LONG SAVE (backpressure reads `retryDepthById.get(id) ?? 0`).
  const seed = 42n as RunSeed;
  const TOTAL_TICKS = 24;
  const SNAP_TICK = 14;
  const route = ["edge", "origin"] as const;

  const slots = createDefaultSlots({
    runSeed: seed,
    dnsNodeId: null,
    expressPath: route,
    deepPath: route,
    defaultPatienceUs: 1_200_000_000n,
    defaultSizeCost: 65536n,
    patienceJitterPct: 0,
    inspectionCostUs: {
      "pass-through": 0n,
      "sample-1-in-20": 0n,
      inspect: 0n,
      challenge: 0n,
    },
    detectionRatio: 0n,
    falsePositiveRatio: 0n,
    referralProbability: 0n,
    returnProbability: 0n,
  } as never);

  const nodes = [
    {
      id: "edge",
      kind: "k",
      slots: [{ occupied: false, unitId: null, waitingOn: null, releasedAtUs: 0n }],
      serviceTimeUs: 120_000_000n,
      queueDepth: 0,
      queue: [],
      shedOrder: "qos-weighted",
      inspectionDepth: "pass-through",
      discipline: "hockey-stick",
      utilizationRho: 0n,
      dependencyNodeId: null,
    },
    {
      id: "origin",
      kind: "k",
      slots: [{ occupied: false, unitId: null, waitingOn: null, releasedAtUs: 0n }],
      serviceTimeUs: 1_800_000_000n,
      queueDepth: 0,
      queue: [],
      shedOrder: "qos-weighted",
      inspectionDepth: "pass-through",
      discipline: "hockey-stick",
      utilizationRho: 0n,
      dependencyNodeId: null,
    },
  ] as never;

  const clocks = initialClocks();
  const retryPolicy = { maxRetries: 2, backoffBaseUs: 1n, jitterPurchased: false };

  // Storm for 6 ticks, then silence: the last bounce generations are still
  // climbing at the checkpoint, exactly where a save would cut the tape.
  const inputs = (t: number) =>
    ({
      envelopes: [
        {
          tableId: "gold",
          role: "baseline",
          shape: "plateau",
          ratePerMin: t === 0 ? 0n : t < 6 ? 65536n * 3n : 0n,
          telegraphed: false,
          dominantFamily: "organic",
        },
      ],
      evidence: [],
      classes: [],
      dependencyEdges: [],
      retryPolicy,
      aggression: 0n,
      expressMaxConfidence: 65536n,
    }) as never;

  const mk = () => ({
    driver: createTickDriver(slots, streamFor(seed, "root", 0), clocks),
    state: createInitialState({
      runSeed: seed,
      engineVersion: "e",
      contentHashes: { sheetsHash: "", rulesetCardHashes: {} },
      clocks,
      nodes,
    } as never),
  });

  type Run = { causes: string[]; state: GameState };
  const collect = (from: number, to: number): ((s: GameState, d: ReturnType<typeof createTickDriver>) => Run) =>
    (s, d) => {
      const causes: string[] = [];
      let state = s;
      for (let t = from; t < to; t++) {
        const r = d.advance(state, inputs(t));
        state = r.state as GameState;
        for (const e of r.events) if (e.kind === "retry") causes.push(String(e.causeId));
      }
      return { causes, state };
    };
  const through = collect(0, TOTAL_TICKS);
  const pre = collect(0, SNAP_TICK);
  const post = collect(SNAP_TICK, TOTAL_TICKS);

  it("checkpoint carries live depths even with an empty pending queue; faithful restore is exact", () => {
    const cont = mk();
    const full = through(cont.state, cont.driver);
    expect(full.causes.length).toBeGreaterThan(0); // the storm is real

    const warm = mk();
    const warmRun = pre(warm.state, warm.driver);
    const checkpoint = warm.driver.exportPending();
    const mint = warm.driver.currentMintCounter();

    // THE F6 PIN: depths are exported while NOTHING is pending — the
    // depth-carrying units are live (in service/queued), precisely the
    // population the pre-fix checkpoint dropped.
    expect(checkpoint.pending.length).toBe(0);
    expect(checkpoint.depths.length).toBeGreaterThan(0);
    for (const [, depth] of checkpoint.depths) expect(depth).toBeGreaterThan(0);

    const cold = mk();
    cold.driver.importPending(checkpoint, mint);
    const restored = post(warmRun.state, cold.driver);
    expect(restored.causes).toEqual(full.causes.slice(warmRun.causes.length));

    // maxRetries binds post-restore: no cause carries a generation past the cap.
    for (const cause of restored.causes) {
      expect(Number(cause.split(":").pop())).toBeLessThanOrEqual(2);
    }
  });

  it("stripped depths (the pre-fix checkpoint) silently extend the storm — falsification probe", () => {
    const cont = mk();
    const full = through(cont.state, cont.driver);

    const warm = mk();
    const warmRun = pre(warm.state, warm.driver);
    const checkpoint = warm.driver.exportPending();
    const mint = warm.driver.currentMintCounter();

    // Import the SAME pending set with depths dropped (exactly what
    // exportPending shipped before F6): the restored run must DIVERGE —
    // zeroed depths re-fuel retry generations the live run had spent.
    const stripped = mk();
    stripped.driver.importPending({ pending: checkpoint.pending, depths: [] } as never, mint);
    const strippedRun = post(warmRun.state, stripped.driver);

    expect(strippedRun.causes.length).toBeGreaterThan(full.causes.length - warmRun.causes.length);
  });
});
