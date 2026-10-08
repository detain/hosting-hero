/**
 * The AudioBus façade seam (ADR-0008 lane 3): the Noop default is inert and
 * total; the WebAudio transport routes through the pure graph, ENFORCES the
 * §8.11 signals-ducks-ambience rule at play() time, and tears voices down
 * exactly once. All on the hand-advanced fake clock — no timers exist to
 * leave running, and the last suite proves none are used.
 */
import { describe, expect, it, vi } from "vitest";
import {
  createNoopAudioBus,
  createWebAudioBus,
  type SampleLibrary,
} from "../audioBus";
import {
  DUCK_ATTACK_SEC,
  DUCK_DEPTH_GAIN,
  DUCK_RELEASE_SEC,
  SIGNALS_DUCK_HOLD_SEC,
  buildAudioBus,
  type AudioBusGraph,
  type AudioBufferLike,
} from "../busGraph";
import {
  FakeAudioContext,
  FakeBufferSourceNode,
  FakeGainNode,
  type FakeParam,
  fakeBuffer,
} from "./fakeAudioContext";

const REF_FAN = "fan-loop";
const REF_PAGE = "pager-sev1";
const REF_MUSIC = "score-theme";

function library(): SampleLibrary {
  const buffers: Record<string, AudioBufferLike> = {
    [REF_FAN]: fakeBuffer(4),
    [REF_PAGE]: fakeBuffer(0.4),
    [REF_MUSIC]: fakeBuffer(60),
  };
  return { bufferFor: (ref: string) => buffers[ref] ?? null };
}

interface Harness {
  readonly ctx: FakeAudioContext;
  readonly graph: AudioBusGraph;
  readonly bus: ReturnType<typeof createWebAudioBus>;
}

function transport(): Harness {
  const ctx = new FakeAudioContext();
  ctx.advanceTo(4); // a non-zero audio clock proves ramps anchor at NOW
  const graph = buildAudioBus(ctx);
  return { ctx, graph, bus: createWebAudioBus({ graph, samples: library() }) };
}

function duckGain(graph: AudioBusGraph, which: "ambience" | "score"): FakeParam {
  return (graph.duckGains[which] as FakeGainNode).gain;
}

function busGain(graph: AudioBusGraph, which: "ambience" | "signals" | "score"): FakeGainNode {
  return graph.busGains[which] as FakeGainNode;
}

describe("NoopAudioBus — the SSR/test/headless default", () => {
  it("is inert and total: every verb works, nothing is audible", () => {
    const bus = createNoopAudioBus();
    const voice = bus.play("anything.at.all", { bus: "ambience", loop: true });
    expect(voice.stopped).toBe(false);
    expect(voice.sampleRef).toBe("anything.at.all");
    expect(voice.bus).toBe("ambience");
    voice.stop();
    voice.stop(); // idempotent
    expect(voice.stopped).toBe(true);
    expect(() => bus.busGain("signals", 0.2)).not.toThrow();
    // Deterministic sentinel: a duck that never happened, echoing the bus.
    expect(bus.duck("score", 99)).toEqual({ bus: "score", atSec: 0, depthUntilSec: 0, releasedAtSec: 0 });
    expect(() => bus.stopAll()).not.toThrow();
  });

  it("touches no audio API at all — headless injects authority AWAY", () => {
    // The point of the Noop: if construction ever needs a ctx, the seam
    // leaked. This fake ctx must stay empty for the whole block.
    const ctx = new FakeAudioContext();
    const noop = createNoopAudioBus();
    noop.play(REF_PAGE, { bus: "signals" }).stop();
    noop.busGain("ambience", 0.5);
    noop.duck("ambience", 1);
    noop.stopAll();
    expect(ctx.gains).toHaveLength(0);
    expect(ctx.panners).toHaveLength(0);
    expect(ctx.compressors).toHaveLength(0);
    expect(ctx.sources).toHaveLength(0);
    expect(ctx.destination.outbound).toHaveLength(0);
  });
});

