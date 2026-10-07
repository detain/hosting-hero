/**
 * DISCONNECT-DRAIN CHOREOGRAPHY (§7.2 R54) — the opt-in two-phase pull.
 *
 * Design pinned here (see intent-door.ts header law "DRAIN BEFORE
 * DISCONNECT"): the pending-disconnect record IS the hand reservation
 * (busyCauseId `drain:<edgeId>`, busyUntilTick = start + drainTicks), so
 * BoardState/HandState/types.ts wire shapes NEVER changed and digestState
 * already absorbs the whole promise through its existing hands walk. When the
 * reservation matures the door mints an internal continuation (never a fed
 * input, never a receipt, intentSeq sentinel -1, causeId `drain:<edgeId>`)
 * that executes the pull BEFORE that tick's external entries.
 *
 * The headline pin is the FIRST test: policy-off (default) keeps the v0 plain
 * pull byte-identical — a 17-intent G4-style session's ENTIRE per-tick
 * digestState chain, captured from the pre-change engine, is hardcoded below.
 */

import { describe, expect, it } from "vitest";
import type {
  ExternalIntent,
  GameState,
  IntentExecutedEvent,
  PlayerVerbArgs,
  RunSeed,
  SimTick,
  TickContext,
} from "../../types";
import { asCauseId, asEntityId, asRunSeed, PlayerVerb } from "../../types";
import { fromInt } from "../../kernel/fixed";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { streamFor } from "../../kernel/rng";
import { createDefaultSlots } from "../defaults";
import { createInitialState, createTickDriver } from "../driver";
import { digestState } from "../digest";
import type { TickInputs } from "../driver";
import type { DefaultPipelineConfig } from "../defaults";
import {
  applyIntentDoor,
  createBoardState,
  IntentDoorError,
  mintHandState,
  type IntentDoorConfig,
} from "../intent-door";
import { IDS, envelope, node, retryPolicy, testConfig, tickInputs } from "./helpers";

const MIN = MICROS_PER_MIN;

/* ═══════════════════════════ helpers ═══════════════════════════ */

function ctx(tick: SimTick): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
}

function ext(tick: SimTick, seq: number, args: PlayerVerbArgs): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "player" as const,
      payload: Object.freeze({ kind: "player-verb" as const, args }),
    }),
  });
}

const WEB = asEntityId("web-1");
const SWITCH = asEntityId("sw-1");
const SPARE = asEntityId("spare-1");
const DATA_EDGE = "edge:data:web-1->sw-1";
const CTRL_EDGE = "edge:control:web-1->spare-1";

/** Two devices, two board edges, `hands` idle — the door-level drain stage. */
function seeded(hands = 2): GameState {
  return createInitialState({
    runSeed: asRunSeed(9n),
    engineVersion: "test-drain",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [node(WEB, { slots: 1 }), node(SWITCH, { slots: 1 }), node(SPARE, { slots: 1 })],
    handCapacity: hands,
    board: createBoardState([
      { id: asEntityId(DATA_EDGE), relation: "data", from: WEB, to: SWITCH, slot: null },
      { id: asEntityId(CTRL_EDGE), relation: "control", from: WEB, to: SPARE, slot: null },
    ]),
  });
}

const DRAIN_ON: IntentDoorConfig = Object.freeze({ drainPolicy: Object.freeze({ enabled: true }) });

function disconnectOf(edgeId: string): PlayerVerbArgs {
  return { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId(edgeId) };
}

function executedByCause(result: ReturnType<typeof applyIntentDoor>, causeId: string): IntentExecutedEvent {
  const event = result.events.find((e) => e.kind === "intent-executed" && e.causeId === causeId);
  if (event === undefined || event.kind !== "intent-executed") {
    throw new Error(`no intent-executed event with causeId "${causeId}" — got ${JSON.stringify(result.events.map((e) => [e.kind, e.causeId]))}`);
  }
  return event;
}

function refusalOf(result: ReturnType<typeof applyIntentDoor>, seq: number): string {
  const receipt = result.receipts.find((r) => r.seq === seq);
  if (receipt === undefined || receipt.outcome !== "refused" || receipt.reason === null) {
    throw new Error(`expected a refusal for seq ${seq}`);
  }
  return receipt.reason;
}

