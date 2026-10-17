/**
 * GATE-7 RULE CARRIERS (ADR-0018) — the door-executed legacy-verb seam.
 * "The Book plays itself through the same hands": under
 * `config.ruleCarriers: "mapped"` a `kind:"verb"` intent from
 * policy/evaluator.ts is translated AT EXECUTION TIME into its player-verb
 * twin and runs the ordinary rail. The switch defaults off; off is TODAY,
 * byte-identically (the zero-golden spine of this whole slice).
 *
 * Pins (falsifiable per it):
 *  - the refusal census stays EXACTLY 46 — every translated refusal reuses
 *    an existing phrase; the standing machine pin in
 *    intent-door-restart.test.ts rides this file's existence UNAIDED (it
 *    re-reads intent-door.ts); this file adds a MAP-SHAPE tripwire so the
 *    private five-route (six-carrier) map can never silently grow;
 *  - mapped adds NOTHING to a player-only feed (digest + events + receipts
 *    equality vs the off run);
 *  - rule carriers pay HANDS and OCCUPANCY like their player twins, and are
 *    exempt from the OD-6(a) attention denomination (D4, v0 law);
 *  - an off-ladder translated value refuses through the ordinary handler
 *    wall (bad-inspection-depth / unknown-edge / unknown-node…), never a
 *    throw, and the refund law restores the rail.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type {
  AttentionState,
  EntityId,
  ExternalIntent,
  GameState,
  PlayerVerbArgs,
  SimTick,
  TickContext,
} from "../../types";
import { asEntityId, asRuleId, asRunSeed, PlayerVerb } from "../../types";
import { FIXED_ONE } from "../../kernel/fixed";
import { initialClocks, MICROS_PER_MIN } from "../../kernel/time";
import { createInitialState } from "../driver";
import { digestState } from "../digest";
import {
  applyIntentDoor,
  createBoardState,
  IntentDoorError,
} from "../intent-door";
import { IDS, node } from "./helpers";

const MIN = MICROS_PER_MIN;

function ctx(tick: SimTick): TickContext {
  return Object.freeze({ tick, minute: Number(tick), clocks: initialClocks() });
}

/** Player-fed entry (the g4-shape envelope). */
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

/** Rule-carrier entry EXACTLY as policy/evaluator.ts buildIntents mints it
 *  (clock "sim", origin "rule", payload kind "verb" + target/value). */
function ruleExt(
  tick: SimTick,
  seq: number,
  verb: string,
  target: EntityId | null,
  value: bigint | null,
  ruleId = "g7-test-card",
): ExternalIntent {
  return Object.freeze({
    tick,
    intent: Object.freeze({
      seq,
      clock: "sim" as const,
      atUs: tick * MIN,
      origin: "rule" as const,
      ruleId: asRuleId(ruleId),
      payload: Object.freeze({ kind: "verb" as const, verb, target, value }),
    }),
  });
}

function baseState(handCapacity = 2): GameState {
  return createInitialState({
    runSeed: asRunSeed(7n),
    engineVersion: "test-rulecarrier",
    contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
    clocks: initialClocks(),
    nodes: [
      node(IDS.edge, { slots: 2, serviceUs: MIN }),
      node(IDS.origin, { slots: 1, serviceUs: MIN }),
    ],
    handCapacity,
    board: createBoardState(),
  });
}

/** Wire a data edge IDS.edge → IDS.origin (plain pull, drain off). Returns
 *  the post-wire state; hands hold until 4n (connect occupancy 3). */
function withDataEdge(state: GameState): GameState {
  const res = applyIntentDoor(state, ctx(1n), [
    ext(1n, 1, {
      verb: PlayerVerb.ConnectPorts,
      relation: "data",
      from: IDS.edge,
      to: IDS.origin,
      slot: null,
    }),
  ], {});
  if (res.receipts[0]?.outcome !== "executed") throw new Error("edge wiring refused");
  return res.state;
}

const MAPPED = { ruleCarriers: "mapped" } as const;

/** BigInt-safe structural snapshot for equality witnesses. */
function plain(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value, (_k, v) => (typeof v === "bigint" ? `${v}n` : v)));
}
/** Census code = the reason up to its first colon (handlers ride detail riders). */
function codeOf(reason: string | null | undefined): string {
  return (reason ?? "").split(":")[0] ?? "";
}

/* ═══════════════════════════ the OFF arm is TODAY ═══════════════════════════ */

