/**
 * HH Audio Pack (`hh-audio-pack@1`) — the per-line ambient pack CONTRACT
 * (ADR-0008 lane 3, 2026-10-08). DATA, not samples: no audio bytes exist
 * yet; this file is the shape law a real pack must satisfy, mirroring the
 * Five-Asset Kit discipline of tools/assetpack/src/manifest.ts (that's the
 * house pattern; the shape law is REPLICATED here on purpose — no
 * cross-package import from app code).
 *
 * The two spec sentences this parser encodes:
 *
 * §8.10 (honest accounting): "sound palette is a sample-set swap on the
 * existing ambient bus" — a pack names its `ambientSampleSet`, the value
 * that lands in the Ruleset Card's `skin.ambientSoundPack` field (already
 * in the type-bundle schema: packages/content/schema/
 * type-bundle.schema.json:315 "Sample-set swap on shared bus").
 *
 * §8.11 (per-line sound palettes): "each line's ambient bed must leave the
 * same frequency band free for the alert tones, so pager severity is
 * equally audible in a GPU hall's pump noise and a tape vault's
 * near-silence. A stated audio budget, exactly like the colour budget."
 * → `alertBandReservationHz` is REQUIRED on every pack; a pack without a
 * stated reservation does not parse, same as a kit without a palette.
 *
 * §8.11 (the hum as instrument): five separable voices with canonical
 * telemetry bindings — fans (load) · drives (I/O) · CRAC (thermal) ·
 * UPS (power state) · room tone (occupancy). "A trained player hears
 * WHICH voice changed" is a diagnostic contract, so a pack may NOT
 * re-bind a voice (fan→io throws naming the law). The state→param mapper
 * is DATA: linear ramps given as endpoints, evaluated by rampAt().
 *
 * Parse at the boundary, trust internally: `parseHumAudioPack` returns a
 * deep-frozen, closed-vocabulary structure; every function downstream of it
 * takes `ParsedHumAudioPack`, never `unknown`.
 */

export const HUM_AUDIO_PACK_SCHEMA_ID = "hh-audio-pack@1";

/** The five hum voices, in §8.11's listed order (fan·drive·crac·ups·room).
 *  Six voices would be a different game's audio; four lose a diagnosis. */
export const HUM_VOICES = ["fan", "drive", "crac", "ups", "room"] as const;
export type HumVoiceId = (typeof HUM_VOICES)[number];

/** The telemetry dimensions a hum voice may ride. Closed: these five are
 *  the five physical systems §8.11 names (load / I/O / thermal / power /
 *  occupancy). */
export const TELEMETRY_DIMENSIONS = ["load", "io", "thermal", "power", "occupancy"] as const;
export type TelemetryDimension = (typeof TELEMETRY_DIMENSIONS)[number];

/** The canonical voice→telemetry pairings — THE diagnostic contract.
 *  A pack declares `bind` and the parser CHECKS it against this table:
 *  a lying manifest is caught at parse, not diagnosed wrong in play. */
export const HUM_VOICE_TELEMETRY: Readonly<Record<HumVoiceId, TelemetryDimension>> =
  Object.freeze({
    fan: "load", // fans spin up as utilization rises
    drive: "io", // seek chatter tracks I/O
    crac: "thermal", // cooling responds to heat
    ups: "power", // whine/state marks power topology
    room: "occupancy", // room tone marks how full the fleet is
  } as const satisfies Record<HumVoiceId, TelemetryDimension>);

// ── parsed shapes (trusted internal types) ─────────────────────────────────

/** A linear state→param mapper as data: value 0 on a healthy idle, value 1
 *  on a pegged meter. Endpoints may rise (fan gain) or fall (room tone in a
 *  near-silent archival line) — the direction is the pack's voice. */
export interface ParamRamp {
  readonly at0: number;
  readonly at1: number;
}