/* ═══════════════════ 1 · POLICY-OFF GOLDEN — byte-identity §4 pin 1 ═══════════════════
 * The 17-intent G4-style session below was captured from the PRE-CHANGE
 * engine (script + fixtures transcribed verbatim from the capture run); the
 * chain literals are those captured digestState values. Any drift the drain
 * work smuggled into the default (policy-off) path moves one of these and
 * fails. The session includes TWO v0 plain pulls (seqs 6 and 14) — the exact
 * code path the drain mode branches — plus refusals of every door family. */

const OFF_SEED = asRunSeed(4242n);

interface ScriptEntry {
  readonly feedTick: SimTick;
  readonly external: ExternalIntent;
}

function extAt(feedTick: SimTick, stamp: SimTick, seq: number, args: PlayerVerbArgs): ScriptEntry {
  return Object.freeze({
    feedTick,
    external: Object.freeze({
      tick: stamp,
      intent: Object.freeze({
        seq,
        clock: "sim" as const,
        atUs: stamp * MIN,
        origin: "player" as const,
        payload: Object.freeze({ kind: "player-verb" as const, args }),
      }),
    }),
  });
}

const GOLDEN_SCRIPT: readonly ScriptEntry[] = Object.freeze([
  extAt(1n, 1n, 1, { verb: PlayerVerb.PlaceDevice, nodeId: WEB, deviceKind: "server", template: null }),
  extAt(1n, 1n, 2, { verb: PlayerVerb.PlaceDevice, nodeId: SWITCH, deviceKind: "switch", template: null }),
  extAt(2n, 2n, 3, { verb: PlayerVerb.PlaceDevice, nodeId: asEntityId("web-2"), deviceKind: "server", template: null }), // hands-exhausted
  extAt(4n, 4n, 4, { verb: PlayerVerb.ConnectPorts, relation: "data", from: WEB, to: SWITCH, slot: null }),
  extAt(4n, 4n, 5, { verb: PlayerVerb.ConnectPorts, relation: "power", from: WEB, to: asEntityId("ghost"), slot: "psu1" }), // unknown-node (refund)
  extAt(7n, 7n, 6, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId(DATA_EDGE) }), // v0 plain pull
  extAt(7n, 7n, 7, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId("edge:ghost") }), // unknown-edge
  extAt(8n, 8n, 8, { verb: PlayerVerb.ConfigureNode, nodeId: WEB, inspectionDepth: "inspect", shedOrder: null }),
  extAt(9n, 9n, 9, { verb: PlayerVerb.ConnectPorts, relation: "data", from: WEB, to: SWITCH, slot: null }), // re-add
  extAt(10n, 10n, 10, { verb: PlayerVerb.ConnectPorts, relation: "data", from: WEB, to: SWITCH, slot: null }), // edge-exists
  extAt(11n, 11n, 11, { verb: PlayerVerb.ToggleSpeed, speedX: 2 }),
  extAt(12n, 12n, 12, { verb: PlayerVerb.Communicate, target: null, note: "maintenance window" }),
  extAt(13n, 13n, 13, { verb: PlayerVerb.ShedLoad, nodeId: asEntityId("ghost"), qosClassId: null }), // unknown-node (refund)
  extAt(14n, 14n, 14, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId(DATA_EDGE) }), // second v0 plain pull
  extAt(15n, 15n, 15, { verb: PlayerVerb.PlaceDevice, nodeId: asEntityId("sw-2"), deviceKind: "switch", template: null }),
  extAt(16n, 99n, 16, { verb: PlayerVerb.ToggleSpeed, speedX: 4 }), // fed at 16, stamped 99 → stamped-in-future
  extAt(17n, 17n, 17, { verb: PlayerVerb.ConfigureNode, nodeId: asEntityId("sw-2"), inspectionDepth: null, shedOrder: "lowest-value-first" }),
]);

const GOLDEN_OFF_CHAIN: readonly string[] = Object.freeze([
  "c19502d9610ff916f576308e21a70af0", // t1
  "d249ce2e73b65117f576308e21a70af0", // t2
  "927556afa5c1d52bf576308e21a70af0", // t3
  "b857522dd54d48b8ae07a7a815f67dd0", // t4
  "c4d90daa3c6b9674ae07a7a815f67dd0", // t5
  "c8dd290e1f0bf927ae07a7a815f67dd0", // t6
  "7e359124649e5cbc5b483397291dfbd0", // t7
  "cd0cd861bc5155c6c5a1d9c9c95102ee", // t8
  "d376fa2f4724edfd79d50ab31d1baf6a", // t9
  "f7deee61ae379f0579d50ab31d1baf6a", // t10
  "4d2c4f61b88e239a79d50ab31d1baf6a", // t11
  "a224217fddf3545220b0985a760b111e", // t12
  "d191d3a3f4c6b64120b0985a760b111e", // t13
  "84f6354ce2ad35ce8fd5ef1c1f2c0a5e", // t14
  "c62573dd5ae9f415e64e95fa3cf40f1b", // t15
  "c02aa9154aca6164e64e95fa3cf40f1b", // t16
  "7973dd178cdd50c5b87a5c1a25c781f3", // t17
]);