describe("ruleCarriers — off is the default and equals absence byte-identically", () => {
  const script: readonly ExternalIntent[] = [
    ruleExt(3n, 1, "scale-out", IDS.edge, 5n * FIXED_ONE),
    ruleExt(3n, 2, "failover", IDS.edge, null),
    ext(3n, 3, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "inspect", shedOrder: null }),
  ];
  const witness = (config: Parameters<typeof applyIntentDoor>[3]) => {
    const res = applyIntentDoor(baseState(), ctx(3n), script, config);
    return {
      digest: digestState(res.state),
      events: plain(res.events),
      receipts: plain(res.receipts) as readonly { verb: string; outcome: string; reason: string | null }[],
    };
  };

  it("config {} equals {ruleCarriers:'off'} — digest, events, receipts", () => {
    expect(witness({ ruleCarriers: "off" })).toEqual(witness({}));
  });

  it("off refuses EVERY rule carrier on the untouched unsupported-verb-carrier rail", () => {
    const off = witness({});
    expect(off.receipts.map((r: { verb: string; outcome: string }) => [r.verb, r.outcome])).toEqual([
      ["verb:scale-out", "refused"],
      ["verb:failover", "refused"],
      ["configure-node", "executed"],
    ]);
  });

  it("mapped adds NOTHING to a player-only feed (digest + events + receipts equal the off run)", () => {
    const playerOnly = [
      ext(3n, 1, { verb: PlayerVerb.PlaceDevice, nodeId: asEntityId("web-9"), deviceKind: "generic", template: null }),
      ext(3n, 2, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "challenge", shedOrder: null }),
      ext(3n, 3, { verb: PlayerVerb.Communicate, target: null, note: "all good" }),
    ];
    const off = applyIntentDoor(baseState(), ctx(3n), playerOnly, {});
    const mapped = applyIntentDoor(baseState(), ctx(3n), playerOnly, MAPPED);
    expect(digestState(mapped.state)).toBe(digestState(off.state));
    expect(plain(mapped.events)).toEqual(plain(off.events));
    expect(plain(mapped.receipts)).toEqual(plain(off.receipts));
  });

  it("a malformed switch value throws at the boundary (fail-loud, Laws 2+4)", () => {
    expect(() => applyIntentDoor(baseState(), ctx(3n), [], { ruleCarriers: "on" as "mapped" })).toThrow(IntentDoorError);
    expect(() => applyIntentDoor(baseState(), ctx(3n), [], { ruleCarriers: "on" as "mapped" })).toThrow(/config\.ruleCarriers/);
    expect(() => applyIntentDoor(baseState(), ctx(3n), [], { ruleCarriers: 1 as unknown as "mapped" })).toThrow(IntentDoorError);
  });
});

/* ═══════════════════════════ the five translations ═══════════════════════════ */

