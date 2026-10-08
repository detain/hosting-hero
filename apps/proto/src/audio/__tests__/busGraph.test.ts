/**
 * Three-bus graph law — §8.11 as executable truth (ADR-0008 lane 3).
 * Everything runs on the FakeAudioContext's hand-advanced clock: no
 * wall-clock nondeterminism, no timers, nothing left running after.
 */
import { describe, expect, it } from "vitest";
import {
  AUDIO_BUSES,
  BUSES_DUCKED_UNDER_SIGNALS,
  DUCK_ATTACK_SEC,
  DUCK_DEPTH_GAIN,
  DUCK_RELEASE_SEC,
  DUCKABLE_BUSES,
  SIGNALS_DUCK_HOLD_SEC,
  AudioGraphError,
  buildAudioBus,
  panFromNormalizedX,
  requirePanDomain,
  type AudioBusGraph,
  type DuckSchedule,
} from "../busGraph";
import {
  FakeAudioContext,
  type FakeCompressorNode,
  type FakeGainNode,
  type FakeParam,
} from "./fakeAudioContext";

function setup(): { ctx: FakeAudioContext; graph: AudioBusGraph } {
  const ctx = new FakeAudioContext();
  ctx.advanceTo(10); // start the clock somewhere non-zero: ramps must anchor at NOW
  const graph = buildAudioBus(ctx);
  return { ctx, graph };
}

function duckParam(graph: AudioBusGraph, bus: (typeof DUCKABLE_BUSES)[number]): FakeParam {
  return (graph.duckGains[bus] as FakeGainNode).gain;
}

function gainParam(graph: AudioBusGraph, bus: (typeof AUDIO_BUSES)[number]): FakeParam {
  return (graph.busGains[bus] as FakeGainNode).gain;
}

describe("topology — three buses, one destination (§8.11 three-bus rule)", () => {
  it("bus vocabulary is closed and in spec order", () => {
    expect(AUDIO_BUSES).toEqual(["ambience", "signals", "score"]);
    expect(DUCKABLE_BUSES).toEqual(["ambience", "score"]);
    expect(BUSES_DUCKED_UNDER_SIGNALS).toEqual(DUCKABLE_BUSES);
  });

  it("exactly ONE edge lands on ctx.destination — the one-destination law", () => {
    const { ctx, graph } = setup();
    expect(ctx.edgesIntoDestination()).toBe(1);
    // ...and it comes from the single master compressor, not any bus.
    expect((graph.master as FakeCompressorNode).outbound).toEqual([ctx.destination]);
    expect(ctx.compressors).toHaveLength(1);
  });

  it("ambience and score run through a duck stage; signals wires straight in", () => {
    const { graph } = setup();
    const ambienceDuck = graph.duckGains.ambience as FakeGainNode;
    const scoreDuck = graph.duckGains.score as FakeGainNode;
    expect((graph.busGains.ambience as FakeGainNode).outbound).toContain(ambienceDuck);
    expect(ambienceDuck.outbound).toContain(graph.master);
    expect((graph.busGains.score as FakeGainNode).outbound).toContain(scoreDuck);
    expect(scoreDuck.outbound).toContain(graph.master);
    // signals NEVER has a duck stage — the duck-master is never ducked.
    expect("signals" in graph.duckGains).toBe(false);
    expect((graph.busGains.signals as FakeGainNode).outbound).toContain(graph.master);
  });

  it("graph construction allocates 5 gains + 1 compressor and zero panners", () => {
    const { ctx } = setup();
    expect(ctx.gains).toHaveLength(5);
    expect(ctx.panners).toHaveLength(0); // panners exist only per located voice
    expect(ctx.compressors).toHaveLength(1);
  });

  it("the master compressor keeps SPEC defaults — lane touches no taste knobs", () => {
    const { graph } = setup();
    const compressor = graph.master;
    expect(compressor.threshold.value).toBe(-24);
    expect(compressor.ratio.value).toBe(12);
    expect(compressor.knee.value).toBe(30);
    for (const p of [compressor.threshold, compressor.knee, compressor.ratio, compressor.attack, compressor.release]) {
      expect((p as FakeParam).events).toHaveLength(0); // created, never written
    }
  });
});

