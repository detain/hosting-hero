// @vitest-environment node
/**
 * render · boardIntent — the §3.1 renderer-intent law, pure side (L-B).
 *
 * Locks: (1) drift pins against the door's OWN source (arg shapes, vocab,
 * edge-id grammar, hand capacity) and the runner's authored depths — the
 * mint grammar cannot silently diverge; (2) the full pointer/keyboard
 * grammar through the machine (arm → preview → terms → commit, Escape mints
 * nothing, release-on-nothing mints nothing); (3) the wire fold (cables and
 * placed ghosts are learned from door receipts at runtime, seq-guarded
 * against rAF re-reads, and a rule-deck configure stays honestly
 * depth-invisible) — the one sanctioned exception is the host's OWN boot
 * rider restated once at construction (initialEdges, weld 3); (4) the
 *  client refusal mirror — every predicted law bounces BEFORE a mint;
 *  (5) dark-desk law + determinism twin + zero-timers source scan.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { screenToWorld, worldToScreen, type WorldTransform } from "../screenSpace";
import { HUE_LEDGER } from "../hues";
import {
  AUTHORED_DEPTHS,
  BOARD_CLOCK,
  BOARD_PLATES,
  BOARD_PORTS,
  BOARD_RELATIONS,
  BOARD_VERBS,
  INSPECTION_DEPTHS,
  MINT_SHAPES,
  PLATE_H,
  PLATE_W,
  PORT_R,
  RELATION_HUES,
  SANDBOX_HAND_CAPACITY,
  SHED_ORDERS,
  benchPlate,
  createBoardIntentMachine,
  deriveEdgeId,
  mintBoardIntent,
  plateAt,
  portAt,
  predictConnect,
  predictDisconnect,
  type CableEdge,
  type MintArgs,
  type SeedCable,
} from "../boardIntent";
import type { SimProjection } from "../../shared/protocol";

const DOOR_SOURCE = readFileSync(
  join(process.cwd(), "..", "..", "packages", "sim-core", "src", "pipeline", "intent-door.ts"),
  "utf8",
);
const RUNNER_SOURCE = readFileSync(join(process.cwd(), "src", "runner", "simCoreRunner.ts"), "utf8");

function shapeKeys(member: string): string[] {
  const row = new RegExp(`\\[PlayerVerb\\.${member}\\]: Object\\.freeze\\(\\{([^}]*)\\}\\)`).exec(DOOR_SOURCE);
  if (row === null) throw new Error(`door row for ${member} not found — VERB_ARG_SHAPES drifted`);
  return [...(row[1] as string).matchAll(/([A-Za-z][A-Za-z0-9]*):/g)].map((m) => m[1] as string);
}

function frozenVocab(name: string): string[] {
  const block = new RegExp(
    `const ${name}: readonly [^=]+= Object\\.freeze\\(\\[([\\s\\S]*?)\\]\\)`,
  ).exec(DOOR_SOURCE);
  if (block === null) throw new Error(`door vocab ${name} not found — closed vocab drifted`);
  return [...(block[1] as string).matchAll(/"([^"]+)"/g)].map((m) => m[1] as string);
}

/* ── fake frames ── */

interface FakeNotice {
  readonly kind: "intent-executed" | "intent-refused" | (string & {});
  readonly detail?: string;
}

function frame(seq: number, tick: number, notices: FakeNotice[]): SimProjection {
  return {
    seq,
    tick,
    minute: 0,
    clocks: {},
    lanes: [],
    observed: new Map(),
    notices: notices.map((n) => ({
      kind: n.kind,
      laneId: null,
      atUs: 0n,
      ...(n.detail === undefined ? {} : { detail: n.detail }),
    })),
    counters: { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 },
    freeCashMicroUsd: 0n,
  } as unknown as SimProjection;
}

function armedMachine(sink: ((args: MintArgs, clock: string) => void) | null = vi.fn()) {
  const machine = createBoardIntentMachine({ sink: sink as never });
  machine.toggleWiring();
  return machine;
}

