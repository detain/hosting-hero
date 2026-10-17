/**
 * `coopSeatView` MOUNT legs (lane L-THIN) — jsdom, the fog rig driven through
 * the real CoopRoom surface via the `wireSocketFactory` test seam (the
 * controller's own socketFactory option promoted one layer up; the production
 * mount keeps the real browser WebSocket byte-unchanged).
 *
 * What the panel owes the law, per the mount pin:
 *  - the rider column exists ONLY on the wire face (the local demo never
 *    grows a projection it did not compute);
 *  - connect is user-gated — mounting CoopRoom opens no socket, seats nobody;
 *  - the pump-gate falsifier: rider bytes fully queued in the carrier and the
 *    column is STILL empty until the pump click drains them;
 *  - rows render the hub-chosen keys/statuses with the "?" null posture, and
 *    the withheld key appears nowhere in the rendered text (absence including
 *    existence, now at the DOM boundary);
 *  - the zero-timer trio (coopRoomWire.test pattern) watches the entire
 *    session, including unmount teardown.
 */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { attachRelayHub, encodeFrame, transportViewForStore } from "transport-tools";
import type { TransportFrame, TransportPort } from "transport-tools";
import { createCoopRelay } from "relay-tools";
import { ObservedStore, asSeatId, entityScope } from "@hh/sim-core/observed";
import { asCauseId, asEntityId, observedKey, ResolutionBand } from "@hh/sim-core/types";
import type { ObservedCell } from "@hh/sim-core/types";
import CoopRoom from "../CoopRoom.vue";
import type { WsSocketFactory } from "../../transport/wsClientPort";

const EDGE = asEntityId("edge");
const ORIGIN = asEntityId("origin");

function cell(value: bigint | number | null, status: ObservedCell<unknown>["status"] = "live"): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Fine,
    freshnessUs: 0n,
    coverage: 65_536n,
    certainty: 65_536n,
    status,
  });
}

