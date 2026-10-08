/**
 * The three-bus audio graph — ADR-0008 lane 3 (2026-10-08).
 *
 * §8.11's three-bus rule is the whole design: "the hum encodes load
 * (continuous ambient telemetry) AND audio must be redundant with every
 * critical visual alert. If both live in the same mix, the alerts fight the
 * telemetry." So: THREE buses with separate sliders, ONE destination, and the
 * stated rule as code — **Signals always duck Ambience** (Score also ducks
 * under Signals, §8.11 "ducks under Signals").
 *
 * The ADR verdict on @pixi/sound is CAUTION precisely because it has no
 * buses/groups/ducking — "our three-bus audio graph (GainNode/Panner/
 * Compressor) therefore remains OURS, built on the Web Audio API directly."
 * This file is that graph. It is PURE TypeScript against a structural
 * minimal view of Web Audio (AudioContextLike below): the real AudioContext
 * satisfies it structurally, the tests inject a deterministic fake, and
 * nothing here touches the DOM, a timer, or a wall clock. Ducking is
 * scheduled on `ctx.currentTime` — the audio clock is sample-accurate and
 * needs no setTimeout.
 *
 * THE ONE-WAY LAW (ADR-0008: "presentation-only, the sim never touches
 * audio"): nothing in this directory may ever be read back into sim state,
 * and this module imports NOTHING — not sim-core, not the camera, not the
 * observed store. Telemetry arrives as plain normalized numbers chosen by
 * the consumer; the graph talks back only in scheduled gain values. The scan
 * in __tests__/audioLaw.test.ts pins the import silence; README.md states
 * the full law.
 *
 * No floats here are sim-adjacent state — audio-domain floats never cross
 * into the simulation in either direction (that is what the one-way law is).
 */

// ── structural Web Audio view (the seam a fake can implement) ──────────────

/** The AudioParam automation subset this graph schedules. Real AudioParams
 *  carry far more (setTargetAtTime, exponential ramps); we use only linear
 *  ramps so any spec-compliant implementation — or fake — behaves exactly. */
export interface AudioParamLike {
  /** Current value (real ctx: the computed value at currentTime). */
  value: number;
  setValueAtTime(value: number, startTime: number): AudioParamLike;
  linearRampToValueAtTime(value: number, endTime: number): AudioParamLike;
  cancelScheduledValues(cancelTime: number): AudioParamLike;
}

export interface AudioNodeLike {
  connect<D extends AudioNodeLike>(destination: D): D;
  disconnect(): void;
}

export interface GainNodeLike extends AudioNodeLike {
  readonly gain: AudioParamLike;
}

export interface StereoPannerNodeLike extends AudioNodeLike {
  /** -1 (full left) .. +1 (full right), clamped by spec. */
  readonly pan: AudioParamLike;
}

/** Master-bus glue node. Named by the ADR's graph (GainNode/Panner/
 *  Compressor); we create it but touch NO parameter — the Web Audio spec
 *  defaults (threshold -24 dB, ratio 12, etc.) stand until an owner audits
 *  real samples and ratifies settings. Zero-taste by design. */
export interface DynamicsCompressorNodeLike extends AudioNodeLike {
  readonly threshold: AudioParamLike;
  readonly knee: AudioParamLike;
  readonly ratio: AudioParamLike;
  readonly attack: AudioParamLike;
  readonly release: AudioParamLike;
}

/** The decoded-buffer identity, as the read-only fields the spec's real
 *  AudioBuffer carries (duration is in SECONDS). The graph never reads them
 *  — they exist so a SampleLibrary can be validated and tested honestly. */
export interface AudioBufferLike {
  readonly duration: number;
  readonly sampleRate: number;
  readonly numberOfChannels: number;
}

export interface AudioBufferSourceNodeLike extends AudioNodeLike {
  buffer: AudioBufferLike | null;
  loop: boolean;
  readonly playbackRate: AudioParamLike;
  start(when?: number): void;
  stop(when?: number): void;
  /** HONEST GAP (lane 3, 2026-10-08): deliberately NO `onended` in this
   *  structural seam — the real member is `((this: …, ev: Event) => any)`,
   *  and threading a DOM Event type through a DOM-free pure module (and a
   *  node-env fake) would cost more honesty than the auto-cleanup buys.
   *  Non-loop voices self-silence at buffer end but stay connected until
   *  stop()/stopAll(); the first lane to play high-volume one-shots owns
   *  the wiring fix, and it lands in audioBus.ts only (the seam stays). */
}