/* ═══════════════════════ drift pins (door + runner source) ═══════════════════════ */

describe("door mint-grammar drift pins", () => {
  it("MINT_SHAPES matches the door's VERB_ARG_SHAPES rows verbatim", () => {
    expect(MINT_SHAPES["place-device"]).toEqual(shapeKeys("PlaceDevice"));
    expect(MINT_SHAPES["connect-ports"]).toEqual(shapeKeys("ConnectPorts"));
    expect(MINT_SHAPES["disconnect-drain"]).toEqual(shapeKeys("DisconnectDrain"));
    expect(MINT_SHAPES["configure-node"]).toEqual(shapeKeys("ConfigureNode"));
  });

  it("the vocab mirrors still match the door's closed arrays", () => {
    expect(INSPECTION_DEPTHS).toEqual(frozenVocab("INSPECTION_DEPTHS"));
    expect(SHED_ORDERS).toEqual(frozenVocab("SHED_ORDERS"));
    expect(BOARD_RELATIONS).toEqual(frozenVocab("RELATIONS"));
  });

  it("the edge-id mirror keeps the door's private defaultEdgeId grammar", () => {
    expect(DOOR_SOURCE).toContain("const base = `edge:${relation}:${from}->${to}`;");
    expect(DOOR_SOURCE).toContain(
      'return (relation === "power" && slot !== null ? `${base}:${slot}` : base) as EntityId;',
    );
    expect(deriveEdgeId("data", "edge", "waf", null)).toBe("edge:data:edge->waf");
    expect(deriveEdgeId("power", "edge", "waf", "psu1")).toBe("edge:power:edge->waf:psu1");
  });

  it("the runner still authors the maze depths we seed from", () => {
    expect(RUNNER_SOURCE).toContain('mkNode(NODE_EDGE, 2, MICROS_PER_MIN, "sample-1-in-20", NODE_ORIGIN)');
    expect(RUNNER_SOURCE).toContain('mkNode(NODE_WAF, 2, 30_000_000n, "pass-through", null)');
    expect(RUNNER_SOURCE).toContain('mkNode(NODE_DEEP, 4, 90_000_000n, "inspect", null)');
    expect(RUNNER_SOURCE).toContain('mkNode(NODE_ORIGIN, 1, MICROS_PER_MIN, "pass-through", null)');
    for (const [nodeId, depth] of Object.entries(AUTHORED_DEPTHS)) {
      const row = new RegExp(`mkNode\\(NODE_${nodeId.toUpperCase()}, \\d+, [^,]+, "${depth}"`).test(RUNNER_SOURCE);
      expect(row, `runner mkNode row for ${nodeId}`).toBe(true);
    }
  });

  it("the sandbox hand rail still defaults to the capacity we display", () => {
    expect(RUNNER_SOURCE).toContain("handCapacity: options.build?.hands ?? 2");
    expect(SANDBOX_HAND_CAPACITY).toBe(2);
  });

  it("every relation hue is a real ledger entry", () => {
    for (const hue of Object.values(RELATION_HUES)) {
      expect(hue in HUE_LEDGER, `ledger carries ${hue}`).toBe(true);
    }
  });

  it("mints carry the verb discriminator plus exactly the shape keys", () => {
    const mint = mintBoardIntent("configure-node", {
      nodeId: "edge",
      inspectionDepth: null,
      shedOrder: "fifo",
    });
    expect(Object.keys(mint)).toEqual(["verb", ...MINT_SHAPES["configure-node"]]);
    expect(Object.isFrozen(mint)).toBe(true);
    expect(BOARD_VERBS.every((v) => v in MINT_SHAPES)).toBe(true);
  });
});

/* ══════════════════════════ geometry + hit law ══════════════════════════ */

