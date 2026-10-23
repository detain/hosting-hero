// @vitest-environment jsdom
/**
 * BoardIntentHud mount law (L-B) — the DOM rail is a thin view over the
 * pure machine: mint clicks land the door-shaped args on the sink, the
 * keyboard cable grammar (Enter-arm → Enter-target → Enter-confirm, Escape
 * mints nothing) works without a mouse, refusals voice through
 * describeRefusal with honest source labels (pack/wire/preview), and the
 * dark desk stays dark without a sink. The last describe runs the REAL
 * intent door (nodeActRow's witness pattern, full circle): every mint this
 * rail produces parses at the door, executes or refuses there, and the
 * receipt fed back through ingest moves the HUD's own ledger.
 *
 * Zero timers: the machine updates on the frame clock the host already
 * owns; the spy trio guards it (FlavourFeed/nodeActRow law).
 */
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  asEntityId,
  asRunSeed,
  type BoardState,
  type GameState,
  type NodeRecord,
  type ReplayContentHashes,
} from "@hh/sim-core/types";
import { applyIntentDoor, createInitialState } from "@hh/sim-core/pipeline";
type DoorReceipt = ReturnType<typeof applyIntentDoor>["receipts"][number];
import BoardIntentHud from "../BoardIntentHud.vue";
import {
  createBoardIntentMachine,
  predictConnect,
  type CableEdge,
  type MintArgs,
} from "../../render/boardIntent";
import type { SimProjection } from "../../shared/protocol";

const MIN = 60_000_000n;
const HASHES = Object.freeze({
  rulesetCardHashes: Object.freeze({}),
  sheetsHash: "0000000000000000",
  ruleBookHash: "0000000000000000",
}) as ReplayContentHashes;

function nodeRecord(raw: string): NodeRecord {
  const slot = Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null });
  return Object.freeze({
    id: asEntityId(raw),
    kind: "generic",
    slots: Object.freeze([slot, slot]),
    serviceTimeUs: 1_000_000n,
    queueDepth: 0,
    queue: Object.freeze([]),
    shedOrder: "qos-weighted",
    inspectionDepth: "pass-through",
    discipline: "hockey-stick",
    utilizationRho: 0n,
    dependencyNodeId: null,
  });
}

function baseState(): GameState {
  return createInitialState({
    runSeed: asRunSeed(904n),
    engineVersion: "board-intent-mount",
    contentHashes: HASHES,
    clocks: Object.freeze({ realUs: 0n, simUs: 42n * MIN, businessUs: 42n * MIN, wallUs: 0n }),
    nodes: Object.freeze([
      nodeRecord("edge"),
      nodeRecord("waf"),
      nodeRecord("deep"),
      nodeRecord("origin"),
    ]),
    board: { version: 0, edges: new Map() } as unknown as BoardState,
    handCapacity: 3,
  });
}

/** The runner's notice shape, from REAL receipts (simCoreRunner mirror). */
function receiptNotice(receipt: DoorReceipt): { kind: string; detail: string } {
  const body =
    receipt.outcome === "executed"
      ? receipt.detail === undefined
        ? receipt.verb
        : `${receipt.verb}: ${receipt.detail}`
      : `${receipt.verb}: ${receipt.reason}`;
  return {
    kind: receipt.outcome === "executed" ? "intent-executed" : "intent-refused",
    detail: body,
  };
}

function doorPass(state: GameState, args: MintArgs) {
  const result = applyIntentDoor(
    state,
    state.context,
    [{ tick: state.context.tick, intent: { seq: 0, clock: "sim", atUs: 0n, origin: "player", payload: { kind: "player-verb", args: args as never } } }],
    { handCapacity: 3 },
  );
  return result;
}

function frame(seq: number, tick: number, notices: Array<{ kind: string; detail?: string }>): SimProjection {
  return {
    seq,
    tick,
    minute: 0,
    clocks: {},
    lanes: [],
    observed: new Map(),
    notices: notices.map((n) => ({ kind: n.kind, laneId: null, atUs: 0n, ...(n.detail === undefined ? {} : { detail: n.detail }) })),
    counters: { served: 0, bounced: 0, blockedFalsePositive: 0, landed: 0 },
    freeCashMicroUsd: 0n,
  } as unknown as SimProjection;
}

let timers: { interval: ReturnType<typeof vi.spyOn>; timeout: ReturnType<typeof vi.spyOn>; raf: ReturnType<typeof vi.spyOn> };

beforeEach(() => {
  timers = {
    interval: vi.spyOn(globalThis, "setInterval"),
    timeout: vi.spyOn(globalThis, "setTimeout"),
    raf: vi.spyOn(globalThis, "requestAnimationFrame"),
  };
});

