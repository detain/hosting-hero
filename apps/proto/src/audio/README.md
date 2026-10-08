# src/audio/ — the AudioBus seam (ADR-0008 lane 3, 2026-10-08)

Three buses, one destination, and a swappable door. §8.11's mix law as code;
**nothing mounts it yet** (law-first, exactly like the `render/post/` lane).

## What lives here

| File | Role |
|---|---|
| `busGraph.ts` | The PURE three-bus graph (§8.11): ambience / signals / score masters, duck stages, one master compressor, ONE destination edge. Structural `AudioContextLike` seam — DOM-free, node-testable, zero timers (ducking is `ctx.currentTime` automation). |
| `audioBus.ts` | THE façade the ADR names: `AudioBus { play(sampleRef, opts), busGain(bus, v), duck(bus, until), stopAll() }` + `createNoopAudioBus()` (SSR/test/headless default) + `createWebAudioBus()` (transport). Repository's only legal `new AudioContext(` site, and only legal future home of any `@pixi/sound` import. |
| `packs.ts` | `hh-audio-pack@1` — the per-line ambient pack CONTRACT (data, not samples): the five hum voices with canonical telemetry bindings, the MANDATORY alert-band reservation, state→param mappers as DATA (`rampAt` is the whole interpreter). |
| `__tests__/` | 66 tests on a hand-advanced fake clock: duck law, three-bus independence, panner mapping, pack strictness, and `audioLaw.test.ts` (the repo-wide comment-stripped scan, filtersLaw precedent, incl. a LIVE planted-file proof). |

## The laws this directory encodes

1. **Three-bus rule (§8.11).** "If both live in the same mix, the alerts
   fight the telemetry." Three GainNode masters, three sliders, one
   destination — asserted, with `edgesIntoDestination() === 1` pinned.
2. **Signals always duck Ambience.** The duck is enforced in the TRANSPORT
   (`play({bus:"signals"})` calls `duckUnderSignals()`), so no caller can
   forget it; Score ducks too (§8.11: "ducks under Signals"). `duck("signals")`
   is unrepresentable in TS **and** refused at runtime — the alert channel is
   the duck-master and is never ducked itself.
3. **No timers, no wall clock.** Attack/hold/release is five `AudioParam`
   events on the audio clock. Re-triggering a live duck cancels-and-extends
   (the pager fires twice; the room ducks once). Nothing here can outlive a
   tick, a test, or a component.
4. **The one-way law (ADR-0008).** This module imports NOTHING — not
   sim-core, not the camera, not the observed store. Located diagnostics
   arrive as a normalized `x01` the consumer computes; `panFromNormalizedX`
   maps it to the StereoPanner domain. No value produced here may ever be
   read back into sim state. The scan pins the import silence; audioLaw
   additionally pins zero sim-core specifiers and zero inbound imports.
5. **Per-line audio budget (§8.11).** Every `hh-audio-pack@1` must state
   `alertBandReservationHz` — pager severity audible over a GPU hall's pump
   noise AND in a tape vault's near-silence — "a stated audio budget,
   exactly like the colour budget." A pack without it does not parse.

## THE PASSAGE — how a real sample pack lands

1. Author the kit under `assets/sound-packs/<line>/`:
   `pack.json` (the `hh-audio-pack@1` manifest — parse it with
   `parseHumAudioPack()` in CI or a lint pass; it fail-louds on every
   shortcut) plus the sample files its `voices.*.sample` refs name.