class FakeSocket {
  readyState = 0;
  onopen: (() => void) | null = null;
  onmessage: ((event: { readonly data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(private readonly toHub: (bytes: string) => void) {}
  open(): void {
    this.readyState = 1;
    this.onopen?.();
  }
  deliver(data: unknown): void {
    this.onmessage?.({ data });
  }
  send(data: string): void {
    if (this.readyState !== 1) throw new Error("InvalidStateError: not open");
    this.toHub(data);
  }
  close(): void {
    /* the mount pin observes teardown via the handler detach, not the close */
  }
}

/** A rig whose ONLY scoped seat is the one this test will type into the seat
 *  box: every seat sees the EDGE slice (edge::probe null-unknown + edge::rho
 *  live), ORIGIN belongs to nobody at this table. */
function mountRig(seat: string): {
  isSeated(seat: string): boolean;
  factory: WsSocketFactory;
  socket(): FakeSocket;
  pumpHub(): number;
} {
  const hubInbox: string[] = [];
  const sockets = new Map<string, FakeSocket>();
  const relay = createCoopRelay({ autoCatchUpOnJoin: false });
  const store = new ObservedStore();
  store.applyObservedWrites(
    Object.freeze([
      Object.freeze({ key: observedKey(EDGE, "rho"), cell: cell(3277n), causeId: asCauseId("mount:edge:rho") }),
      Object.freeze({ key: observedKey(EDGE, "probe"), cell: cell(null, "unknown"), causeId: asCauseId("mount:edge:probe") }),
      Object.freeze({ key: observedKey(ORIGIN, "rate"), cell: cell(64, "stale"), causeId: asCauseId("mount:origin:rate") }),
    ]),
    0n,
  );
  const port: TransportPort = {
    hub: {
      seat: null,
      send(): void {
        throw new RangeError("test rig: nothing posts toward the hub through its own endpoint");
      },
      poll: () => hubInbox.splice(0),
    },
    client: (s: string) => ({
      seat: s,
      send: (frame: TransportFrame) => sockets.get(s)?.deliver(encodeFrame(frame)),
      poll: () => [],
    }),
  };
  const hub = attachRelayHub(relay, port, {
    projectionSource: (s) => transportViewForStore(store, entityScope(asSeatId(s), [EDGE])),
  });
  const factory: WsSocketFactory = () => {
    const socket = new FakeSocket((bytes) => void hubInbox.push(bytes));
    sockets.set(seat, socket);
    socket.open(); // a warm page: the outbox law is coopRoomWire.test's arm, not this one
    return socket;
  };
  return {
    isSeated: (s) => relay.isSeated(s),
    factory,
    socket: () => {
      const found = sockets.get(seat);
      if (found === undefined) throw new RangeError("mount rig: no socket yet — the factory runs on the connect click");
      return found;
    },
    pumpHub: () => hub.drain(),
  };
}

type TimerSpy = ReturnType<typeof vi.spyOn>;
let spies: TimerSpy[];

beforeEach(() => {
  spies = [
    vi.spyOn(globalThis, "setTimeout"),
    vi.spyOn(globalThis, "setInterval"),
    vi.spyOn(globalThis, "requestAnimationFrame"),
  ];
});

afterEach(() => {
  for (const spy of spies) {
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  }
});

describe("CoopRoom fog-rider column — mounted, pump-gated, user-gated", () => {
  it("the column lives on the WIRE face only, renders the honest no-rider sentence, and connect is gated by a typed seat", async () => {
    const rig = mountRig("alice");
    const wrapper = mount(CoopRoom, { props: { wireSocketFactory: rig.factory } });
    expect(wrapper.find('[data-test="coop-wire-view"]').exists()).toBe(false); // local demo: no wire projection surface

    await wrapper.find('[data-test="coop-mode-wire"]').trigger("click");
    const column = wrapper.find('[data-test="coop-wire-view"]');
    expect(column.exists()).toBe(true);
    expect(column.attributes("data-present")).toBe("false");
    expect(wrapper.find('[data-test="coop-wire-view-note"]').text()).toContain("hub sends no rider");
    expect(wrapper.find('[data-test="coop-wire-view-row"]').exists()).toBe(false);

    expect(wrapper.find('[data-test="coop-wire-connect"]').attributes("disabled")).toBeDefined(); // blank seat is illegal
    expect(rig.isSeated("alice")).toBe(false); // mount opened NOTHING — the controller is born on the click
  });

  it("pump-gate falsifier: the rider is fully queued in the carrier and the column STAYS empty until the pump click", async () => {
    const rig = mountRig("alice");
    const wrapper = mount(CoopRoom, { props: { wireSocketFactory: rig.factory } });
    await wrapper.find('[data-test="coop-mode-wire"]').trigger("click");
    await wrapper.find('[data-test="coop-wire-seat"]').setValue("alice");
    expect(wrapper.find('[data-test="coop-wire-connect"]').attributes("disabled")).toBeUndefined();

    await wrapper.find('[data-test="coop-wire-connect"]').trigger("click");
    expect(rig.pumpHub()).toBe(2); // join + catchup-request; seat-state WITH rider delivered into the inbound queue
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-test="coop-wire-view"]').attributes("data-present")).toBe("false"); // bytes are not seen (truth 7)

    await wrapper.find('[data-test="coop-wire-pump"]').trigger("click");
    expect(wrapper.find('[data-test="coop-wire-view"]').attributes("data-present")).toBe("true");
    expect(wrapper.findAll('[data-test="coop-wire-view-row"]')).toHaveLength(2);
  });

  it("rows render the HUB-CHOSEN keys and statuses, the null value shows ?, and the withheld key is in no text at all", async () => {
    const rig = mountRig("alice");
    const wrapper = mount(CoopRoom, { props: { wireSocketFactory: rig.factory } });
    await wrapper.find('[data-test="coop-mode-wire"]').trigger("click");
    await wrapper.find('[data-test="coop-wire-seat"]').setValue("alice");
    await wrapper.find('[data-test="coop-wire-connect"]').trigger("click");
    rig.pumpHub();
    await wrapper.find('[data-test="coop-wire-pump"]').trigger("click");

    const rows = wrapper.findAll('[data-test="coop-wire-view-row"]');
    expect(rows.map((r) => r.attributes("data-key"))).toEqual(["edge::probe", "edge::rho"]);
    expect(rows.map((r) => r.attributes("data-status"))).toEqual(["unknown", "live"]);
    expect(rows[0]?.text()).toContain("?"); // null → "?" downstream, never 0
    expect(rows[1]?.text()).toContain("3277"); // raw decimal display, no rescaling
    expect(rows[1]?.text()).toContain("65536"); // certainty raw (Fixed 1.0)
    expect(wrapper.find('[data-test="coop-wire-view"]').text()).not.toContain("origin"); // absence incl. existence, at the DOM
    expect(wrapper.find('[data-test="coop-wire-view-note"]').text()).toContain("delivered t"); // the seen-at witness rides
  });

  it("the full session mounts, connects, pumps and unmounts on ZERO timers; teardown detaches the carrier handlers", async () => {
    const rig = mountRig("zoe");
    const wrapper = mount(CoopRoom, { props: { wireSocketFactory: rig.factory } });
    await wrapper.find('[data-test="coop-mode-wire"]').trigger("click");
    await wrapper.find('[data-test="coop-wire-seat"]').setValue("zoe");
    await wrapper.find('[data-test="coop-wire-connect"]').trigger("click");
    rig.pumpHub();
    await wrapper.find('[data-test="coop-wire-pump"]').trigger("click");
    expect(wrapper.findAll('[data-test="coop-wire-view-row"]')).toHaveLength(2);
    expect(rig.socket()).toBeDefined();

    await wrapper.find('[data-test="coop-wire-disconnect"]').trigger("click"); // explicit dispose path…
    await wrapper.unmount(); // …then the onBeforeUnmount guard — idempotent teardown
    const socket = rig.socket();
    expect(socket.onmessage).toBeNull(); // handlers detached; the zero-timer trio asserts in afterEach
  });
});
