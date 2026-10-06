/**
 * Canonical serializer + digest law tests (§3.4 runtime-neutral discipline):
 * key-shuffle stability, exact bigint, Map insertion-order significance,
 * JSON↔binary cross-decoding, shared digest, and a ×1000 seeded fuzz of
 * both codec variants.
 */

import { describe, expect, it } from "vitest";
import {
  MAX_CANONICAL_DEPTH,
  decodeCanonicalBinary,
  decodeCanonicalJson,
  digestCanonicalValue,
  encodeCanonicalBinary,
  encodeCanonicalJson,
  fnv1a64Hex,
  fnv1a64Text,
  utf8Decode,
  utf8Encode,
} from "../canonical";
import { ReplayError } from "../canonical";
import { diffStates } from "../diff";
import { SeedRng, normalizeSignedZeros, randomCanonicalValue } from "./helpers";

describe("canonical key ordering (digest stability under key-shuffle)", () => {
  const left = { zeta: 1n, alpha: { y: 2n, b: [{ q: 3n }, { a: 4n }] }, mid: "m" };
  const shuffled = { mid: "m", alpha: { b: [{ q: 3n }, { a: 4n }], y: 2n }, zeta: 1n };

  it("JSON variant ignores object-key insertion order", () => {
    expect(encodeCanonicalJson(left)).toBe(encodeCanonicalJson(shuffled));
  });

  it("binary variant ignores object-key insertion order", () => {
    expect([...encodeCanonicalBinary(left)]).toEqual([...encodeCanonicalBinary(shuffled)]);
  });

  it("digest ignores object-key insertion order", () => {
    expect(digestCanonicalValue(left)).toBe(digestCanonicalValue(shuffled));
  });

  it("Map ORDER is content (a reorder is a divergence)", () => {
    const a = new Map([
      ["x", 1n],
      ["y", 2n],
    ]);
    const b = new Map([
      ["y", 2n],
      ["x", 1n],
    ]);
    expect(digestCanonicalValue(a)).not.toBe(digestCanonicalValue(b));
  });
});

describe("canonical bigint & number fidelity", () => {
  it("bigint survives as exact decimal past 2^53 in both variants", () => {
    const huge = 123456789012345678901234567890n;
    expect(decodeCanonicalJson(encodeCanonicalJson({ v: huge }))).toEqual({ v: huge });
    expect(decodeCanonicalBinary(encodeCanonicalBinary({ v: huge }))).toEqual({ v: huge });
  });

  it("negative and zero bigints round-trip", () => {
    for (const value of [0n, -1n, -(2n ** 63n), 2n ** 64n]) {
      expect(decodeCanonicalBinary(encodeCanonicalBinary(value))).toBe(value);
      expect(decodeCanonicalJson(encodeCanonicalJson(value))).toBe(value);
    }
  });

  it("−0 normalises to +0 at encode in BOTH variants — one digest truth (R2)", () => {
    // The JSON wire could never carry the sign (JSON.stringify(-0) === "0"),
    // so the binary encoder normalises too: −0, +0 and JSON/binary
    // round-trips of either share ONE digest. bigint 0 stays distinct.
    const viaJson = decodeCanonicalJson(encodeCanonicalJson(-0)) as number;
    const viaBinary = decodeCanonicalBinary(encodeCanonicalBinary(-0)) as number;
    expect(Object.is(viaJson, -0)).toBe(false);
    expect(viaJson).toBe(0);
    expect(viaBinary).toBe(0);
    expect(digestCanonicalValue(-0)).toBe(digestCanonicalValue(0));
    expect(digestCanonicalValue(viaJson)).toBe(digestCanonicalValue(viaBinary));
    expect(digestCanonicalValue(viaJson)).toBe(digestCanonicalValue(0));
    expect([...encodeCanonicalBinary(-0)]).toEqual([...encodeCanonicalBinary(0)]);
    expect(encodeCanonicalJson({ v: -0 })).toBe(encodeCanonicalJson({ v: 0 }));
    expect(digestCanonicalValue(0)).not.toBe(digestCanonicalValue(0n));
  });

  it("non-finite numbers fail loud (CONVENTIONS §4 float ban)", () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      expect(() => encodeCanonicalJson(bad)).toThrow(ReplayError);
      expect(() => encodeCanonicalBinary(bad)).toThrow(ReplayError);
    }
  });
});