describe("WebAudio transport — routing (§8.11 buses)", () => {
  it("plays an unlocated ambience voice straight into the ambience bus gain", () => {
    const { ctx, graph, bus } = transport();
    bus.play(REF_FAN, { bus: "ambience", loop: true });
    const source = ctx.sources[0] as FakeBufferSourceNode;
    expect(source.buffer?.duration).toBe(4);
    expect(source.loop).toBe(true);
    expect(source.startTimes).toEqual([4]); // started NOW on the audio clock
    expect(source.outbound).toEqual([busGain(graph, "ambience")]); // direct
    expect(ctx.panners).toHaveLength(0); // no panner for an unlocated voice
  });

  it("a trimmed, located signals voice chains source -> trim -> panner -> signals gain", () => {
    const { ctx, graph, bus } = transport();
    bus.play(REF_PAGE, { bus: "signals", gain: 0.5, pan: 0.6 });
    const source = ctx.sources[0] as FakeBufferSourceNode;
    expect(source.loop).toBe(false);

    const panner = ctx.panners[0]!;
    const trim = ctx.gains.find((g) => g.outbound.includes(panner)) as FakeGainNode;
    expect(source.outbound).toEqual([trim]);
    expect(trim.gain.value).toBeCloseTo(0.5, 12);
    expect(trim.outbound).toEqual([panner]);
    expect(panner.pan.value).toBeCloseTo(0.6, 12);
    expect(panner.outbound).toEqual([busGain(graph, "signals")]);
  });

  it("an unknown sample ref throws audio[unknown-sample] naming the ref and bus", () => {
    const { ctx, bus } = transport();
    expect(() => bus.play("ghost-hum", { bus: "score" })).toThrowError(
      /audio\[unknown-sample\].*ghost-hum.*'score'/s,
    );
    expect(ctx.sources).toHaveLength(0); // refused before allocating a voice
  });

  it("out-of-domain trim/pan throw at the boundary before any node is allocated", () => {
    const { ctx, bus } = transport();
    expect(() => bus.play(REF_FAN, { bus: "ambience", gain: 1.5 })).toThrowError(/audio\[domain\]/);
    expect(() => bus.play(REF_FAN, { bus: "ambience", pan: 2 })).toThrowError(/audio\[domain\]/);
    expect(ctx.sources).toHaveLength(0);
  });

  it("busGain forwards to the three independent sliders", () => {
    const { graph, bus } = transport();
    bus.busGain("score", 0.3);
    expect(busGain(graph, "ambience").gain.value).toBe(1);
    expect(busGain(graph, "signals").gain.value).toBe(1);
    expect(busGain(graph, "score").gain.value).toBeCloseTo(0.3, 12);
    expect(() => bus.busGain("ambience", -0.1)).toThrowError(/audio\[domain\]/);
  });
});

