/**
 * `hh-audio-pack@1` contract law (ADR-0008 lane 3) — the parser is the
 * prosecutor: §8.10's sample-set swap, §8.11's five canonical hum voices
 * and the MANDATORY alert-band reservation each get their red card here.
 * Deep-frozen outputs; the mapper is evaluated as data, never interpreted
 * from prose.
 */
import { describe, expect, it } from "vitest";
import {
  HUM_AUDIO_PACK_SCHEMA_ID,
  HUM_VOICE_TELEMETRY,
  HUM_VOICES,
  HumAudioPackError,
  parseHumAudioPack,
  rampAt,
  type ParamRamp,
  type ParsedHumAudioPack,
} from "../packs";

function voice(bind: string, over: Record<string, unknown> = {}) {
  return {
    sample: `${bind}-loop`,
    bind,
    gain: { at0: 0.2, at1: 0.9 },
    pitch: { at0: 1, at1: 1.4 },
    loop: true,
    ...over,
  };
}

function validPack(): Record<string, unknown> {
  return {
    schema: HUM_AUDIO_PACK_SCHEMA_ID,
    line: "shared-web",
    ambientSampleSet: "sound:wall-of-fans",
    alertBandReservationHz: { lowHz: 2000, highHz: 5000 },
    voices: {
      fan: voice("load"),
      drive: voice("io", { sample: "drive-seek-chatter" }),
      crac: voice("thermal"),
      ups: voice("power", { pitch: { at0: 0.98, at1: 1.02 } }),
      room: voice("occupancy", { gain: { at0: 0, at1: 0.35 } }), // near-silent idle is legal (§8.10 archival)
    },
  };
}

function mutate(doc: Record<string, unknown>, path: string[], value: unknown): void {
  let node: Record<string, unknown> = doc;
  for (const key of path.slice(0, -1)) {
    node = node[key] as Record<string, unknown>;
  }
  const last = path[path.length - 1] as string;
  if (value === DELETE) delete node[last];
  else node[last] = value;
}

const DELETE = Symbol("delete");

function parseMutated(path: string[], value: unknown): () => ParsedHumAudioPack {
  return () => {
    const doc = validPack();
    mutate(doc, path, value);
    return parseHumAudioPack(doc);
  };
}

describe("a compliant pack parses to a trusted, deep-frozen contract", () => {
  const pack = parseHumAudioPack(validPack());

  it("carries the §8.10 sample-set swap identity", () => {
    expect(pack.schema).toBe("hh-audio-pack@1");
    expect(pack.line).toBe("shared-web");
    expect(pack.ambientSampleSet).toBe("sound:wall-of-fans"); // Ruleset Card skin.ambientSoundPack form
  });

  it("states the §8.11 alert-band reservation", () => {
    expect(pack.alertBandReservationHz).toEqual({ lowHz: 2000, highHz: 5000 });
  });

  it("holds EXACTLY the five hum voices on their canonical telemetry bindings", () => {
    expect(Object.keys(pack.voices)).toEqual([...HUM_VOICES]);
    expect(HUM_VOICE_TELEMETRY).toEqual({
      fan: "load",
      drive: "io",
      crac: "thermal",
      ups: "power",
      room: "occupancy",
    });
    for (const id of HUM_VOICES) {
      expect(pack.voices[id].bind).toBe(HUM_VOICE_TELEMETRY[id]);
    }
    expect(pack.voices.room.gain.at0).toBe(0); // a silent-at-idle line parses
  });

  it("is deep-frozen: every write path throws (ESM strict mode)", () => {
    expect(Object.isFrozen(pack)).toBe(true);
    expect(Object.isFrozen(pack.voices)).toBe(true);
    expect(Object.isFrozen(pack.voices.fan)).toBe(true);
    expect(Object.isFrozen(pack.voices.fan.gain)).toBe(true);
    expect(Object.isFrozen(pack.alertBandReservationHz)).toBe(true);
    expect(() => {
      (pack as { line: string }).line = "lied-about";
    }).toThrow(TypeError);
    expect(() => {
      (pack.voices.fan.gain as ParamRamp & { at0: number }).at0 = 5;
    }).toThrow(TypeError);
  });
});

