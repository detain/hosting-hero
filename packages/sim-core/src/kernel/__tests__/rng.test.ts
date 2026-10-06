import { describe, expect, it } from "vitest";

import { asEntityId, asRunSeed, type RunSeed } from "../../types";
import { openStream, streamFor } from "../rng";

/**
 * Determinism tests for counter-based streams (MASTER_REPORT §4.1 R-16,
 * §7.0). The scripted sequence below mixes roots, forks, per-entity keys and
 * range() draws; byte-equality across 1000 replays is the same tripwire the
 * CI dual-runtime gate will generalize (RISK-1).
 */

const REPLAY_COUNT = 1000;

function scriptedDraws(seed: RunSeed): number[] {
  const draws: number[] = [];
  for (let minute = 0; minute < 50; minute += 1) {
    const wave = streamFor(seed, "wave", minute);
    for (let i = 0; i < 8; i += 1) draws.push(wave.nextU32());

    const inspect = streamFor(seed, "inspect", minute, asEntityId(`node-${minute % 7}`));
    for (let i = 0; i < 5; i += 1) draws.push(inspect.range(6));

    const director = streamFor(seed, "director", minute).fork("trough");
    draws.push(director.nextU32());

    const parent = streamFor(seed, "outcome", minute);
    draws.push(parent.nextU32());
    const child = parent.fork("bounce"); // forking must consume NOTHING from parent
    draws.push(child.nextU32());
    draws.push(parent.nextU32()); // parent continues at its own counter=2
  }
  return draws;
}

function toBytes(draws: readonly number[]): Uint8Array {
  const bytes = new Uint8Array(draws.length * 4);
  const view = new DataView(bytes.buffer);
  draws.forEach((value, index) => view.setUint32(index * 4, value, false));
  return bytes;
}

/** FNV-1a 64 over bytes → hex. Test-side digest only (kernel stays pure). */
function fnvHex(bytes: Uint8Array): string {
  let hash = 0xcbf29ce484222325n;
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * 0x100000001b3n) & 0xffffffffffffffffn;
  }
  return hash.toString(16).padStart(16, "0");
}

describe("rng: byte-determinism", () => {
  it(`replays the scripted draw sequence identically ${REPLAY_COUNT}×`, () => {
    const seed = asRunSeed(0x0badc0ffeeface55n);
    const reference = fnvHex(toBytes(scriptedDraws(seed)));
    for (let replay = 0; replay < REPLAY_COUNT; replay += 1) {
      expect(fnvHex(toBytes(scriptedDraws(seed)))).toBe(reference);
    }
  });

  it("produces a different byte stream for a different run seed", () => {
    const a = fnvHex(toBytes(scriptedDraws(asRunSeed(1n))));
    const b = fnvHex(toBytes(scriptedDraws(asRunSeed(2n))));
    expect(a).not.toBe(b);
  });

  it("keeps values inside u32", () => {
    for (const value of scriptedDraws(asRunSeed(7n))) {
      expect(Number.isSafeInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(0xffffffff);
    }
  });
});

describe("rng: stream isolation (§4.1 R-16)", () => {
  it("consuming one domain never perturbs another", () => {
    const seed = asRunSeed(42n);
    const routeBefore = streamFor(seed, "route", 9, asEntityId("edge-1"));
    const baseline = Array.from({ length: 100 }, () => routeBefore.nextU32());

    // Heavy unrelated consumption in other domains / minutes / entities.
    const noisy = streamFor(seed, "queue", 9, asEntityId("db-0"));
    for (let i = 0; i < 10_000; i += 1) noisy.range(37);
    for (let minute = 0; minute < 200; minute += 1) {
      streamFor(seed, "bounce", minute).nextU32();
    }

    const routeAfter = streamFor(seed, "route", 9, asEntityId("edge-1"));
    const rerun = Array.from({ length: 100 }, () => routeAfter.nextU32());
    expect(rerun).toEqual(baseline);
  });

  it("advancing one stream never advances another with the same key", () => {
    const seed = asRunSeed(42n);
    const twinA = streamFor(seed, "outcome", 3);
    const twinB = streamFor(seed, "outcome", 3);
    for (let i = 0; i < 50; i += 1) twinA.nextU32();
    expect(twinB.nextU32()).toBe(streamFor(seed, "outcome", 3).nextU32());
    // …and the twins are the same sequence from position 0:
    const freshA = streamFor(seed, "outcome", 3);
    expect(freshA.nextU32()).toBe(streamFor(seed, "outcome", 3).nextU32());
  });

  it("fork extends the domain path and stays positionally stable", () => {
    const seed = asRunSeed(99n);
    const child = streamFor(seed, "outcome", 1).fork("bounce").fork("per-cohort");
    expect(child.key.domain).toBe("outcome/bounce/per-cohort");
    const direct = openStream({ runSeed: seed, domain: "outcome/bounce/per-cohort", simMinute: 1, entityId: null });
    expect(Array.from({ length: 32 }, () => child.nextU32())).toEqual(
      Array.from({ length: 32 }, () => direct.nextU32()),
    );
  });

  it("neighbouring keys decorrelate (no visible structure)", () => {
    const seed = asRunSeed(2026n);
    const d0 = streamFor(seed, "wave", 0).nextU32();
    const d1 = streamFor(seed, "wave", 1).nextU32();
    const e0 = streamFor(seed, "wave", 0, asEntityId("a")).nextU32();
    const e1 = streamFor(seed, "wave", 0, asEntityId("b")).nextU32();
    expect(new Set([d0, d1, e0, e1]).size).toBe(4);
  });
});

describe("rng: range() correctness", () => {
  it("is in-bounds and unbiased enough for gameplay use", () => {
    const stream = streamFor(asRunSeed(5n), "dice", 0);
    const buckets = new Array<number>(6).fill(0);
    const rolls = 60_000;
    for (let i = 0; i < rolls; i += 1) {
      const value = stream.range(6);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(6);
      buckets[value] = (buckets[value] ?? 0) + 1;
    }
    for (const count of buckets) {
      // 10% relative tolerance — modulo bias would show up immediately.
      expect(Math.abs(count - rolls / 6)).toBeLessThan(rolls / 6 / 5);
    }
  });

  it("range(1) always returns 0", () => {
    const stream = streamFor(asRunSeed(6n), "trivial", 0);
    for (let i = 0; i < 100; i += 1) expect(stream.range(1)).toBe(0);
  });

  it("fails loud on invalid n", () => {
    const stream = streamFor(asRunSeed(7n), "trivial", 0);
    expect(() => stream.range(0)).toThrow(/≥ 1/);
    expect(() => stream.range(-3)).toThrow(/≥ 1/);
    expect(() => stream.range(1.5)).toThrow(/≥ 1/);
    expect(() => stream.range(2 ** 31)).toThrow(/2\^31−1/);
  });
});

describe("rng: fail-fast key validation", () => {
  it("rejects empty domains and invalid minutes", () => {
    const seed = asRunSeed(1n);
    expect(() => streamFor(seed, "", 0)).toThrow(/non-empty stable literal/);
    expect(() => streamFor(seed, "wave", -1)).toThrow(/non-negative safe integer/);
    expect(() => streamFor(seed, "wave", 1.5)).toThrow(/non-negative safe integer/);
    expect(() => streamFor(seed, "wave", 0).fork("")).toThrow(/empty fork domain/);
  });
});