function goldenInitial(seed: RunSeed): GameState {
  return createInitialState({
    runSeed: seed,
    engineVersion: "drain-golden",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "sha-golden-sheets", ruleBookHash: "sha-golden-book" },
    clocks: initialClocks(),
    hands: mintHandState(2),
    board: createBoardState(),
  });
}

interface GoldenEvent {
  readonly kind: string;
  readonly verb: string;
  readonly intentSeq: number;
  readonly causeId: string;
  readonly detail: string | null;
  readonly reason: string | null;
  readonly handIndexes: readonly number[];
  readonly busyUntilTick: string;
}

/** One deterministic 17-tick run of the golden script under `doorConfig`.
 *  Everything mutable is minted INSIDE — same request ⇒ same answer. */
function goldenSimulate(doorConfig: IntentDoorConfig, seed: RunSeed = OFF_SEED): {
  readonly digests: readonly string[];
  readonly events: readonly GoldenEvent[];
  readonly state: GameState;
} {
  const config: DefaultPipelineConfig = Object.freeze({
    runSeed: seed,
    dnsNodeId: null,
    expressPath: Object.freeze([WEB]),
    deepPath: Object.freeze([]),
    defaultPatienceUs: 3n * MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({
      "pass-through": 0n,
      "sample-1-in-20": 3n * MIN,
      inspect: 10n * MIN,
      challenge: 20n * MIN,
    }),
    detectionRatio: fromInt(1),
    falsePositiveRatio: fromInt(0),
    referralProbability: fromInt(0),
    returnProbability: fromInt(0),
  });
  const driver = createTickDriver(
    createDefaultSlots(config),
    streamFor(seed, "root", 0),
    initialClocks(),
    { intents: doorConfig },
  );
  let state = goldenInitial(seed);
  const digests: string[] = [];
  const events: GoldenEvent[] = [];
  for (let t = 1; t <= 17; t += 1) {
    const tick = BigInt(t);
    const batch = GOLDEN_SCRIPT.filter((entry) => entry.feedTick === tick).map((entry) => entry.external);
    const inputs: TickInputs = Object.freeze({
      envelopes: Object.freeze([]),
      evidence: Object.freeze([]),
      classes: Object.freeze([]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: retryPolicy(0, 0n),
      aggression: fromInt(0),
      expressMaxConfidence: fromInt(1),
      externalIntents: Object.freeze(batch),
    });
    const result = driver.advance(state, inputs);
    state = result.state;
    digests.push(digestState(state));
    for (const event of result.events) {
      if (event.kind === "intent-executed" || event.kind === "intent-refused") {
        events.push({
          kind: event.kind,
          verb: event.verb,
          intentSeq: event.intentSeq,
          causeId: event.causeId,
          detail: event.kind === "intent-executed" ? event.detail : null,
          reason: event.kind === "intent-refused" ? event.reason : null,
          handIndexes: event.kind === "intent-executed" ? event.handIndexes : [],
          busyUntilTick: (event.kind === "intent-executed" ? event.busyUntilTick : 0n).toString(),
        });
      }
    }
  }
  return { digests, events, state };
}

describe("policy-off golden — the default path stays byte-identical to the pre-change engine", () => {
  it("17-tick digestState chain equals the pre-change capture (no-config variant)", () => {
    const { digests } = goldenSimulate(Object.freeze({}));
    expect(digests).toStrictEqual([...GOLDEN_OFF_CHAIN]);
  });

  it("explicit drainPolicy.enabled:false digests the SAME chain (off is off, stated or defaulted)", () => {
    const { digests } = goldenSimulate(Object.freeze({ drainPolicy: Object.freeze({ enabled: false }) }));
    expect(digests).toStrictEqual([...GOLDEN_OFF_CHAIN]);
  });

  it("policy-off keeps the v0 plain-pull event space: `pulled:<edge>` details, no continuations", () => {
    const { events, state } = goldenSimulate(Object.freeze({}));
    const pulls = events.filter((e) => e.causeId === "intent:6" || e.causeId === "intent:14");
    expect(pulls.map((e) => e.detail)).toStrictEqual([`pulled:${DATA_EDGE}`, `pulled:${DATA_EDGE}`]);
    expect(events.filter((e) => e.causeId.startsWith("drain:"))).toHaveLength(0);
    expect(events.filter((e) => e.intentSeq === -1)).toHaveLength(0);
    expect(state.board?.version).toBe(4);
  });

  it("policy-ON moves the chain (the choreography is state-visible) yet stays ×100 deterministic", () => {
    const on = goldenSimulate(DRAIN_ON);
    expect(on.digests).not.toStrictEqual(GOLDEN_OFF_CHAIN); // s6/s14 now defer their pulls
    const chain = on.digests.join("|");
    for (let run = 0; run < 100; run += 1) {
      expect(goldenSimulate(DRAIN_ON).digests.join("|")).toBe(chain);
    }
  }, 120_000);
});

/* ═══════════════════ 2 · phase 1 — stop new, keep the link live ═══════════════════ */

describe("drain phase 1 — the disconnect books a reservation, not a removal", () => {
  it("executed disconnect leaves the edge PRESENT and mints a drain:<edge> hand hold", () => {
    const state = seeded();
    const result = applyIntentDoor(state, ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON);
    // edge still routable mid-drain (in-flight is not dropped)…
    expect(result.state.board?.edges.has(asEntityId(DATA_EDGE))).toBe(true);
    expect(result.state.board?.version).toBe(0); // board UNTOUCHED in phase 1
    // …the record IS the reservation: cause `drain:<edgeId>`, hold = drainTicks (2)…
    const token = result.state.hands?.tokens[0];
    expect(token?.busyCauseId).toBe(asCauseId(`drain:${DATA_EDGE}`));
    expect(token?.busyUntilTick).toBe(3n); // 1 + 2
    // …and the player event keeps its intent:<seq> attribution with the start detail.
    const event = executedByCause(result, "intent:1");
    expect(event.detail).toBe(`drain-started:${DATA_EDGE}`);
    expect(event.busyUntilTick).toBe(3n);
    expect(event.handIndexes).toEqual([0]);
    expect(result.receipts.find((r) => r.seq === 1)?.outcome).toBe("executed");
  });

  it("occupancyTicks[disconnect-drain] is SUPERSEDED by drainTicks in drain mode", () => {
    const config: IntentDoorConfig = Object.freeze({
      drainPolicy: Object.freeze({ enabled: true, drainTicks: 1 }),
      occupancyTicks: Object.freeze({ [PlayerVerb.DisconnectDrain]: 5 }),
    });
    const result = applyIntentDoor(seeded(), ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], config);
    expect(result.state.hands?.tokens[0]?.busyUntilTick).toBe(2n); // 1 + drainTicks(1), NOT 1 + 5
    const matured = applyIntentDoor(result.state, ctx(2n), [], config);
    expect(matured.state.board?.edges.has(asEntityId(DATA_EDGE))).toBe(false); // pulls at 2, no 5-tick tail
    expect(matured.state.hands?.tokens[0]?.busyUntilTick).toBe(2n); // release law: stamp kept, cause nulled
    expect(matured.state.hands?.tokens[0]?.busyCauseId).toBeNull();
  });

  it("unknown edge still refuses (unknown-edge) and refunds the reservation under the policy", () => {
    const result = applyIntentDoor(seeded(), ctx(1n), [ext(1n, 1, disconnectOf("edge:ghost"))], DRAIN_ON);
    expect(refusalOf(result, 1)).toMatch(/^unknown-edge:/);
    for (const token of result.state.hands?.tokens ?? []) {
      expect(token.busyCauseId).toBeNull();
    }
  });
});