describe("strict parse — every shortcut gets a named red card", () => {
  it("unknown keys die at root, voice, and band levels alike", () => {
    expect(parseMutated(["volumes"], {})).toThrowError(/unknown key "volumes"/);
    expect(parseMutated(["voices", "fan", "tremolo"], 3)).toThrowError(/unknown key "tremolo"/);
    expect(parseMutated(["alertBandReservationHz", "centerHz"], 3400)).toThrowError(/unknown key "centerHz"/);
  });

  it("a missing alert-band reservation names the §8.11 audio-budget law", () => {
    expect(parseMutated(["alertBandReservationHz"], DELETE)).toThrowError(
      /every line MUST state the frequency band reserved for alert tones/,
    );
    expect(parseMutated(["alertBandReservationHz"], DELETE)).toThrowError(HumAudioPackError);
  });

  it("a band that is not an ordered positive range is refused", () => {
    expect(parseMutated(["alertBandReservationHz", "lowHz"], 0)).toThrowError(/positive Hz/);
    expect(parseMutated(["alertBandReservationHz", "lowHz"], -400)).toThrowError(/positive Hz/);
    expect(parseMutated(["alertBandReservationHz", "highHz"], 2000)).toThrowError(/must exceed lowHz/);
    expect(parseMutated(["alertBandReservationHz", "highHz"], "loud")).toThrowError(/expected a finite number/);
  });

  it("the five voices are EXACTLY five — no missing diagnosis, no smuggled sixth", () => {
    expect(parseMutated(["voices", "room"], DELETE)).toThrowError(
      /§8.11 states 5 voices exactly: fan, drive, crac, ups, room/,
    );
    expect(parseMutated(["voices", "pump"], voice("load"))).toThrowError(/unknown key "pump"/);
  });

  it("a re-bound voice is refused — the bindings ARE the diagnostic contract", () => {
    expect(parseMutated(["voices", "fan", "bind"], "io")).toThrowError(/invalid at 'voices\.fan\.bind'/);
    expect(parseMutated(["voices", "fan", "bind"], "io")).toThrowError(
      /diagnostic contract: a trained player hears WHICH voice changed/,
    );
    expect(parseMutated(["voices", "ups", "bind"], "thermal")).toThrowError(/'ups' binds 'thermal' but §8.11 pins 'power'/);
  });

  it("ramp domains: gain [0,1] incl. silence; pitch (0,8] — playbackRate 0 freezes a buffer", () => {
    expect(parseMutated(["voices", "fan", "gain", "at1"], 1.2)).toThrowError(/gain endpoint must be within \[0, 1\]/);
    expect(parseMutated(["voices", "fan", "gain", "at0"], -0.01)).toThrowError(/gain endpoint/);
    expect(parseMutated(["voices", "drive", "pitch", "at0"], 0)).toThrowError(/pitch \(playbackRate\) endpoint must be within \(0, 8\]/);
    expect(parseMutated(["voices", "drive", "pitch", "at1"], 9)).toThrowError(/pitch \(playbackRate\) endpoint/);
    expect(parseMutated(["voices", "crac", "gain", "at1"], "louder")).toThrowError(/expected a finite number/);
    expect(parseMutated(["voices", "crac", "pitch", "at1"], Number.NaN)).toThrowError(/expected a finite number/);
  });

  it("loop is REQUIRED — a silent default would hide a non-continuous 'hum'", () => {
    expect(parseMutated(["voices", "room", "loop"], DELETE)).toThrowError(/expected a boolean/);
    expect(parseMutated(["voices", "room", "loop"], "true")).toThrowError(/expected a boolean/);
    const doc = validPack();
    (doc.voices as Record<string, unknown>)["room"] = voice("occupancy", { loop: false });
    expect(parseHumAudioPack(doc).voices.room.loop).toBe(false); // explicit false is honest data
  });

  it("schema, line and sample-set grammars are enforced, not admired", () => {
    expect(parseMutated(["schema"], "hh-audio-pack@2")).toThrowError(/expected one of "hh-audio-pack@1"/);
    expect(parseMutated(["line"], "Shared_Web")).toThrowError(/lowercase-dashed/);
    expect(parseMutated(["ambientSampleSet"], "SOUNDS!")).toThrowError(/ambientSampleSet/);
    expect(parseMutated(["ambientSampleSet"], "")).toThrowError(/ambientSampleSet/);
    expect(parseMutated(["voices", "fan", "sample"], "../escape")).toThrowError(/sample ref/);
  });

  it("non-object roots fail loud with the parser's own error type", () => {
    expect(() => parseHumAudioPack(null)).toThrowError(HumAudioPackError);
    expect(() => parseHumAudioPack([])).toThrowError(/expected an object, got array/);
    expect(() => parseHumAudioPack("hum")).toThrowError(/expected an object, got string/);
  });
});

describe("rampAt — the state→param mapper, evaluated (the DATA pays out)", () => {
  const ramp: ParamRamp = Object.freeze({ at0: 0.2, at1: 0.9 });

  it("interpolates linearly across the normalized telemetry reading", () => {
    expect(rampAt(ramp, 0)).toBe(0.2);
    expect(rampAt(ramp, 1)).toBe(0.9);
    expect(rampAt(ramp, 0.5)).toBeCloseTo(0.55, 12);
    expect(rampAt(ramp, 0.25)).toBeCloseTo(0.375, 12);
  });

  it("handles descending ramps too (identity falls, e.g. a cooling voice easing off)", () => {
    const down: ParamRamp = Object.freeze({ at0: 1.4, at1: 0.98 });
    expect(rampAt(down, 1)).toBe(0.98);
    expect(rampAt(down, 0.5)).toBeCloseTo(1.19, 12);
  });

  it("refuses out-of-domain readings — normalize upstream, do not clamp a lie", () => {
    expect(() => rampAt(ramp, -0.0001)).toThrowError(/normalize upstream, do not clamp a lie/);
    expect(() => rampAt(ramp, 1.01)).toThrowError(/normalized within \[0, 1\]/);
    expect(() => rampAt(ramp, Number.NaN)).toThrowError(/normalized within \[0, 1\]/);
  });

  it("end-to-end: a parsed pack drives every voice's gain and pitch at pegged load", () => {
    const pack = parseHumAudioPack(validPack());
    const fan = pack.voices.fan;
    expect(rampAt(fan.gain, 1)).toBe(0.9);
    expect(rampAt(fan.pitch, 1)).toBeCloseTo(1.4, 12);
    expect(rampAt(pack.voices.room.gain, 0)).toBe(0); // archival-silent at idle
  });
});