describe("R1 parse-depth ceiling (crafted wire → ReplayError, never RangeError)", () => {
  /** Deep T_ARRAY-of-one chain: 8-byte frame + `levels`×(tag 0x07 + u32 1) + T_NULL. */
  function craftedDeepBinary(levels: number): Uint8Array {
    const bytes = new Uint8Array(8 + levels * 5 + 1);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, 0x4848_4331); // "HHC1"
    view.setUint32(4, 8);
    let pos = 8;
    for (let i = 0; i < levels; i += 1) {
      view.setUint8(pos, 0x07); // T_ARRAY
      view.setUint32(pos + 1, 1); // one element
      pos += 5;
    }
    view.setUint8(pos, 0x00); // T_NULL leaf
    return bytes;
  }

  function plainChain(levels: number, leaf: unknown): unknown {
    let value: unknown = leaf;
    for (let i = 0; i < levels; i += 1) value = { nested: value };
    return value;
  }

  it("crafted ~60 KB deep-nested binary buffer throws ReplayError", () => {
    // 12 000 array levels ≈ 60 KB — exactly the attack shape: pre-cap this
    // stack-overflowed readValue with a raw RangeError.
    expect(craftedDeepBinary(12_000).byteLength).toBeGreaterThan(60_000);
    expect(() => decodeCanonicalBinary(craftedDeepBinary(12_000))).toThrow(ReplayError);
    expect(() => decodeCanonicalBinary(craftedDeepBinary(12_000))).toThrow(/depth cap/);
  });

  it("crafted 200k-nested tagged JSON throws ReplayError (JSON.parse itself is stack-safe)", () => {
    const text = '{"a":'.repeat(200_000) + "1" + "}".repeat(200_000);
    expect(() => JSON.parse(text)).not.toThrow(); // parse survived → OUR recursion must reject
    expect(() => decodeCanonicalJson(text)).toThrow(ReplayError);
    expect(() => decodeCanonicalJson(text)).toThrow(/depth cap/);
  });

  it("nested $m / $s tag chains are capped too (arrow-callback depth threading)", () => {
    // 600-deep Map wrapper: {"$m":[["k", <next>]]} — passing fromTaggedJson
    // BARE to .map() would feed the entry index in as depth, tripping the
    // cap on WIDE maps (or never on deep ones) instead of on true nesting.
    const mapChain = '{"$m":[["k",'.repeat(600) + "1" + "]]}".repeat(600);
    expect(() => decodeCanonicalJson(mapChain)).toThrow(ReplayError);
    const setChain = '{"$s":['.repeat(600) + "1" + "]}".repeat(600);
    expect(() => decodeCanonicalJson(setChain)).toThrow(ReplayError);
    // and legit shallow-but-wide maps never trip the cap
    const wide = new Map(Array.from({ length: 600 }, (_, i) => [`k${i}`, BigInt(i)]));
    expect(() => decodeCanonicalJson(encodeCanonicalJson(wide))).not.toThrow();
  });

  it("ceiling is exact: chain whose deepest value sits at level 512 decodes, 513 rejected (both variants)", () => {
    // depth bookkeeping: root dict 0, Set 1, member chain wrapper i at 1+i,
    // leaf bigint at 2+N for an N-wrapper chain.
    const ok512 = { s: new Set([plainChain(MAX_CANONICAL_DEPTH - 2, 1n)]) }; // leaf at 512
    expect(() => decodeCanonicalBinary(encodeCanonicalBinary(ok512))).not.toThrow();
    expect(() => decodeCanonicalJson(encodeCanonicalJson(ok512))).not.toThrow();
    const bad513 = { s: new Set([plainChain(MAX_CANONICAL_DEPTH - 1, 1n)]) }; // leaf at 513
    expect(() => decodeCanonicalBinary(encodeCanonicalBinary(bad513))).toThrow(/depth cap/);
    expect(() => decodeCanonicalJson(encodeCanonicalJson(bad513))).toThrow(/depth cap/);
  });

  it("legit depth-400 state round-trips BOTH variants with stable digest", () => {
    const state = plainChain(400, { tick: 400n, units: new Map([["u", [1n, -0, 3n]]]) });
    const fromBinary = decodeCanonicalBinary(encodeCanonicalBinary(state));
    const fromJson = decodeCanonicalJson(encodeCanonicalJson(state));
    expect(digestCanonicalValue(fromBinary)).toBe(digestCanonicalValue(state));
    expect(digestCanonicalValue(fromJson)).toBe(digestCanonicalValue(state));
    expect(digestCanonicalValue(fromJson)).toBe(digestCanonicalValue(fromBinary));
    expect(JSON.stringify(diffStates(fromBinary, fromJson).diffs)).toBe("[]");
  });

  it("diffStates caps its walk and its payload compaction (raw deep input)", () => {
    expect(() => diffStates(plainChain(600, 1n), plainChain(600, 2n))).toThrow(ReplayError); // walk recursion
    expect(() => diffStates(plainChain(60_000, 1n), 0)).toThrow(ReplayError); // deep-vs-leaf → compact() payload
    const legit = diffStates(plainChain(400, 1n), plainChain(400, 2n));
    expect(legit.diffs).toHaveLength(1);
    expect((legit.diffs[0] as { path: string }).path.split(".").length).toBe(400);
  });
});

