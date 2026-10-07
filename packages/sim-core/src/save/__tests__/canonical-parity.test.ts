/**
 * S-3 — THE cross-lane canonical-codec tripwire.
 *
 * Since commit 34acf18 the canonical machinery is SHARED: save/canonical.ts
 * and replay/canonical.ts are two wrapper encoders over ONE shared walker in
 * src/internal/canonical.ts (workstream boundary: src in save/ may not import
 * replay/, so each lane keeps its own thin wrapper). This file pins the
 * WRAPPER contracts — reporter wording, depth policy, digest domains — of the
 * two encoders, so ANY future divergence between them fails red HERE, in the
 * lane that owns the wrapper.
 *
 * Tests may consume sibling public APIs — both lanes are imported via their
 * package subpaths (`@hh/sim-core/save`, `@hh/sim-core/replay`), i.e. exactly
 * what external consumers see, not internal file plumbing.
 *
 * Scope note: the DIGESTS are deliberately separate domains (save hashes
 * canonical JSON TEXT, replay hashes the canonical BINARY "HHC1" frame — see
 * save/canonical.ts header). What must agree byte-for-byte is the tagged-JSON
 * ENCODER, the cross-decoders, and the shared primitives (UTF-8, FNV-1a-64).
 */

import { describe, expect, it } from "vitest";
import { canonicalJson, fromCanonicalJson, digestSaveValue, fnv1a64Hex as saveFnv1a64Hex, utf8Bytes as saveUtf8Bytes } from "@hh/sim-core/save";
import { decodeCanonicalJson, encodeCanonicalJson, fnv1a64Hex as replayFnv1a64Hex, fnv1a64Text, utf8Encode as replayUtf8Encode } from "@hh/sim-core/replay";
import { founderNode } from "./helpers";

/* ═══════════════════════ adversarial fixture table ═══════════════════════ */

type Fixture = readonly [name: string, value: unknown];

const FIXTURES: readonly Fixture[] = [
  [
    "bigint extremes (µs/µ$ Long-Save magnitudes, int64 walls, beyond-2^53)",
    {
      zero: 0n,
      one: 1n,
      negOne: -1n,
      int64Max: 2n ** 63n - 1n,
      int64Min: -(2n ** 63n),
      beyondSafe: 9007199254740993n,
      colossal: 123456789012345678901234567890n,
      simTimeUs: 1759741445123456n,
      moneyNeg: -42000000n,
    },
  ],
  ["Map insertion order variant A", new Map<string, bigint>([["a", 1n], ["b", 2n], ["c", 3n]])],
  ["Map insertion order variant B (relabelled A — reorder is divergence)", new Map<string, bigint>([["c", 3n], ["a", 1n], ["b", 2n]])],
  ["Set insertion order variant A", new Set<unknown>(["x", 1n, 2, "x".concat("")])],
  ["Set insertion order variant B (dedup + reorder)", new Set<unknown>([2, "x", 1n])],
  [
    "$$-prefixed data strings (tag-escape inversion)",
    ["$", "$$", "$$$", "$i", "$u", "$m", "$s", "$i:5", "$$i", "$$$i", "money$USD", ""],
  ],
  [
    "integer-like and mixed object keys (JS enumeration order vs code-unit sort)",
    { "10": "ten", 2: "two", "1": "one", "01": "oh-one", "-5": "neg", "2e3": "sci", Z: "upper", a: "lower", é: "accent" },
  ],
  [
    "unicode payloads (astral, combining, RTL, ZWJ, NUL-in-string, lone surrogate)",
    { emoji: "🚀 rack-put", cjk: "日本語サーボ", rtl: "مرحبا", combining: "résum\u0065\u0301", zwj: "👨‍👩‍👧", nul: "a\u0000b", loneSurrogate: "\ud800", quoted: 'he said "hi"\\path' },
  ],
  [
    "$-tag-shaped DATA objects (must never be re-read as tags)",
    [{ $i: 5 }, { $i: "5" }, { $m: "not-pairs" }, { $s: {} }, { $u: 9 }, { $i: "5", extra: 1 }, { $z: "unknown-tag" }, { $m: [[1, 2]] }],
  ],
  ["negative zero + float edges (stringifier agreement)", { nz: -0, d: 0.1 + 0.2, exp: 1e21, tiny: 5e-324, max: Number.MAX_VALUE, int: 42 }],
  ["undefined in arrays and as object values", { present: undefined, arr: [undefined, 1, undefined] }],
  ["null, booleans, empty containers", [null, true, false, {}, [], new Map(), new Set(), ""]],
  [
    "deep mixed nest (the Long Save shape zoo)",
    { ticks: [0n, 1n], byId: new Map<EntityShim, { set: Set<bigint> }>([[{ k: "a" }, { set: new Set([1n, 2n]) }]]), tags: { $i: "looks-like-a-tag" }, s: "$$literal" },
  ],
  ["top-level scalars", [undefined, null, true, 0n, "", "plain", 7]],
  ["real founder node (production payload through both forks)", founderNode()],
];