describe("ruleCarriers — mapped: each translation executes through the SAME handler", () => {
  it("raise-inspection-depth → configure-node (rung 2 = inspect), arrow-labeled receipt, COMMIT occupancy", () => {
    const res = applyIntentDoor(baseState(), ctx(5n), [ruleExt(5n, 7, "raise-inspection-depth", IDS.edge, 2n * FIXED_ONE)], MAPPED);
    expect(res.receipts).toHaveLength(1);
    expect(res.receipts[0]).toMatchObject({
      seq: 7,
      verb: "raise-inspection-depth→configure-node",
      outcome: "executed",
      detail: "depth=inspect",
    });
    expect(res.state.nodes?.get(IDS.edge)?.inspectionDepth).toBe("inspect");
    const executed = res.events.find((e) => e.kind === "intent-executed");
    expect(executed).toMatchObject({ verb: PlayerVerb.ConfigureNode, intentSeq: 7, causeId: "intent:7" });
    // COMMIT class: 1 hand for 1 tick.
    expect(res.state.hands?.tokens.filter((t) => t.busyCauseId !== null)).toHaveLength(1);
    expect(res.state.hands?.tokens[0]?.busyUntilTick).toBe(6n);
    expect(res.state.hands?.tokens[0]?.busyCauseId).toBe("intent:7");
  });

  it("raise with no value orders the default first-inspection rung (sample-1-in-20)", () => {
    const res = applyIntentDoor(baseState(), ctx(5n), [ruleExt(5n, 1, "raise-inspection-depth", IDS.edge, null)], MAPPED);
    expect(res.state.nodes?.get(IDS.edge)?.inspectionDepth).toBe("sample-1-in-20");
  });

  it("off-ladder rung values refuse through the ORDINARY value wall — never a throw, state identity", () => {
    const start = baseState();
    const res = applyIntentDoor(start, ctx(5n), [ruleExt(5n, 1, "raise-inspection-depth", IDS.edge, 9n * FIXED_ONE)], MAPPED);
    expect(res.receipts[0]).toMatchObject({
      verb: "raise-inspection-depth→configure-node",
      outcome: "refused",
      reason: 'bad-inspection-depth: "off-ladder"',
    });
    expect(res.state).toBe(start); // identity: refusal spends nothing, materializes nothing
    const negative = applyIntentDoor(start, ctx(5n), [ruleExt(5n, 1, "raise-inspection-depth", IDS.edge, -1n * FIXED_ONE)], MAPPED);
    expect(negative.receipts[0]).toMatchObject({ outcome: "refused", reason: 'bad-inspection-depth: "off-ladder"' });
  });

  it("a rule carrier with no target refuses unknown-node through the ordinary wall", () => {
    const res = applyIntentDoor(baseState(), ctx(5n), [ruleExt(5n, 1, "raise-inspection-depth", null, 2n * FIXED_ONE)], MAPPED);
    expect(res.receipts[0]).toMatchObject({ outcome: "refused", reason: 'unknown-node: ""' });
  });

  it("drain → disconnect-drain carries the target's SOLE supplier edge (plain pull, drain off)", () => {
    const start = withDataEdge(baseState());
    const res = applyIntentDoor(start, ctx(6n), [ruleExt(6n, 2, "drain", IDS.origin, null)], MAPPED);
    expect(res.receipts[0]).toMatchObject({
      verb: "drain→disconnect-drain",
      outcome: "executed",
      detail: `pulled:edge:data:${IDS.edge}->${IDS.origin}`,
    });
    expect(res.state.board?.edges.size).toBe(0);
  });

  it("drain carrying an edge id directly works too (target names the cable)", () => {
    const start = withDataEdge(baseState());
    const res = applyIntentDoor(start, ctx(6n), [
      ruleExt(6n, 2, "drain", asEntityId(`edge:data:${IDS.edge}->${IDS.origin}`), null),
    ], MAPPED);
    expect(res.receipts[0]).toMatchObject({ outcome: "executed", detail: `pulled:edge:data:${IDS.edge}->${IDS.origin}` });
  });

  it("drain with TWO supplier candidates (or none, or estate) refuses through unknown-edge — never picks", () => {
    const start = applyIntentDoor(withDataEdge(baseState()), ctx(6n), [
      ext(6n, 4, { verb: PlayerVerb.PlaceDevice, nodeId: asEntityId("node/f1"), deviceKind: "generic", template: null }),
      ext(6n, 5, { verb: PlayerVerb.ConnectPorts, relation: "data", from: asEntityId("node/f1"), to: IDS.origin, slot: null }),
    ], MAPPED);
    if (start.receipts.some((r) => r.outcome !== "executed")) throw new Error("setup feed refused");
    expect(start.state.board?.edges.size).toBe(2);
    const two = applyIntentDoor(start.state, ctx(10n), [ruleExt(10n, 9, "drain", IDS.origin, null)], MAPPED);
    expect(two.receipts[0]).toMatchObject({ verb: "drain→disconnect-drain", outcome: "refused", reason: 'unknown-edge: ""' });
    const none = applyIntentDoor(start.state, ctx(10n), [ruleExt(10n, 9, "drain", IDS.edge, null)], MAPPED);
    expect(none.receipts[0]).toMatchObject({ outcome: "refused", reason: 'unknown-edge: ""' });
    const estate = applyIntentDoor(start.state, ctx(10n), [ruleExt(10n, 9, "drain", null, null)], MAPPED);
    expect(estate.receipts[0]).toMatchObject({ outcome: "refused", reason: 'unknown-edge: ""' });
  });

  it("shed-class → shed-load directive event names the engine's unclassified default", () => {
    const res = applyIntentDoor(baseState(), ctx(8n), [ruleExt(8n, 4, "shed-class", IDS.edge, null)], MAPPED);
    expect(res.receipts[0]).toMatchObject({
      verb: "shed-class→shed-load",
      outcome: "executed",
      detail: `node=${IDS.edge},qos=unclassified`,
    });
    expect(res.events.some((e) => e.kind === "intent-executed")).toBe(true);
  });

  it("scale-out resolves the ABSOLUTE book value against the live anchor (5 wanted, 2 authored → +3 reserved)", () => {
    const res = applyIntentDoor(baseState(), ctx(6n), [ruleExt(6n, 3, "scale-out", IDS.edge, 5n * FIXED_ONE)], MAPPED);
    expect(res.receipts[0]).toMatchObject({
      verb: "scale-out→scale-node",
      outcome: "executed",
      detail: `node=${IDS.edge},slots=3`,
    });
    expect(res.state.scale?.entries.get(IDS.edge)).toMatchObject({ reservedSlots: 3, baseRosterSlots: 2 });
  });

  it("scale amendments chain against the ANCHOR (6 wanted → +4; 5 again → +3; 1 wanted → +0 no-op warmth)", () => {
    const once = applyIntentDoor(baseState(), ctx(6n), [ruleExt(6n, 3, "scale-out", IDS.edge, 5n * FIXED_ONE)], MAPPED);
    const twice = applyIntentDoor(once.state, ctx(7n), [ruleExt(7n, 4, "scale-out", IDS.edge, 6n * FIXED_ONE)], MAPPED);
    expect(twice.receipts[0]).toMatchObject({ outcome: "executed", detail: `node=${IDS.edge},slots=4` });
    expect(twice.state.scale?.entries.get(IDS.edge)).toMatchObject({ reservedSlots: 4, baseRosterSlots: 2 });
    const back = applyIntentDoor(twice.state, ctx(8n), [ruleExt(8n, 5, "scale-out", IDS.edge, 5n * FIXED_ONE)], MAPPED);
    expect(back.receipts[0]).toMatchObject({ outcome: "executed", detail: `node=${IDS.edge},slots=3` });
    const shrink = applyIntentDoor(twice.state, ctx(8n), [ruleExt(8n, 5, "scale-out", IDS.edge, 1n * FIXED_ONE)], MAPPED);
    expect(shrink.receipts[0]).toMatchObject({ outcome: "executed", detail: `node=${IDS.edge},slots=0` });
  });

  it("scale-out on an unknown node refuses unknown-node (delta math reads 0 — ordinary wall decides)", () => {
    const res = applyIntentDoor(baseState(), ctx(6n), [ruleExt(6n, 3, "scale-out", asEntityId("node/ghost"), 9n * FIXED_ONE)], MAPPED);
    expect(codeOf(res.receipts[0]?.reason)).toBe("unknown-node");
  });

  it("page (estate scope) → communicate; open-ticket (node target) → communicate with the target", () => {
    const page = applyIntentDoor(baseState(), ctx(6n), [ruleExt(6n, 1, "page", null, null)], MAPPED);
    expect(page.receipts[0]).toMatchObject({
      verb: "page→communicate",
      outcome: "executed",
      detail: 'estate:"the Book opened a ticket"',
    });
    const ticket = applyIntentDoor(baseState(), ctx(6n), [ruleExt(6n, 2, "open-ticket", IDS.edge, null)], MAPPED);
    expect(ticket.receipts[0]).toMatchObject({
      verb: "open-ticket→communicate",
      outcome: "executed",
      detail: `node=${IDS.edge}:"the Book opened a ticket"`,
    });
  });

  it("the bought-verb wall holds: unmapped carriers refuse on the untouched rail, state identity", () => {
    for (const verb of ["failover", "dispatch-remote-hands", "queue-change", "run-runbook:evac", "not-even-a-policy-verb"]) {
      const start = baseState();
      const res = applyIntentDoor(start, ctx(6n), [ruleExt(6n, 1, verb, IDS.edge, null)], MAPPED);
      expect(res.receipts[0], verb).toMatchObject({ verb: `verb:${verb}`, outcome: "refused" });
      expect(String(res.receipts[0]?.reason).startsWith("unsupported-verb-carrier"), verb).toBe(true);
      expect(res.state, verb).toBe(start);
    }
  });
});

