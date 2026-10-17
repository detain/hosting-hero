/**
 * `coopSeatView` ASYMMETRY law (lane L-THIN) — jsdom, the coopRoomWire.test
 * rig pattern with the hub's `projectionSource` WIRED (the seam
 * transport/publish.test.ts proves end-to-end and tools/host --sim uses in
 * anger): a real ObservedStore projected per seat through projectSeat/entity-
 * Scope, fanned as seat-state riders, consumed by two CoopRoomWire controllers
 * on fake browser sockets.
 *
 * The law under test is §9.1 asymmetric information MADE VISIBLE: alice's
 * column contains her scoped keys and LACKS bob's extras — including
 * existence (no count, no marker, no placeholder). And the rider is display-
 * side only: two windows with identical submits keep converging on identical
 * local digests WITH the fog wired, exactly as they did without it.
 *
 * ZERO-TIMER LAW is file-wide (the coopRoomWire.test trio pattern): nothing
 * in the rider path may schedule; every application rides the user's pump.
 */
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { attachRelayHub, encodeFrame, transportViewForStore } from "transport-tools";
import type { TransportFrame, TransportPort } from "transport-tools";
import { createCoopRelay } from "relay-tools";
import type { CoopRelay } from "relay-tools";
import { ObservedStore, asSeatId, entityScope } from "@hh/sim-core/observed";
import { asCauseId, asEntityId, observedKey, PlayerVerb, ResolutionBand } from "@hh/sim-core/types";
import type { ObservedCell } from "@hh/sim-core/types";
import { createCoopRoomWire } from "../coopRoomWire";
import type { CoopRoomWire } from "../coopRoomWire";
import { SEAT_VIEW_NO_RIDER_NOTE, seatViewState } from "../coopSeatView";

const EDGE = asEntityId("edge");
const ORIGIN = asEntityId("origin");

function cell(value: bigint | number | string | null, status: ObservedCell<unknown>["status"] = "live"): ObservedCell<unknown> {
  return Object.freeze({
    value,
    fidelity: ResolutionBand.Fine,
    freshnessUs: 0n,
    coverage: 65_536n,
    certainty: 65_536n,
    status,
  });
}

function seedStore(store: ObservedStore): void {
  store.applyObservedWrites(
    Object.freeze([
      Object.freeze({ key: observedKey(EDGE, "rho"), cell: cell(3277n), causeId: asCauseId("seatview:edge:rho") }),
      Object.freeze({ key: observedKey(EDGE, "probe"), cell: cell(null, "unknown"), causeId: asCauseId("seatview:edge:probe") }),
      Object.freeze({ key: observedKey(ORIGIN, "rate"), cell: cell(64, "stale"), causeId: asCauseId("seatview:origin:rate") }),
    ]),
    0n,
  );
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
    /* mount-pin precedent: the socket stays deliverable so dispose remains observable */
  }
}

/** The fog rig: hub attached WITH a projectionSource — alice owns EDGE, bob
 *  owns EDGE+ORIGIN, every other seat (carol) is declined a rider entirely
 *  (the honest-null path), exactly one host's per-seat scope table. */
