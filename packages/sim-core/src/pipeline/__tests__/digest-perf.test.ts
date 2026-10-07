/**
 * Differential oracle for the digest limbs fast path (perf audit rec #1) —
 * the same discipline as kernel/rng-oracle.test.ts pins the splitmix64 limbs:
 * a BIGINT REFERENCE implementation (the pre-port sink, mirrored verbatim
 * below from git history at the golden-capture commit) run against the LIVE
 * limb sink over 100k+ random code-point strings and 100k+ random bigints.
 *
 * Where the two ever disagree, the limb port is wrong: the guard boundaries
 * (2^32, 2^40 shift cut, 2^64 mask wrap, negatives, lone/paired surrogates,
 * the ∅ sentinel, the "#" tag) are exactly where a fast path hides a drift.
 */

import { describe, expect, it } from "vitest";
import { Sink } from "../digest-limbs";

/* ─────────────── pre-port bigint sink (verbatim reference) ─────────────── */

const MASK64 = (1n << 64n) - 1n;
const FNV_OFFSET = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const SALT_B = 0x9e3779b97f4a7c15n;

class ReferenceSink {
  private a = FNV_OFFSET;
  private b = (FNV_OFFSET ^ SALT_B) & MASK64;

  feed(value: bigint): this {
    this.a = ((this.a ^ (value & MASK64)) * FNV_PRIME) & MASK64;
    // signed shift for the high lane so negatives spread too (>> keeps sign).
    this.b = ((this.b ^ ((value >> 40n) & MASK64)) * FNV_PRIME) & MASK64;
    return this;
  }

  text(value: string): this {
    for (const ch of value) {
      this.feed(BigInt(ch.codePointAt(0) as number));
    }
    this.feed(0n); // terminator so "ab"+"c" ≠ "a"+"bc"
    return this;
  }

  int(value: bigint | number): this {
    this.feed(35n); // "#" type tag — numbers never collide with text streams
    this.feed(BigInt(value));
    return this;
  }

  bool(value: boolean): this {
    return this.int(value ? 1n : 0n);
  }

  nullableText(value: string | null | undefined): this {
    if (value === null || value === undefined) return this.text("∅");
    return this.text(value);
  }

  hex(): string {
    const hi = this.a.toString(16).padStart(16, "0");
    const lo = this.b.toString(16).padStart(16, "0");
    return `${hi}${lo}`;
  }
}

/* ───────────────────── deterministic code-point source ─────────────────── */

/** splitmix64 — deterministic across engines, no platform crypto; the ONLY
 *  job here is dense, reproducible coverage of the input space. */
function makeRng(seed: bigint): () => bigint {
  let state = seed & MASK64;
  return () => {
    state = (state + 0x9e3779b97f4a7c15n) & MASK64;
    let z = state;
    z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK64;
    z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK64;
    return (z ^ (z >> 31n)) & MASK64;
  };
}

/** Bands deliberately include the raw surrogate range (0xD800–0xDFFF): a
 *  code point there becomes a LONE surrogate code unit in the string, which
 *  the limb text() must hash as itself (for..of/codePointAt semantics). */
const CODEPOINT_BANDS: readonly [lo: number, hi: number][] = [
  [0x20, 0x7e], // printable ASCII (the common case)
  [0x0, 0x1f], // controls incl. NUL
  [0x80, 0x7ff], // latin supplement / greek / CJK punctuation
  [0x2000, 0xd7ff], // BMP proper (incl. ∅ at 0x2205)
  [0xd800, 0xdfff], // UNPAIRED surrogates as themselves
  [0xe000, 0xfffd], // private use + odd marks
  [0x10000, 0x10ffff], // astral planes (surrogate PAIRS)
];

function randomCodepointString(next: () => bigint): string {
  const r = next();
  const length = Number(r % 49n); // 0..48 code points
  const bandRoll = r >> 8n;
  const parts: string[] = [];
  for (let i = 0; i < length; i += 1) {
    const pick = next();
    const band = CODEPOINT_BANDS[Number((bandRoll + BigInt(i)) % BigInt(CODEPOINT_BANDS.length))] as [number, number];
    const cp = band[0] + Number(pick % BigInt(band[1] - band[0] + 1));
    parts.push(String.fromCodePoint(cp));
  }
  return parts.join("");
}

function randomBigint(next: () => bigint): bigint {
  const magnitude = next();
  const shift = next() % 129n; // 0..128 bits — spans Lt32, 2^40 cut, 2^63, MASK64, wrap
  const value = magnitude >> shift;
  const negative = (magnitude >> 63n) & 1n;
  return negative === 1n ? -value - 1n : value;
}

/* ─────────────────────────────── oracles ───────────────────────────────── */