/** The minimal context surface buildAudioBus consumes. The browser's
 *  AudioContext satisfies this structurally; tests inject a fake with a
 *  hand-driven `currentTime`. */
export interface AudioContextLike {
  /** Seconds since context start — THE audio clock. */
  readonly currentTime: number;
  readonly destination: AudioNodeLike;
  createGain(): GainNodeLike;
  createStereoPanner(): StereoPannerNodeLike;
  createDynamicsCompressor(): DynamicsCompressorNodeLike;
  createBufferSource(): AudioBufferSourceNodeLike;
}

// ── the bus vocabulary (§8.11, closed) ─────────────────────────────────────

/** The three buses, IN §8.11 order. Adding a fourth is a spec change, not a
 *  code change — the vocabulary is closed by law. */
export const AUDIO_BUSES = ["ambience", "signals", "score"] as const;
export type AudioBusId = (typeof AUDIO_BUSES)[number];

/** The buses that MAY be ducked. "signals" is deliberately absent: Signals
 *  is the duck-master (§8.11: "Signals always duck Ambience"); ducking the
 *  alert channel under its own alert would re-create the masking problem
 *  the three-bus rule exists to solve. Illegal state, unrepresentable. */
export const DUCKABLE_BUSES = ["ambience", "score"] as const;
export type DuckableBusId = (typeof DUCKABLE_BUSES)[number];

/** Which buses duck when Signals fires — the stated rule, as data. */
export const BUSES_DUCKED_UNDER_SIGNALS: readonly DuckableBusId[] = Object.freeze(
  DUCKABLE_BUSES,
);

// ── ducking envelope (PROVISIONAL taste values — owner-ratification needed) ─

/** How far a ducked bus drops, as a gain multiplier. 0.25 ≈ -12 dB: audibly
 *  pushed back, never muted (a ducked room that goes silent would itself
 *  read as a power-loss event — §8.11 reserves silence for that). */
export const DUCK_DEPTH_GAIN = 0.25;

/** Seconds to reach DUCK_DEPTH_GAIN once a duck starts. Fast enough that
 *  the alert is never masked, slow enough to avoid a click. */
export const DUCK_ATTACK_SEC = 0.05;

/** Seconds to glide back to unity after the hold ends. Slower than the
 *  attack by design: the room returns gently after the pager stops. */
export const DUCK_RELEASE_SEC = 0.3;

/** Minimum hold (from duck start) for an automatic signals-fired duck when
 *  the caller gives no explicit `until`. Discrete alerts are short; this
 *  covers a beep without narrating it. */
export const SIGNALS_DUCK_HOLD_SEC = 0.6;

// ── errors ─────────────────────────────────────────────────────────────────

/** `audio[CODE]: detail` — the same error family the versus/unattended/post
 *  lanes use, so a thrown law message is greppable across the repo. */
export class AudioGraphError extends Error {
  constructor(code: string, detail: string) {
    super(`audio[${code}]: ${detail}`);
    this.name = "AudioGraphError";
  }
}

function requireFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AudioGraphError(
      "bad-value",
      `${label} must be a finite number, got ${String(value)}`,
    );
  }
  return value;
}

function requireUnitInterval(value: unknown, label: string): number {
  const n = requireFiniteNumber(value, label);
  if (n < 0 || n > 1) {
    throw new AudioGraphError("domain", `${label} must be within [0, 1], got ${String(n)}`);
  }
  return n;
}

// ── the panner mapping (§8.14 diagnostic captions with location) ───────────

/** The StereoPanner domain is [-1, +1]; enforce it at the seam. */
export function requirePanDomain(value: unknown, label = "pan"): number {
  const n = requireFiniteNumber(value, label);
  if (n < -1 || n > 1) {
    throw new AudioGraphError("domain", `${label} must be within [-1, 1], got ${String(n)}`);
  }
  return n;
}