describe("vector hit law (no pixel lookup)", () => {
  it("ports are circles and plates are rects — inside/outside both answered", () => {
    const port = BOARD_PORTS.find((p) => p.portId === "edge#data")!;
    expect(portAt({ x: port.x, y: port.y })).toBe("edge#data");
    expect(portAt({ x: port.x + PORT_R - 1, y: port.y })).toBe("edge#data");
    expect(portAt({ x: port.x + PORT_R + 2, y: port.y })).toBe(null);
    expect(plateAt({ x: -240, y: -190 })).toBe("edge");
    expect(plateAt({ x: -240 + PLATE_W / 2 + 1, y: -190 })).toBe(null);
    expect(plateAt({ x: benchPlate(1).cx, y: benchPlate(1).cy }, 1)).toBe("bench-1");
    expect(plateAt({ x: benchPlate(1).cx, y: benchPlate(1).cy })).toBe(null);
  });

  it("the screen↔world round-trip is exact for the plate grid (law-tested math)", () => {
    const world: WorldTransform = { scale: 0.42, panX: 120, panY: -40 };
    for (const port of BOARD_PORTS) {
      const screen = worldToScreen(world, { x: port.x, y: port.y });
      const back = screenToWorld(world, screen);
      expect(back.x).toBeCloseTo(port.x, 6);
      expect(back.y).toBeCloseTo(port.y, 6);
    }
  });
});

/* ════════════════════════ client refusal mirror ════════════════════════ */

const EMPTY: ReadonlyMap<string, CableEdge> = new Map();
const ROSTER = new Set(["edge", "waf", "deep", "origin"]);

describe("predictConnect mirrors the door's refusal order", () => {
  const data = (nodeId: string) => ({ nodeId, relation: "data", slot: null }) as const;
  const power = (nodeId: string, slot: string | null = "psu1") =>
    ({ nodeId, relation: "power", slot }) as const;

  it("R32 shape-mismatch leads (client-only bounce, the door never sees ports)", () => {
    const v = predictConnect(data("edge"), power("waf"), EMPTY, ROSTER);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toContain("shape-mismatch");
  });

  it("power-needs-slot and slot-only-for-power mirror the door", () => {
    expect(predictConnect(power("edge", null), power("waf", null), EMPTY, ROSTER)).toMatchObject({
      ok: false,
      reason: expect.stringContaining("power-needs-slot"),
    });
    expect(
      predictConnect(
        { nodeId: "edge", relation: "data", slot: "psu1" },
        { nodeId: "waf", relation: "data", slot: "psu1" },
        EMPTY,
        ROSTER,
      ),
    ).toMatchObject({ ok: false, reason: expect.stringContaining("slot-only-for-power") });
  });

  it("unknown-node / self-edge / edge-exists mirror the door phrases", () => {
    expect(predictConnect(data("edge"), data("ghost"), EMPTY, ROSTER)).toMatchObject({
      ok: false,
      reason: 'unknown-node: "ghost"',
    });
    expect(predictConnect(data("edge"), data("edge"), EMPTY, ROSTER)).toMatchObject({
      ok: false,
      reason: expect.stringContaining("self-edge"),
    });
    const ledger = new Map<string, CableEdge>([
      ["edge:data:edge->waf", { edgeId: "edge:data:edge->waf", relation: "data", from: "edge", to: "waf", slot: null }],
    ]);
    expect(predictConnect(data("edge"), data("waf"), ledger, ROSTER)).toMatchObject({
      ok: false,
      reason: 'edge-exists: "edge:data:edge->waf"',
    });
  });

  it("power slot-occupied and power-cycle laws match the door's walk", () => {
    const ledger = new Map<string, CableEdge>([
      ["edge:power:edge->waf:psu1", { edgeId: "edge:power:edge->waf:psu1", relation: "power", from: "edge", to: "waf", slot: "psu1" }],
    ]);
    // second feed into waf#psu1 from another node → occupied
    expect(predictConnect(power("deep"), power("waf"), ledger, ROSTER)).toMatchObject({
      ok: false,
      reason: expect.stringContaining("slot-occupied"),
    });
    // waf feeding edge back upstream → cycle
    const chain = new Map<string, CableEdge>([
      ["edge:power:waf->deep:psu1", { edgeId: "edge:power:waf->deep:psu1", relation: "power", from: "waf", to: "deep", slot: "psu1" }],
      ["edge:power:edge->waf:psu1", { edgeId: "edge:power:edge->waf:psu1", relation: "power", from: "edge", to: "waf", slot: "psu1" }],
    ]);
    expect(predictConnect(power("deep"), power("edge"), chain, ROSTER)).toMatchObject({
      ok: false,
      reason: expect.stringContaining("power-cycle"),
    });
    // different slot on the same target is multi-feed legal (door law)
    expect(
      predictConnect(power("deep", "psu2"), power("waf", "psu2"), ledger, ROSTER).ok,
    ).toBe(true);
  });

  it("a predictable-ok verdict carries the full terms card", () => {
    const v = predictConnect(power("edge"), power("waf"), EMPTY, ROSTER);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.card).toEqual({
        kind: "connect",
        relation: "power",
        from: "edge",
        to: "waf",
        slot: "psu1",
        edgeId: "edge:power:edge->waf:psu1",
      });
    }
  });

  it("disconnect predicts unknown-edge before the door pays a hand for it", () => {
    expect(predictDisconnect("edge:data:nope->gone", EMPTY)).toMatchObject({
      ok: false,
      reason: 'unknown-edge: "edge:data:nope->gone"',
    });
  });
});