2. Put the pack's `line` + `ambientSampleSet` (e.g. `sound:wall-of-fans`)
   into the Ruleset Card. **The field already exists in the type-bundle
   schema**: `packages/content/schema/type-bundle.schema.json` —
   `skin.ambientSoundPack` (line ~315, described "Sample-set swap on
   shared bus"; REQUIRED in the skin record at :285), carried by the
   loader (`packages/sim-core/src/loader/
   bundle.ts` — parsed required `req(str)` ~:677, projected onto the
   typed skin ~:968) and typed optional at `packages/sim-core/src/
   types.ts:1015` (the sim-side contract keeps it opaque — nothing in
   sim-core interprets it: the one-way law already holds in the schema).
   §8.10's honest accounting works for audio exactly as for sprites: the
   shared bus + a named sample-set means every line inherits the
   telemetry, the palette swaps per line.
3. Implement a `SampleLibrary` (fetch + `decodeAudioData` behind
   `bufferFor(ref)`) — the façade takes it as an injected port; nothing in
   this directory touches the network or the DOM.
4. The first screen wiring (hum instrument / located alert captions)
   imports `AudioBus` from `src/audio` and receives an instance at app
   root. That import crossing the quarantine line is deliberate and
   single: flip `audioLaw.test.ts`'s consumer-pin roster at that moment,
   in that commit, and nothing else.
5. Band-budget enforcement (an `EqualizerFilter`-style dip on the ambience
   bus carving out `alertBandReservationHz`) lands THEN — see the ledger.

## Honest gap ledger (nothing here is pretending)

- **No samples exist.** `assets/sound-packs/` is not on disk; the pack
  contract ships ahead of its first subject — same posture as the
  Five-Asset Kit placeholders, and stricter (those at least have PNGs).
- **Nothing mounts audio.** Zero imports from any screen/gate/chrome file
  (pinned by `audioLaw.test.ts`). Audio has never made a sound in this app.
- **Equalizer band-budgets: deliberately NOT implemented.** §8.11's
  frequency reservation is CONTRACTUAL in the pack (`alertBandReservationHz`
  parses and is mandatory) but not ENFORCED in the graph — carving a real
  EQ dip needs actual sample spectra to prove the budget numbers. Building
  filters before the audio exists is taste without evidence; the ADR lists
  Equalizer as the usable hook when that day comes.
- **Duck envelope values are PROVISIONAL** — `DUCK_DEPTH_GAIN 0.25 /
  ATTACK 50ms / RELEASE 300ms / HOLD 600ms` are named constants awaiting
  owner audition. Zero-taste elsewhere: the master compressor keeps spec
  defaults, touched by no line of code (test-pinned).
- **Natural-end cleanup is not wired.** `AudioBufferSourceNodeLike` has no
  `onended` in the structural seam (the real member is `((this, ev: Event)
  => any)`-shaped and would drag DOM types through a DOM-free law module).
  One-shot voices self-silence at buffer end but stay connected until
  `stop()`/`stopAll()`; the first high-volume one-shot consumer owns the
  fix, and it lands inside `audioBus.ts` only.
- **`mountWebAudioBus` is untested-by-construction** (thin browser door;
  everything it composes is fake-tested). Intentional: the testable law is
  in the graph and the parser, the door is two lines of `new`.

## Why @pixi/sound may never appear here — and why that's fine

The lane-3 decision (2026-10-08) shipped **zero dependencies**: no
`@pixi/sound@6.0.1` install. Reasoning, on the record:

- The audit's verdict was CAUTION — frozen ~2yr, 56 open issues, and **no
  buses, no groups, no ducking**: every §8.11 decision this lane implements
  is one the library cannot host. The ADR itself allows the backing to be
  "skipped entirely."
- Its residual value was loader + playback convenience. With zero samples
  on disk the loader saves no code, and `AudioBufferSourceNode` is ~30
  lines of honest plumbing we already typed as a structural interface.
- Its `MediaElementSource`/own-context playback would couple **frozen
  library internals** to OUR graph — the exact risk the façade law exists
  to price.

Because `AudioBus` is the seam, swapping is a one-file act: a future lane
imports the vendor inside `audioBus.ts` (the scan's inside-audio decision
pin is the single honest flip), adapts its sounds into `busGraph` inputs,
and **no consumer changes line-for-line** — screens only ever saw the
interface. That is what "swappable (or deletable) without touching a
single audio-routing decision" buys; the routing decisions all live on our
side of the door already.