export interface ParsedHumVoice {
  /** Sample ref inside the pack's ambientSampleSet (e.g. "fan-loop"). */
  readonly sample: string;
  /** Must equal HUM_VOICE_TELEMETRY[voice] — checked at parse. */
  readonly bind: TelemetryDimension;
  /** Gain endpoints for the bind dimension, each within [0, 1]. */
  readonly gain: ParamRamp;
  /** playbackRate endpoints for the bind dimension, each within (0, 8]. */
  readonly pitch: ParamRamp;
  /** Hum beds are continuous; the flag is still REQUIRED, not defaulted —
   *  a non-looping "hum" is a data smell the author must state aloud. */
  readonly loop: boolean;
}

export interface ParsedAlertBandReservationHz {
  readonly lowHz: number;
  readonly highHz: number;
}

export interface ParsedHumAudioPack {
  readonly schema: typeof HUM_AUDIO_PACK_SCHEMA_ID;
  /** Lowercase-dashed line id, e.g. "shared-web". */
  readonly line: string;
  /** Matches the Ruleset Card's skin.ambientSoundPack value,
   *  e.g. "sound:wall-of-fans" (§8.10 sample-set swap). */
  readonly ambientSampleSet: string;
  readonly alertBandReservationHz: ParsedAlertBandReservationHz;
  readonly voices: Readonly<Record<HumVoiceId, ParsedHumVoice>>;
}

// ── errors (AssetManifestError style — the parser house pattern) ───────────

export class HumAudioPackError extends Error {
  constructor(path: string, message: string) {
    super(`hh-audio-pack invalid at '${path}': ${message}`);
    this.name = "HumAudioPackError";
  }
}

/* ────────────────────────── primitive guards ────────────────────────── */

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new HumAudioPackError(path, `expected an object, got ${describe(value)}`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new HumAudioPackError(path, `expected a string, got ${describe(value)}`);
  }
  return value;
}

function asBoolean(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new HumAudioPackError(path, `expected a boolean, got ${describe(value)}`);
  }
  return value;
}

function asNumber(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new HumAudioPackError(path, `expected a finite number, got ${describe(value)}`);
  }
  return value;
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], path: string): T {
  const raw = asString(value, path);
  for (const candidate of allowed) {
    if (raw === candidate) return candidate;
  }
  throw new HumAudioPackError(
    path,
    `expected one of ${allowed.map((a) => `"${a}"`).join(", ")}, got "${raw}"`,
  );
}

function requireKeys(keys: readonly string[], provided: Record<string, unknown>, path: string): void {
  for (const key of Object.keys(provided)) {
    if (!keys.includes(key)) {
      throw new HumAudioPackError(`${path}.${key}`, `unknown key "${key}" (legal: ${keys.join(", ")})`);
    }
  }
}

/** Exactly-five / exactly-these-keys wall for the voices map. Both halves
 *  of "five separable voices" — no missing diagnosis, no smuggled sixth. */
function requireExactKeys(
  required: readonly string[],
  provided: Record<string, unknown>,
  path: string,
  label: string,
): void {
  for (const key of required) {
    if (!(key in provided)) {
      throw new HumAudioPackError(path, `${label} '${key}' is missing — §8.11 states ${required.length} voices exactly: ${required.join(", ")}`);
    }
  }
  requireKeys(required, provided, path);
}

/* ─────────────────────────── ramp parsing ───────────────────────────── */

const GAIN_MAX = 1;
const PITCH_MAX = 8; // playbackRate sanity wall, not acoustics

interface RampBounds {
  readonly min: number;
  /** true → domain [min, max]; false → domain (min, max] (pitch refuses 0). */
  readonly minInclusive: boolean;
  readonly max: number;
  readonly label: string;
}