/* ═══════════════════════════ the shared rails ═══════════════════════════ */

describe("ruleCarriers — hands, ordering, and the D4 attention exemption", () => {
  it("one free hand: (tick, seq) decides, and the loser sees the carrier-visible suffix", () => {
    // seq 0 (player) sorts BEFORE seq 1 (rule) — the player takes the last hand.
    const playerWins = applyIntentDoor(
      baseState(1),
      ctx(6n),
      [
        ext(6n, 0, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "inspect", shedOrder: null }),
        ruleExt(6n, 1, "scale-out", IDS.edge, 3n * FIXED_ONE),
      ],
      MAPPED,
    );
    expect(playerWins.receipts[0]).toMatchObject({ verb: "configure-node", outcome: "executed" });
    expect(playerWins.receipts[1]).toMatchObject({
      verb: "scale-out→scale-node",
      outcome: "refused",
      reason: 'hands-exhausted: need 1, free 0 of 1 — rule carrier "scale-out" pays the same hands as the player',
    });
    // Flipped stamps (rule seq before player seq) reverse the winners — the
    // ONE law is (tick, seq) order, no privilege for either origin.
    const ruleWins = applyIntentDoor(
      baseState(1),
      ctx(6n),
      [
        ext(6n, 5, { verb: PlayerVerb.ConfigureNode, nodeId: IDS.edge, inspectionDepth: "inspect", shedOrder: null }),
        ruleExt(6n, 1, "scale-out", IDS.edge, 3n * FIXED_ONE),
      ],
      MAPPED,
    );
    expect(ruleWins.receipts.map((r) => r.outcome)).toEqual(["executed", "refused"]);
    expect(ruleWins.receipts[0]).toMatchObject({ verb: "scale-out→scale-node" });
    expect(String(ruleWins.receipts[1]?.reason)).toBe("hands-exhausted: need 1, free 0 of 1");
  });

  it("occupancy interleaves: a translated communicate books the 2-tick window exactly like the player's", () => {
    const res = applyIntentDoor(baseState(1), ctx(9n), [ruleExt(9n, 1, "page", null, null)], MAPPED);
    expect(res.state.hands?.tokens[0]?.busyUntilTick).toBe(11n); // 9 + 2
    expect(res.state.hands?.tokens[0]?.busyCauseId).toBe("intent:1");
    const blocked = applyIntentDoor(res.state, ctx(9n), [
      ext(9n, 2, { verb: PlayerVerb.Communicate, target: null, note: "player" }),
    ], MAPPED);
    expect(blocked.receipts[0]).toMatchObject({ outcome: "refused" });
    expect(String(blocked.receipts[0]?.reason).startsWith("hands-exhausted")).toBe(true);
    const freed = applyIntentDoor(res.state, ctx(11n), [
      ext(11n, 3, { verb: PlayerVerb.Communicate, target: null, note: "player" }),
    ], MAPPED);
    expect(freed.receipts[0]).toMatchObject({ outcome: "executed" });
  });

  it("D4: a rule carrier NEVER pays attention (contrast: the player pays the same verb)", () => {
    const attention: AttentionState = Object.freeze({
      capacity: 1,
      tokens: Object.freeze([Object.freeze({ index: 0, busyUntilTick: 0n, busyCauseId: null })]),
      debt: 0,
      loanLedger: Object.freeze([]),
      window: 1,
      lastReplenishBusinessMinute: 0,
    });
    const seeded = createInitialState({
      runSeed: asRunSeed(7n),
      engineVersion: "test-rulecarrier-attention",
      contentHashes: { rulesetCardHashes: {}, sheetsHash: "s", ruleBookHash: "r" },
      clocks: initialClocks(),
      nodes: [node(IDS.edge, { slots: 2, serviceUs: MIN })],
      handCapacity: 2,
      board: createBoardState(),
      attention,
    });
    const config = { ...MAPPED, attentionCost: { [PlayerVerb.Communicate]: 1 } } as const;
    const page = applyIntentDoor(seeded, ctx(6n), [ruleExt(6n, 1, "page", null, null)], config);
    expect(page.receipts[0]).toMatchObject({ outcome: "executed" });
    expect(page.state.attention?.tokens.every((t) => t.busyCauseId === null)).toBe(true); // Book skipped the focus hand
    const player = applyIntentDoor(seeded, ctx(6n), [
      ext(6n, 2, { verb: PlayerVerb.Communicate, target: null, note: "founder posts" }),
    ], config);
    expect(player.receipts[0]).toMatchObject({ outcome: "executed" });
    expect(player.state.attention?.tokens.filter((t) => t.busyCauseId !== null)).toHaveLength(1);
  });

  it("the private map is FIVE routes over six carriers — a seventh key is a law change, not an edit", () => {
    const source = readFileSync(fileURLToPath(new URL("../intent-door.ts", import.meta.url)), "utf8");
    const block = /const RULE_CARRIER_MAP[\s\S]*?\n\]\);/.exec(source);
    if (block === null) throw new Error("RULE_CARRIER_MAP not found — the private map moved or renamed");
    const keys = [...block[0].matchAll(/^\s{4}"([a-z-]+)",$/gm)].map((m) => m[1]);
    expect(keys).toEqual([
      "raise-inspection-depth",
      "drain",
      "shed-class",
      "scale-out",
      "page",
      "open-ticket",
    ]);
    const verbs = [...block[0].matchAll(/verb: PlayerVerb\.(\w+)/g)].map((m) => m[1]);
    expect([...new Set(verbs)].sort()).toEqual(
      ["Communicate", "ConfigureNode", "DisconnectDrain", "ScaleNode", "ShedLoad"], // five door twins
    );
  });
});