afterEach(() => {
  expect(timers.interval).not.toHaveBeenCalled();
  expect(timers.timeout).not.toHaveBeenCalled();
  expect(timers.raf).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

function mountHud(sink: ((args: MintArgs, clock: string) => void) | null) {
  const machine = createBoardIntentMachine({ sink: sink as never });
  return { machine, w: mount(BoardIntentHud, { props: { machine } }) };
}

describe("configure rail (click grammar)", () => {
  it("a node chip opens the menu; a depth choice mints the exact door args", async () => {
    const sink = vi.fn();
    const { w } = mountHud(sink);
    await w.find('[data-test="board-node-edge"]').trigger("click");
    expect(w.find('[data-test="board-node-menu"]').exists()).toBe(true);
    await w.find('[data-test="board-depth-challenge"]').trigger("click");
    expect(sink).toHaveBeenCalledTimes(1);
    expect((sink.mock.calls[0] as [MintArgs])[0]).toEqual({
      verb: "configure-node",
      nodeId: "edge",
      inspectionDepth: "challenge",
      shedOrder: null,
    });
    expect(w.find('[data-test="board-node-menu"]').exists()).toBe(false);
  });

  it("defense toggle maps the ROC pair off the FOLDED depth, not the authored one", async () => {
    const sink = vi.fn();
    const { machine, w } = mountHud(sink);
    // edge authored armed → the chip offers pass-through
    await w.find('[data-test="board-node-waf"]').trigger("click");
    // waf authored pass-through → defense OFF → toggle arms at inspect
    await w.find('[data-test="board-defense-toggle"]').trigger("click");
    expect((sink.mock.calls[0] as [MintArgs])[0].inspectionDepth).toBe("inspect");
    // after the wire confirms it, the toggle flips back
    machine.ingest(frame(1, 3, [{ kind: "intent-executed", detail: "configure-node: depth=inspect" }]));
    await w.find('[data-test="board-node-waf"]').trigger("click");
    await w.find('[data-test="board-defense-toggle"]').trigger("click");
    expect((sink.mock.calls[1] as [MintArgs])[0].inspectionDepth).toBe("pass-through");
  });

  it("place buttons mint bench ids (the sandbox door has no placement validator)", async () => {
    const sink = vi.fn();
    const { w } = mountHud(sink);
    await w.find('[data-test="board-place-db"]').trigger("click");
    expect((sink.mock.calls[0] as [MintArgs])[0]).toEqual({
      verb: "place-device",
      nodeId: "bench-1",
      deviceKind: "db",
      template: null,
    });
  });
});

describe("wiring rail (keyboard cable grammar)", () => {
  it("the W key enters wiring mode and reveals the port rail", async () => {
    const { machine, w } = mountHud(vi.fn());
    expect(w.find('[data-test="board-target-rail"]').exists()).toBe(false);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "w" }));
    expect(machine.wiring).toBe(true);
    await w.vm.$nextTick();
    expect(w.find('[data-test="board-target-rail"]').exists()).toBe(true);
    expect(w.find('[data-test="board-wiring-toggle"]').attributes("aria-pressed")).toBe("true");
    // Escape (no dialog open) closes the menu only — mode is W's to leave
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(machine.wiring).toBe(true);
  });

  it("Enter arms a source, Enter on a target opens terms, Enter confirms the mint", async () => {
    const sink = vi.fn();
    const { machine, w } = mountHud(sink);
    machine.toggleWiring();
    await w.vm.$nextTick();
    await w.find('[data-test="board-port-edge#data"]').trigger("keydown.enter");
    expect(w.find('[data-test="board-armed-line"]').text()).toContain("source armed: edge · data");
    await w.find('[data-test="board-port-waf#data"]').trigger("keydown.enter");
    const dialog = w.find('[data-test="board-terms"]');
    expect(dialog.exists()).toBe(true);
    expect(dialog.attributes("role")).toBe("dialog");
    expect(dialog.attributes("aria-modal")).toBe("true");
    expect(w.find('[data-test="board-terms-edge"]').text()).toBe("edge:data:edge->waf");
    await dialog.trigger("keydown.enter");
    expect(sink).toHaveBeenCalledTimes(1);
    expect((sink.mock.calls[0] as [MintArgs])[0]).toEqual({
      verb: "connect-ports",
      relation: "data",
      from: "edge",
      to: "waf",
      slot: null,
    });
  });

  it("Escape on the dialog mints nothing (g4 terms-card law, verbatim)", async () => {
    const sink = vi.fn();
    const { machine, w } = mountHud(sink);
    machine.toggleWiring();
    machine.attemptConnect("edge#trust", "origin#trust");
    await w.vm.$nextTick();
    await w.find('[data-test="board-terms"]').trigger("keydown.escape");
    expect(sink).not.toHaveBeenCalled();
    expect(w.find('[data-test="board-terms"]').exists()).toBe(false);
  });

  it("a client shape-mismatch bounces before any mint, labelled as preview", async () => {
    const sink = vi.fn();
    const { machine, w } = mountHud(sink);
    machine.toggleWiring();
    machine.attemptConnect("edge#data", "waf#power"); // R32: shapes are facts
    await w.vm.$nextTick();
    const chip = w.find('[data-test="board-refuse-flash"]');
    expect(chip.attributes("data-refusal-source")).toBe("preview");
    expect(chip.text()).toContain("shape-mismatch");
    expect(sink).not.toHaveBeenCalled();
  });
});