/* ═══════════════════ 3 · the continuation — safe-to-touch pull ═══════════════════ */

describe("drain continuation — the safe-to-touch pull rides the due queue", () => {
  /** Phase 1 at tick 1 → matures at tick 3 (default drainTicks 2). */
  function startedDrain(): GameState {
    return applyIntentDoor(seeded(), ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON).state;
  }

  it("edge stays through the drain and is gone at tick start+drainTicks, detail `drained:<edge>`", () => {
    const state = startedDrain();
    const mid = applyIntentDoor(state, ctx(2n), [], DRAIN_ON);
    expect(mid.state.board?.edges.has(asEntityId(DATA_EDGE))).toBe(true); // mid-drain: STILL PRESENT
    expect(mid.events).toHaveLength(0);
    expect(mid.receipts).toHaveLength(0);
    const done = applyIntentDoor(mid.state, ctx(3n), [], DRAIN_ON);
    expect(done.state.board?.edges.has(asEntityId(DATA_EDGE))).toBe(false); // gone after drainTicks
    expect(done.state.board?.version).toBe(1); // the mutation-count convention
    const event = executedByCause(done, `drain:${DATA_EDGE}`);
    expect(event.verb).toBe(PlayerVerb.DisconnectDrain);
    expect(event.detail).toBe(`drained:${DATA_EDGE}`);
    expect(event.intentSeq).toBe(-1); // sentinel: continuations are never fed intents
    expect(event.handIndexes).toEqual([0]);
    expect(event.busyUntilTick).toBe(3n);
    // the hand comes free at the pull: release law nulls the cause, keeps the stamp
    expect(done.state.hands?.tokens[0]?.busyCauseId).toBeNull();
    expect(done.state.hands?.tokens[0]?.busyUntilTick).toBe(3n);
  });

  it("the continuation mints NO receipt — receipts stay one-per-FED-intent", () => {
    const done = applyIntentDoor(startedDrain(), ctx(3n), [], DRAIN_ON);
    expect(done.receipts).toHaveLength(0); // but the pull IS replay-visible in events:
    expect(done.events).toHaveLength(1);
  });

  it("drainTicks 3 moves maturity to start+3 (edge survives ticks 1–3, gone at 4)", () => {
    const config: IntentDoorConfig = Object.freeze({ drainPolicy: Object.freeze({ enabled: true, drainTicks: 3 }) });
    const state = applyIntentDoor(seeded(), ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], config).state;
    expect(state.hands?.tokens[0]?.busyUntilTick).toBe(4n);
    for (const tick of [2n, 3n, 4n] as const) {
      const pass = applyIntentDoor(state, ctx(tick), [], config);
      expect(pass.state.board?.edges.has(asEntityId(DATA_EDGE))).toBe(tick < 4n);
    }
    const matured = applyIntentDoor(state, ctx(4n), [], config);
    expect(matured.state.board?.edges.has(asEntityId(DATA_EDGE))).toBe(false);
  });

  it("a started drain COMPLETES even when the host flips the policy off mid-drain (state is the promise)", () => {
    const state = startedDrain();
    const off = applyIntentDoor(state, ctx(3n), [], Object.freeze({})); // drainPolicy absent now
    expect(off.state.board?.edges.has(asEntityId(DATA_EDGE))).toBe(false);
    expect(executedByCause(off, `drain:${DATA_EDGE}`).detail).toBe(`drained:${DATA_EDGE}`);
  });

  it("two drains maturing on one tick pull in token-index order, one version bump each", () => {
    let state = seeded();
    state = applyIntentDoor(state, ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON).state;
    state = applyIntentDoor(state, ctx(1n), [ext(1n, 2, disconnectOf(CTRL_EDGE))], DRAIN_ON).state;
    const done = applyIntentDoor(state, ctx(3n), [], DRAIN_ON);
    expect(done.events.map((e) => e.kind === "intent-executed" ? e.causeId : "")).toStrictEqual([
      `drain:${DATA_EDGE}`, // token 0 first
      `drain:${CTRL_EDGE}`, // token 1 second
    ]);
    expect(done.state.board?.version).toBe(2);
    expect(done.state.board?.edges.size).toBe(0);
  });

  it("forged drain token whose edge vanished: the promise still retires, board keeps its version", () => {
    const base = seeded();
    const hands = base.hands;
    if (hands === undefined) throw new Error("seeded state must carry hands");
    const token0 = hands.tokens[0];
    if (token0 === undefined) throw new Error("seeded rail must have a token");
    const forged: GameState = Object.freeze({
      ...base,
      hands: Object.freeze({
        capacity: hands.capacity,
        tokens: Object.freeze([
          Object.freeze({ ...token0, busyUntilTick: 3n, busyCauseId: asCauseId("drain:edge:gone") }),
          ...hands.tokens.slice(1),
        ]),
      }),
    });
    const done = applyIntentDoor(forged, ctx(3n), [], DRAIN_ON);
    expect(done.events).toHaveLength(1); // event fires (one per matured token)…
    expect(done.state.board?.version).toBe(0); // …no phantom mutation bump…
    expect(done.state.hands?.tokens[0]?.busyCauseId).toBeNull(); // …and the reservation retires
  });
});