function parseRamp(value: unknown, path: string, bounds: RampBounds): ParamRamp {
  const ramp = asRecord(value, path);
  requireKeys(["at0", "at1"], ramp, path);
  const endpoints: Record<string, number> = {};
  for (const key of ["at0", "at1"] as const) {
    const n = asNumber(ramp[key], `${path}.${key}`);
    const belowMin = bounds.minInclusive ? n < bounds.min : n <= bounds.min;
    if (belowMin || n > bounds.max) {
      const domain = `${bounds.minInclusive ? "[" : "("}${bounds.min}, ${bounds.max}]`;
      throw new HumAudioPackError(
        `${path}.${key}`,
        `${bounds.label} endpoint must be within ${domain}, got ${String(n)}`,
      );
    }
    endpoints[key] = n;
  }
  return { at0: endpoints["at0"] as number, at1: endpoints["at1"] as number };
}

function parseGainRamp(value: unknown, path: string): ParamRamp {
  // gain 0 is legal: an archival line's room tone idles near-silent (§8.10).
  return parseRamp(value, path, { min: 0, minInclusive: true, max: GAIN_MAX, label: "gain" });
}

function parsePitchRamp(value: unknown, path: string): ParamRamp {
  // playbackRate 0 would freeze the buffer — silence is gain's job, not pitch's.
  return parseRamp(value, path, { min: 0, minInclusive: false, max: PITCH_MAX, label: "pitch (playbackRate)" });
}

/* ──────────────────────────── id grammars ───────────────────────────── */

const LINE_PATTERN = /^[a-z0-9][a-z0-9-]*$/;
const SAMPLE_SET_PATTERN = /^[a-z0-9][a-z0-9:._-]*$/; // colon-namespace: "sound:wall-of-fans"
const SAMPLE_REF_PATTERN = /^[a-z0-9][a-z0-9._-]*$/; // pack-internal file-ish ref

/* ───────────────────────────── voice parse ──────────────────────────── */

function parseVoice(voice: HumVoiceId, value: unknown): ParsedHumVoice {
  const path = `voices.${voice}`;
  const raw = asRecord(value, path);
  requireKeys(["sample", "bind", "gain", "pitch", "loop"], raw, path);

  const sample = asString(raw["sample"], `${path}.sample`);
  if (!SAMPLE_REF_PATTERN.test(sample)) {
    throw new HumAudioPackError(`${path}.sample`, `sample ref must match ${SAMPLE_REF_PATTERN}, got "${sample}"`);
  }
  const bind = oneOf<TelemetryDimension>(raw["bind"], TELEMETRY_DIMENSIONS, `${path}.bind`);
  const canonical = HUM_VOICE_TELEMETRY[voice];
  if (bind !== canonical) {
    throw new HumAudioPackError(
      `${path}.bind`,
      `'${voice}' binds '${bind}' but §8.11 pins '${canonical}' — the five pairings ` +
        "(fans·load / drives·I/O / CRAC·thermal / UPS·power / room·occupancy) ARE the " +
        "diagnostic contract: a trained player hears WHICH voice changed, so the " +
        "bindings are law, not taste",
    );
  }
  return Object.freeze({
    sample,
    bind,
    gain: parseGainRamp(raw["gain"], `${path}.gain`),
    pitch: parsePitchRamp(raw["pitch"], `${path}.pitch`),
    loop: asBoolean(raw["loop"], `${path}.loop`),
  });
}

/* ──────────────────────────── band reservation ──────────────────────── */

function parseAlertBand(value: unknown): ParsedAlertBandReservationHz {
  const path = "alertBandReservationHz";
  if (value === undefined) {
    throw new HumAudioPackError(
      path,
      "every line MUST state the frequency band reserved for alert tones — §8.11: " +
        '"each line\'s ambient bed must leave the same frequency band free for the ' +
        'alert tones … a stated audio budget, exactly like the colour budget"',
    );
  }
  const band = asRecord(value, path);
  requireKeys(["lowHz", "highHz"], band, path);
  const lowHz = asNumber(band["lowHz"], `${path}.lowHz`);
  const highHz = asNumber(band["highHz"], `${path}.highHz`);
  if (lowHz <= 0) {
    throw new HumAudioPackError(`${path}.lowHz`, `must be a positive Hz value, got ${String(lowHz)}`);
  }
  if (highHz <= lowHz) {
    throw new HumAudioPackError(
      `${path}.highHz`,
      `must exceed lowHz (${String(lowHz)}), got ${String(highHz)}`,
    );
  }
  return Object.freeze({ lowHz, highHz });
}

