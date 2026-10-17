/**
 * actRow law tests (L-HUD, node env) — §7.16 Act row pure derivation.
 *
 * The money test is the DOOR DRIFT PIN: the minted arg shapes are compared
 * against the door's own VERB_ARG_SHAPES parsed from intent-door.ts via
 * ?raw (scenario/doc.ts HONEST_ROWS / elasticity mirror precedent) — a
 * door amendment that this desk has not followed reddens here, never at
 * click time in front of a player.
 *
 * Live-book states are DOOR-FED (applyIntentDoor + a tick bump per feed),
 * so shippedAtTick stamps, versions and LWW replaces are real engine
 * facts, not HUD guesses. Branch statuses the door cannot reach on a
 * frozen clock (armed-for-future, released, shielded, warmth) ride tiny
 * hand-forged book spreads — every reader here is a pure function of the
 * books, so the forge is honest.
 */
import { describe, expect, it } from "vitest";
import doorRaw from "../../../../../packages/sim-core/src/pipeline/intent-door.ts?raw";
import {
  PlayerVerb,
  asEntityId,
  asRunSeed,
  type BoardEdgeRecord,
  type EntityId,
  type GameState,
  type NodeRecord,
  type PlayerVerbArgs,
  type ReplayContentHashes,
  type SimEvent,
} from "@hh/sim-core/types";
import { applyIntentDoor, createInitialState } from "@hh/sim-core/pipeline";
import {
  ActRowError,
  LIFT_AT_NEXT_MINUTE,
  RESTART_WINDOW_MINUTES,
  actIntentClock,
  deriveActReceipt,
  deriveActRow,
  mintActIntent,
} from "../actRow";

const MIN = 60_000_000n; // µs per business minute — mirrors shieldBusinessMinuteOf
const NOW_MINUTE = 42;
const id = (raw: string): EntityId => asEntityId(raw);

const HASHES = Object.freeze({
  rulesetCardHashes: Object.freeze({}),
  sheetsHash: "0000000000000000",
  ruleBookHash: "0000000000000000",
}) as ReplayContentHashes;