/* ═════════════════════════ the machine grammar ═════════════════════════ */

describe("configure menu mints", () => {
  it("chooseDepth sends the door shape with nulls spelled, clock sim", () => {
    const sink = vi.fn();
    const machine = createBoardIntentMachine({ sink });
    machine.tapNode("edge");
    expect(machine.menuNode).toBe("edge");
    expect(machine.chooseDepth("edge", "challenge")).toBe(true);
    expect(sink).toHaveBeenCalledTimes(1);
    const [args, clock] = sink.mock.calls[0] as [Record<string, string | null>, string];
    expect(args).toEqual({
      verb: "configure-node",
      nodeId: "edge",
      inspectionDepth: "challenge",
      shedOrder: null,
    });
    expect(clock).toBe(BOARD_CLOCK);
    expect(machine.menuNode).toBe(null);
  });

  it("toggleDefense maps the g3 ROC pair and flips with the folded depth", () => {
    const sink = vi.fn();
    const machine = createBoardIntentMachine({ sink });
    // edge opens armed (sample-1-in-20) ⇒ first toggle disarms to pass-through
    expect(machine.defenseOn("edge")).toBe(true);
    machine.toggleDefense("edge");
    const [offArgs] = sink.mock.calls[0] as [Record<string, string | null>];
    expect(offArgs.inspectionDepth).toBe("pass-through");
    // the wire confirms it, so the next toggle arms at inspect
    machine.ingest(frame(1, 5, [{ kind: "intent-executed", detail: "configure-node: depth=pass-through" }]));
    expect(machine.defenseOn("edge")).toBe(false);
    machine.toggleDefense("edge");
    const [onArgs] = sink.mock.calls[1] as [Record<string, string | null>];
    expect(onArgs.inspectionDepth).toBe("inspect");
  });

  it("place-device mints bench ids deterministically and folds the roster", () => {
    const sink = vi.fn();
    const machine = createBoardIntentMachine({ sink });
    machine.placeDevice("web");
    machine.placeDevice("db");
    const first = sink.mock.calls[0] as [Record<string, string | null>];
    expect(first[0]).toEqual({ verb: "place-device", nodeId: "bench-1", deviceKind: "web", template: null });
    expect((sink.mock.calls[1] as [Record<string, string | null>])[0].nodeId).toBe("bench-2");
    machine.ingest(frame(1, 2, [{ kind: "intent-executed", detail: "place-device: kind=web" }]));
    expect(machine.roster.has("bench-1")).toBe(true);
    expect(machine.roster.has("bench-2")).toBe(false); // the db mint is still in flight
  });
});