describe("independent sliders — three controls, one mix (§8.11)", () => {
  it("each bus slider moves ONLY its own gain node", () => {
    const { ctx, graph } = setup();
    graph.setBusGain("ambience", 0.7);
    expect(gainParam(graph, "ambience").value).toBeCloseTo(0.7, 12);
    expect(gainParam(graph, "signals").value).toBe(1);
    expect(gainParam(graph, "score").value).toBe(1);
    graph.setBusGain("signals", 0); // full silence on alerts is the player's right
    expect(gainParam(graph, "signals").value).toBe(0);
    expect(gainParam(graph, "ambience").value).toBeCloseTo(0.7, 12);
    expect(ctx.edgesIntoDestination()).toBe(1); // sliders never re-route
  });

  it("out-of-domain slider values throw audio[domain], unknown buses audio[unknown-bus]", () => {
    const { graph } = setup();
    expect(() => graph.setBusGain("ambience", 1.01)).toThrowError(/audio\[domain\]/);
    expect(() => graph.setBusGain("score", Number.NaN)).toThrowError(/audio\[bad-value\]/);
    expect(() => graph.setBusGain("radio" as never, 0.5)).toThrowError(/audio\[unknown-bus\]/);
  });
});

describe("duck law — Signals always duck Ambience, release restores (§8.11)", () => {
  it("explicit duck schedules attack → hold → release on the audio clock only", () => {
    const { ctx, graph } = setup(); // clock = 10
    const schedule: DuckSchedule = graph.duck("ambience", 11);
    const duck = duckParam(graph, "ambience");

    expect(schedule).toEqual({ bus: "ambience", atSec: 10, depthUntilSec: 11, releasedAtSec: 11 + DUCK_RELEASE_SEC });

    // attack: unity now, depth once the attack lands
    expect(duck.at(10)).toBe(1);
    expect(duck.at(10 + DUCK_ATTACK_SEC)).toBe(DUCK_DEPTH_GAIN);
    // hold: pinned at depth through `until`
    expect(duck.at(10.5)).toBe(DUCK_DEPTH_GAIN);
    expect(duck.at(11)).toBe(DUCK_DEPTH_GAIN);
    // release: linear glide back, RESTORED at until + release
    expect(duck.at(11 + DUCK_RELEASE_SEC / 2)).toBeGreaterThan(DUCK_DEPTH_GAIN);
    expect(duck.at(11 + DUCK_RELEASE_SEC / 2)).toBeLessThan(1); // mid-glide
    expect(duck.at(11 + DUCK_RELEASE_SEC)).toBe(1); // "release restores"
    expect(ctx.sources).toHaveLength(0);
  });

  it("the mid-attack point is strictly between unity and depth (a ramp, not a cut)", () => {
    const { graph } = setup();
    graph.duck("ambience", 11);
    const mid = duckParam(graph, "ambience").at(10 + DUCK_ATTACK_SEC / 2);
    expect(mid).toBeGreaterThan(DUCK_DEPTH_GAIN);
    expect(mid).toBeLessThan(1);
  });

  it("duck('signals') is refused by TYPE and at RUNTIME — the duck-master never ducks", () => {
    const { graph } = setup();
    expect(() => graph.duck("signals" as "ambience", 11)).toThrowError(/audio\[signals-never-ducks\]/);
    expect(() => graph.duck("signals" as "ambience", 11)).toThrowError(AudioGraphError);
  });

  it("re-triggering mid-duck EXTENDS the hold instead of stacking automation", () => {
    const { graph } = setup();
    graph.duck("ambience", 11);
    const duck = duckParam(graph, "ambience");
    (graph.ctx as FakeAudioContext).advanceTo(10.4); // still ducked (0.25)
    expect(duck.at(10.4)).toBe(DUCK_DEPTH_GAIN);

    graph.duck("ambience", 11.5); // pager fires again — hold extends
    expect(duck.at(11.2)).toBe(DUCK_DEPTH_GAIN); // old release (11.3) is GONE
    expect(duck.at(11.5 + DUCK_RELEASE_SEC)).toBe(1);
    expect(duck.countOf("cancelScheduledValues")).toBe(2); // rewind, not pile-up
  });

  it("duckUnderSignals ducks BOTH duckable buses and leaves signals at unity", () => {
    const { ctx, graph } = setup();
    ctx.advanceTo(4);
    const schedules = graph.duckUnderSignals();
    expect(schedules.map((s) => s.bus)).toEqual(["ambience", "score"]);
    for (const bus of DUCKABLE_BUSES) {
      expect(duckParam(graph, bus).at(4 + DUCK_ATTACK_SEC)).toBe(DUCK_DEPTH_GAIN);
      expect(duckParam(graph, bus).at(4 + SIGNALS_DUCK_HOLD_SEC + DUCK_RELEASE_SEC)).toBe(1);
    }
    expect(gainParam(graph, "signals").value).toBe(1); // untouched, by law
  });

  it("an until in the past clamps to a full attack before release (no negative ramps)", () => {
    const { graph } = setup(); // clock 10
    const schedule = graph.duck("score", 9.5); // nonsense deadline
    expect(schedule.depthUntilSec).toBeGreaterThanOrEqual(10 + DUCK_ATTACK_SEC);
    expect(schedule.releasedAtSec).toBe(schedule.depthUntilSec + DUCK_RELEASE_SEC);
    const duck = duckParam(graph, "score");
    expect(duck.at(10 + DUCK_ATTACK_SEC)).toBe(DUCK_DEPTH_GAIN);
    expect(duck.at(schedule.releasedAtSec)).toBe(1);
  });
});