describe("digest limbs sink ≡ pre-port bigint sink (differential oracle)", { timeout: 60_000 }, () => {
  it("100k random code-point strings: text() feeds agree every 1000th", () => {
    const next = makeRng(0xd16e57a1cb3f00d1n);
    const limb = new Sink();
    const reference = new ReferenceSink();
    for (let i = 0; i < 100_000; i += 1) {
      const s = randomCodepointString(next);
      limb.text(s);
      reference.text(s);
      if (i % 1000 === 999) {
        expect(limb.hex(), `after ${String(i + 1)} strings`).toBe(reference.hex());
      }
    }
    expect(limb.hex()).toBe(reference.hex());
  });

  it("2k single-string sinks: fresh-sink text() hexes agree per string", () => {
    const next = makeRng(0x51ee7c0de5bed15en);
    for (let i = 0; i < 2_000; i += 1) {
      const s = randomCodepointString(next);
      expect(new Sink().text(s).hex(), `string ${String(i)} (${s.length} units)`).toBe(
        new ReferenceSink().text(s).hex(),
      );
    }
  });

  it("100k random bigints (negatives, ≥2^64, shift-cut ±): feed() agrees", () => {
    const next = makeRng(0xfeedfacecafebabEn);
    const limb = new Sink();
    const reference = new ReferenceSink();
    for (let i = 0; i < 100_000; i += 1) {
      const v = randomBigint(next);
      limb.feed(v);
      reference.feed(v);
      if (i % 1000 === 999) {
        expect(limb.hex(), `after ${String(i + 1)} bigints`).toBe(reference.hex());
      }
    }
    expect(limb.hex()).toBe(reference.hex());
  });

  it("mixed int()/bool()/nullableText()/text() sequences (500 rounds) agree", () => {
    const next = makeRng(0x9e3779b97f4a7c57n);
    for (let round = 0; round < 500; round += 1) {
      const limb = new Sink();
      const reference = new ReferenceSink();
      const ops = 20 + Number(next() % 60n);
      for (let i = 0; i < ops; i += 1) {
        const pick = Number(next() % 5n);
        if (pick === 0) {
          const v = randomBigint(next);
          limb.int(v);
          reference.int(v);
        } else if (pick === 1) {
          const n = Number(next() % 4_294_967_296n);
          limb.int(n);
          reference.int(n);
        } else if (pick === 2) {
          const flag = (next() & 1n) === 1n;
          limb.bool(flag);
          reference.bool(flag);
        } else if (pick === 3) {
          const maybe = (next() % 4n) === 0n ? null : (next() % 7n) === 0n ? undefined : randomCodepointString(next);
          limb.nullableText(maybe);
          reference.nullableText(maybe);
        } else {
          const s = randomCodepointString(next);
          limb.text(s);
          reference.text(s);
        }
      }
      expect(limb.hex(), `round ${String(round)}`).toBe(reference.hex());
    }
  });

  it("guard boundary census: every structural edge feeds identically", () => {
    const edges: readonly bigint[] = [
      0n,
      1n,
      34n,
      35n, // the "#" tag value
      36n,
      0x10fffcn, // max code point
      0x1_0000_0000n - 1n, // guard boundary − 1 (fast path top)
      0x1_0000_0000n, // guard boundary (general path floor)
      0xff_ffff_ffffn, // 2^40 − 1 (>> 40n still 0)
      0x100_0000_0000n, // 2^40 (lane b first blood)
      0x7fff_ffff_ffff_ffffn,
      0x8000_0000_0000_0000n,
      0xffff_ffff_ffff_ffffn, // MASK64 full
      0x1_0000_0000_0000_0000n, // 2^64 (lane a wraps, lane b = 2^24)
      -(0x1_0000_0000_0000_0000n), // −2^64
      -1n, // all-ones in both lanes
      -(1n << 127n),
      1n << 200n,
    ];
    for (const v of edges) {
      expect(new Sink().feed(v).hex(), `edge ${String(v)}`).toBe(new ReferenceSink().feed(v).hex());
      expect(new Sink().int(v).hex(), `int ${String(v)}`).toBe(new ReferenceSink().int(v).hex());
    }
  });

  it("surrogate-pair census: astral, lone-high, lone-low, trailing-high", () => {
    const high = String.fromCharCode(0xd83d);
    const low = String.fromCharCode(0xde00);
    const samples = [
      `${high}${low}`, // valid pair = one astral code point
      `${high}${high}${low}`, // lone high then pair
      `${low}${high}`, // lone low then lone high
      `${high}`, // trailing lone high
      `${low}`, // leading lone low
      `a${high}b`, // high surrounded by BMP
      `${high}${"\u0041"}`, // high followed by non-low
      "😀-🚀",
    ];
    for (const s of samples) {
      expect(new Sink().text(s).hex(), `text ${s.length} units`).toBe(new ReferenceSink().text(s).hex());
    }
  });

  it("limb path is faster than the bigint reference on the same workload", () => {
    // Node ambient is deliberately NOT declared globally (sibling stubs own
    // `process` with narrower types) — probe it through globalThis instead.
    const nodeProcess = (globalThis as {
      process?: { readonly hrtime: { bigint(): bigint } };
    }).process;
    if (nodeProcess === undefined) throw new Error("perf smoke requires the Node process global");
    const nowUs = (): bigint => nodeProcess.hrtime.bigint();
    const next = makeRng(0xb100babe12345678n);
    const strings = Array.from({ length: 20_000 }, () => randomCodepointString(next));
    const runLimb = (): string => {
      const s = new Sink();
      for (const t of strings) s.text(t);
      return s.hex();
    };
    const runRef = (): string => {
      const s = new ReferenceSink();
      for (const t of strings) s.text(t);
      return s.hex();
    };
    runLimb();
    runRef(); // warm both paths (also asserts equality of the warm-up result)
    expect(runLimb()).toBe(runRef());
    const t0 = nowUs();
    runLimb();
    const limbMs = Number(nowUs() - t0) / 1e6;
    const t1 = nowUs();
    runRef();
    const refMs = Number(nowUs() - t1) / 1e6;
    // Soft law: the whole point of the port. (Reported, and a floor 2× off
    // the measured ~10× catches a regression that re-introduces bigint.)
    expect(limbMs, `limb ${String(limbMs.toFixed(1))}ms vs bigint ${String(refMs.toFixed(1))}ms`).toBeLessThan(refMs);
  });
});
