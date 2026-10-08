/**
 * The AudioBus façade — ADR-0008 lane 3, step 4's named seam (2026-10-08).
 *
 * The ADR's exact words: "Sound may serve only behind an injected AudioBus
 * façade: presentation-only, the sim never touches audio, and the façade
 * keeps the library swappable (or deletable) without touching a single
 * audio-routing decision." THIS interface is that seam. Consumers (future
 * gate panels, the hum instrument, alert captions with location) receive an
 * `AudioBus`; they never know or care what backs it.
 *
 * Two ships today:
 *  - createNoopAudioBus() — the SSR/test/headless default. Zero behavior,
 *    zero throws, plays nothing. An app without sound is a legal app
 *    (§8.11: the game must be fully playable with either channel off).
 *  - createWebAudioBus(deps) — mounts the pure graph from busGraph.ts on a
 *    real-or-fake AudioContextLike and plays buffer sources through it.
 *
 * THE @pixi/sound DECISION (lane-3 ruling, 2026-10-08): this lane installs
 * NOTHING. @pixi/sound 6.0.1 is CAUTION/frozen and its residual value was
 * loader + playback convenience; with zero samples on disk the loader saves
 * no code, and routing its source nodes into OUR graph means coupling to a
 * frozen library's internals — the exact risk the façade law exists to
 * price. If a future lane wants it, the wiring lands inside this file
 * (behind the same interface) and audioLaw.test.ts's inside-audio vendor
 * pin is the one honest flip. Swapping or deleting @pixi/sound must remain
 * a one-file change.
 *
 * One-way law: NOTHING in src/audio imports sim-core, and no value produced
 * here may ever be read back into sim state — pinned by the scan test and
 * spelled out in README.md.
 */
import {
  AudioGraphError,
  buildAudioBus,
  type AudioBufferLike,
  type AudioBufferSourceNodeLike,
  type AudioBusGraph,
  type AudioBusId,
  type AudioContextLike,
  type AudioNodeLike,
  type DuckableBusId,
  type DuckSchedule,
  type GainNodeLike,
} from "./busGraph";

export type { AudioBusId, DuckableBusId } from "./busGraph";

// ── the façade vocabulary ──────────────────────────────────────────────────

/** What a caller must say to make a sound. `bus` is REQUIRED — every sound
 *  in the game is an explicit ambience/signal/score decision (there is no
 *  default bus; an undeclared one is the costume-without-a-meter mistake
 *  §8.10 warns about in audio form). */
export interface AudioPlayOptions {
  readonly bus: AudioBusId;
  /** Loop until the handle stops it (the continuous hum bed). */
  readonly loop?: boolean;
  /** Per-voice trim 0..1 on top of the bus slider (distance/fog fade). */
  readonly gain?: number;
  /** Stereo placement [-1, 1]; pair with panFromNormalizedX() for located
   *  diagnostics ("[drive click — rack 4, bay 7]"). Omit for unlocated. */
  readonly pan?: number;
}

export interface AudioVoiceHandle {
  readonly sampleRef: string;
  readonly bus: AudioBusId;
  /** Idempotent; safe after stopAll(); the hum bed calls this on pivot. */
  stop(): void;
  readonly stopped: boolean;
}

/** THE seam the ADR names. Four verbs, no more — every addition must justify
 *  itself against §8.11, not against convenience. */
export interface AudioBus {
  /** Fire one sample into a bus. Signals-bus plays duck Ambience + Score
   *  automatically (the §8.11 rule lives in the transport, not the caller).
   *  Throws `audio[unknown-sample]` on a ref the library cannot resolve —
   *  fail-fast: silent missing audio is a lie about the room. */
  play(sampleRef: string, options: AudioPlayOptions): AudioVoiceHandle;
  /** One of the three independent sliders (§8.11 "each bus its own volume
   *  control"). value ∈ [0, 1]. */
  busGain(bus: AudioBusId, value: number): void;
  /** Explicit duck hold for the duckable buses; `untilSec` is absolute
   *  audio-clock seconds. TS refuses "signals"; runtime refuses it too. */
  duck(bus: DuckableBusId, untilSec: number): DuckSchedule;
  /** Stop and un-plug every live voice (era shift, pivot, tab-hidden). */
  stopAll(): void;
}

// ── sample resolution (the second injected seam) ───────────────────────────

/** A decoded-buffer store. A real implementation fetches/decodes audio
 *  files behind this interface; tests hand it in-memory fakes. NOTHING
 *  ships an implementation of this yet — no samples exist (README gap
 *  ledger). */
export interface SampleLibrary {
  /** Return the buffer for a ref, or null. The façade turns null into a
   *  loud `audio[unknown-sample]` throw at play time. */
  bufferFor(sampleRef: string): AudioBufferLike | null;
}

// ── the Noop bus (SSR / test / headless default) ───────────────────────────

/** A bus that hears nothing and ducks nothing: every method is inert and
 *  total. This is what non-interactive surfaces inject so "audio is an
 *  optional channel" is true by construction, not by if-guards. */
export function createNoopAudioBus(): AudioBus {
  return {
    play(sampleRef: string, options: AudioPlayOptions): AudioVoiceHandle {
      let stopped = false;
      return {
        sampleRef,
        bus: options.bus,
        stop(): void {
          stopped = true;
        },
        get stopped(): boolean {
          return stopped;
        },
      };
    },
    busGain(): void {},
    duck(bus: DuckableBusId): DuckSchedule {
      // Deterministic sentinel: a duck that never happened, on no clock.
      return { bus, atSec: 0, depthUntilSec: 0, releasedAtSec: 0 };
    },
    stopAll(): void {},
  };
}

// ── the WebAudio bus ───────────────────────────────────────────────────────

