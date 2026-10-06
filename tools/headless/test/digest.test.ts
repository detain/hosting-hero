import { describe, expect, it } from "vitest";

import { canonicalize, decodeCanonical, digestOfCanonical, fnv1a64Hex, fnv1a64HexBigInt, serializeCanonical, stateDigest } from "../src/canonical.ts";

describe("fnv1a64Hex fast path == bigint oracle", () => {
  const vectors = [
    "",
    "a",
    "foobar",
    "chained|digest|with|pipes|and|12345678901234567890",
    JSON.stringify({ tick: 987, cashFree: "9950000000000", map: [1, 2, 3, true, null] }),
    "unicode ✿ mixed \u0000\u0001 surrogate emoji 漢字",
    "cbf29ce484222325af63dc4c8601ec8c0123456789abcdef0123456789abcdef",
  ];
  it("bit-identical on every vector (long inputs stress the limb carry)", () => {
    for (const v of vectors) expect(fnv1a64Hex(v)).toBe(fnv1a64HexBigInt(v));
  });
});

describe("canonical encoder", () => {
  it("sorts object keys regardless of insertion order", () => {
    const a = canonicalize({ z: 1, a: 2, m: { y: 3, b: 4 } }, "$");
    const b = canonicalize({ m: { b: 4, y: 3 }, a: 2, z: 1 }, "$");
    expect(serializeCanonical(a)).toBe(serializeCanonical(b));
  });

  it("preserves Map insertion order (the contract's only iteration order)", () => {
    const m1 = new Map<string, number>([
      ["x", 1],
      ["y", 2],
    ]);
    const m2 = new Map<string, number>([
      ["y", 2],
      ["x", 1],
    ]);
    expect(serializeCanonical(canonicalize(m1, "$"))).not.toBe(serializeCanonical(canonicalize(m2, "$")));
  });

  it("tags bigints exactly (no precision loss at 2^64+)", () => {
    const huge = 18446744073709551617n; // 2^64 + 1
    const encoded = serializeCanonical(canonicalize(huge, "$"));
    expect(encoded).toContain('"#bi":"18446744073709551617"');
    expect(decodeCanonical(JSON.parse(encoded), "$")).toBe(huge);
  });

  it("rejects floats reaching state — fail loud, name the path", () => {
    expect(() => canonicalize({ ok: 1.5 }, "$")).toThrow(/non-integer number at \$\.ok/);
  });

  it("rejects undefined members but skips optional-absent keys", () => {
    expect(() => canonicalize([undefined], "$")).toThrow(/undefined at \$\[0\]/);
    expect(serializeCanonical(canonicalize({ a: 1, b: undefined }, "$"))).toBe('{"a":1}');
  });

  it("round-trips decode → canonicalize idempotently", () => {
    const value = { list: [1n, 2n], map: new Map<string, bigint>([["k", 9n]]), flag: true };
    const tree = canonicalize(value, "$");
    const decoded = decodeCanonical(JSON.parse(serializeCanonical(tree)), "$");
    expect(digestOfCanonical(canonicalize(decoded, "$"))).toBe(digestOfCanonical(tree));
  });

  it("digest has stable shape: 32 lowercase hex", () => {
    const hex = digestOfCanonical(canonicalize({ anything: 1n }, "$"));
    expect(hex).toMatch(/^[0-9a-f]{32}$/);
  });

  it("FNV-1a 64 is a known-answer function (fixed vectors)", () => {
    // Computed offline from the same spec (offset basis / prime, UTF-16 units).
    expect(fnv1a64Hex("")).toBe("cbf29ce484222325"); // empty input = offset basis
    expect(fnv1a64Hex("a")).toBe("af63dc4c8601ec8c"); // classic FNV-1a/64 vector
  });
});

describe("stateDigest determinism (engine state surface)", () => {
  const sampleState = () => ({
    runSeed: 12345n,
    context: { tick: 7n, minute: 7, clocks: { realUs: 7_000_000n, simUs: 420_000_000n, businessUs: 1n, wallUs: 1n } },
    units: new Map<string, { id: string; patienceUs: bigint }>([["u1", { id: "u1", patienceUs: 800_000n }]]),
    observed: new Map<string, { value: bigint | null; status: string }>([["edge::util", { value: 4_587n, status: "live" }]]),
    cash: { free: 9_950_000_000n },
    ledgerSeq: 3,
  });

  it("same content → same digest across repeated constructions", () => {
    const h1 = stateDigest(sampleState());
    const h2 = stateDigest(sampleState());
    expect(h1).toBe(h2);
  });

  it("one bigint bit changes everything (avalanche-ish sanity)", () => {
    const base = sampleState();
    const other = sampleState();
    other.cash.free += 1n;
    expect(stateDigest(base)).not.toBe(stateDigest(other));
  });

  it("Map reinsertion order is a REAL state change (must differ)", () => {
    const m1 = new Map([
      ["a", 1n],
      ["b", 2n],
    ]);
    const m2 = new Map([
      ["b", 2n],
      ["a", 1n],
    ]);
    expect(stateDigest(m1)).not.toBe(stateDigest(m2));
  });
});
