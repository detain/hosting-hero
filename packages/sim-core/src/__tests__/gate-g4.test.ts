/**
 * GATE G4 — "drag a cable" (§9.13 #4), proven HEADLESS through the intent
 * door. The gate law: making a connection must FEEL like committing to a
 * dependency — and the sim-side half of that promise is that every cable,
 * every refusal, and every hand-occupancy window lands in deterministic,
 * replayable ground truth.
 *
 * This file owns:
 *  1. A scripted 17-intent cable session run through the REAL tick driver
 *     (place → hands-exhausted → validator rejection → data cable →
 *     duplicate → slot-occupied → power-cycle → dual-PSU legality →
 *     disconnect-drain v0) with the full refusal-receipt sequence
 *     golden-compared;
 *  2. Determinism ×100 via replay.createHarness (re-simulated digests must
 *     be byte-identical, per §4.1 R-16 and the LONG SAVE);
 *  3. Hand-occupancy windows observable in the state digest;
 *  4. Accessibility law: drag and click-to-link produce the IDENTICAL cable
 *     (same args ⇒ same board mutation, same version bump, same digest);
 *  5. Declared-socket preflight (topology grammar) rejecting the cable the
 *     host must never issue, and cold-door guard refusals
 *     (stamped-in-future, bad-relation, power-needs-slot, self-edge…).
 *
 * Public barrel surface ONLY — no deep imports (mirrors integration-smoke).
 */

import { describe, expect, it } from "vitest";
import {
  // kernel + types
  asCauseId,
  asEntityId,
  asRunSeed,
  fromInt,
  initialClocks,
  streamFor,
  MICROS_PER_MIN,
  PlayerVerb,
  // pipeline (door + driver)
  applyIntentDoor,
  createBoardState,
  createDefaultSlots,
  createInitialState,
  createTickDriver,
  digestState,
  makeSlots,
  mintHandState,
  // topology (socket grammar preflight)
  canConnect,
  refusalReason,
  // replay (determinism harness)
  canonicalDigest,
  createHarness,
  type BoardRelation,
  type ConnectPortsArgs,
  type EntityId,
  type ExternalIntent,
  type GameState,
  type NodeRecord,
  type PlayerVerbArgs,
  type RetryPolicy,
  type RunSeed,
  type SimTick,
  type StampedIntent,
} from "../index.ts";

/* ═══════════════════════ scenario wiring ═══════════════════════ */

const SEED = asRunSeed(904n);
const TERMINAL_TICK: SimTick = 16n;
const HAND_CAPACITY = 2; // §7.5 two-hand opening (T2 tier)

const WEB = asEntityId("web-1");
const SWITCH = asEntityId("sw-1");
const SPARE = asEntityId("spare-1");
const FORBIDDEN_ID = asEntityId("jakal-1");
const GHOST_EDGE = asEntityId("edge:power:ghost->sw-1");

/** Pinned receipt-sequence digest (computed from a verified run; CI re-verifies
 *  EVERY tick, guard string, and ordering of the 17-intent session). */
const GOLDEN_RECEIPTS_DIGEST = "13ba145f76c1799a";

/** The rack profile the validator callback enforces — the door itself never
 *  branches on deviceKind (module decoupling); THIS is the host law. */
const ALLOWED_KINDS: ReadonlySet<string> = new Set(["server", "switch"]);

const DATA_EDGE = "edge:data:web-1->sw-1";
const PSU1_EDGE = "edge:power:web-1->sw-1:psu1";
const PSU2_EDGE = "edge:power:web-1->sw-1:psu2";
const SPARE_DATA_EDGE = "edge:data:spare-1->sw-1";

const RETRY: RetryPolicy = Object.freeze({
  maxRetries: 2,
  backoffBaseUs: 2n * MICROS_PER_MIN,
  jitterPurchased: false,
});

/** One scripted door entry: fed to the driver EXACTLY at `feedTick`. */
interface ScriptEntry {
  readonly feedTick: SimTick;
  readonly external: ExternalIntent;
}

function verb(seq: number, feedTick: SimTick, args: PlayerVerbArgs): ScriptEntry {
  return Object.freeze({
    feedTick,
    external: Object.freeze({
      tick: feedTick,
      intent: Object.freeze({
        seq,
        clock: "sim" as const,
        atUs: feedTick * MICROS_PER_MIN,
        origin: "player" as const,
        payload: Object.freeze({ kind: "player-verb" as const, args }),
      }),
    }),
  });
}