/**
 * Map a normalized cross-aisle position to a stereo pan.
 *
 * `[drive click — rack 4, bay 7]` (§8.14) is the caption form; its audio
 * twin is a drive-click voice hard-mid-right on the aisle. The consumer
 * (a chrome/panel lane) normalizes the world x of the sound source against
 * the visible aisle span into [0, 1] and calls THIS pure function — the
 * graph never imports the CameraRig, the topology grid, or any observed
 * store (one-way law; the decoupling follows the intent-door's
 * canPlaceDevice precedent).
 *
 * x01 < 0 or > 1 CLAMPS rather than throws: off-screen sources exist (the
 * click is in rack 9 while you look at racks 1–4) and hard-panning them to
 * the edge IS the honest spatial answer.
 */
export function panFromNormalizedX(x01: unknown): number {
  const n = requireFiniteNumber(x01, "normalized x");
  return Math.min(1, Math.max(-1, 2 * n - 1));
}

// ── the graph ──────────────────────────────────────────────────────────────

/** Where one voice plugs into the graph. `head` is what the source connects
 *  to; `detach()` un-plugs a created panner so stopped voices leave no live
 *  connections behind. */
export interface VoiceInput {
  readonly head: AudioNodeLike;
  readonly panner: StereoPannerNodeLike | null;
  detach(): void;
}

export interface VoicePlacement {
  readonly bus: AudioBusId;
  /** Omit for an unlocated voice (room tone, score). A number in [-1, 1]
   *  gets its own StereoPanner feeding the bus (located diagnostics). */
  readonly pan?: number;
}

/** A scheduled automation step, exposed so tests (and future audits) can
 *  read what was queued WITHOUT a wall clock. */
export interface DuckSchedule {
  readonly bus: DuckableBusId;
  readonly atSec: number;
  readonly depthUntilSec: number;
  readonly releasedAtSec: number;
}

export interface AudioBusGraph {
  readonly ctx: AudioContextLike;
  /** Per-bus master sliders — the "give each bus its own volume control"
   *  law. These are the three volume controls; there is no fourth path. */
  readonly busGains: Readonly<Record<AudioBusId, GainNodeLike>>;
  /** Duck stages for the duckable buses only; signals has none BY LAW. */
  readonly duckGains: Readonly<Partial<Record<DuckableBusId, GainNodeLike>>>;
  /** The one shared master node feeding ctx.destination. */
  readonly master: DynamicsCompressorNodeLike;
  setBusGain(bus: AudioBusId, value: number): void;
  voiceInput(placement: VoicePlacement): VoiceInput;
  /** Explicit duck: hold the bus ducked until `untilSec` (absolute audio
   *  clock), then release. Reschedules (extends) if already ducking. */
  duck(bus: DuckableBusId, untilSec: number): DuckSchedule;
  /** The §8.11 rule as a method: any Signals firing ducks Ambience AND
   *  Score for the hold window. Called by the WebAudio façade on every
   *  signals-bus play — the law is not left to caller discipline. */
  duckUnderSignals(): DuckSchedule[];
}

function assertBusId(bus: unknown): AudioBusId {
  if (typeof bus !== "string" || !(AUDIO_BUSES as readonly string[]).includes(bus)) {
    throw new AudioGraphError(
      "unknown-bus",
      `'${String(bus)}' is not one of the three §8.11 buses (${AUDIO_BUSES.join(", ")})`,
    );
  }
  return bus as AudioBusId;
}

function assertDuckableBus(bus: unknown): DuckableBusId {
  const id = assertBusId(bus);
  if (!(DUCKABLE_BUSES as readonly string[]).includes(id)) {
    // Reachable only from untyped (JS) callers — TS hides the state.
    throw new AudioGraphError(
      "signals-never-ducks",
      "duck('signals') is refused by law: §8.11 states Signals always duck " +
        "Ambience — the alert channel is the duck-MASTER and is never ducked " +
        "itself (ducking alerts under alerts is the masking problem this graph exists to kill)",
    );
  }
  return id as DuckableBusId;
}

/** Schedule one bus's duck: attack from the current value to the depth,
 *  hold through `untilSec` (never shorter than the attack), release to
 *  unity. Pure `currentTime`-relative automation — zero timers. */