describe("canonical reserved-tag escaping", () => {
  it("tag-shaped data round-trips as data, not tags", () => {
    const tricky = { $i: "5", $$weird: 1n, $: [1n], plain: "no escape" };
    expect(decodeCanonicalJson(encodeCanonicalJson(tricky))).toEqual(tricky);
    expect(decodeCanonicalBinary(encodeCanonicalBinary(tricky))).toEqual(tricky);
    const trickyString = "$i:123";
    expect(decodeCanonicalJson(encodeCanonicalJson(trickyString))).toBe(trickyString);
  });

  it("undefined survives inside objects (JSON would have dropped it)", () => {
    const value = { present: 1n, absent: undefined };
    const json = decodeCanonicalJson(encodeCanonicalJson(value)) as Record<string, unknown>;
    expect("absent" in json).toBe(true);
    expect(json.absent).toBeUndefined();
  });

  it("unsafe prototype keys are rejected at the boundary", () => {
    expect(() => encodeCanonicalJson(JSON.parse('{"__proto__": 1}'))).toThrow(ReplayError);
    expect(() => decodeCanonicalJson('{"__proto__": 1}')).toThrow(ReplayError);
    expect(() => decodeCanonicalBinary(encodeCanonicalBinary({ x: 1 }))).not.toThrow();
  });

  it("cyclic structures fail loud", () => {
    const cyclic: Record<string, unknown> = { a: 1n };
    cyclic.self = cyclic;
    expect(() => encodeCanonicalBinary(cyclic)).toThrow(ReplayError);
    expect(() => encodeCanonicalJson(cyclic)).toThrow(ReplayError);
  });
});

describe("canonical cross-variant equivalence & digest", () => {
  const sample = {
    tick: 7n,
    units: new Map<string, bigint[]>([
      ["u1", [1n, 2n]],
      ["u2", []],
    ]),
    set: new Set(["a", "b"]),
    nested: { deep: [{ x: null }, { y: true }] },
    note: "µ$ é 😀",
  };

  it("binary decodes what JSON encoded (and vice versa)", () => {
    expect(decodeCanonicalBinary(encodeCanonicalBinary(decodeCanonicalJson(encodeCanonicalJson(sample))))).toEqual(sample);
    expect(decodeCanonicalJson(encodeCanonicalJson(decodeCanonicalBinary(encodeCanonicalBinary(sample))))).toEqual(sample);
  });

  it("one digest across variants", () => {
    const viaJson = decodeCanonicalJson(encodeCanonicalJson(sample));
    expect(digestCanonicalValue(viaJson)).toBe(digestCanonicalValue(sample));
  });

  it("digest is 16 lowercase hex and sensitive to one-bit flips", () => {
    const base = digestCanonicalValue({ v: 0xdead_beefn });
    expect(base).toMatch(/^[0-9a-f]{16}$/);
    expect(digestCanonicalValue({ v: 0xdead_befn })).not.toBe(base);
  });

  it("fnv1a64 over text/bytes agrees for empty and known inputs", () => {
    expect(fnv1a64Text("")).toBe(fnv1a64Hex(new Uint8Array([])));
    expect(fnv1a64Text("abc")).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe("hand-rolled UTF-8", () => {
  it("round-trips the full range including astral planes", () => {
    for (const text of ["", "plain", "µ$©中", "😀🎉", "mixed é中😀 end"]) {
      const bytes = new Uint8Array(utf8Encode(text));
      expect(utf8Decode(bytes, 0, bytes.length)).toBe(text);
    }
  });

  it("rejects truncated sequences loud", () => {
    const bytes = new Uint8Array(utf8Encode("é"));
    expect(() => utf8Decode(bytes.subarray(0, 1), 0, 1)).toThrow(ReplayError);
  });
});

describe("×1000 seeded fuzz — codec round-trip, digest stability", () => {
  it("1000 seeded fixtures survive both variants identically", () => {
    const rng = new SeedRng(0xf055edn, "replay-fuzz-canonical");
    for (let i = 0; i < 1000; i += 1) {
      const fixture = randomCanonicalValue(rng, 3 + rng.int(3)); // emits −0 leaves (R2)
      const fromBinary = decodeCanonicalBinary(encodeCanonicalBinary(fixture));
      const fromJson = decodeCanonicalJson(encodeCanonicalJson(fixture));
      // codecs normalise −0→+0 at encode, so structural equality is asserted
      // against the normalised fixture; the digest pair proves one truth.
      const expected = normalizeSignedZeros(fixture);
      expect(fromBinary).toEqual(expected);
      expect(fromJson).toEqual(expected);
      expect(digestCanonicalValue(fromBinary)).toBe(digestCanonicalValue(fixture));
      expect(digestCanonicalValue(fromJson)).toBe(digestCanonicalValue(fixture));
    }
  });
});