describe("panner mapping — located diagnostics (§8.14 caption twins)", () => {
  it("normalized aisle position maps onto the [-1, 1] stereo domain", () => {
    expect(panFromNormalizedX(0)).toBe(-1); // far left of the visible aisle
    expect(panFromNormalizedX(0.5)).toBe(0); // dead center
    expect(panFromNormalizedX(1)).toBe(1);
    expect(panFromNormalizedX(0.25)).toBeCloseTo(-0.5, 12);
    // OFF-SCREEN sources clamp hard (rack 9 while you look at racks 1–4):
    expect(panFromNormalizedX(2)).toBe(1);
    expect(panFromNormalizedX(-3)).toBe(-1);
    expect(() => panFromNormalizedX(Number.NaN)).toThrowError(/audio\[bad-value\]/);
    expect(() => panFromNormalizedX("left" as never)).toThrowError(/audio\[bad-value\]/);
  });

  it("requirePanDomain accepts the panner range and refuses outside it", () => {
    expect(requirePanDomain(-1)).toBe(-1);
    expect(requirePanDomain(0.6)).toBe(0.6);
    expect(() => requirePanDomain(1.5)).toThrowError(/audio\[domain\]/);
  });

  it("an unlocated voice plugs straight into its bus — no panner allocated", () => {
    const { ctx, graph } = setup();
    const input = graph.voiceInput({ bus: "score" });
    expect(input.panner).toBeNull();
    expect(input.head).toBe(graph.busGains.score);
    expect(ctx.panners).toHaveLength(0);
    input.detach(); // legal no-op
  });

  it("a located voice gets its OWN StereoPanner feeding the bus; detach un-plugs it", () => {
    const { ctx, graph } = setup();
    const input = graph.voiceInput({ bus: "ambience", pan: 0.6 });
    expect(ctx.panners).toHaveLength(1);
    const panner = ctx.panners[0]!;
    expect(input.panner).toBe(panner);
    expect(panner.pan.value).toBeCloseTo(0.6, 12);
    expect(panner.outbound).toContain(graph.busGains.ambience);
    input.detach();
    expect(panner.disconnects).toBe(1);
    expect(panner.outbound).toHaveLength(0);
  });

  it("an out-of-domain pan throws naming the bus the voice aimed at", () => {
    const { graph } = setup();
    expect(() => graph.voiceInput({ bus: "signals", pan: -1.2 })).toThrowError(/audio\[domain\].*signals/);
  });

  it("an unknown bus on a voice throws before any node is allocated", () => {
    const { ctx, graph } = setup();
    expect(() => graph.voiceInput({ bus: "hum" as never })).toThrowError(/audio\[unknown-bus\]/);
    expect(ctx.panners).toHaveLength(0);
  });
});