describe("refusal chip voicing (describeRefusal pack path)", () => {
  it("hands-exhausted arrives pack-voiced", async () => {
    const { machine, w } = mountHud(vi.fn());
    machine.ingest(frame(1, 8, [{ kind: "intent-refused", detail: "configure-node: hands-exhausted" }]));
    await w.vm.$nextTick();
    const chip = w.find('[data-test="board-refuse-flash"]');
    expect(chip.attributes("role")).toBe("alert");
    expect(chip.attributes("data-refusal-source")).toBe("pack");
    expect(chip.text()).not.toContain("hands-exhausted:"); // voiced prose, not raw code
  });

  it("an unvoiced door code falls back visible, labelled wire", async () => {
    const { machine, w } = mountHud(vi.fn());
    machine.ingest(
      frame(1, 8, [{ kind: "intent-refused", detail: 'connect-ports: power-cycle: "edge" already supplies the path' }]),
    );
    await w.vm.$nextTick();
    const chip = w.find('[data-test="board-refuse-flash"]');
    expect(chip.attributes("data-refusal-source")).toBe("wire");
    expect(chip.text()).toContain("power-cycle");
  });
});

describe("cable ledger (wire fold made visible)", () => {
  it("an executed connect shows a chip; pull → confirm mints the disconnect", async () => {
    const sink = vi.fn();
    const { machine, w } = mountHud(sink);
    machine.ingest(frame(1, 2, [{ kind: "intent-executed", detail: "connect-ports: data:edge->waf" }]));
    await w.vm.$nextTick();
    expect(w.find('[data-test="board-cables"]').exists()).toBe(true);
    await w.find('[data-test="board-pull"]').trigger("click");
    await w.find('[data-test="board-terms-confirm"]').trigger("click");
    expect((sink.mock.calls[0] as [MintArgs])[0]).toEqual({
      verb: "disconnect-drain",
      edgeId: "edge:data:edge->waf",
    });
  });

  it("the hands rail counts in-flight mints and clears on receipts", async () => {
    const sink = vi.fn();
    const { machine, w } = mountHud(sink);
    machine.chooseDepth("edge", "inspect");
    await w.vm.$nextTick();
    expect(w.findAll('[data-test="board-hand-token"]').length).toBe(1);
    machine.ingest(frame(1, 4, [{ kind: "intent-executed", detail: "configure-node: depth=inspect" }]));
    await w.vm.$nextTick();
    expect(w.findAll('[data-test="board-hand-token"]').length).toBe(0);
    expect(w.find('[data-test="board-hands"]').text()).toContain("free 2");
  });
});

describe("dark-desk law (no sink, no fake door)", () => {
  it("minting controls render disabled and nothing reaches the machine", async () => {
    const { machine, w } = mountHud(null);
    expect(w.find('[data-test="board-intent-hud"]').attributes("data-enabled")).toBe("false");
    machine.tapNode("edge"); // the model may open; the DOM stays locked
    await w.vm.$nextTick();
    expect(w.find('[data-test="board-depth-inspect"]').attributes("disabled")).toBeDefined();
    expect(w.find('[data-test="board-place-web"]').attributes("disabled")).toBeDefined();
    // the machine itself refuses to mint — the chip names the desk, not the door
    expect(machine.chooseDepth("edge", "inspect")).toBe(false);
    expect(machine.chip?.reason).toBe("no-door-attached");
    expect(machine.chip?.source).toBe("preview");
  });
});