/* ═══════════════════ 4 · edge-draining — one choreography per cable ═══════════════════ */

describe("edge-draining — one choreography per cable (the chosen refusal code)", () => {
  it("a second disconnect on the SAME edge mid-drain refuses `edge-draining` and spends nothing", () => {
    let state = seeded();
    state = applyIntentDoor(state, ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON).state;
    const dup = applyIntentDoor(state, ctx(2n), [ext(2n, 2, disconnectOf(DATA_EDGE))], DRAIN_ON);
    expect(refusalOf(dup, 2)).toMatch(/^edge-draining:/);
    // the refusal spent nothing: still exactly ONE drain reservation on the rail…
    const busy = dup.state.hands?.tokens.filter((t) => t.busyCauseId !== null) ?? [];
    expect(busy).toHaveLength(1);
    expect(busy[0]?.busyCauseId).toBe(asCauseId(`drain:${DATA_EDGE}`));
    expect(busy[0]?.busyUntilTick).toBe(3n); // the ORIGINAL window, unextended
    // …and the edge pulls EXACTLY once at maturity.
    const done = applyIntentDoor(dup.state, ctx(3n), [], DRAIN_ON);
    expect(done.events.filter((e) => e.causeId === `drain:${DATA_EDGE}`)).toHaveLength(1);
  });

  it("a same-feed duplicate (two disconnects in one schedule) refuses on the fresh reservation", () => {
    const dup = applyIntentDoor(seeded(), ctx(1n), [
      ext(1n, 1, disconnectOf(DATA_EDGE)),
      ext(1n, 2, disconnectOf(DATA_EDGE)),
    ], DRAIN_ON);
    expect(dup.receipts.find((r) => r.seq === 1)?.outcome).toBe("executed");
    expect(refusalOf(dup, 2)).toMatch(/^edge-draining:/);
  });

  it("a DIFFERENT edge drains concurrently — edge-draining is per cable, not per rail", () => {
    let state = seeded();
    state = applyIntentDoor(state, ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON).state;
    const second = applyIntentDoor(state, ctx(1n), [ext(1n, 2, disconnectOf(CTRL_EDGE))], DRAIN_ON);
    expect(second.receipts.find((r) => r.seq === 2)?.outcome).toBe("executed");
  });

  it("connect-ports onto a draining edge refuses via the EXISTING codes (edge-exists / slot-occupied)", () => {
    // Design decision, documented: NO new connect code — a draining edge is
    // PRESENT, so the current law already refuses re-plugs at the point of
    // use; the cable is not safe-to-touch until the pull lands.
    const state = applyIntentDoor(seeded(), ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON).state;
    const replug = applyIntentDoor(state, ctx(2n), [
      ext(2n, 2, { verb: PlayerVerb.ConnectPorts, relation: "data", from: WEB, to: SWITCH, slot: null }),
    ], DRAIN_ON);
    expect(refusalOf(replug, 2)).toMatch(/^edge-exists:/);
  });

  it("a mid-drain rail with no free hand still refuses hands-exhausted FIRST (canonical pay order)", () => {
    const state = seeded(1); // single hand
    const drained = applyIntentDoor(state, ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON).state;
    const blocked = applyIntentDoor(drained, ctx(2n), [ext(2n, 2, disconnectOf(DATA_EDGE))], DRAIN_ON);
    expect(refusalOf(blocked, 2)).toMatch(/^hands-exhausted:/); // affordability precedes semantics
  });
});

