// @vitest-environment jsdom
/**
 * FlavourFeed mount proof: the panel renders the PURE law's line (twin
 * equality against flavourLineAtSeed — the component is a mouth, not a
 * second authority), the buttons drive content (advance re-derives under
 * the adjacent-distinct law, chips swap the live pool, the era flip moves
 * the SHARED eraState switch), every chip rides the rail enabled since the
 * ADR-0014 #D5 widening, and nothing schedules a timer: every re-render is a
 * click. The global observed store never hears from it.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import FlavourFeed from "../FlavourFeed.vue";
import { DEFAULT_ERA_YEAR, getEra, setEra } from "../../i18n/eraState";
import { projection } from "../../state/observedStore";
import {
  asRunSeed,
  type RunSeed,
} from "@hh/sim-core/types";
import { defaultFlavourPool, flavourLineAt, flavourLineAtSeed } from "../flavourFeed";

const SEED: RunSeed = asRunSeed(904n);

let timers: {
  interval: ReturnType<typeof vi.spyOn>;
  timeout: ReturnType<typeof vi.spyOn>;
  frame: ReturnType<typeof vi.spyOn>;
} | null = null;

beforeEach(() => {
  setEra(DEFAULT_ERA_YEAR);
  const interval = vi.spyOn(globalThis, "setInterval");
  const timeout = vi.spyOn(globalThis, "setTimeout");
  const frame = vi.spyOn(globalThis, "requestAnimationFrame");
  timers = { interval, timeout, frame };
});

afterEach(() => {
  const t = timers;
  expect(t, "spy roster lost").not.toBeNull();
  expect(t!.interval).not.toHaveBeenCalled();
  expect(t!.timeout).not.toHaveBeenCalled();
  expect(t!.frame).not.toHaveBeenCalled();
  vi.restoreAllMocks();
  setEra(DEFAULT_ERA_YEAR);
});

describe("FlavourFeed.vue", () => {
  it("boots on the pure law's line: root label + prose + key meta", () => {
    const w = mount(FlavourFeed);
    const expected = flavourLineAt(SEED, 0, DEFAULT_ERA_YEAR, defaultFlavourPool());
    const line = w.get('[data-test="feed-line"]');
    expect(line.attributes("data-key")).toBe(expected.key);
    expect(line.attributes("data-root")).toBe(expected.root);
    expect(line.get(".feed-text").text()).toBe(expected.text);
    expect(w.get('[data-test="feed-panel"]').attributes("data-tick")).toBe("0");
    expect(w.get(".feed-meta").text()).toContain("tick 0");
    expect(w.get(".feed-root").text()).toBe(expected.root);
    w.unmount();
  });

  it("next line advances the tick and lands exactly where the law says", async () => {
    const w = mount(FlavourFeed);
    const seen: string[] = [w.get('[data-test="feed-line"]').attributes("data-key")!];
    for (let i = 0; i < 5; i++) {
      await w.get('[data-test="feed-advance"]').trigger("click");
      seen.push(w.get('[data-test="feed-line"]').attributes("data-key")!);
    }
    expect(w.get('[data-test="feed-panel"]').attributes("data-tick")).toBe("5");
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]).not.toBe(seen[i - 1]); // adjacent-distinctness, rendered
    }
    const fifth = flavourLineAt(SEED, 5, DEFAULT_ERA_YEAR, defaultFlavourPool());
    expect(w.get('[data-test="feed-line"]').attributes("data-key")).toBe(fifth.key);
    expect(w.get(".feed-text").text()).toBe(fifth.text);
    // self-containment: the shell store stays out of it
    expect(projection.value).toBeNull();
    w.unmount();
  });

  it("the press chip swaps the LIVE pool — every following line wears the root", async () => {
    const w = mount(FlavourFeed);
    await w.get('[data-test="feed-root-press"]').trigger("click");
    expect(w.get('[data-test="feed-root-press"]').classes()).toContain("on");
    for (let i = 0; i < 3; i++) {
      await w.get('[data-test="feed-advance"]').trigger("click");
      expect(w.get('[data-test="feed-line"]').attributes("data-root")).toBe("press");
    }
    // clearing back to ALL re-derives the current tick over the full pool
    await w.get('[data-test="feed-root-all"]').trigger("click");
    const tick = Number(w.get('[data-test="feed-panel"]').attributes("data-tick"));
    const twin = flavourLineAt(SEED, tick, DEFAULT_ERA_YEAR, defaultFlavourPool());
    expect(w.get('[data-test="feed-line"]').attributes("data-key")).toBe(twin.key);
    w.unmount();
  });

  it("every chip SPEAKS since #D5 — forum rides the rail enabled with 8 lines", async () => {
    const w = mount(FlavourFeed);
    // the widening brought slot-free forum threads from the type packs; no
    // chip renders dead any more (the locked-button branch stays law for a
    // future bank whose root ships slots on everything)
    for (const [root, lines] of [
      ["press", 3],
      ["forum", 8],
      ["chatter", 19],
      ["ticket", 52],
    ] as const) {
      const chip = w.get(`[data-test="feed-root-${root}"]`);
      expect(chip.attributes("disabled"), root).toBeUndefined();
      expect(chip.attributes("data-lines"), root).toBe(String(lines));
    }
    // a now-live forum chip actually filters
    await w.get('[data-test="feed-root-forum"]').trigger("click");
    await w.get('[data-test="feed-advance"]').trigger("click");
    expect(w.get('[data-test="feed-line"]').attributes("data-root")).toBe("forum");
    w.unmount();
  });

  it("flip era drives the SHARED eraState switch and the meta year follows", async () => {
    const w = mount(FlavourFeed);
    expect(getEra()).toBe(2026);
    await w.get('[data-test="feed-era"]').trigger("click");
    expect(getEra()).toBe(1998); // the shell's own toggle sees the same ref
    expect(w.get(".feed-meta").text()).toContain("1998");
    await w.get('[data-test="feed-era"]').trigger("click");
    expect(getEra()).toBe(2026);
    expect(w.get(".feed-meta").text()).toContain("2026");
    w.unmount();
  });

  it("the seed prop re-bases the whole feed (lab hosts pass their own)", () => {
    const w = mount(FlavourFeed, { props: { seed: 905 } });
    const twin = flavourLineAtSeed(905n, 0, DEFAULT_ERA_YEAR, defaultFlavourPool());
    expect(w.get('[data-test="feed-line"]').attributes("data-key")).toBe(twin.key);
    w.unmount();
  });
});
