import { describe, expect, it } from "vitest";

import { asEntityId, asRunSeed, type RunSeed } from "../../types";
import { streamFor } from "../rng";

/**
 * GOLDEN DIGEST TRIPWIRE — every hex value below was captured from the
 * ORIGINAL bigint kernel (pre-32-bit-limb rewrite, 2026-10-06) with the
 * exact scripts reproduced below. The rewrite mandated BIT-IDENTICAL stream
 * outputs; these pins keep that promise enforced forever against any future
 * kernel change. If one of these moves, replayed saves are poisoned.
 */

const MASK = 0xffffffffffffffffn;

function fnvHex(bytes: Uint8Array): string {
  let hash = 0xcbf29ce484222325n;
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * 0x100000001b3n) & MASK;
  }
  return hash.toString(16).padStart(16, "0");
}

function u32Hex(values: readonly number[]): string {
  const bytes = new Uint8Array(values.length * 4);
  const view = new DataView(bytes.buffer);
  values.forEach((value, index) => view.setUint32(index * 4, value, false));
  return fnvHex(bytes);
}

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
    const child = parent.fork("bounce");
    draws.push(child.nextU32());
    draws.push(parent.nextU32());
  }
  return draws;
}

const GOLDEN_SCRIPTED: Readonly<Record<string, string>> = {
  "0x0badc0ffeeface55": "ed53f6be5a6988b7",
  "0x1": "0c3a2a8fcd3428e7",
  "0x2": "f1b4f4c146ce2a21",
  "0x7": "271337432940a9ae",
  "0x2a": "224d8fdd087a1019",
  "0x63": "71881bd398ddb1f7",
  "0x7ea": "c2608839e7be5104",
  "0xffffffffffffffff": "c9c7614906cc970d",
  "0x8000000000000000": "9b4940bbe30f3c63",
  "0x0": "7ff8c06802efaa10",
  "0xdeadbeefcafebabe": "ecffa039c744b270",
};

const DOMAINS: readonly string[] = [
  "wave",
  "inspect/deep/nested",
  "a",
  "漢字ドメイン-ünicode",
  "emoji-\u{1f600}-tail",
  "x".repeat(300),
  "domain\u0001with\u0000nulls",
  "ÄÖÜß",
  "key:minute:queue",
  "bounce",
];
const ENTITIES: readonly (string | null)[] = [null, "unit-0", "node-17", "漢字id", "\u{1f680}rocket", "a".repeat(500)];

function matrixDraws(): number[] {
  const draws: number[] = [];
  for (const seedHex of ["0x11", "0x22", "0x3333333333333333", "0x7fffffffffffffff"]) {
    const seed = asRunSeed(BigInt(seedHex));
    for (const domain of DOMAINS) {
      for (const minute of [0, 1, 61, 4096, 1_000_003, 2_147_483_647]) {
        for (const entity of ENTITIES) {
          const stream = streamFor(seed, domain, minute, entity === null ? null : asEntityId(entity));
          for (let c = 0; c < 17; c += 1) draws.push(stream.nextU32());
          let node = stream;
          for (const part of ["f1", "f2"]) {
            node = node.fork(part);
            draws.push(node.nextU32());
          }
        }
      }
    }
  }
  // Long-counter stream (64-bit accumulator carry/wrap coverage).
  const wrap = streamFor(asRunSeed(0xa5a5a5a5a5a5a5a5n), "wrap", 0);
  for (let c = 0; c < 100_001; c += 1) draws.push(wrap.nextU32());
  return draws;
}

function matrixRanges(): number[] {
  const ranges: number[] = [];
  for (const seedHex of ["0x11", "0x22", "0x3333333333333333", "0x7fffffffffffffff"]) {
    const seed = asRunSeed(BigInt(seedHex));
    for (const domain of DOMAINS) {
      for (const minute of [0, 1, 61, 4096, 1_000_003, 2_147_483_647]) {
        for (const entity of ENTITIES) {
          const stream = streamFor(seed, domain, minute, entity === null ? null : asEntityId(entity));
          for (let c = 0; c < 17; c += 1) stream.nextU32(); // advance to range position
          for (const n of [1, 2, 3, 7, 100, 1_000, 2 ** 30, 2 ** 31 - 1]) {
            ranges.push(stream.range(n));
          }
        }
      }
    }
  }
  return ranges;
}

function nearKeyDraws(): number[] {
  const draws: number[] = [];
  const seed = asRunSeed(0x0badc0ffeeface55n);
  for (let m = 0; m < 5_000; m += 1) {
    draws.push(streamFor(seed, "probe", m).nextU32());
    draws.push(streamFor(seed, "probe", m, asEntityId(`e${String(m % 97)}`)).nextU32());
  }
  return draws;
}

describe("rng golden digests (pre-limb-rewrite values, byte-identity law)", () => {
  it("scripted sequences match the pre-rewrite digests for 11 seeds", () => {
    for (const [hex, expected] of Object.entries(GOLDEN_SCRIPTED)) {
      expect(u32Hex(scriptedDraws(asRunSeed(BigInt(hex))))).toBe(expected);
    }
  });

  it("wide unicode/entity/fork matrix matches its golden digest", () => {
    expect(u32Hex(matrixDraws())).toBe("7f647bd36b3edf16");
  });

  it("range() matrix matches its golden digest", () => {
    expect(u32Hex(matrixRanges())).toBe("9b6ac96aa9dff9ad");
  });

  it("near-key avalanche probe matches its golden digest", () => {
    expect(u32Hex(nearKeyDraws())).toBe("7098f6e295ab7da3");
  });
});