describe("cable grammar: drag, terms, commit, pull", () => {
  it("release over nothing or the same port mints nothing (g4 Escape-law in pointer form)", () => {
    const sink = vi.fn();
    const machine = armedMachine(sink);
    machine.dragStart("edge#data");
    expect(machine.armedPort).toBe("edge#data");
    machine.dragEnd(null);
    expect(machine.armedPort).toBe(null);
    machine.dragStart("edge#data");
    machine.dragEnd("edge#data");
    expect(machine.preview).toBe(null);
    expect(sink).not.toHaveBeenCalled();
  });

  it("drag port→port previews terms; Enter commits, Escape mints nothing", () => {
    const sink = vi.fn();
    const machine = armedMachine(sink);
    machine.dragStart("edge#data");
    machine.dragMove({ x: 0, y: 0 });
    expect(machine.dragPoint).toEqual({ x: 0, y: 0 });
    machine.dragEnd("waf#data");
    expect(machine.preview).toEqual({
      kind: "connect",
      relation: "data",
      from: "edge",
      to: "waf",
      slot: null,
      edgeId: "edge:data:edge->waf",
    });
    machine.cancelPreview();
    expect(machine.preview).toBe(null);
    expect(sink).not.toHaveBeenCalled();
    machine.attemptConnect("edge#data", "waf#data"); // keyboard path — no drag needed
    expect(machine.confirmPreview()).toBe(true);
    const [args] = sink.mock.calls[0] as [Record<string, string | null>];
    expect(args).toEqual({ verb: "connect-ports", relation: "data", from: "edge", to: "waf", slot: null });
    expect(machine.pending.map((t) => t.verb)).toEqual(["connect-ports"]);
  });

  it("the keyboard rail mirrors the pointer: Enter arms a source, Enter on a target previews", () => {
    const machine = armedMachine(vi.fn());
    machine.armPort("edge#trust");
    expect(machine.armedPort).toBe("edge#trust");
    machine.armPort("edge#trust");
    expect(machine.armedPort).toBe(null);
    machine.armPort("origin#trust");
    expect(machine.armedPort).toBe("origin#trust");
    expect(machine.preview).toBe(null);
    machine.armPort("edge#trust");
    expect(machine.preview).toMatchObject({ kind: "connect", from: "origin", to: "edge" });
  });

  it("a predictable refusal bounces BEFORE any mint", () => {
    const sink = vi.fn();
    const machine = armedMachine(sink);
    machine.attemptConnect("edge#data", "waf#power");
    expect(sink).not.toHaveBeenCalled();
    expect(machine.chip).toMatchObject({ source: "preview", verb: "connect-ports" });
    expect(machine.chip?.reason).toContain("shape-mismatch");
  });

  it("pull→confirm disconnects; the folded pulled detail clears the ledger", () => {
    const sink = vi.fn();
    const machine = armedMachine(sink);
    machine.attemptConnect("edge#power", "waf#power");
    machine.confirmPreview();
    machine.ingest(frame(1, 3, [{ kind: "intent-executed", detail: "connect-ports: power:edge->waf" }]));
    // the slot is NOT on the wire detail — the seat's own token anchors it
    expect([...machine.ledger.keys()]).toEqual(["edge:power:edge->waf:psu1"]);
    machine.pullCable("edge:power:edge->waf:psu1");
    expect(machine.preview).toMatchObject({ kind: "disconnect", edgeId: "edge:power:edge->waf:psu1" });
    machine.confirmPreview();
    const [args] = sink.mock.calls[1] as [Record<string, string | null>];
    expect(args).toEqual({ verb: "disconnect-drain", edgeId: "edge:power:edge->waf:psu1" });
    machine.ingest(frame(2, 4, [{ kind: "intent-executed", detail: "disconnect-drain: pulled:edge:power:edge->waf:psu1" }]));
    expect(machine.ledger.size).toBe(0);
  });

  it("drain-started keeps the cable (the pull is a later frame)", () => {
    const machine = createBoardIntentMachine({ sink: vi.fn() });
    machine.ingest(frame(1, 1, [{ kind: "intent-executed", detail: "connect-ports: data:edge->waf" }]));
    machine.ingest(
      frame(2, 2, [{ kind: "intent-executed", detail: "disconnect-drain: drain-started:edge:data:edge->waf" }]),
    );
    expect(machine.ledger.size).toBe(1);
    machine.ingest(
      frame(3, 3, [{ kind: "intent-executed", detail: "disconnect-drain: pulled:edge:data:edge->waf" }]),
    );
    expect(machine.ledger.size).toBe(0);
  });
});

