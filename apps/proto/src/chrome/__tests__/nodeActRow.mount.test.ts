// @vitest-environment jsdom
/**
 * NodeActRow mount law (L-HUD) — the thin SFC stays thin: rows render from
 * the pure model, clicks mint the door payload into the panel's sink,
 * disabled honesty rides data-enabled, and NOTHING schedules a timer —
 * the parent stepper owns cadence (zero-timer spy trio, FlavourFeed law).
 */
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { asEntityId, asRunSeed, type GameState, type NodeRecord, type PlayerIntent, type ReplayContentHashes } from "@hh/sim-core/types";
import { applyIntentDoor, createInitialState } from "@hh/sim-core/pipeline";
import type { TickFacts } from "../../runner/simCoreRunner";
import NodeActRow from "../NodeActRow.vue";
import { mintActIntent } from "../actRow";
import { PlayerVerb } from "@hh/sim-core/types";

const MIN = 60_000_000n;
const HASHES = Object.freeze({ rulesetCardHashes: Object.freeze({}), sheetsHash: "0000000000000000", ruleBookHash: "0000000000000000" }) as ReplayContentHashes;

function nodeRecord(raw: string, roster: number): NodeRecord {
  const slot = Object.freeze({ occupied: false, unitId: null, waitingOn: null, releasedAtUs: null });
  return Object.freeze({
    id: asEntityId(raw),
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
    engineVersion: "act-row-mount",
    contentHashes: HASHES,
    clocks: Object.freeze({ realUs: 0n, simUs: 42n * MIN, businessUs: 42n * MIN, wallUs: 0n }),
    nodes: Object.freeze([nodeRecord("edge", 2), nodeRecord("origin", 1)]),
    handCapacity: 2,
  });
}

function factsWith(events: readonly unknown[], game: GameState): TickFacts {
  return { events: events as never, game };
}

/** One executed door pass (isolate on `edge`) whose REAL events feed the receipt leg. */
function doorFacts(): TickFacts {
  const state = baseState();
  const result = applyIntentDoor(
    state,
    state.context,
    [
      {
        tick: state.context.tick,
        intent: {
          seq: 0,
          clock: "business",
          atUs: 0n,
          origin: "player",
          payload: { kind: "player-verb", args: mintActIntent(PlayerVerb.IsolateNode, "edge", 42) },
        },
      },
    ],
    { handCapacity: 2 },
  );
  return factsWith(result.events, state);
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

function mountRow(facts: TickFacts | null, submit: ((intent: PlayerIntent) => void) | null = () => {}) {
  return mount(NodeActRow, { props: { facts, submit } });
}

describe("NodeActRow.vue", () => {
  it("renders the sorted node chips and the eight status chips of one frozen frame", async () => {
    const w = mountRow(factsWith([], baseState()));
    expect(w.find('[data-test="act-node-edge"]').exists()).toBe(true);
    expect(w.find('[data-test="act-node-origin"]').exists()).toBe(true);
    for (const verbKey of ["drain", "restart", "isolate", "shed", "throttle", "reclaim", "warmth", "shield"]) {
      expect(w.find(`[data-test="act-status-${verbKey}"]`).exists(), verbKey).toBe(true);
    }
  });

  it("a click mints the door-shaped player-verb into the sink — clock law included", async () => {
    const seen: PlayerIntent[] = [];
    const w = mountRow(factsWith([], baseState()), (i) => seen.push(i));
    await w.find('[data-test="act-isolate"]').trigger("click");
    expect(seen).toHaveLength(1);
    const intent = seen[0];
    expect(intent?.clock).toBe("business");
    expect(intent?.payload.kind).toBe("player-verb");
    const args = intent?.payload.kind === "player-verb" ? (intent.payload.args as unknown as Record<string, unknown>) : {};
    expect(args).toEqual({ verb: "isolate-node", targetNodeId: "edge", effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null });
  });

  it("throttle-raise mints the notch count the pure model computed (roster−1 ceiling)", async () => {
    const seen: PlayerIntent[] = [];
    const w = mountRow(factsWith([], baseState()), (i) => seen.push(i));
    await w.find('[data-test="act-throttle-raise"]').trigger("click");
    const first = seen[0];
    const args = first !== undefined && first.payload.kind === "player-verb" ? (first.payload.args as unknown as Record<string, unknown>) : {};
    expect(args).toEqual({ verb: "throttle-node", targetNodeId: "edge", cutSlots: 1, effectiveAtBusinessMinute: null, releaseAtBusinessMinute: null });
  });

  it("a cable-free board renders drain DISABLED and a click never reaches the sink", async () => {
    const sink = vi.fn();
    const w = mountRow(factsWith([], baseState()), sink);
    const btn = w.find('[data-test="act-drain"]');
    expect(btn.attributes("data-enabled")).toBe("false");
    await btn.trigger("click");
    expect(sink).not.toHaveBeenCalled();
  });

  it("no sink ⇒ the desk is dark: every act button disabled (the lab never fakes a live door)", () => {
    const w = mountRow(factsWith([], baseState()), null);
    for (const btn of w.findAll("button.a")) expect(btn.attributes("disabled")).toBeDefined();
  });

  it("the receipt line rides the door's own words verbatim", () => {
    const w = mountRow(doorFacts());
    const receipt = w.find('[data-test="act-receipt"]');
    expect(receipt.text()).toContain("isolate-node");
    expect(receipt.text()).toContain("target=edge,eff=now,rel=indefinite");
    expect(receipt.attributes("data-source")).toBe("wire");
  });

  it("the node selector switches the derivation frame (origin roster 1 speaks through the desk)", async () => {
    const w = mountRow(factsWith([], baseState()));
    expect(w.find('[data-test="act-status-throttle"]').text()).toContain("full ceiling of 2");
    await w.find('[data-test="act-node-origin"]').trigger("click");
    expect(w.find('[data-test="act-status-throttle"]').text()).toContain("full ceiling of 1");
  });

  it("sequential clicks count their own intent seq (the door dedupes by (tick,seq))", async () => {
    const seen: PlayerIntent[] = [];
    const w = mountRow(factsWith([], baseState()), (i) => seen.push(i));
    await w.find('[data-test="act-isolate"]').trigger("click");
    await w.find('[data-test="act-reclaim"]').trigger("click");
    expect(seen.map((i) => i.seq)).toEqual([0, 1]);
  });
});
