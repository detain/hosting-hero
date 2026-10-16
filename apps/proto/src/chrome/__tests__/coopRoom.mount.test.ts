// @vitest-environment jsdom
/**
 * Incident Room MOUNT test — the panel as the contracts' mouth: rendered
 * tape, toasts quoting the ENGINE's sentences verbatim, and a digest readout
 * twin-equal to the pure law (the component shows, coopRoom.ts decides).
 * Zero timers are legal in CoopRoom: the whole room is click-driven. The one
 * card-ride test mounts HudLabPanel, whose OWN 250ms lab ticker belongs to
 * that lane — the spy proves CoopRoom never starts one, and the panel test
 * opts out of the global assert (flag below) while still unmounting clean.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { asEntityId } from "@hh/sim-core/types";
import CoopRoom from "../CoopRoom.vue";
import HudLabPanel from "../HudLabPanel.vue";
import {
  advanceClock,
  createCoopRoom,
  joinSeat,
  mergeFeeds,
  roomDigest,
  stageRecord,
} from "../coopRoom";

const A = asEntityId("a");
const B = asEntityId("b");

let setIntervalSpy: ReturnType<typeof vi.spyOn>;
let setTimeoutSpy: ReturnType<typeof vi.spyOn>;
let rafSpy: ReturnType<typeof vi.spyOn>;
/** the lab ticker inside HudLabPanel is NOT this lane's surface (see header). */
let allowSiblingTimers = false;

beforeEach(() => {
  allowSiblingTimers = false;
  setIntervalSpy = vi.spyOn(globalThis, "setInterval");
  setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
  rafSpy = vi.spyOn(globalThis, "requestAnimationFrame");
});

afterEach(() => {
  if (!allowSiblingTimers) {
    expect(setIntervalSpy).not.toHaveBeenCalled();
  }
  expect(setTimeoutSpy).not.toHaveBeenCalled();
  expect(rafSpy).not.toHaveBeenCalled();
  vi.restoreAllMocks();
});

function seatOf(w: VueWrapper, id: "a" | "b") {
  const seat = w.find(`[data-test="coop-seat-${id}"]`);
  expect(seat.exists()).toBe(true);
  return seat;
}