/* ═══════════════════════════ the wire fold ═══════════════════════════ */

describe("projection fold (the wire is the only ground truth)", () => {
  it("a refusal chip carries the door's reason and frees its rail token", () => {
    const sink = vi.fn();
    const machine = createBoardIntentMachine({ sink });
    machine.chooseDepth("edge", "challenge");
    expect(machine.pending.length).toBe(1);
    machine.ingest(frame(1, 9, [{ kind: "intent-refused", detail: "configure-node: hands-exhausted" }]));
    expect(machine.pending.length).toBe(0);
    expect(machine.chip).toEqual({ verb: "configure-node", reason: "hands-exhausted", tick: "9", source: "wire" });
  });

  it("colons inside the door detail survive the verb split", () => {
    const machine = createBoardIntentMachine({ sink: vi.fn() });
    machine.ingest(
      frame(1, 2, [{ kind: "intent-refused", detail: 'connect-ports: edge-exists: "edge:data:edge->waf"' }]),
    );
    expect(machine.chip?.reason).toBe('edge-exists: "edge:data:edge->waf"');
    expect(machine.chip?.source).toBe("wire");
  });

  it("rAF re-reads fold once (seq guard)", () => {
    const machine = createBoardIntentMachine({ sink: vi.fn() });
    machine.chooseDepth("edge", "challenge");
    const once = frame(7, 7, [{ kind: "intent-executed", detail: "configure-node: depth=challenge" }]);
    machine.ingest(once);
    machine.ingest(once); // same seq — must NOT double-pop or double-fold
    expect(machine.pending.length).toBe(0);
    expect(machine.depthOf("edge")).toBe("challenge");
  });

  it("a rule-deck configure stays depth-invisible (fog law, honestly pinned)", () => {
    const machine = createBoardIntentMachine({ sink: vi.fn() });
    machine.ingest(frame(1, 4, [{ kind: "intent-executed", detail: "configure-node: depth=challenge" }]));
    // no seat token anchored it — the authored depth stands
    expect(machine.depthOf("edge")).toBe("sample-1-in-20");
    // a rule-deck connect still folds (the detail carries the endpoints)
    machine.ingest(frame(2, 5, [{ kind: "intent-executed", detail: "connect-ports: data:deep->origin" }]));
    expect([...machine.ledger.keys()]).toEqual(["edge:data:deep->origin"]);
  });

  it("non-door notices (surge, rule-fired, economy) never touch the rail", () => {
    const machine = createBoardIntentMachine({ sink: vi.fn() });
    machine.chooseDepth("waf", "inspect");
    machine.ingest(
      frame(
        1,
        3,
        [
          { kind: "arrival-surge" },
          { kind: "rule-fired", detail: "some-card" },
          { kind: "economy-notice", detail: "sla-credit-due:c-04" },
        ],
      ),
    );
    expect(machine.pending.length).toBe(1);
  });

  it("a rule same-verb receipt may consume a seat token — the rail is honest, the engine never was", () => {
    const machine = createBoardIntentMachine({ sink: vi.fn() });
    machine.chooseDepth("waf", "inspect");
    machine.ingest(
      frame(1, 3, [{ kind: "intent-executed", detail: "configure-node: depth=challenge" }]),
    );
    // the token cannot tell rule from seat; the anchor folds the seat depth
    expect(machine.pending.length).toBe(0);
    expect(machine.depthOf("waf")).toBe("challenge");
  });
});

/* ═══════════ seeded cables (weld 3 — the host's boot rider) ═══════════ */

