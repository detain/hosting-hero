/**
 * G6 UI-runner contract (node env): the SAME engine class the panel drives,
 * pinned headlessly — determinism through the protocol wire, seed divergence,
 * tempo inherited from the loaded flag, fail-loud data seams, and the
 * existence of the dual-run "screenshot minute" (same seed, one type bounces,
 * the other serves).
 */
import { describe, expect, it } from "vitest";
import { canonicalDigest } from "@hh/sim-core/replay";
import { encodeProjection } from "../../../shared/protocol.ts";
import { createG6Runner, G6Runner, TOTAL_TICKS } from "../g6Runner.ts";
import {
  G6_PROFILES,
  loadG6Profile,
  meterFace,
  type G6Profile,
} from "../g6Data.ts";

const WEB = G6_PROFILES.find((p) => p.typeId === "official:shared-web") as G6Profile;
const GAME = G6_PROFILES.find((p) => p.typeId === "official:game-servers") as G6Profile;

function drain(runner: G6Runner, ticks: number): ReturnType<G6Runner["step"]>[] {
  const frames = [];
  for (let i = 0; i < ticks; i += 1) frames.push(runner.step());
  return frames;
}

describe("G6 UI runner · determinism through the wire", () => {
  it("two fresh runners on one profile + seed emit byte-identical projections per frame", () => {
    const a = createG6Runner(WEB, 42);
    const b = createG6Runner(WEB, 42);
    for (let i = 0; i < 60; i += 1) {
      expect(canonicalDigest(encodeProjection(a.step()))).toBe(canonicalDigest(encodeProjection(b.step())));
    }
  });

  it("different seeds diverge (the loaded data is not wallpaper over randomness)", () => {
    const one = drain(createG6Runner(WEB, 42), TOTAL_TICKS).at(-1)!;
    const two = drain(createG6Runner(WEB, 43), TOTAL_TICKS).at(-1)!;
    expect(canonicalDigest(encodeProjection(one))).not.toBe(canonicalDigest(encodeProjection(two)));
  });
});

describe("G6 UI runner · one class, two loaded profiles", () => {
  it("both types run the SAME runner class and produce the SAME observed-cell addresses", () => {
    const web = createG6Runner(WEB, 7);
    const game = createG6Runner(GAME, 7);
    expect(web.constructor).toBe(game.constructor);
    const w = web.step();
    const g = game.step();
    expect([...w.observed.keys()].sort()).toEqual([...g.observed.keys()].sort());
  });

  it("the screenshot minute EXISTS: same seed, some tick bounces one type while the other serves", () => {
    const web = createG6Runner(WEB, 42);
    const game = createG6Runner(GAME, 42);
    let prevW = 0;
    let prevG = 0;
    let prevWS = 0;
    let prevGS = 0;
    let divergentMinutes = 0;
    for (let i = 0; i < TOTAL_TICKS; i += 1) {
      const w = web.step();
      const g = game.step();
      const wb = w.counters.bounced - prevW;
      const gb = g.counters.bounced - prevG;
      const ws = w.counters.served - prevWS;
      const gs = g.counters.served - prevGS;
      prevW = w.counters.bounced;
      prevG = g.counters.bounced;
      prevWS = w.counters.served;
      prevGS = g.counters.served;
      if ((wb > 0 && gb === 0 && gs > 0) || (gb > 0 && wb === 0 && ws > 0)) divergentMinutes += 1;
    }
    expect(divergentMinutes, "the gate's screenshot moment must actually occur on the default seed").toBeGreaterThan(0);
  });
});

describe("G6 UI runner · tempo comes from the loaded flag", () => {
  it("game-servers costs exactly 4× the real µs per sim-minute; sim minutes stay one-per-tick", () => {
    const web = createG6Runner(WEB, 5);
    const game = createG6Runner(GAME, 5);
    for (let i = 1; i <= 20; i += 1) {
      const w = web.step();
      const g = game.step();
      expect(g.clocks.simUs).toBe(w.clocks.simUs);
      expect(g.clocks.realUs).toBe(4n * w.clocks.realUs);
    }
    expect(GAME.incident).toBe(true);
    expect(WEB.incident).toBe(false);
  });
});

describe("G6 data seams · fail loud, never blank", () => {
  it("an unknown meterWidget has no face — the bezel refuses to paint a guess", () => {
    expect(() => meterFace("sparkline-of-doom")).toThrow(/no bound face/);
    expect(meterFace(WEB.meterWidget).face).toBe("waterline");
    expect(meterFace(GAME.meterWidget).face).toBe("scope");
  });

  it("loadG6Profile re-parses the corpus deterministically into the frozen profile", () => {
    const again = loadG6Profile(WEB.typeId);
    expect(again.patienceUs).toBe(WEB.patienceUs);
    expect(again.table.id).toBe(WEB.table.id);
    expect(again.curve).toBe(WEB.curve); // the library is shared-frozen, one instance per name
    expect(again.label).toBe("Shared Web");
  });

  it("the G6 day is exactly TOTAL_TICKS long and stepping past it throws", () => {
    const runner = createG6Runner(WEB, 1);
    drain(runner, TOTAL_TICKS);
    expect(runner.done()).toBe(true);
    expect(() => runner.step()).toThrow(/day is over/);
  });
});