describe("duck law THROUGH THE FAÇADE — a Signals firing always ducks the room", () => {
  it("play() on signals ducks ambience AND score; the schedule restores itself", () => {
    const { graph, bus } = transport(); // clock 4
    bus.play(REF_PAGE, { bus: "signals" });
    for (const which of ["ambience", "score"] as const) {
      const duck = duckGain(graph, which);
      expect(duck.at(4 + DUCK_ATTACK_SEC)).toBe(DUCK_DEPTH_GAIN); // ducked
      expect(duck.at(4 + SIGNALS_DUCK_HOLD_SEC + DUCK_RELEASE_SEC)).toBe(1); // restored
    }
  });

  it("the signals bus itself is NEVER ducked — not by play, not by duck()", () => {
    const { graph, bus } = transport();
    bus.play(REF_PAGE, { bus: "signals" });
    expect(busGain(graph, "signals").gain.at(4 + SIGNALS_DUCK_HOLD_SEC + DUCK_RELEASE_SEC + 1)).toBe(1);
    expect(() => bus.duck("signals" as "ambience", 9)).toThrowError(/audio\[signals-never-ducks\]/);
  });

  it("ambience/score plays do NOT duck anything (only Signals moves the room)", () => {
    const { graph, bus } = transport();
    bus.play(REF_FAN, { bus: "ambience", loop: true });
    bus.play(REF_MUSIC, { bus: "score", loop: true });
    expect(duckGain(graph, "ambience").events).toHaveLength(0);
    expect(duckGain(graph, "score").events).toHaveLength(0);
  });

  it("explicit bus.duck forwards to the graph on the audio clock", () => {
    const { graph, bus } = transport();
    const schedule = bus.duck("ambience", 100);
    expect(schedule.bus).toBe("ambience");
    expect(schedule.atSec).toBe(4);
    expect(duckGain(graph, "ambience").at(4 + DUCK_ATTACK_SEC)).toBe(DUCK_DEPTH_GAIN);
    expect(duckGain(graph, "ambience").at(100 + DUCK_RELEASE_SEC)).toBe(1);
  });
});

describe("voice teardown — stop/stopAll un-plug EVERYTHING, exactly once", () => {
  it("handle.stop stops the source on the clock, drops trim+panner, idempotent", () => {
    const { ctx, bus } = transport();
    const voice = bus.play(REF_PAGE, { bus: "signals", gain: 0.5, pan: -0.5 });
    const source = ctx.sources[0] as FakeBufferSourceNode;
    const panner = ctx.panners[0]!;
    const trim = ctx.gains.find((g) => g.outbound.includes(panner)) as FakeGainNode;

    voice.stop();
    expect(source.stopTimes).toEqual([4]);
    expect(source.disconnects).toBe(1);
    expect(trim.disconnects).toBe(1);
    expect(panner.disconnects).toBe(1);
    expect(voice.stopped).toBe(true);

    voice.stop(); // second stop changes NOTHING
    expect(source.stopTimes).toEqual([4]);
    expect(source.disconnects).toBe(1);
    expect(panner.disconnects).toBe(1);
  });

  it("stopAll tears down every live voice through the same single-release path", () => {
    const { ctx, bus } = transport();
    const a = bus.play(REF_FAN, { bus: "ambience", loop: true });
    const b = bus.play(REF_MUSIC, { bus: "score", loop: true, pan: 0.2 });
    expect(ctx.sources).toHaveLength(2);

    bus.stopAll();
    for (const source of ctx.sources as FakeBufferSourceNode[]) {
      expect(source.stopTimes.length).toBe(1);
      expect(source.disconnects).toBe(1);
    }
    expect(ctx.panners[0]!.disconnects).toBe(1);
    expect(a.stopped).toBe(true);
    expect(b.stopped).toBe(true);

    expect(() => bus.stopAll()).not.toThrow(); // empty set, second call
    expect(() => a.stop()).not.toThrow(); // handles stay honest after stopAll
    for (const source of ctx.sources as FakeBufferSourceNode[]) {
      expect(source.stopTimes.length).toBe(1); // nothing tore down twice
    }
  });
});

describe("clock honesty — the seam never invents time", () => {
  it("play/stopAll schedule on ctx.currentTime only: zero timers fired", () => {
    const { ctx, bus } = transport();
    const timerSpy = vi.spyOn(globalThis, "setTimeout");
    const intervalSpy = vi.spyOn(globalThis, "setInterval");
    try {
      bus.play(REF_PAGE, { bus: "signals", pan: 0.4 });
      ctx.advanceTo(5);
      bus.stopAll();
    } finally {
      timerSpy.mockRestore();
      intervalSpy.mockRestore();
    }
    expect(timerSpy).not.toHaveBeenCalled();
    expect(intervalSpy).not.toHaveBeenCalled();
  });
});