describe("CoopRoom mount", () => {
  it("boots an honest empty room: both columns, no tape, the empty-set digest", () => {
    const w = mount(CoopRoom);
    expect(w.find('[data-test="coop-room"]').exists()).toBe(true);
    expect(seatOf(w, "a").exists()).toBe(true);
    expect(seatOf(w, "b").exists()).toBe(true);
    expect(w.find('[data-test="coop-tape-empty"]').exists()).toBe(true);
    expect(w.find('[data-test="coop-digest"]').text()).toContain(roomDigest(createCoopRoom()));
    expect(w.find('[data-test="coop-refusal"]').exists()).toBe(false);
    expect(w.find('[data-test="coop-guard"]').attributes("data-armed")).toBe("false");
  });

  it("joins arm the guard, the drain moves notes from outbox to tape, and the digest twins the pure law", async () => {
    const w = mount(CoopRoom);
    await w.find('[data-test="coop-join-a"]').trigger("click"); // t=1
    await w.find('[data-test="coop-join-b"]').trigger("click"); // t=2
    expect(w.find('[data-test="coop-guard"]').attributes("data-armed")).toBe("true");
    await seatOf(w, "a").find('[data-test="coop-append-note"]').trigger("click"); // (2,1) pending
    expect(seatOf(w, "a").find('[data-test="coop-outbox-row"]').exists()).toBe(true);
    await w.find('[data-test="coop-drain"]').trigger("click");
    const rows = w.findAll('[data-test="coop-tape-row"]');
    expect(rows).toHaveLength(1);
    expect(rows[0]?.text()).toContain("Seat A");
    expect(rows[0]?.text()).toContain("note");
    expect(rows[0]?.text()).toContain("(t2,s1)");
    // twin: the same ops through the pure law must print the same hex:
    let s = joinSeat(advanceClock(createCoopRoom()), A);
    s = joinSeat(advanceClock(s), B);
    s = stageRecord(s, A, "note");
    expect(w.find('[data-test="coop-digest"]').text()).toContain(roomDigest(mergeFeeds(s)));
    // equivalence readout: one digest across the interleavings, control green
    expect(w.find('[data-test="coop-equal"]').attributes("data-equal")).toBe("true");
    expect(w.find('[data-test="coop-control"]').attributes("data-differs")).toBe("true");
  });

  it("the double-send leg: drain refuses LOUD, the toast quotes BOTH positions, the tape stands", async () => {
    const w = mount(CoopRoom);
    await w.find('[data-test="coop-join-a"]').trigger("click");
    await w.find('[data-test="coop-join-b"]').trigger("click");
    await seatOf(w, "b").find('[data-test="coop-append-note"]').trigger("click"); // (2,1)
    await w.find('[data-test="coop-drain"]').trigger("click");
    expect(w.findAll('[data-test="coop-tape-row"]')).toHaveLength(1);
    await w.find('[data-test="coop-replay"]').trigger("click"); // clone re-enters the feed
    expect(w.find('[data-test="coop-collision"]').text()).toMatch(/claimed by two records/); // probe held honestly
    await w.find('[data-test="coop-drain"]').trigger("click"); // the relay law refuses
    const refusal = w.find('[data-test="coop-refusal"]');
    expect(refusal.attributes("data-refusal-source")).toBe("engine");
    expect(refusal.text()).toMatch(/\(2, 1\) appears at both positions 0 and 1/);
    expect(w.findAll('[data-test="coop-tape-row"]')).toHaveLength(1); // log untouched by the refusal
    expect(w.findAll('[data-test="coop-outbox-row"]')).toHaveLength(1); // the offending clone waits in B's outbox
  });

  it("vacate→ghost leg: an ex-seat author's note stages fine and the refusal reads not-seated (preview, never swallowed)", async () => {
    const w = mount(CoopRoom);
    await w.find('[data-test="coop-join-a"]').trigger("click"); // t=1
    await w.find('[data-test="coop-join-b"]').trigger("click"); // t=2
    await w.find('[data-test="coop-vacate-a"]').trigger("click"); // A leaves at t=3 → [1,3)
    await seatOf(w, "a").find('[data-test="coop-append-note"]').trigger("click"); // ghost staging (3,1)
    const refusal = w.find('[data-test="coop-refusal"]');
    expect(refusal.attributes("data-refusal-source")).toBe("ghost-preview");
    expect(refusal.text()).toMatch(/not seated at tick 3/);
    expect(seatOf(w, "a").find('[data-test="coop-outbox-row"]').attributes("data-ghost")).toBe("true");
    await w.find('[data-test="coop-drain"]').trigger("click"); // transport still accepts it…
    const row = w.find('[data-test="coop-tape-row"]');
    expect(row.attributes("data-ghost")).toBe("true"); // …the tape keeps saying GHOST
  });

  it("MAX_SEAT_WRITERS leg: bench C and D fit, bench E is refused by the engine's own sentence", async () => {
    const w = mount(CoopRoom);
    for (const id of ["a", "b", "c", "d"] as const) {
      await w.find(`[data-test="coop-join-${id}"]`).trigger("click");
    }
    expect(w.find('[data-test="coop-refusal"]').exists()).toBe(false);
    await w.find('[data-test="coop-join-e"]').trigger("click");
    const refusal = w.find('[data-test="coop-refusal"]');
    expect(refusal.attributes("data-refusal-source")).toBe("engine");
    expect(refusal.text()).toMatch(/5 simultaneous writers at tick 5/);
    expect(refusal.text()).toMatch(/seats at most 4/);
  });

  it("rides the HUD lab as card lab-coop (sibling cards keep their seats)", () => {
    allowSiblingTimers = true; // HudLabPanel's own 250ms lab ticker is that lane's contract
    const w = mount(HudLabPanel);
    const card = w.find('[data-test="lab-coop"]');
    expect(card.exists()).toBe(true);
    expect(card.find('[data-test="coop-room"]').exists()).toBe(true);
    expect(w.find('[data-test="lab-flavour"]').exists()).toBe(true); // sibling card intact
    w.unmount();
  });
});