/* ═══════════════════ 5 · ordering law — due queue BEFORE entries ═══════════════════ */

describe("maturing tick ordering — continuations precede that tick's entries", () => {
  it("a re-connect stamped at the maturing tick sees the edge already pulled", () => {
    let state = seeded();
    state = applyIntentDoor(state, ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON).state;
    const at = applyIntentDoor(state, ctx(3n), [
      ext(3n, 2, { verb: PlayerVerb.ConnectPorts, relation: "data", from: WEB, to: SWITCH, slot: null }),
    ], DRAIN_ON);
    // event order pins the law: drained continuation FIRST, then the entry.
    expect(at.events.map((e) => e.kind === "intent-executed" ? e.causeId : "")).toStrictEqual([
      `drain:${DATA_EDGE}`,
      "intent:2",
    ]);
    expect(at.receipts.find((r) => r.seq === 2)?.outcome).toBe("executed");
    expect(at.state.board?.edges.has(asEntityId(DATA_EDGE))).toBe(true); // re-plugged, v2 (pull + add)
    expect(at.state.board?.version).toBe(2);
  });

  it("a duplicate disconnect stamped at the maturing tick sees unknown-edge, not edge-draining", () => {
    let state = seeded();
    state = applyIntentDoor(state, ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON).state;
    const at = applyIntentDoor(state, ctx(3n), [ext(3n, 2, disconnectOf(DATA_EDGE))], DRAIN_ON);
    expect(refusalOf(at, 2)).toMatch(/^unknown-edge:/); // the pull already landed this pass, first
    expect(at.events).toHaveLength(2); // drained + refused
  });

  it("through the DRIVER the continuation event leads the tick (door events lead, continuations lead the door)", () => {
    const config = testConfig({ runSeed: asRunSeed(11n) });
    const slots = createDefaultSlots(config);
    let state = createInitialState({
      runSeed: config.runSeed,
      engineVersion: "test-drain-driver",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 1 }), node(IDS.origin, { slots: 1 })],
      handCapacity: 2,
      board: createBoardState([
        { id: asEntityId("edge:data:edge->origin"), relation: "data", from: IDS.edge, to: IDS.origin, slot: null },
      ]),
    });
    const driver = createTickDriver(
      slots,
      streamFor(config.runSeed, "root", 0),
      state.context.clocks,
      { intents: DRAIN_ON },
    );
    const seen: string[] = [];
    const feeds: Record<number, readonly ExternalIntent[]> = {
      1: [ext(1n, 1, disconnectOf("edge:data:edge->origin"))],
    };
    for (let t = 1; t <= 3; t += 1) {
      const result = driver.advance(
        state,
        tickInputs({
          envelopes: t === 3 ? [envelope("base", fromInt(2), "organic")] : [],
          dependencyEdges: [],
          retryPolicy: retryPolicy(0, 0n),
          externalIntents: feeds[t] ?? [],
        }),
      );
      state = result.state;
      for (const event of result.events) {
        if (event.kind === "intent-executed" || event.kind === "intent-refused") seen.push(event.causeId);
      }
      if (t === 3) {
        expect(event0Kind(result.events)).toBe("intent-executed"); // door events LEAD step 1…
        expect((result.events[0] as IntentExecutedEvent).causeId).toBe("drain:edge:data:edge->origin"); // …and the continuation LEADS the door
      }
    }
    expect(seen).toStrictEqual(["intent:1", "drain:edge:data:edge->origin"]);
    expect(state.board?.edges.size).toBe(0);
  });
});