describe("REAL door round-trip (the mint grammar parses at the engine)", () => {
  it("a HUD connect executes at applyIntentDoor; the receipt folds the cable back in", async () => {
    const seen: MintArgs[] = [];
    const machine = createBoardIntentMachine({ sink: (a) => seen.push(a) });
    machine.toggleWiring();
    machine.attemptConnect("edge#data", "waf#data");
    expect(machine.confirmPreview()).toBe(true);
    const mint = seen[0];
    if (mint === undefined) throw new Error("the rail minted nothing");

    const state = baseState();
    const result = doorPass(state, mint);
    const receipt = result.receipts[0];
    expect(receipt?.outcome).toBe("executed");
    expect(receipt?.detail).toBe("data:edge->waf");
    // engine truth: the board slice gained the edge under the SAME id law
    expect([...(result.state.board?.edges.keys() ?? [])]).toEqual(["edge:data:edge->waf"]);
    // the receipt fed back through the wire moves the HUD ledger
    machine.ingest(frame(1, 1, [receiptNotice(receipt as DoorReceipt)]));
    expect([...machine.ledger.keys()]).toEqual(["edge:data:edge->waf"]);

    // the SAME cable minted again refuses at the door, edge-exists — and the
    // pack voices it (chip label "wire" never lies: this one IS the door)
    const again = doorPass(result.state, mint);
    machine.ingest(frame(2, 2, [receiptNotice(again.receipts[0] as DoorReceipt)]));
    expect(again.receipts[0]?.outcome).toBe("refused");
    expect(again.receipts[0]?.reason).toContain("edge-exists");
  });

  it("configure + place + a slotted power connect all execute in one door pass", () => {
    const seen: MintArgs[] = [];
    const machine = createBoardIntentMachine({ sink: (a) => seen.push(a) });
    machine.chooseDepth("deep", "challenge");
    machine.placeDevice("web");
    machine.toggleWiring();
    machine.attemptConnect("edge#power", "waf#power");
    machine.confirmPreview();
    expect(seen.length).toBe(3);

    const anchor = baseState();
    const result = applyIntentDoor(
      anchor,
      anchor.context,
      seen.map((args, seq) => ({
        tick: anchor.context.tick,
        intent: { seq, clock: "sim", atUs: 0n, origin: "player", payload: { kind: "player-verb", args: args as never } },
      })),
      { handCapacity: 3 },
    );
    expect(result.receipts.map((r) => r.outcome)).toEqual(["executed", "executed", "executed"]);
    // the door's OWN derivation produced the slotted id our mirror predicted
    expect([...(result.state.board?.edges.keys() ?? [])]).toEqual(["edge:power:edge->waf:psu1"]);
  });

  it("a power cycle refuses at the real door — and the client mirror agrees", () => {
    // Seed the door with waf→deep (the D7 boot.board rail: edges exist
    // before the pass), then attempt the closing leg deep→waf straight at
    // the engine (bypassing the client mirror to test the mirror's claim).
    const seeded: BoardState = {
      version: 1,
      edges: new Map([
        [
          "edge:power:waf->deep:psu1",
          { id: "edge:power:waf->deep:psu1", relation: "power", from: "waf", to: "deep", slot: "psu1" },
        ],
      ]),
    } as unknown as BoardState;
    const state = createInitialState({
      runSeed: asRunSeed(904n),
      engineVersion: "board-intent-mount",
      contentHashes: HASHES,
      clocks: Object.freeze({ realUs: 0n, simUs: 42n * MIN, businessUs: 42n * MIN, wallUs: 0n }),
      nodes: Object.freeze([nodeRecord("edge"), nodeRecord("waf"), nodeRecord("deep"), nodeRecord("origin")]),
      board: seeded,
      handCapacity: 2,
    });
    const closingLeg: MintArgs = Object.freeze({
      verb: "connect-ports",
      relation: "power",
      from: "deep",
      to: "waf",
      slot: "psu1",
    });
    const result = doorPass(state, closingLeg);
    expect(result.receipts[0]?.outcome).toBe("refused");
    expect(result.receipts[0]?.reason).toContain("power-cycle");
    // the client mirror, given the same wire-learned chain, refuses it too
    const ledger = new Map<string, CableEdge>([
      ["edge:power:waf->deep:psu1", { edgeId: "edge:power:waf->deep:psu1", relation: "power", from: "waf", to: "deep", slot: "psu1" }],
    ]);
    const verdict = predictConnect(
      { nodeId: "deep", relation: "power", slot: "psu1" },
      { nodeId: "waf", relation: "power", slot: "psu1" },
      ledger,
      new Set(["edge", "waf", "deep", "origin"]),
    );
    expect(verdict.ok).toBe(false);
    if (!verdict.ok) expect(verdict.reason).toContain("power-cycle");
  });
});