function scheduleDuck(
  param: AudioParamLike,
  nowSec: number,
  untilSec: number,
  bus: DuckableBusId,
): DuckSchedule {
  const now = requireFiniteNumber(nowSec, "nowSec");
  const requestedUntil = requireFiniteNumber(untilSec, "duck.untilSec");

  const heldUntil = Math.max(requestedUntil, now + DUCK_ATTACK_SEC);
  const releasedAt = heldUntil + DUCK_RELEASE_SEC;

  // Rewind the timeline, pin wherever the value actually is, then attack →
  // hold → release. cancelScheduledValues(now) drops any previous release
  // so re-triggering a duck while one is live EXTENDS it instead of stacking
  // automation (the pager fires twice; the duck holds once).
  const current = param.value;
  param.cancelScheduledValues(now);
  param.setValueAtTime(current, now);
  param.linearRampToValueAtTime(DUCK_DEPTH_GAIN, now + DUCK_ATTACK_SEC);
  param.setValueAtTime(DUCK_DEPTH_GAIN, heldUntil);
  param.linearRampToValueAtTime(1, releasedAt);
  return { bus, atSec: now, depthUntilSec: heldUntil, releasedAtSec: releasedAt };
}

/**
 * Build the three-bus graph on any (real or fake) context surface.
 *
 * Topology (§8.11 + the ADR's GainNode/Panner/Compressor naming):
 *
 *   voice → [panner] ─┐
 *                     ├→ ambience-gain → ambience-duck ─┐
 *   voice ────────────┼→ signals-gain ──────────────────┼→ master compressor → destination
 *   voice ────────────┼→ score-gain → score-duck ───────┘
 *                     │        (signals has NO duck stage — assertDuckableBus)
 *
 * One destination, three sliders, two duck stages, zero timers.
 */
export function buildAudioBus(ctx: AudioContextLike): AudioBusGraph {
  const master = ctx.createDynamicsCompressor();
  master.connect(ctx.destination); // THE single destination edge in the graph

  const busGains = {
    ambience: ctx.createGain(),
    signals: ctx.createGain(),
    score: ctx.createGain(),
  } satisfies Record<AudioBusId, GainNodeLike>;

  const duckGains: Partial<Record<DuckableBusId, GainNodeLike>> = {
    ambience: ctx.createGain(),
    score: ctx.createGain(),
  };

  busGains.ambience.connect(duckGains.ambience as GainNodeLike);
  (duckGains.ambience as GainNodeLike).connect(master);
  busGains.signals.connect(master); // direct: the duck-master is never ducked
  busGains.score.connect(duckGains.score as GainNodeLike);
  (duckGains.score as GainNodeLike).connect(master);

  const graph: AudioBusGraph = {
    ctx,
    busGains,
    duckGains,
    master,

    setBusGain(bus: AudioBusId, value: number): void {
      const id = assertBusId(bus);
      busGains[id].gain.value = requireUnitInterval(value, `busGain('${id}')`);
    },

    voiceInput(placement: VoicePlacement): VoiceInput {
      const bus = assertBusId(placement.bus);
      const target = busGains[bus];
      if (placement.pan === undefined) {
        return { head: target, panner: null, detach(): void {} };
      }
      const panner = ctx.createStereoPanner();
      panner.pan.value = requirePanDomain(placement.pan, `voice pan on '${bus}'`);
      panner.connect(target);
      return {
        head: panner,
        panner,
        detach(): void {
          panner.disconnect();
        },
      };
    },

    duck(bus: DuckableBusId, untilSec: number): DuckSchedule {
      const id = assertDuckableBus(bus);
      return scheduleDuck((duckGains[id] as GainNodeLike).gain, ctx.currentTime, untilSec, id);
    },

    duckUnderSignals(): DuckSchedule[] {
      const untilSec = ctx.currentTime + SIGNALS_DUCK_HOLD_SEC;
      return BUSES_DUCKED_UNDER_SIGNALS.map((bus) =>
        scheduleDuck((duckGains[bus] as GainNodeLike).gain, ctx.currentTime, untilSec, bus),
      );
    },
  };
  return graph;
}