/* ────────────────────────────── top level ───────────────────────────── */

const TOP_LEVEL_KEYS: readonly string[] = [
  "schema",
  "line",
  "ambientSampleSet",
  "alertBandReservationHz",
  "voices",
];

export function parseHumAudioPack(json: unknown): ParsedHumAudioPack {
  const root = asRecord(json, "<root>");
  requireKeys(TOP_LEVEL_KEYS, root, "<root>");

  oneOf(root["schema"], [HUM_AUDIO_PACK_SCHEMA_ID], "schema");

  const line = asString(root["line"], "line");
  if (!LINE_PATTERN.test(line)) {
    throw new HumAudioPackError("line", `line id must be lowercase-dashed, got "${line}"`);
  }

  const ambientSampleSet = asString(root["ambientSampleSet"], "ambientSampleSet");
  if (!SAMPLE_SET_PATTERN.test(ambientSampleSet)) {
    throw new HumAudioPackError(
      "ambientSampleSet",
      `must match ${SAMPLE_SET_PATTERN} (lowercase, optional colon namespace — the Ruleset ` +
        `Card value form, e.g. "sound:wall-of-fans"), got "${ambientSampleSet}"`,
    );
  }

  const alertBandReservationHz = parseAlertBand(root["alertBandReservationHz"]);

  const voicesRaw = asRecord(root["voices"], "voices");
  requireExactKeys(HUM_VOICES, voicesRaw, "voices", "hum voice");
  const voices = {
    fan: parseVoice("fan", voicesRaw["fan"]),
    drive: parseVoice("drive", voicesRaw["drive"]),
    crac: parseVoice("crac", voicesRaw["crac"]),
    ups: parseVoice("ups", voicesRaw["ups"]),
    room: parseVoice("room", voicesRaw["room"]),
  } satisfies Record<HumVoiceId, ParsedHumVoice>;

  return deepFreezePack({
    schema: HUM_AUDIO_PACK_SCHEMA_ID,
    line,
    ambientSampleSet,
    alertBandReservationHz,
    voices: Object.freeze(voices),
  });
}

function deepFreezePack(pack: ParsedHumAudioPack): ParsedHumAudioPack {
  Object.freeze(pack.alertBandReservationHz);
  for (const voice of HUM_VOICES) {
    const v = pack.voices[voice];
    Object.freeze(v.gain);
    Object.freeze(v.pitch);
    Object.freeze(v);
  }
  return Object.freeze(pack);
}

/* ───────────────────── the mapper, evaluated (pure) ─────────────────── */

/**
 * Evaluate a state→param ramp: the linear map from a normalized telemetry
 * reading (0 = idle, 1 = pegged) to the audio-domain param value. This is
 * where "as DATA" pays out — the pack file carries the shape of the
 * response, this two-line function is the whole interpreter, and a future
 * curved response is a SCHEMA bump, not a silent behavior change.
 *
 * `value01` outside [0, 1] THROWS (fail-fast): the feeding consumer must
 * normalize honestly; clamping here would hide a lying telemetry source.
 * The one-way law applies — the telemetry number arrives FROM a presentation
 * consumer; nothing in this lane writes back into the sim.
 */
export function rampAt(ramp: ParamRamp, value01: number): number {
  if (!(value01 >= 0 && value01 <= 1)) {
    throw new HumAudioPackError(
      "rampAt.value01",
      `telemetry reading must be normalized within [0, 1], got ${String(value01)} — normalize upstream, do not clamp a lie`,
    );
  }
  // Endpoints land EXACTLY on the authored values (no float drift at idle
  // or pegged — the two states a player hears most).
  if (value01 === 0) return ramp.at0;
  if (value01 === 1) return ramp.at1;
  return ramp.at0 + (ramp.at1 - ramp.at0) * value01;
}
