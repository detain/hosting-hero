/**
 * src/audio/ — the ADR-0008 lane-3 AudioBus seam (2026-10-08).
 *
 * Three homes, one law (the explicit-barrel pattern of render/post/):
 *  - busGraph.ts: the pure three-bus graph law (§8.11) against a structural
 *    AudioContextLike — DOM-free, node-testable, zero timers.
 *  - audioBus.ts: the injected AudioBus façade — Noop default + WebAudio
 *    transport; the repo's only legal `new AudioContext(` site and only
 *    legal future home of any @pixi/sound import.
 *  - packs.ts: the `hh-audio-pack@1` per-line ambient pack contract
 *    (five hum voices, band reservation, mappers as data).
 *
 * NOTHING mounts audio yet — law-first, exactly like the filters lane:
 * zero calls from existing screens. The release lane owns the first
 * consumer (the hum instrument / alert caption wiring), and README.md
 * carries the PASSAGE for landing a real sample pack.
 */
export {
  AUDIO_BUSES,
  BUSES_DUCKED_UNDER_SIGNALS,
  DUCKABLE_BUSES,
  DUCK_ATTACK_SEC,
  DUCK_DEPTH_GAIN,
  DUCK_RELEASE_SEC,
  SIGNALS_DUCK_HOLD_SEC,
  AudioGraphError,
  buildAudioBus,
  panFromNormalizedX,
  requirePanDomain,
  type AudioBufferLike,
  type AudioBufferSourceNodeLike,
  type AudioBusGraph,
  type AudioBusId,
  type AudioContextLike,
  type AudioNodeLike,
  type AudioParamLike,
  type DynamicsCompressorNodeLike,
  type DuckSchedule,
  type DuckableBusId,
  type GainNodeLike,
  type StereoPannerNodeLike,
  type VoiceInput,
  type VoicePlacement,
} from "./busGraph";
export {
  createBrowserAudioContext,
  createNoopAudioBus,
  createWebAudioBus,
  mountWebAudioBus,
  type AudioBus,
  type AudioPlayOptions,
  type AudioVoiceHandle,
  type SampleLibrary,
  type WebAudioBusDeps,
} from "./audioBus";
export {
  HUM_AUDIO_PACK_SCHEMA_ID,
  HUM_VOICE_TELEMETRY,
  HUM_VOICES,
  TELEMETRY_DIMENSIONS,
  HumAudioPackError,
  parseHumAudioPack,
  rampAt,
  type HumVoiceId,
  type ParamRamp,
  type ParsedAlertBandReservationHz,
  type ParsedHumAudioPack,
  type ParsedHumVoice,
  type TelemetryDimension,
} from "./packs";