function nodeRecord(raw: string, roster: number): NodeRecord {
  const slot = Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null });
  return Object.freeze({
    id: id(raw),
    kind: "generic",
    slots: Object.freeze(Array.from({ length: roster }, () => slot)),
    serviceTimeUs: 1_000_000n,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted",
    inspectionDepth: "inspect",
    discipline: "hockey-stick",
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

function baseState(): GameState {
  return createInitialState({
    runSeed: asRunSeed(904n),
    engineVersion: "act-row-test",
    contentHashes: HASHES,
    clocks: Object.freeze({ realUs: 0n, simUs: BigInt(NOW_MINUTE) * MIN, businessUs: BigInt(NOW_MINUTE) * MIN, wallUs: 0n }),
    nodes: Object.freeze([nodeRecord("edge", 2), nodeRecord("origin", 1)]),
    handCapacity: 2,
  });
}

/** One door-fed verb, then the tick bump a real driver would perform —
 *  hands release for the next feed; shippedAtTick stamps are door truth. */
function feedDoor(state: GameState, args: PlayerVerbArgs): { state: GameState; events: readonly SimEvent[] } {
  const ctx = state.context;
  const result = applyIntentDoor(
    state,
    ctx,
    Object.freeze([
      Object.freeze({
        tick: ctx.tick,
        intent: Object.freeze({
          seq: 0,
          clock: "business" as const,
          atUs: 0n,
          origin: "player" as const,
          payload: Object.freeze({ kind: "player-verb" as const, args }),
        }),
      }),
    ]),
    Object.freeze({ handCapacity: 2 }),
  );
  const next = result.state;
  return {
    state: Object.freeze({ ...next, context: Object.freeze({ ...next.context, tick: next.context.tick + 1n }) }) as GameState,
    events: result.events,
  };
}

function rowOf(model: ReturnType<typeof deriveActRow>, verbKey: string) {
  const r = model.rows.find((x) => x.verbKey === verbKey);
  if (r === undefined) throw new Error(`no ${verbKey} row`);
  return r;
}
function actionOf(row: ReturnType<typeof rowOf>, key: string) {
  const a = row.actions.find((x) => x.key === key);
  if (a === undefined) throw new Error(`no ${key} action`);
  return a;
}

/* ═══════════════════════ the door drift pin (money tests) ═══════════════════ */

interface DoorShape {
  readonly member: string;
  readonly verb: PlayerVerb;
  readonly mint: () => PlayerVerbArgs;
}

const MINT_CASES: readonly DoorShape[] = Object.freeze([
  { member: "DisconnectDrain", verb: PlayerVerb.DisconnectDrain, mint: () => mintActIntent(PlayerVerb.DisconnectDrain, "edge", NOW_MINUTE, { edgeId: "e-d1" }) },
  { member: "ShedLoad", verb: PlayerVerb.ShedLoad, mint: () => mintActIntent(PlayerVerb.ShedLoad, "edge", NOW_MINUTE) },
  { member: "IsolateNode", verb: PlayerVerb.IsolateNode, mint: () => mintActIntent(PlayerVerb.IsolateNode, "edge", NOW_MINUTE) },
  { member: "ThrottleNode", verb: PlayerVerb.ThrottleNode, mint: () => mintActIntent(PlayerVerb.ThrottleNode, "edge", NOW_MINUTE, { cutSlots: 1 }) },
  { member: "RestartNode", verb: PlayerVerb.RestartNode, mint: () => mintActIntent(PlayerVerb.RestartNode, "edge", NOW_MINUTE) },
  { member: "ReclaimNode", verb: PlayerVerb.ReclaimNode, mint: () => mintActIntent(PlayerVerb.ReclaimNode, "edge", NOW_MINUTE) },
  { member: "ScaleNode", verb: PlayerVerb.ScaleNode, mint: () => mintActIntent(PlayerVerb.ScaleNode, "edge", NOW_MINUTE, { reservedSlots: 1 }) },
]);

/** Parse the door's own table: `Object.freeze({ key: "wiretype", ... })` per verb line. */
function doorShape(member: string): ReadonlyMap<string, string> {
  const line = new RegExp(`\\[PlayerVerb\\.${member}\\]:\\s*Object\\.freeze\\(\\{([^}]*)\\}\\)`).exec(doorRaw);
  if (line === null || line[1] === undefined) throw new Error(`door has no VERB_ARG_SHAPES line for ${member}`);
  const out = new Map<string, string>();
  for (const kv of line[1].matchAll(/(\w+):\s*"([\w-]+)"/g)) out.set(kv[1] as string, kv[2] as string);
  return out;
}

describe("actRow · door drift pin", () => {
  it("the door table still carries every Act verb by name (shape-parse sanity)", () => {
    for (const c of MINT_CASES) expect(doorShape(c.member).size).toBeGreaterThan(0);
  });

  it("minted key-sets EQUAL the door's per-verb key-sets (verb discriminator aside)", () => {
    const legs: string[] = [];
    for (const c of MINT_CASES) {
      const minted = Object.keys(c.mint()).filter((k) => k !== "verb").sort();
      const door = [...doorShape(c.member).keys()].sort();
      expect(minted, c.member).toEqual(door);
      legs.push(c.member);
    }
    expect(legs.length).toBe(7);
  });

  it("minted VALUE types ride the door wire families (null needs the -null arm)", () => {
    for (const c of MINT_CASES) {
      const shape = doorShape(c.member);
      for (const [key, value] of Object.entries(c.mint())) {
        if (key === "verb") continue;
        const wire = shape.get(key);
        expect(wire, `${c.member}.${key} absent from door`).toBeDefined();
        if (value === null) expect(wire!.endsWith("-null"), `${c.member}.${key}`).toBe(true);
        else if (typeof value === "number") expect(wire).toMatch(/^number(-or-null)?$/);
        else if (typeof value === "string") expect(wire).toMatch(/^string(-or-null)?$/);
        else if (typeof value === "bigint") expect(wire).toMatch(/^bigint(-or-null)?$/);
        else throw new Error(`minted ${c.member}.${key}: unrepresentable wire value`);
      }
    }
  });

  it("shed-load mints nodeId (NOT targetNodeId) with a null qosClassId directive", () => {
    const args = mintActIntent(PlayerVerb.ShedLoad, "edge", NOW_MINUTE) as unknown as Record<string, unknown>;
    expect(Object.keys(args).sort()).toEqual(["nodeId", "qosClassId", "verb"]);
    expect(args["nodeId"]).toBe("edge");
    expect(args["qosClassId"]).toBeNull();
  });
});

/* ══════════════════════════ mint semantics ══════════════════════════════════ */

describe("actRow · mint semantics", () => {
  it("isolate-arm is immediate-indefinite: both minute legs null", () => {
    const args = mintActIntent(PlayerVerb.IsolateNode, "edge", NOW_MINUTE) as unknown as Record<string, unknown>;
    expect(args["effectiveAtBusinessMinute"]).toBeNull();
    expect(args["releaseAtBusinessMinute"]).toBeNull();
  });

  it("isolate-lift is the door-honest boundary release: eff null, rel = now + 1 (no un-isolate exists)", () => {
    const args = mintActIntent(PlayerVerb.IsolateNode, "edge", NOW_MINUTE, { lift: true }) as unknown as Record<string, unknown>;
    expect(args["effectiveAtBusinessMinute"]).toBeNull();
    expect(args["releaseAtBusinessMinute"]).toBe(NOW_MINUTE + LIFT_AT_NEXT_MINUTE);
  });

  it("restart release is REQUIRED non-null — bounded flush window (PROVISIONAL 5m taste row)", () => {
    const drop = mintActIntent(PlayerVerb.RestartNode, "edge", NOW_MINUTE) as unknown as Record<string, unknown>;
    expect(drop["dropQueued"]).toBe("drop");
    expect(drop["releaseAtBusinessMinute"]).toBe(NOW_MINUTE + RESTART_WINDOW_MINUTES);
    const keep = mintActIntent(PlayerVerb.RestartNode, "edge", NOW_MINUTE, { dropQueued: "keep" }) as unknown as Record<string, unknown>;
    expect(keep["dropQueued"]).toBe("keep");
  });

  it("drain without an edge id fails loud at the mint, not silent at the door", () => {
    expect(() => mintActIntent(PlayerVerb.DisconnectDrain, "edge", NOW_MINUTE)).toThrow(ActRowError);
    expect(() => mintActIntent(PlayerVerb.DisconnectDrain, "edge", NOW_MINUTE)).toThrow(/disconnect-drain\.edgeId/);
  });

  it("verbs outside the desk surface refuse to mint", () => {
    expect(() => mintActIntent(PlayerVerb.ToggleSpeed, "edge", NOW_MINUTE)).toThrow(/act\[not-act-row\]/);
  });

  it("mints are deep-frozen", () => {
    const args = mintActIntent(PlayerVerb.ThrottleNode, "edge", NOW_MINUTE, { cutSlots: 1 });
    expect(Object.isFrozen(args)).toBe(true);
    expect(Object.isFrozen(mintActIntent(PlayerVerb.RestartNode, "edge", NOW_MINUTE))).toBe(true);
  });

  it("Dual-Clock law: minute-window acts ride business, packet-world acts ride sim", () => {
    expect(actIntentClock(PlayerVerb.IsolateNode)).toBe("business");
    expect(actIntentClock(PlayerVerb.ReclaimNode)).toBe("business");
    expect(actIntentClock(PlayerVerb.RestartNode)).toBe("business");
    expect(actIntentClock(PlayerVerb.DisconnectDrain)).toBe("sim");
    expect(actIntentClock(PlayerVerb.ShedLoad)).toBe("sim");
  });
});

/* ════════════════════════ as-of derivation (door-fed) ═══════════════════════ */

describe("actRow · derivation", () => {
  it("a fresh world: act section is EXACTLY the four §7.16 verbs in order, desk follows, everything idle", () => {
    const model = deriveActRow(baseState(), "edge");
    expect(model.minute).toBe(NOW_MINUTE);
    const acts = model.rows.filter((r) => r.section === "act").map((r) => r.verbKey);
    expect(acts).toEqual(["drain", "restart", "isolate", "shed"]);
    expect(model.rows.filter((r) => r.section === "desk").map((r) => r.verbKey)).toEqual(["throttle", "reclaim", "warmth", "shield"]);
    expect(model.rows.filter((r) => r.live)).toEqual([]);
    expect(rowOf(model, "drain").actions.every((a) => !a.enabled)).toBe(true);
  });

  it("door-fed isolate: FENCED · admits 0; arm goes dark, the boundary lift wakes", () => {
    const fed = feedDoor(baseState(), mintActIntent(PlayerVerb.IsolateNode, "edge", NOW_MINUTE));
    const model = deriveActRow(fed.state, "edge");
    const iso = rowOf(model, "isolate");
    expect(iso.live).toBe(true);
    expect(iso.status).toBe("FENCED now · indefinite · admits 0");
    expect(actionOf(iso, "isolate").enabled).toBe(false);
    expect(actionOf(iso, "isolate-lift").enabled).toBe(true);
  });

  it("door-fed isolate lifted at the boundary: still live, release minute shown", () => {
    const armed = feedDoor(baseState(), mintActIntent(PlayerVerb.IsolateNode, "edge", NOW_MINUTE));
    const lifted = feedDoor(armed.state, mintActIntent(PlayerVerb.IsolateNode, "edge", NOW_MINUTE, { lift: true }));
    const model = deriveActRow(lifted.state, "edge");
    expect(rowOf(model, "isolate").status).toBe("FENCED now · releases m43 · admits 0");
  });

  it("armed-for-future is not live (half-open [eff,rel) through the reader)", () => {
    const state = Object.freeze({
      ...baseState(),
      isolate: Object.freeze({ version: 1, entries: new Map([[id("edge"), Object.freeze({ shippedAtTick: 0n, effectiveAtBusinessMinute: 52, releaseAtBusinessMinute: null })]]) }),
    }) as GameState;
    const iso = rowOf(deriveActRow(state, "edge"), "isolate");
    expect(iso.live).toBe(false);
    expect(iso.status).toBe("armed for m52");
  });

  it("expired release reads back honestly, never as live", () => {
    const state = Object.freeze({
      ...baseState(),
      isolate: Object.freeze({ version: 1, entries: new Map([[id("edge"), Object.freeze({ shippedAtTick: 0n, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: 30 })]]) }),
    }) as GameState;
    expect(rowOf(deriveActRow(state, "edge"), "isolate").status).toBe("released at m30");
  });

  it("throttle at the door's ceiling (cut = roster−1): donut-shrink language, raise disabled with the isolate pointer", () => {
    const fed = feedDoor(baseState(), mintActIntent(PlayerVerb.ThrottleNode, "edge", NOW_MINUTE, { cutSlots: 1 }));
    const th = rowOf(deriveActRow(fed.state, "edge"), "throttle");
    expect(th.status).toBe("ceiling 1 of 2 — max visibly shrunk · at ceiling");
    expect(actionOf(th, "throttle-raise").enabled).toBe(false);
    expect(actionOf(th, "throttle-raise").title).toMatch(/isolate-node/);
    expect(actionOf(th, "throttle-lift").enabled).toBe(true);
  });

  it("restart window: rebooting line carries the release minute and the queue mode", () => {
    const fed = feedDoor(baseState(), mintActIntent(PlayerVerb.RestartNode, "edge", NOW_MINUTE));
    const rs = rowOf(deriveActRow(fed.state, "edge"), "restart");
    expect(rs.live).toBe(true);
    expect(rs.status).toBe(`rebooting to m${NOW_MINUTE + RESTART_WINDOW_MINUTES} · queue flushing`);
  });

  it("the tombstone voids the OTHER books: door-fed isolate flips inert under a later reclaim", () => {
    const armed = feedDoor(baseState(), mintActIntent(PlayerVerb.IsolateNode, "edge", NOW_MINUTE));
    const reclaimed = feedDoor(armed.state, mintActIntent(PlayerVerb.ReclaimNode, "edge", NOW_MINUTE));
    const model = deriveActRow(reclaimed.state, "edge");
    expect(rowOf(model, "isolate").live).toBe(false);
    expect(rowOf(model, "isolate").status).toBe("booking tombstoned — inert");
    const rc = rowOf(model, "reclaim");
    expect(rc.live).toBe(true);
    expect(rc.status).toBe("tombstone now — 1 booking(s) inert");
  });

  it("drain enumerates DATA edges only, per-edge, keyed by the real edge id", () => {
    const edges = new Map<EntityId, BoardEdgeRecord>([
      [id("e-d1"), Object.freeze({ id: id("e-d1"), relation: "data", from: id("edge"), to: id("origin"), slot: null })],
      [id("e-p1"), Object.freeze({ id: id("e-p1"), relation: "power", from: id("origin"), to: id("edge"), slot: "psu1" })],
    ]);
    const state = Object.freeze({ ...baseState(), board: Object.freeze({ version: 1, edges }) }) as GameState;
    const dr = rowOf(deriveActRow(state, "edge"), "drain");
    expect(dr.actions.length).toBe(1);
    expect(dr.actions[0]?.key).toBe("drain:e-d1");
    expect(dr.actions[0]?.enabled).toBe(true);
    expect(dr.actions[0]?.options).toEqual({ edgeId: "e-d1" });
  });

  it("warmth + shield are readouts through the scale/shield books (shield never an act)", () => {
    const state = Object.freeze({
      ...baseState(),
      scale: Object.freeze({ version: 1, entries: new Map([[id("edge"), Object.freeze({ reservedSlots: 2, baseRosterSlots: 3, shippedAtTick: 0n, effectiveAtBusinessMinute: null })]]) }),
      shield: Object.freeze({ version: 1, entries: new Map([[id("edge"), Object.freeze({ shippedAtTick: 0n, effectiveAtBusinessMinute: null })]]) }),
    }) as GameState;
    const model = deriveActRow(state, "edge");
    expect(rowOf(model, "warmth").status).toBe("warmth: +2 reserved on base roster 3 — effective 5");
    expect(rowOf(model, "warmth").actions[0]?.options).toEqual({ reservedSlots: 3 });
    const sh = rowOf(model, "shield");
    expect(sh.live).toBe(true);
    expect(sh.actions).toEqual([]);
  });

  it("an absent node darkens every action and says so", () => {
    const model = deriveActRow(baseState(), "ghost");
    expect(model.nodeExists).toBe(false);
    for (const r of model.rows) for (const a of r.actions) {
      expect(a.enabled, `${r.verbKey}/${a.key}`).toBe(false);
      expect(a.title).toContain("no such node");
    }
  });

  it("the model is frozen all the way down", () => {
    const model = deriveActRow(baseState(), "edge");
    expect(Object.isFrozen(model)).toBe(true);
    expect(Object.isFrozen(model.rows)).toBe(true);
    expect(Object.isFrozen(model.rows[0])).toBe(true);
    expect(Object.isFrozen(model.rows[0]?.actions)).toBe(true);
    expect(Object.isFrozen(model.rows[0]?.actions[0])).toBe(true);
  });
});

/* ═══════════════════════════ the receipt line ═══════════════════════════════ */

describe("actRow · receipts", () => {
  it("executed detail rides VERBATIM; the refused reason is the LAST door word", () => {
    const armed = feedDoor(baseState(), mintActIntent(PlayerVerb.IsolateNode, "edge", NOW_MINUTE));
    const executed = deriveActReceipt(armed.events);
    expect(executed?.kind).toBe("executed");
    expect(executed?.verb).toBe("isolate-node");
    expect(executed?.text).toContain("target=edge");

    const refusedFeed = feedDoor(baseState(), mintActIntent(PlayerVerb.IsolateNode, "ghost", NOW_MINUTE));
    const refused = deriveActReceipt(refusedFeed.events);
    expect(refused?.kind).toBe("refused");
    expect(refused?.text).toBe('unknown-node: "ghost"');

    const both = deriveActReceipt([...armed.events, ...refusedFeed.events]);
    expect(both?.kind).toBe("refused");
  });

  it("no door traffic → no receipt, ever", () => {
    expect(deriveActReceipt([])).toBeNull();
  });
});