function fogRig(): {
  relay: CoopRelay;
  store: ObservedStore;
  connect(seat: string): CoopRoomWire;
  pumpHub(): number;
  publishHub(): number;
} {
  const hubInbox: string[] = [];
  const sockets = new Map<string, FakeSocket>();
  const relay = createCoopRelay({ autoCatchUpOnJoin: false });
  const store = new ObservedStore();
  seedStore(store);
  const scopes: Readonly<Record<string, readonly import("@hh/sim-core/types").EntityId[]>> = {
    alice: [EDGE],
    bob: [EDGE, ORIGIN],
  };
  const port: TransportPort = {
    hub: {
      seat: null,
      send(): void {
        throw new RangeError("test rig: nothing posts toward the hub through its own endpoint");
      },
      poll: () => hubInbox.splice(0),
    },
    client: (seat: string) => ({
      seat,
      send: (frame: TransportFrame) => sockets.get(seat)?.deliver(encodeFrame(frame)),
      poll: () => [],
    }),
  };
  const hub = attachRelayHub(relay, port, {
    projectionSource: (seat) => {
      const entities = scopes[seat];
      return entities === undefined ? undefined : transportViewForStore(store, entityScope(asSeatId(seat), entities));
    },
  });
  return {
    relay,
    store,
    connect(seat) {
      const socket = new FakeSocket((bytes) => void hubInbox.push(bytes));
      sockets.set(seat, socket);
      socket.open();
      return createCoopRoomWire({ url: "ws://fake.local/room", seat, socketFactory: () => socket });
    },
    pumpHub: () => hub.drain(),
    publishHub: () => hub.publish(),
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

describe("coopSeatView — the fog rider is asymmetric, pump-gated, and display-only", () => {
  it("queued bytes are NOT seen (truth 7): the rider lands only on the pump's drain", () => {
    const r = fogRig();
    const alice = r.connect("alice");
    expect(r.pumpHub()).toBe(2); // join + catchup-request processed; the rider is already IN her inbound queue
    expect(alice.wireView()).toBeNull(); // …and applied NOTHING (the pump-gate falsifier)
    expect(alice.wireViewSeenAt()).toBeNull();
    alice.pump(1);
    const state = seatViewState(alice.wireView());
    expect(state.present).toBe(true);
    expect(alice.wireViewSeenAt()).toBe(1n); // stamped by the delivering pump's local clock
  });

  it("alice's column carries her scoped keys and LACKS bob's extras — including existence", () => {
    const r = fogRig();
    const alice = r.connect("alice");
    r.pumpHub();
    alice.pump(1);
    const rows = seatViewState(alice.wireView());
    expect(rows.present && rows.rows.map((row) => row.key)).toEqual(["edge::probe", "edge::rho"]);
    const rendered = JSON.stringify(rows);
    expect(rendered).not.toContain("origin"); // no row, no count, no marker — the withheld key is invisible whole
  });

  it("the same hub, at the same fan, shows TWO seats DIFFERENT columns", () => {
    const r = fogRig();
    const alice = r.connect("alice");
    const bob = r.connect("bob");
    r.pumpHub();
    alice.pump(1);
    bob.pump(1);
    const aliceKeys = seatViewState(alice.wireView());
    const bobKeys = seatViewState(bob.wireView());
    expect(aliceKeys.present && bobKeys.present).toBe(true);
    if (aliceKeys.present && bobKeys.present) {
      expect(bobKeys.rows.map((row) => row.key)).toEqual(["edge::probe", "edge::rho", "origin::rate"]);
      expect(bobKeys.rows.length).toBeGreaterThan(aliceKeys.rows.length); // one world, two views, zero leaks
      // the null-value cell survives the whole hop as NOTHING (not a dropped row, not a zero):
      const probe = bobKeys.rows.find((row) => row.key === "edge::probe");
      expect(probe).toMatchObject({ value: null, encoding: "none", status: "unknown" });
      // and the stale cell keeps its status for the tint law:
      expect(bobKeys.rows.find((row) => row.key === "origin::rate")?.status).toBe("stale");
    }
  });

  it("a seat the host declines gets the honest no-rider sentence — seated, ledger-fed, viewing NOTHING", () => {
    const r = fogRig();
    const carol = r.connect("carol"); // projectionSource returns undefined for her
    r.pumpHub();
    carol.pump(1);
    expect(carol.ledgerRows().some((row) => row.participantId === "carol" && row.open)).toBe(true); // SEATED…
    expect(carol.wireView()).toBeNull(); // …yet the rider door stays honest:
    expect(seatViewState(carol.wireView())).toEqual({ present: false });
    expect(SEAT_VIEW_NO_RIDER_NOTE).toContain("hub sends no rider");
    expect(carol.wireViewSeenAt()).toBeNull(); // a rider never delivered never stamps a clock
  });

  it("wireViewSeenAt advances ONLY on a freshly delivered rider — idle pumps and queued-but-undrained publishes move nothing", () => {
    const r = fogRig();
    const alice = r.connect("alice");
    r.pumpHub();
    alice.pump(1);
    expect(alice.wireViewSeenAt()).toBe(1n);
    alice.pump(1); // a pump with no new seat-state: same rider, same seen-at (identity law)
    expect(alice.wireViewSeenAt()).toBe(1n);
    storeWrite(r, observedKey(EDGE, "queue"), cell(12n)); // a fresh world…
    r.publishHub(); // …fanned, but sitting in alice's inbound queue
    expect(alice.wireViewSeenAt()).toBe(1n); // bytes are not seen
    alice.pump(1);
    expect(alice.wireViewSeenAt()).toBe(3n); // the pump that drained it stamps THIS local tick
    const state = seatViewState(alice.wireView());
    expect(state.present && state.rows.map((row) => row.key)).toEqual(["edge::probe", "edge::queue", "edge::rho"]);
  });

  it("identical submits converge both windows' local digests WITH the fog wired — the rider never touches the sim", () => {
    const r = fogRig();
    const alice = r.connect("alice");
    const bob = r.connect("bob");
    r.pumpHub();
    alice.submitAction(PlayerVerb.Communicate, { target: null, note: "alice was here" });
    bob.submitAction(PlayerVerb.Communicate, { target: null, note: "bob was here" });
    r.pumpHub();
    alice.pump(1);
    bob.pump(1);
    const a = alice.localDigest();
    const b = bob.localDigest();
    expect(a).not.toBeNull();
    expect(a).toBe(b); // boot-seed law + equal hub-stamped feed + equal pumps ⇒ equal digests — fog or no fog
    // …and each window still sees a DIFFERENT fogged column while agreeing on the sim:
    const aState = seatViewState(alice.wireView());
    const bState = seatViewState(bob.wireView());
    expect(aState.present && bState.present && JSON.stringify(aState) !== JSON.stringify(bState)).toBe(true);
  });

  it("leave() freezes the departed seat's rider; the survivor's grows on the next publish", () => {
    const r = fogRig();
    const alice = r.connect("alice");
    const bob = r.connect("bob");
    r.pumpHub();
    alice.pump(1);
    bob.pump(1);
    const frozenSeenAt = alice.wireViewSeenAt();
    expect(frozenSeenAt).not.toBeNull();
    r.relay.advanceTo(1n);
    alice.leave();
    r.pumpHub(); // the hub processes leave; the departed seat is off the live-seats fan (@24426ec law)
    storeWrite(r, observedKey(EDGE, "queue"), cell(12n));
    expect(r.publishHub()).toBe(1); // ONE live seat fanned — alice is gone
    bob.pump(1);
    const bobState = seatViewState(bob.wireView());
    expect(bobState.present && bobState.rows.some((row) => row.key === "edge::queue")).toBe(true); // survivor grows
    alice.pump(1);
    const aliceState = seatViewState(alice.wireView());
    expect(aliceState.present && aliceState.rows.map((row) => row.key)).toEqual(["edge::probe", "edge::rho"]);
    expect(alice.wireViewSeenAt()).toBe(frozenSeenAt); // her last live view, kept honest-frozen
  });
});

/** One more world fact for the hub's store — the projectionSource re-reads on
 *  the NEXT fan, so growth arrives through publish()/events, never a poller. */
function storeWrite(r: { store: ObservedStore }, key: ReturnType<typeof observedKey>, value: ObservedCell<unknown>): void {
  r.store.applyObservedWrites(Object.freeze([Object.freeze({ key, cell: value, causeId: asCauseId("seatview:growth") })]), 1n);
}