export interface WebAudioBusDeps {
  readonly graph: AudioBusGraph;
  readonly samples: SampleLibrary;
}

function requireTrimDomain(gain: number): number {
  if (!(gain >= 0 && gain <= 1)) {
    throw new AudioGraphError("domain", `play.gain must be within [0, 1], got ${String(gain)}`);
  }
  return gain;
}

function requirePlayPanDomain(pan: number): number {
  if (!(pan >= -1 && pan <= 1)) {
    throw new AudioGraphError("domain", `play.pan must be within [-1, 1], got ${String(pan)}`);
  }
  return pan;
}

/** One sounding voice: its source plus every side-node this play()
 *  allocated, so ALL explicit teardown paths (handle.stop, stopAll)
 *  un-plug the same set of nodes exactly once. Natural-end cleanup is a
 *  documented gap (see AudioBufferSourceNodeLike in busGraph.ts). */
interface LiveVoice {
  readonly source: AudioBufferSourceNodeLike;
  release(): void;
}

/**
 * The real transport. Construction is wiring-only: options are validated
 * here, once, at the boundary (parse, don't validate — the graph's guards
 * stay as internal backstops, not as the first line).
 *
 * audioLaw.test.ts pins THIS file as the repository's ONLY legal site of
 * `new AudioContext(` (positive control: exactly one, inside
 * createBrowserAudioContext below) and as the only legal home of any future
 * `@pixi/sound` import (zero today — the no-dep decision; a vendor swap
 *  edits this file and nothing else).
 */
export function createWebAudioBus(deps: WebAudioBusDeps): AudioBus {
  const { graph, samples } = deps;
  const ctx: AudioContextLike = graph.ctx;
  const live = new Set<LiveVoice>();

  function play(sampleRef: string, options: AudioPlayOptions): AudioVoiceHandle {
    const buffer = samples.bufferFor(sampleRef);
    if (buffer === null) {
      throw new AudioGraphError(
        "unknown-sample",
        `sample '${sampleRef}' is not in the mounted library — the room cannot lie about ` +
          `what it hums; ship the pack or fix the ref (bus was '${String(options.bus)}')`,
      );
    }
    const trim = options.gain === undefined ? null : requireTrimDomain(options.gain);
    const pan = options.pan === undefined ? undefined : requirePlayPanDomain(options.pan);

    const input = graph.voiceInput(pan === undefined ? { bus: options.bus } : { bus: options.bus, pan });
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = options.loop === true;

    let chainHead: AudioNodeLike = source;
    let trimNode: GainNodeLike | null = null;
    if (trim !== null) {
      trimNode = ctx.createGain();
      trimNode.gain.value = trim;
      source.connect(trimNode);
      chainHead = trimNode;
    }
    chainHead.connect(input.head);

    // The §8.11 rule, enforced in the transport: a Signals firing always
    // ducks Ambience (and Score) — no caller can forget it.
    if (options.bus === "signals") {
      graph.duckUnderSignals();
    }

    source.start(ctx.currentTime);

    // One release, shared by the wired teardown paths (handle.stop and
    // stopAll) and idempotent through `released` — a voice can only ever
    // un-plug its nodes once, in any order, at any time. Natural-end
    // (onended) is deliberately NOT wired yet — see the honest-gap note
    // below and on AudioBufferSourceNodeLike.
    const voice: LiveVoice = { source, release: () => {} };
    let released = false;
    voice.release = (): void => {
      if (released) return;
      released = true;
      live.delete(voice);
      try {
        source.stop(ctx.currentTime); // spec: stop-after-end is a no-op
      } catch {
        // stop-before-start would throw; the voice is dead either way.
      }
      source.disconnect();
      trimNode?.disconnect();
      input.detach();
    };
    live.add(voice);
    // Natural-end cleanup is NOT wired (see the honest-gap note on
    // AudioBufferSourceNodeLike): one-shot sources self-silence at buffer
    // end; their nodes un-plug on the next stop()/stopAll(). release() is
    // idempotent, so the later explicit stop is harmless.

    return {
      sampleRef,
      bus: options.bus,
      stop(): void {
        voice.release(); // idempotent — also the post-stopAll case
      },
      get stopped(): boolean {
        return released;
      },
    };
  }

  return {
    play,
    busGain(bus, value): void {
      graph.setBusGain(bus, value);
    },
    duck(bus: DuckableBusId, untilSec: number): DuckSchedule {
      return graph.duck(bus, untilSec);
    },
    stopAll(): void {
      // Route through each voice's own release — the same code path a
      // manual stop takes, so side nodes (trim, panner) never leak.
      for (const voice of [...live]) {
        voice.release();
      }
      live.clear();
    },
  };
}

// ── the browser context seam ───────────────────────────────────────────────

/**
 * The ONLY legal `new AudioContext(` in the repository (pinned by
 * audioLaw.test.ts, positive control exactly-one). Kept separate from
 * createWebAudioBus so tests never construct a real context: they inject
 * fakes into buildAudioBus directly, and this function stays a two-line
 * honest door to the browser.
 *
 * No `webkitAudioContext` shim on purpose: the proto is a modern-browser
 * target (Vite 7 baseline) and a dead fallback path is untestable surface.
 */
export function createBrowserAudioContext(): AudioContext {
  return new AudioContext();
}

/** Convenience mount: browser context + graph + library in one call, for
 *  whichever lane first wires audio into a screen. */
export function mountWebAudioBus(samples: SampleLibrary): {
  readonly bus: AudioBus;
  readonly ctx: AudioContext;
} {
  const ctx = createBrowserAudioContext();
  const graph = buildAudioBus(ctx);
  return { bus: createWebAudioBus({ graph, samples }), ctx };
}