/** SESSION_BUILD.board restated — the same four records the session boots
 *  the door with (host quoting its OWN input, the initialEdges law). */
const SESSION_SEED: readonly SeedCable[] = [
  { relation: "data", from: "edge", to: "waf", slot: null },
  { relation: "control", from: "waf", to: "deep", slot: null },
  { relation: "trust", from: "deep", to: "origin", slot: null },
  { relation: "power", from: "origin", to: "edge", slot: "psu-a" },
];

describe("initialEdges: the boot rider seeds the ledger at construction", () => {
  it("four seeded cables land under the door's derived grammar, psu-a slot and all", () => {
    const machine = createBoardIntentMachine({ sink: vi.fn(), handCapacity: 3, initialEdges: SESSION_SEED });
    expect(machine.handCapacity).toBe(3);
    expect(machine.sortedEdges().map((e) => e.edgeId)).toEqual([
      "edge:control:waf->deep",
      "edge:data:edge->waf",
      "edge:power:origin->edge:psu-a",
      "edge:trust:deep->origin",
    ]);
    const power = machine.ledger.get("edge:power:origin->edge:psu-a");
    expect(power).toMatchObject({ relation: "power", from: "origin", to: "edge", slot: "psu-a" });
  });

  it("a seeded cable is pull-disconnectable — the mint is the door record", () => {
    const sink = vi.fn();
    const machine = createBoardIntentMachine({ sink, initialEdges: SESSION_SEED });
    machine.pullCable("edge:trust:deep->origin");
    expect(machine.preview).toMatchObject({ kind: "disconnect", edgeId: "edge:trust:deep->origin" });
    expect(machine.confirmPreview()).toBe(true);
    const [args] = sink.mock.calls[0] as [Record<string, string | null>];
    expect(args).toEqual({ verb: "disconnect-drain", edgeId: "edge:trust:deep->origin" });
  });

  it("re-connecting a seeded route bounces edge-exists BEFORE any mint", () => {
    const sink = vi.fn();
    const machine = createBoardIntentMachine({ sink, initialEdges: SESSION_SEED });
    machine.toggleWiring();
    machine.attemptConnect("edge#data", "waf#data");
    expect(sink).not.toHaveBeenCalled();
    expect(machine.chip).toMatchObject({ source: "preview", verb: "connect-ports" });
    expect(machine.chip?.reason).toContain('edge-exists: "edge:data:edge->waf"');
  });

  it("the runtime wire stays the authority: a pull receipt removes a seeded cable", () => {
    const machine = createBoardIntentMachine({ sink: vi.fn(), initialEdges: SESSION_SEED });
    machine.ingest(
      frame(2, 4, [{ kind: "intent-executed", detail: "disconnect-drain: pulled:edge:data:edge->waf" }]),
    );
    expect(machine.ledger.has("edge:data:edge->waf")).toBe(false);
    expect(machine.ledger.has("edge:power:origin->edge:psu-a")).toBe(true);
  });

  it("no option, no seed — the sandbox ledger still opens empty (byte-stand)", () => {
    const machine = createBoardIntentMachine();
    expect(machine.ledger.size).toBe(0);
    expect(machine.handCapacity).toBe(SANDBOX_HAND_CAPACITY);
  });

  it("sessionModel.SESSION_BOARD_EDGES equals the boot rider's own board (drift pin)", () => {
    const src = readFileSync(join(process.cwd(), "src", "session", "sessionModel.ts"), "utf8");
    expect(src).toContain("SESSION_BOARD_EDGES");
    // the four seeded cables here are the four the panel file freezes
    expect(SESSION_SEED.length).toBe(4);
    expect(SESSION_SEED.map((e) => deriveEdgeId(e.relation, e.from, e.to, e.slot)).sort()).toEqual([
      "edge:control:waf->deep",
      "edge:data:edge->waf",
      "edge:power:origin->edge:psu-a",
      "edge:trust:deep->origin",
    ]);
    // and each equals the SESSION_EDGE_IDS literals the verb rail targets
    for (const literal of ["edge:data:edge->waf", "edge:control:waf->deep", "edge:trust:deep->origin", "edge:power:origin->edge:psu-a"]) {
      expect(src).toContain(literal);
    }
  });
});