const place = (seq: number, tick: SimTick, nodeId: string, deviceKind: string): ScriptEntry =>
  verb(seq, tick, { verb: PlayerVerb.PlaceDevice, nodeId: asEntityId(nodeId), deviceKind, template: null });

const connect = (
  seq: number,
  tick: SimTick,
  relation: BoardRelation,
  from: string,
  to: string,
  slot: string | null,
): ScriptEntry =>
  verb(seq, tick, {
    verb: PlayerVerb.ConnectPorts,
    relation,
    from: asEntityId(from),
    to: asEntityId(to),
    slot,
  });

const disconnect = (seq: number, tick: SimTick, edgeId: string): ScriptEntry =>
  verb(seq, tick, { verb: PlayerVerb.DisconnectDrain, edgeId: asEntityId(edgeId) });

/**
 * THE SCRIPT. Hand math (capacity 2, cost 1, occupancy place/connect 3):
 *  T1  s1,s2 place web-1 + sw-1        → tokens T-1, T-2 busy until 4
 *  T2  s3    place spare-1             → REFUSED hands-exhausted (0 free of 2)
 *  T4  s4    place spare-1 (retry)     → EXECUTED (tokens released at 4)
 *  T4  s5    place kind "forbidden"    → REFUSED placement-rejected (validator)
 *  T6  s6    data web-1→sw-1           → EXECUTED (board v1)
 *  T7  s7    data … slot "mgt"         → REFUSED slot-only-for-power
 *  T7  s8    power web-1→sw-1 psu1     → EXECUTED (board v2)
 *  T9  s9    data spare-1→sw-1         → EXECUTED (board v3)
 *  T10 s10   duplicate s6              → REFUSED edge-exists
 *  T10 s11   power spare-1→sw-1 psu1   → REFUSED slot-occupied
 *  T10 s12   power sw-1→web-1 psu2     → REFUSED power-cycle (tree law)
 *  T11 s13   power web-1→sw-1 psu2     → EXECUTED (board v4, dual-PSU legal)
 *  T12 s14   power spare-1→sw-1 psu2   → REFUSED slot-occupied (psu2 taken)
 *  T12 s15   disconnect ghost edge     → REFUSED unknown-edge
 *  T14 s16   disconnect data web-1     → EXECUTED (board v5, plain pull)
 *  T16 s17   power web-1→spare-1 psu1  → EXECUTED (board v6, survivor powered)
 */
const SCRIPT: readonly ScriptEntry[] = Object.freeze([
  place(1, 1n, WEB, "server"),
  place(2, 1n, SWITCH, "switch"),
  place(3, 2n, SPARE, "server"),
  place(4, 4n, SPARE, "server"),
  place(5, 4n, FORBIDDEN_ID, "forbidden"),
  connect(6, 6n, "data", WEB, SWITCH, null),
  connect(7, 7n, "data", WEB, SWITCH, "mgt"),
  connect(8, 7n, "power", WEB, SWITCH, "psu1"),
  connect(9, 9n, "data", SPARE, SWITCH, null),
  connect(10, 10n, "data", WEB, SWITCH, null),
  connect(11, 10n, "power", SPARE, SWITCH, "psu1"),
  connect(12, 10n, "power", SWITCH, WEB, "psu2"),
  connect(13, 11n, "power", WEB, SWITCH, "psu2"),
  connect(14, 12n, "power", SPARE, SWITCH, "psu2"),
  disconnect(15, 12n, GHOST_EDGE),
  disconnect(16, 14n, asEntityId(DATA_EDGE)),
  connect(17, 16n, "power", WEB, SPARE, "psu1"),
]);

/** Deterministic driver-side config: the SAME object the UI gate installs. */
const DOOR_CONFIG = Object.freeze({
  handCapacity: HAND_CAPACITY,
  canPlaceDevice: (query: { args: { deviceKind: string } }): { reason: string } | null =>
    ALLOWED_KINDS.has(query.args.deviceKind)
      ? null
      : { reason: `rack profile forbids device kind "${query.args.deviceKind}"` },
});

function buildInitial(seed: RunSeed): GameState {
  return createInitialState({
    runSeed: seed,
    engineVersion: "gate-g4",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "sha-g4-sheets", ruleBookHash: "sha-g4-book" },
    clocks: initialClocks(),
    hands: mintHandState(HAND_CAPACITY),
    board: createBoardState(),
  });
}

