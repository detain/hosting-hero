/**
 * Deterministic fake of the structural Web Audio seam (busGraph.ts's
 * AudioContextLike) for the audio lane's node-env tests.
 *
 * Laws this fake exists to serve:
 *  - NO wall-clock nondeterminism: the clock is a plain number the test
 *    advances by hand; automation is an event list with an exact evaluator.
 *  - NO timers: the graph schedules on `currentTime` only, so there is
 *    nothing here to await and nothing can leak past a test's end.
 *  - Connection honesty: every connect()/disconnect() is recorded, so the
 *    topology (three buses, two ducks, one compressor, ONE destination) and
 *    voice teardown are asserted, not assumed.
 */
import type {
  AudioBufferLike,
  AudioBufferSourceNodeLike,
  AudioContextLike,
  AudioNodeLike,
  AudioParamLike,
  DynamicsCompressorNodeLike,
  GainNodeLike,
  StereoPannerNodeLike,
} from "../busGraph";

export type AutomationKind = "setValueAtTime" | "linearRampToValueAtTime" | "cancelScheduledValues";

export interface AutomationEvent {
  readonly kind: AutomationKind;
  readonly value: number;
  readonly time: number;
}

export class FakeParam implements AudioParamLike {
  private timeline: AutomationEvent[] = [];

  constructor(
    readonly label: string,
    private readonly initial: number,
    private readonly now: () => number,
  ) {}

  get events(): readonly AutomationEvent[] {
    return this.timeline;
  }

  get value(): number {
    return this.at(this.now());
  }

  set value(v: number) {
    // Mirrors the spec's implicit behavior: assigning .value lands a
    // setValueAtTime at the current time (what our writers always intend).
    this.timeline.push({ kind: "setValueAtTime", value: v, time: this.now() });
  }

  setValueAtTime(value: number, startTime: number): AudioParamLike {
    this.timeline.push({ kind: "setValueAtTime", value, time: startTime });
    return this;
  }

  linearRampToValueAtTime(value: number, endTime: number): AudioParamLike {
    this.timeline.push({ kind: "linearRampToValueAtTime", value, time: endTime });
    return this;
  }

  cancelScheduledValues(cancelTime: number): AudioParamLike {
    this.timeline.push({ kind: "cancelScheduledValues", value: NaN, time: cancelTime });
    // Spec: drops changes scheduled at or after cancelTime. Cancels keep
    // their record — the duck-extension law is asserted ON these events.
    this.timeline = this.timeline.filter(
      (e) => e.time < cancelTime || e.kind === "cancelScheduledValues",
    );
    return this;
  }

  /** Exact piecewise evaluation at a fake-clock instant. */
  at(t: number): number {
    let prevT = 0;
    let prevV = this.initial;
    for (const e of this.timeline) {
      if (e.kind === "cancelScheduledValues") continue;
      if (e.time <= t) {
        prevT = e.time;
        prevV = e.value;
        continue;
      }
      if (e.kind === "linearRampToValueAtTime" && t > prevT) {
        const fraction = (t - prevT) / (e.time - prevT);
        return prevV + (e.value - prevV) * fraction;
      }
      return prevV;
    }
    return prevV;
  }

  countOf(kind: AutomationKind): number {
    return this.timeline.filter((e) => e.kind === kind).length;
  }
}

export class FakeNode implements AudioNodeLike {
  readonly outbound: AudioNodeLike[] = [];
  disconnects = 0;

  constructor(readonly label: string) {}

  connect<D extends AudioNodeLike>(destination: D): D {
    this.outbound.push(destination);
    return destination;
  }

  disconnect(): void {
    this.disconnects += 1;
    this.outbound.length = 0;
  }
}

export class FakeGainNode extends FakeNode implements GainNodeLike {
  readonly gain: FakeParam;

  constructor(label: string, now: () => number, initialGain = 1) {
    super(label);
    this.gain = new FakeParam(`${label}.gain`, initialGain, now);
  }
}

export class FakeStereoPannerNode extends FakeNode implements StereoPannerNodeLike {
  readonly pan: FakeParam;

  constructor(label: string, now: () => number) {
    super(label);
    this.pan = new FakeParam(`${label}.pan`, 0, now);
  }
}

/** Compressor params carry the Web Audio SPEC defaults (never touched by
 *  our graph — asserted as much: zero-taste until an owner audits samples). */
export class FakeCompressorNode extends FakeNode implements DynamicsCompressorNodeLike {
  readonly threshold: FakeParam;
  readonly knee: FakeParam;
  readonly ratio: FakeParam;
  readonly attack: FakeParam;
  readonly release: FakeParam;

  constructor(label: string, now: () => number) {
    super(label);
    this.threshold = new FakeParam(`${label}.threshold`, -24, now);
    this.knee = new FakeParam(`${label}.knee`, 30, now);
    this.ratio = new FakeParam(`${label}.ratio`, 12, now);
    this.attack = new FakeParam(`${label}.attack`, 0.003, now);
    this.release = new FakeParam(`${label}.release`, 0.25, now);
  }
}

export class FakeBufferSourceNode extends FakeNode implements AudioBufferSourceNodeLike {
  buffer: AudioBufferLike | null = null;
  loop = false;
  readonly playbackRate: FakeParam;
  readonly startTimes: number[] = [];
  readonly stopTimes: number[] = [];

  constructor(label: string, now: () => number) {
    super(label);
    this.playbackRate = new FakeParam(`${label}.playbackRate`, 1, now);
  }

  start(when = 0): void {
    this.startTimes.push(when);
  }

  stop(when = 0): void {
    this.stopTimes.push(when);
  }
}

export function fakeBuffer(durationSec = 2): AudioBufferLike {
  return Object.freeze({ duration: durationSec, sampleRate: 48000, numberOfChannels: 2 });
}

let seq = 0;

export class FakeAudioContext implements AudioContextLike {
  clock = 0;
  readonly destination: FakeNode = new FakeNode("destination");
  readonly gains: FakeGainNode[] = [];
  readonly panners: FakeStereoPannerNode[] = [];
  readonly compressors: FakeCompressorNode[] = [];
  readonly sources: FakeBufferSourceNode[] = [];

  get currentTime(): number {
    return this.clock;
  }

  /** The only way time moves in these tests: a hand-advanced audio clock. */
  advanceTo(sec: number): void {
    this.clock = sec;
  }

  createGain(): GainNodeLike {
    const node = new FakeGainNode(`gain-${(seq += 1)}`, () => this.clock);
    this.gains.push(node);
    return node;
  }

  createStereoPanner(): StereoPannerNodeLike {
    const node = new FakeStereoPannerNode(`panner-${(seq += 1)}`, () => this.clock);
    this.panners.push(node);
    return node;
  }

  createDynamicsCompressor(): DynamicsCompressorNodeLike {
    const node = new FakeCompressorNode(`compressor-${(seq += 1)}`, () => this.clock);
    this.compressors.push(node);
    return node;
  }

  createBufferSource(): AudioBufferSourceNodeLike {
    const node = new FakeBufferSourceNode(`source-${(seq += 1)}`, () => this.clock);
    this.sources.push(node);
    return node;
  }

  /** Every edge written to destination, across the whole fake graph. */
  edgesIntoDestination(): number {
    let hits = 0;
    const all: FakeNode[] = [
      this.destination,
      ...this.gains,
      ...this.panners,
      ...this.compressors,
      ...this.sources,
    ];
    for (const node of all) {
      hits += node.outbound.filter((edge) => edge === this.destination).length;
    }
    return hits;
  }
}
