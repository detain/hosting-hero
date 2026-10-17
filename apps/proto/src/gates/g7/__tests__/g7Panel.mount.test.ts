// @vitest-environment jsdom
// G7GatePanel mount laws: the panel is a MOUTH, not an authority — every
// assertion below reads what the runner already decided (g4 mount precedent).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import G7GatePanel from "../G7GatePanel.vue";

async function settle(w: ReturnType<typeof mount>, times = 1): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await w.vm.$nextTick();
  }
}

/* The panel mints its own session in setup(); drive it only through clicks. */
type Wrapper = ReturnType<typeof mount>;
const tick = (w: Wrapper): number => Number(w.find('[data-test="g7-meters"]').text().match(/tick(\d+)/)?.[1] ?? -1);
const depth = (w: Wrapper): string => w.find('[data-test="edge-depth"]').text();
const click = async (w: Wrapper, test: string): Promise<void> => {
  w.find(`[data-test="${test}"]`).trigger("click");
  await settle(w);
};

describe("G7GatePanel — mount", () => {
  let wrapper: Wrapper | null = null;

  beforeEach(() => {
    wrapper = mount(G7GatePanel, { props: { seed: 904 } });
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = null;
    vi.restoreAllMocks();
  });

  it("renders the thesis: one rail (2 hands + focus pips) spanning both board columns and six book cards", () => {
    const w = wrapper!;
    expect(w.find('[data-test="g7-panel"]').exists()).toBe(true);
    expect(w.find('[data-test="hand-0"]').exists()).toBe(true);
    expect(w.find('[data-test="hand-1"]').exists()).toBe(true);
    expect(w.find('[data-test="pip-0"]').exists()).toBe(true); // §7.5 one special hand, minted by loan
    expect(w.find('[data-test="g7-board-col"]').exists()).toBe(true);
    expect(w.find('[data-test="g7-book-col"]').exists()).toBe(true);
    expect(w.findAll(".g7-card")).toHaveLength(6);
    expect(w.find('[data-test="g7-tape"]').exists()).toBe(true);
  });

  it("commit click lands the card: grace → commit → live row appears, step fires it, next step moves the BOARD", async () => {
    const w = wrapper!;
    await click(w, "g7-grace"); // open the window — the focus hand is minted, not given
    expect(w.find('[data-test="commit-watch-the-door"]').exists()).toBe(true);
    await click(w, "commit-watch-the-door"); // commit queues AND steps (t1): executed + fired
    expect(w.find('[data-test="live-watch-the-door"]').exists()).toBe(true);
    expect(depth(w)).toBe("pass-through"); // the fire is same-tick; the intent lands NEXT tick
    await click(w, "g7-step"); // t2: raise-inspection-depth→configure-node executes
    expect(depth(w)).toBe("inspect"); // the BOOK moved the board — no player verb touched depth
  });

  it("the hand rail shows the origin split: after the rule executes, a token reads Book (rule ink), not you", async () => {
    const w = wrapper!;
    await click(w, "g7-grace");
    await click(w, "commit-watch-the-door");
    await click(w, "g7-step"); // t2: configure holds a token to t3 — held by the BOOK
    expect(w.find('[data-test="hand-0"]').classes()).toContain("g7-hand--rule");
    expect(w.find('[data-test="hand-0"]').text()).toContain("Book");
    expect(w.find('[data-test="hand-1"]').text()).toContain("free");
  });

  it("watch toggle HIDES but never PAUSES: book-only view, the board keeps running under the fold", async () => {
    const w = wrapper!;
    await click(w, "g7-grace");
    await click(w, "commit-watch-the-door");
    await click(w, "watch-book"); // look away from the Iron Board
    expect(w.find('[data-test="g7-board-col"]').attributes("style") ?? "").toContain("display: none");
    expect(w.find('[data-test="g7-unwatched"]').exists()).toBe(true);
    const before = tick(w);
    await click(w, "g7-step");
    await click(w, "g7-step");
    expect(tick(w)).toBe(before + 2); // the driver ticked while the board was unwatched…
    expect(w.find('[data-test="g7-tape"]').text()).toContain("configure-node"); // …and the hidden board ACTED (receipt in the shared tape)
  });

  it("the wall card is legible from the Book alone: fired in the tape, refused ×1, never executed", async () => {
    const w = wrapper!;
    await click(w, "g7-grace");
    await click(w, "commit-escape-hatch"); // t1: executes + (waits — origin ρ crosses later)
    await click(w, "g7-step"); // t2
    await click(w, "g7-step"); // t3: the ticker says yes (fires)
    expect(w.find('[data-test="live-escape-hatch"]').text()).toContain("fired ×1");
    await click(w, "g7-step"); // t4: the board says no (door wall)
    const live = w.find('[data-test="live-escape-hatch"]');
    expect(live.text()).toContain("refused ×1");
    expect(live.text()).not.toContain("executed");
  });

  it("timers follow the g4-ratified pattern: auto arms ONE 2000ms setInterval, halt and unmount clear it — no other timer classes", async () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const w = wrapper!;
    await click(w, "g7-auto");
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy.mock.calls[0]?.[1]).toBe(2000);
    await click(w, "g7-auto"); // halt
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
    // The panel itself must not mint timers on any other path:
    setIntervalSpy.mockClear();
    await click(w, "g7-dry-run");
    await click(w, "watch-board");
    await click(w, "g7-grace");
    expect(setIntervalSpy).not.toHaveBeenCalled();
    await click(w, "g7-auto"); // arm again to prove unmount cleanup
    clearIntervalSpy.mockClear();
    w.unmount();
    wrapper = null;
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it("dry-run click is a label flip, not a tick: would-fire appears, board stays pass-through, no rule receipts", async () => {
    const w = wrapper!;
    await click(w, "g7-dry-run");
    await click(w, "g7-grace");
    await click(w, "commit-watch-the-door");
    await click(w, "g7-step");
    expect(depth(w)).toBe("pass-through"); // shadow never touches the board
    expect(w.find('[data-test="live-watch-the-door"]').text()).toContain("would-fire");
  });
});