interface SessionResult {
  readonly state: GameState;
  readonly digests: readonly string[]; // digestState AFTER each tick (index 0 = tick 1)
  readonly receipts: SessionReceipt[];
  readonly events: readonly { kind: string; reason?: string; detail?: string | null }[];
}

/** Receipt projection into JSON-safe space for the golden digest. */
interface SessionReceipt {
  readonly tick: string;
  readonly seq: number;
  readonly verb: string;
  readonly outcome: string;
  readonly reason: string | null;
}

/**
 * THE session — one deterministic run of the script to `targetTick`.
 * Everything mutable (driver cross-tick memory, slots side tables) is minted
 * INSIDE, so same-request ⇒ same-answer holds by construction (replay law).
 */
function simulate(seed: RunSeed, targetTick: SimTick): SessionResult {
  const config = Object.freeze({
    runSeed: seed,
    dnsNodeId: null,
    expressPath: Object.freeze([WEB]), // build-time anchor; no units arrive at G4
    deepPath: Object.freeze([]),
    defaultPatienceUs: 3n * MICROS_PER_MIN,
    defaultSizeCost: fromInt(1),
    patienceJitterPct: 0,
    inspectionCostUs: Object.freeze({
      "pass-through": 0n,
      "sample-1-in-20": 3n * MICROS_PER_MIN,
      inspect: 10n * MICROS_PER_MIN,
      challenge: 20n * MICROS_PER_MIN,
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
    { intents: DOOR_CONFIG },
  );

  let state = buildInitial(seed);
  const digests: string[] = [];
  const receipts: SessionReceipt[] = [];
  const events: { kind: string; reason?: string; detail?: string | null }[] = [];

  for (let t = 1; t <= Number(targetTick); t += 1) {
    const tick = BigInt(t);
    const batch = SCRIPT.filter((entry) => entry.feedTick === tick).map((entry) => entry.external);
    const result = driver.advance(state, Object.freeze({
      envelopes: Object.freeze([]),
      evidence: Object.freeze([]),
      classes: Object.freeze([]),
      dependencyEdges: Object.freeze([]),
      retryPolicy: RETRY,
      aggression: fromInt(0),
      expressMaxConfidence: fromInt(1),
      externalIntents: Object.freeze(batch),
    }));
    state = result.state;
    digests.push(digestState(state));
    for (const receipt of result.doorReceipts) {
      receipts.push({
        tick: receipt.submittedTick.toString(),
        seq: receipt.seq,
        verb: receipt.verb,
        outcome: receipt.outcome,
        reason: receipt.reason,
      });
    }
    for (const event of result.events) {
      if (event.kind === "intent-executed" || event.kind === "intent-refused") events.push(event);
    }
  }
  return { state, digests, receipts, events };
}

/* ═══════════════════════ 1 · the session story ═══════════════════════ */

describe("G4 session · scripted cable-drag through the door", () => {
  const session = simulate(SEED, TERMINAL_TICK);

  it("executes 9 and refuses 8 intents, in feed order", () => {
    expect(session.receipts).toHaveLength(SCRIPT.length);
    expect(session.receipts.map((r) => r.seq)).toStrictEqual(SCRIPT.map((s) => s.external.intent.seq));
    expect(session.receipts.filter((r) => r.outcome === "executed")).toHaveLength(9);
    expect(session.receipts.filter((r) => r.outcome === "refused")).toHaveLength(8);
  });

  it("refusal reasons are the full in-game refusal space, verbatim", () => {
    const refused = session.receipts.filter((r) => r.outcome === "refused").map((r) => r.reason);
    expect(refused).toStrictEqual([
      "hands-exhausted: need 1, free 0 of 2",
      'placement-rejected: rack profile forbids device kind "forbidden"',
      'slot-only-for-power: got "mgt"',
      `edge-exists: "${DATA_EDGE}"`,
      `slot-occupied: "psu1" on "sw-1" fed by "web-1" — one supplier per socket`,
      `power-cycle: "sw-1" already draws power through "web-1" — the feed graph is a tree`,
      `slot-occupied: "psu2" on "sw-1" fed by "web-1" — one supplier per socket`,
      `unknown-edge: "${GHOST_EDGE}"`,
    ]);
  });

  it("lands the committed topology: board v6, dual-PSU feed, survivor powered", () => {
    const board = session.state.board;
    expect(board?.version).toBe(6);
    expect([...(board?.edges.keys() ?? [])].sort()).toStrictEqual(
      [PSU1_EDGE, PSU2_EDGE, SPARE_DATA_EDGE, "edge:power:web-1->spare-1:psu1"].sort(),
    );
    // the cut data cable is really gone (v0 plain pull, nothing left behind)
    expect(board?.edges.has(asEntityId(DATA_EDGE))).toBe(false);
    // all three devices exist as pipeline nodes via the door's place handler
    expect(session.state.nodes.size).toBe(3);
  });

  it("refusals consumed NOTHING: nodes for refused places never existed", () => {
    expect(session.state.nodes.has(FORBIDDEN_ID)).toBe(false);
  });

  it("golden · canonical digest of the whole receipt sequence", () => {
    // Pinned at authoring time from a verified run; ANY change to door
    // semantics, ordering, or wording moves this hash and fails the gate.
    expect(canonicalDigest(session.receipts)).toBe(GOLDEN_RECEIPTS_DIGEST);
  });
});

/* ═══════════════════ 2 · hands = observable occupancy ═══════════════════ */

describe("G4 hands · occupancy windows land in the digest", () => {
  it("both tokens busy after the T1 double-place, released exactly at T4", () => {
    const atT2 = simulate(SEED, 2n);
    expect(atT2.state.hands?.tokens.map((t) => [t.index, t.busyUntilTick.toString()])).toStrictEqual([
      [0, "4"],
      [1, "4"],
    ]);
    const atT4 = simulate(SEED, 4n);
    // T4: the two T1 tokens released (release nulls the cause but keeps the
    // busyUntilTick stamp — history stays readable), s4 re-took token 0
    // (busy until 7); s5's refusal restored the snapshot.
    expect(atT4.state.hands?.tokens.map((t) => [t.busyUntilTick.toString(), t.busyCauseId])).toStrictEqual([
      ["7", "intent:4"],
      ["4", null],
    ]);
  });

  it("the busy-hand window changes the state digest tick-to-tick", () => {
    const s = simulate(SEED, 6n);
    expect(s.digests[0]).not.toBe(s.digests[3]); // T1 board/nodes vs T4
    expect(s.digests[4]).not.toBe(s.digests[5]); // T5 vs T6 (connect landed)
  });

  it("refusal restores hands: same-tick EXEC after a REFUSE pays the NEXT free token", () => {
    // T7: s7 refused (slot-only-for-power) then s8 EXECUTED on the same tick
    // — proof the refusal handed its token back rather than burning it.
    const atT7 = simulate(SEED, 7n);
    const s8 = atT7.receipts.find((r) => r.seq === 8);
    expect(s8?.outcome).toBe("executed");
    const busyBy = (cause: string) =>
      atT7.state.hands?.tokens.find((t) => t.busyCauseId === cause)?.busyUntilTick;
    expect(busyBy("intent:8")).toBe(10n);
  });
});

/* ═══════════════════ 3 · determinism ×100 (harness) ═══════════════════ */

describe("G4 determinism · re-simulated digests are byte-identical ×100", () => {
  const harness = createHarness<GameState>({
    runner: (request) => simulate(request.runSeed, request.targetTick).state,
    initialState: buildInitial(SEED),
    runSeed: SEED,
    engineVersion: "gate-g4",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "sha-g4-sheets", ruleBookHash: "sha-g4-book" },
    totalTicks: TERMINAL_TICK,
    snapshotEveryTicks: 8n,
    checkpointEveryTicks: 2n,
    intents: SCRIPT.map((entry): StampedIntent => entry.external),
    digest: digestState,
  });

  it("100 replays of the final tick all equal the captured digest", () => {
    const final = harness.replayFinalDigest();
    expect(final).toBe(digestState(simulate(SEED, TERMINAL_TICK).state));
    const runs = harness.replayDigests(100);
    expect(runs).toHaveLength(100);
    expect(new Set(runs).size).toBe(1);
    expect(runs[0]).toBe(final);
  });

  it("the bundle records the cable session verbatim", () => {
    const doc = harness.capture();
    expect(doc.intentLog).toHaveLength(SCRIPT.length);
    expect(doc.schemaVersion).toBe(1);
  });

  it("a different seed digests differently (not a constant function)", () => {
    const other = simulate(asRunSeed(905n), TERMINAL_TICK);
    expect(other.digests.at(-1)).not.toBe(simulate(SEED, TERMINAL_TICK).digests.at(-1));
  });
});

/* ═══════════════ 4 · accessibility law · drag ≡ click-to-link ═══════════════ */

describe("G4 accessibility · the drag path and the click path mint ONE cable", () => {
  /** Both UI paths end by submitting the SAME args to the SAME door — the
   *  sim cannot tell them apart, and must not be able to. */
  const CABLE_ARGS = Object.freeze({
    verb: PlayerVerb.ConnectPorts,
    relation: "data" as const,
    from: WEB,
    to: SWITCH,
    slot: null,
  });

  function oneCable() {
    const base: GameState = Object.freeze({
      ...buildInitial(SEED),
      nodes: Object.freeze(
        new Map<EntityId, NodeRecord>([WEB, SWITCH].map((id): [EntityId, NodeRecord] => [id, nodeStub(id)])),
      ),
      board: createBoardState(),
    });
    const context = Object.freeze({ tick: 5n, minute: 5, clocks: initialClocks() });
    const intent: ExternalIntent = Object.freeze({
      tick: 5n,
      intent: Object.freeze({
        seq: 1,
        clock: "sim" as const,
        atUs: 5n * MICROS_PER_MIN,
        origin: "player" as const,
        payload: Object.freeze({ kind: "player-verb" as const, args: CABLE_ARGS }),
      }),
    });
    return applyIntentDoor(base, context, [intent], DOOR_CONFIG);
  }

  const drag = oneCable();
  const click = oneCable();

  it("identical edge, identical version bump, identical digest", () => {
    expect(drag.state.board?.version).toBe(1);
    expect(click.state.board?.version).toBe(drag.state.board?.version);
    expect([...(click.state.board?.edges.keys() ?? [])]).toStrictEqual([DATA_EDGE]);
    expect(digestState(click.state)).toBe(digestState(drag.state));
    expect(canonicalDigest(click.receipts)).toBe(canonicalDigest(drag.receipts));
  });

  function nodeStub(id: EntityId): NodeRecord {
    return Object.freeze({
      id,
      kind: "server",
      slots: makeSlots(1),
      serviceTimeUs: MICROS_PER_MIN,
      queueDepth: 0,
      queue: Object.freeze([]),
      shedOrder: "qos-weighted" as const,
      inspectionDepth: "pass-through" as const,
      discipline: "hockey-stick" as const,
      utilizationRho: 0n,
      dependencyNodeId: null,
    });
  }
});

/* ══════════════ 5 · cold-door guards + socket preflight ══════════════ */

describe("G4 cold door · guard refusals the driver session could not stage", () => {
  const stub = (id: string): NodeRecord => ({
    id: asEntityId(id),
    kind: "server",
    slots: makeSlots(1),
    serviceTimeUs: MICROS_PER_MIN,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted" as const,
    inspectionDepth: "pass-through" as const,
    discipline: "hockey-stick" as const,
    utilizationRho: 0n,
    dependencyNodeId: null,
  });

  const boardful: GameState = Object.freeze({
    ...buildInitial(SEED),
    nodes: Object.freeze(
      new Map<EntityId, NodeRecord>([WEB, SWITCH].map((id): [EntityId, NodeRecord] => [id, stub(id)])),
    ),
    board: createBoardState(),
    hands: mintHandState(1),
  });
  const context = Object.freeze({ tick: 10n, minute: 10, clocks: initialClocks() });

  function shot(args: PlayerVerbArgs, seq = 1) {
    const intent: ExternalIntent = Object.freeze({
      tick: 10n,
      intent: Object.freeze({
        seq,
        clock: "sim" as const,
        atUs: 10n * MICROS_PER_MIN,
        origin: "player" as const,
        payload: Object.freeze({ kind: "player-verb" as const, args }),
      }),
    });
    return applyIntentDoor(boardful, context, [intent], DOOR_CONFIG).receipts[0]?.reason;
  }

  it("stamped-in-future refuses a live-stamped entry against a paused clock", () => {
    const args: ConnectPortsArgs = { verb: PlayerVerb.ConnectPorts, relation: "data", from: WEB, to: SWITCH, slot: null };
    const intent: ExternalIntent = Object.freeze({
      tick: 99n, // host fed a tick-99 order at tick 10 — the door guards
      intent: Object.freeze({
        seq: 1,
        clock: "sim" as const,
        atUs: 10n * MICROS_PER_MIN,
        origin: "player" as const,
        payload: Object.freeze({ kind: "player-verb" as const, args }),
      }),
    });
    const result = applyIntentDoor(boardful, context, [intent], DOOR_CONFIG);
    expect(result.receipts[0]?.outcome).toBe("refused");
    expect(result.receipts[0]?.reason).toBe("stamped-in-future: entry tick 99 > current 10");
    expect(result.state).toBe(boardful); // nothing consumed, identity kept
  });

  it("bad-relation names the closed relation set", () => {
    expect(shot({ verb: PlayerVerb.ConnectPorts, relation: "vibes" as BoardRelation, from: WEB, to: SWITCH, slot: null })).toBe(
      'bad-relation: "vibes" not in {data,power,control,trust}',
    );
  });

  it("power-needs-slot / unknown-node / self-edge / node-exists all refuse", () => {
    expect(shot({ verb: PlayerVerb.ConnectPorts, relation: "power", from: WEB, to: SWITCH, slot: null })).toBe(
      "power-needs-slot",
    );
    expect(shot({ verb: PlayerVerb.ConnectPorts, relation: "data", from: asEntityId("ghost"), to: SWITCH, slot: null })).toBe(
      'unknown-node: "ghost"',
    );
    expect(shot({ verb: PlayerVerb.ConnectPorts, relation: "data", from: WEB, to: WEB, slot: null })).toBe(
      'self-edge: "web-1"',
    );
    expect(shot({ verb: PlayerVerb.PlaceDevice, nodeId: WEB, deviceKind: "server", template: null })).toBe(
      'node-exists: "web-1"',
    );
  });

  it("payment precedes semantics: exhausted hands outrank a doomed handler", () => {
    const busy: GameState = Object.freeze({
      ...boardful,
      hands: Object.freeze({
        capacity: 1,
        tokens: Object.freeze([
          { index: 0, busyUntilTick: 50n, busyCauseId: asCauseId("intent:0") },
        ]),
      }),
    });
    const args: ConnectPortsArgs = { verb: PlayerVerb.ConnectPorts, relation: "data", from: WEB, to: SWITCH, slot: null };
    const intent: ExternalIntent = Object.freeze({
      tick: 10n,
      intent: Object.freeze({
        seq: 1,
        clock: "sim" as const,
        atUs: 10n * MICROS_PER_MIN,
        origin: "player" as const,
        // an args set that WOULD also be refused (edge already seated on a
        // pre-fed board) — but the hands gate sees it FIRST
        payload: Object.freeze({ kind: "player-verb" as const, args }),
      }),
    });
    const result = applyIntentDoor(busy, context, [intent], DOOR_CONFIG);
    expect(result.receipts[0]?.reason).toBe("hands-exhausted: need 1, free 0 of 1");
  });
});

describe("G4 socket preflight · the declared-sockets config path (host law)", () => {
  /** Per-kind endpoints — the same table the UI's wiring-mode glow reads. */
  const ENDPOINTS = Object.freeze({
    server: Object.freeze({ needs: Object.freeze(["sql-out"]), provides: Object.freeze(["http-in"]) }),
    switch: Object.freeze({ needs: Object.freeze([]), provides: Object.freeze(["http-in", "sql-in"]) }),
    "legacy-db": Object.freeze({ needs: Object.freeze(["sql-out"]), provides: Object.freeze(["sql-in"]) }),
  });

  it("a grammar-fit pair connects (web server → datacenter switch)", () => {
    expect(canConnect(ENDPOINTS.server, ENDPOINTS.switch)).toBe(true);
    expect(refusalReason(ENDPOINTS.server.needs, ENDPOINTS.switch.provides)).toBeNull();
  });

  it("a passive device needs nothing — nothing to plug, nothing to allow", () => {
    // the switch declares no `needs`: as a CONSUMER it fits nowhere, which
    // the UI reads as "no outgoing data plugs offered" in wiring mode.
    expect(canConnect(ENDPOINTS.switch, ENDPOINTS.server)).toBe(false);
    expect(refusalReason(ENDPOINTS.switch.needs, ENDPOINTS.server.provides)).toBe("no socket declared");
  });

  it("a socket-mismatched pair is refused BEFORE any intent is issued", () => {
    // a sql consumer plugged into a pure-http patch panel is illegal:
    const httpOnlyPanel = Object.freeze({ needs: Object.freeze([]), provides: Object.freeze(["http-in"]) });
    expect(canConnect(ENDPOINTS["legacy-db"], httpOnlyPanel)).toBe(false);
    expect(refusalReason(ENDPOINTS["legacy-db"].needs, httpOnlyPanel.provides)).toBe(
      "wrong socket type — needs sql-in but target speaks http-in",
    );
  });
});