function event0Kind(events: readonly { kind: string }[]): string {
  const first = events[0];
  if (first === undefined) throw new Error("expected at least one event");
  return first.kind;
}

/* ═══════════════════ 6 · malformed host config THROWS (Laws 2+4) ═══════════════════ */

describe("drain policy parsing — malformed host config throws at the boundary", () => {
  const feed = (policy: unknown) =>
    applyIntentDoor(seeded(), ctx(1n), [], {
      drainPolicy: policy as NonNullable<IntentDoorConfig["drainPolicy"]>,
    });

  it("drainTicks 0 / fractional / string / negative → IntentDoorError naming the field", () => {
    expect(() => feed({ enabled: true, drainTicks: 0 })).toThrow(/config\.drainPolicy\.drainTicks/);
    expect(() => feed({ enabled: true, drainTicks: 0 })).toThrow(IntentDoorError);
    expect(() => feed({ enabled: true, drainTicks: 1.5 })).toThrow(/safe integer/);
    expect(() => feed({ enabled: true, drainTicks: "2" })).toThrow(/safe integer/);
    expect(() => feed({ enabled: true, drainTicks: -3 })).toThrow(/>= 1/);
  });

  it("enabled non-boolean throws; drainTicks on a disabled policy still type-parses (host bug is a host bug)", () => {
    expect(() => feed({ enabled: "yes" })).toThrow(/config\.drainPolicy\.enabled/);
    expect(() => feed({ enabled: false, drainTicks: 0 })).toThrow(IntentDoorError);
    expect(() => feed({ enabled: false })).not.toThrow(); // well-formed off-switch is fine
  });

  it("enabled + handCost[disconnect-drain] 0 throws — the reservation record would be uncariable", () => {
    expect(() =>
      applyIntentDoor(seeded(), ctx(1n), [], {
        drainPolicy: { enabled: true },
        handCost: { [PlayerVerb.DisconnectDrain]: 0 },
      }),
    ).toThrow(/handCost\[disconnect-drain\] >= 1/);
  });

  it("a throw leaves the fed state UNTOUCHED (fail-fast never forks a half-run)", () => {
    const state = seeded();
    expect(() => feed({ enabled: true, drainTicks: 0 })).toThrow(IntentDoorError);
    expect(digestState(state)).toBe(digestState(state)); // pure read: the state was never fed to anything
  });
});