type EntityShim = { k: string };

/* ═══════════════════════ byte-identity + cross-decode stability ═══════════════════════ */

describe("S-3 canonical fork parity — save/canonical.ts ≡ replay/canonical.ts", () => {
  for (const [name, value] of FIXTURES) {
    it(`${name} — both lanes emit byte-identical canonical JSON and cross-decode stably`, () => {
      const saveText = canonicalJson(value);
      const replayText = encodeCanonicalJson(value);
      expect(saveText).toBe(replayText);
      // Each lane's decoder re-encodes the OTHER lane's bytes to the same
      // text: the codecs are interchangeable in both directions.
      expect(canonicalJson(fromCanonicalJson(replayText))).toBe(saveText);
      expect(encodeCanonicalJson(decodeCanonicalJson(saveText))).toBe(replayText);
      // decoded graphs agree under deep equality (bigints, Maps, Sets, order)
      expect(fromCanonicalJson(saveText)).toEqual(decodeCanonicalJson(replayText));
    });
  }

  it("insertion order is content in BOTH lanes (the divergence the pins above guard)", () => {
    const mapA = new Map<string, bigint>([["a", 1n]]);
    mapA.set("b", 2n);
    const mapB = new Map<string, bigint>([["b", 2n]]);
    mapB.set("a", 1n);
    expect(canonicalJson(mapA)).not.toBe(canonicalJson(mapB));
    expect(encodeCanonicalJson(mapA)).not.toBe(encodeCanonicalJson(mapB));
    expect(canonicalJson(mapA)).toBe(encodeCanonicalJson(mapA));
  });

  it("fail-loud parity: non-finite, functions, cycles and unsafe keys rejected by BOTH lanes", () => {
    const cyc: Record<string, unknown> = {};
    cyc["self"] = cyc;
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, () => 0, cyc, JSON.parse('{"__proto__":1}')]) {
      expect(() => canonicalJson(bad)).toThrow();
      expect(() => encodeCanonicalJson(bad)).toThrow();
    }
    expect(() => fromCanonicalJson('{"constructor":1}')).toThrow();
    expect(() => decodeCanonicalJson('{"constructor":1}')).toThrow();
  });

  it("digest primitives fork in lockstep: UTF-8 bytes and FNV-1a-64 identical", () => {
    const samples = ["", "plain", "🚀日本語\u0000", founderNode().identity.name, "µ$1.25/µs", canonicalJson(FIXTURES[0]?.[1])];
    for (const s of samples) {
      const saveBytes = saveUtf8Bytes(s);
      expect(Array.from(saveBytes)).toEqual(replayUtf8Encode(s));
      expect(saveFnv1a64Hex(saveBytes)).toBe(replayFnv1a64Hex(saveBytes));
      expect(saveFnv1a64Hex(saveBytes)).toBe(fnv1a64Text(s));
    }
  });

  it("save digests stay stable through replay's encoder too (fork swap is digest-safe on the text domain)", () => {
    const save = founderNode();
    const viaReplay = decodeCanonicalJson(canonicalJson(save));
    expect(digestSaveValue(viaReplay)).toBe(digestSaveValue(save));
  });
});