/* ═══════════════════════ dark desk + sorted views ═══════════════════════ */

describe("dark-desk law and view order", () => {
  it("without a sink nothing mints and the rail says so", () => {
    const machine = createBoardIntentMachine();
    expect(machine.hasSink).toBe(false);
    expect(machine.chooseDepth("edge", "inspect")).toBe(false);
    expect(machine.pending.length).toBe(0);
    expect(machine.chip).toMatchObject({ reason: "no-door-attached", source: "preview" });
    machine.setSink(vi.fn());
    expect(machine.hasSink).toBe(true);
    expect(machine.chooseDepth("edge", "inspect")).toBe(true);
  });

  it("every listed view sorts by code units", () => {
    const machine = createBoardIntentMachine({ sink: vi.fn() });
    expect(machine.sortedNodes()).toEqual(["deep", "edge", "origin", "waf"]);
    expect(machine.sortedPorts()[0]?.portId).toBe("deep#control");
    expect(machine.sortedEdges()).toEqual([]);
    const wired = armedMachine(vi.fn());
    wired.attemptConnect("edge#data", "origin#data");
    wired.confirmPreview();
    wired.attemptConnect("edge#trust", "waf#trust");
    wired.confirmPreview();
    wired.ingest(
      frame(
        1,
        1,
        [
          { kind: "intent-executed", detail: "connect-ports: data:edge->origin" },
          { kind: "intent-executed", detail: "connect-ports: trust:edge->waf" },
        ],
      ),
    );
    expect(wired.sortedEdges().map((e) => e.edgeId)).toEqual(["edge:data:edge->origin", "edge:trust:edge->waf"]);
  });

  it("twin machines end at identical snapshots (determinism)", () => {
    const script = (sink: (args: MintArgs, clock: string) => void) => {
      const machine = createBoardIntentMachine({ sink: sink as never });
      machine.toggleWiring();
      machine.dragStart("edge#data");
      machine.dragMove({ x: 1, y: 2 });
      machine.dragEnd("waf#data");
      machine.confirmPreview();
      machine.ingest(frame(1, 2, [{ kind: "intent-executed", detail: "connect-ports: data:edge->waf" }]));
      machine.placeDevice("cache");
      machine.toggleDefense("edge");
      machine.ingest(
        frame(
          2,
          3,
          [
            { kind: "intent-executed", detail: "place-device: kind=cache" },
            { kind: "intent-refused", detail: "configure-node: hands-exhausted" },
          ],
        ),
      );
      return JSON.stringify({
        version: machine.version,
        pending: machine.pending,
        chip: machine.chip,
        edges: [...machine.ledger.entries()],
        roster: machine.sortedNodes(),
        depths: machine.sortedNodes().map((n) => machine.depthOf(n)),
        wiring: machine.wiring,
      });
    };
    expect(script(() => undefined)).toBe(script(() => undefined));
  });

  it("the pure modules carry zero timers and no wall clock (source scan)", () => {
    for (const rel of [
      join("src", "render", "boardIntent.ts"),
      join("src", "render", "boardPick.ts"),
    ]) {
      const code = readFileSync(join(process.cwd(), rel), "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "");
      expect(code, rel).not.toMatch(/setTimeout|setInterval|requestAnimationFrame|performance\.now|Date\.now|new Date/);
    }
  });

  it("the plate/port layout stays a sane grid (regression guard)", () => {
    expect(BOARD_PLATES.length).toBe(4);
    expect(BOARD_PORTS.length).toBe(16);
    const seen = new Set(BOARD_PORTS.map((p) => `${p.x},${p.y}`));
    expect(seen.size).toBe(16);
    for (const p of BOARD_PORTS) {
      expect(Math.abs(p.y - (-190 + PLATE_H / 2 + 18))).toBeLessThan(1);
    }
  });
});