/* ═══════════════════ 7 · digest visibility + round-trip (§4 pin 4) ═══════════════════ */

describe("the drain is digest-visible and survives state round-trips", () => {
  function startedMidDrain(): { readonly quiet: GameState; readonly mid: GameState } {
    const quiet = seeded();
    const mid = applyIntentDoor(quiet, ctx(1n), [ext(1n, 1, disconnectOf(DATA_EDGE))], DRAIN_ON).state;
    return { quiet, mid };
  }

  it("mid-drain digest differs from the quiet rail (the promise is replay-visible)", () => {
    const { quiet, mid } = startedMidDrain();
    expect(digestState(mid)).not.toBe(digestState(quiet));
  });

  it("structural clone of the mid-drain state digests identically AND re-fires the same continuation", () => {
    const { mid } = startedMidDrain();
    const clone = cloneState(mid);
    expect(clone).not.toBe(mid); // genuinely new containers…
    expect(digestState(clone)).toBe(digestState(mid)); // …same canonical identity
    const a = applyIntentDoor(mid, ctx(3n), [], DRAIN_ON);
    const b = applyIntentDoor(clone, ctx(3n), [], DRAIN_ON);
    expect(digestState(b.state)).toBe(digestState(a.state)); // a checkpoint-restored host pulls identically…
    expect(executedByCause(b, `drain:${DATA_EDGE}`).detail).toBe(
      executedByCause(a, `drain:${DATA_EDGE}`).detail,
    ); // …and mints the same continuation record
  });

  it("an idle pass with nothing due keeps the state object identity (zero churn mid-drain)", () => {
    const { mid } = startedMidDrain();
    const idle = applyIntentDoor(mid, ctx(2n), [], DRAIN_ON);
    expect(idle.state).toBe(mid);
    expect(idle.events).toHaveLength(0);
    expect(idle.receipts).toHaveLength(0);
  });

  it("policy-off state with no hand slices digests byte-identically through a full idle pass (pre-door hosts)", () => {
    const preDoor = createInitialState({
      runSeed: asRunSeed(5n),
      engineVersion: "pre-door",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 1 })],
    });
    const pass = applyIntentDoor(preDoor, ctx(1n), [], DRAIN_ON);
    expect(pass.state).toBe(preDoor); // no hands → no records → the scan never even looks
    expect(digestState(pass.state)).toBe(digestState(preDoor));
  });
});

/** Structural clone: frozen Maps become fresh Map instances, arrays fresh
 *  arrays, the two door slices rebuilt record-by-record — the shape a
 *  save/-restored host state carries. Object identity is the ONLY thing
 *  allowed to differ (digest + continuation behaviour must not). */
function cloneState(state: GameState): GameState {
  const board = state.board === undefined ? undefined : Object.freeze({
    version: state.board.version,
    edges: Object.freeze(new Map([...state.board.edges].map(([id, e]) => [id, Object.freeze({ ...e })]))),
  });
  const hands = state.hands === undefined ? undefined : Object.freeze({
    capacity: state.hands.capacity,
    tokens: Object.freeze(state.hands.tokens.map((t) => Object.freeze({ ...t }))),
  });
  return Object.freeze({
    ...state,
    context: Object.freeze({ ...state.context, clocks: Object.freeze({ ...state.context.clocks }) }),
    units: Object.freeze(new Map(state.units)),
    nodes: Object.freeze(new Map(state.nodes)),
    lanes: Object.freeze(new Map(state.lanes)),
    observed: Object.freeze(new Map(state.observed)),
    cash: Object.freeze({ ...state.cash }),
    contracts: Object.freeze(new Map(state.contracts)),
    ruleBook: Object.freeze([...state.ruleBook]),
    ...(board !== undefined ? { board } : {}),
    ...(hands !== undefined ? { hands } : {}),
  }) as GameState;
}
