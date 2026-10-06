import { describe, expect, it } from "vitest";

import type { Fixed } from "../../types";
import { FIXED_RAW_MAX, FIXED_RAW_MIN, FIXED_SCALE, div, mul } from "../fixed";

/**
 * FIXED.MULT TRIPWIRES — the original bigint algorithm (verbatim, pre-
 * 2026-10-06) inlined as the test-side ORACLE. The limb fast-path attempt
 * was measured ~30% slower and reverted (see fixed.ts PERF AUDIT), but these
 * ≥10^6-comparison identity tripwires + pinned golden digests stay forever
 * so ANY future mul change is caught against exact semantics, including
 * fail-loud messages.
 */

const MASK = 0xffffffffffffffffn;

/* ── verbatim copy of the oracle semantics (mirrors fixed.ts internals) ── */
function divideRoundHalfAwayOracle(num: bigint, den: bigint): bigint {
  const negative = num < 0n !== den < 0n;
  const absNum = num < 0n ? -num : num;
  const absDen = den < 0n ? -den : den;
  const whole = absNum / absDen;
  const remainderTimesTwo = (absNum % absDen) * 2n;
  const magnitude = remainderTimesTwo >= absDen ? whole + 1n : whole;
  return negative ? -magnitude : magnitude;
}

function mulOracle(a: Fixed, b: Fixed): Fixed {
  const product = a * b;
  const shifted = divideRoundHalfAwayOracle(product, FIXED_SCALE);
  if (shifted > FIXED_RAW_MAX || shifted < FIXED_RAW_MIN) {
    throw new Error(
      `fixed.mul: result ${shifted} overflows Q16.16 raw range [${FIXED_RAW_MIN}, ${FIXED_RAW_MAX}]`,
    );
  }
  return shifted;
}

function u64Hex(values: readonly bigint[]): string {
  const bytes = new Uint8Array(values.length * 8);
  const view = new DataView(bytes.buffer);
  values.forEach((value, index) => view.setBigUint64(index * 8, value & MASK, false));
  let hash = 0xcbf29ce484222325n;
  for (const byte of bytes) {
    hash ^= BigInt(byte);
    hash = (hash * 0x100000001b3n) & MASK;
  }
  return hash.toString(16).padStart(16, "0");
}

function scramble(value: bigint): bigint {
  let z = (value * 0x9e3779b97f4a7c15n) & MASK;
  z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & MASK;
  z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & MASK;
  return (z ^ (z >> 31n)) & MASK;
}

/** mul-vs-oracle on one pair, including throw-message identity. */
function mulEqualsReference(a: bigint, b: bigint): string | null {
  let fastValue: bigint | null = null;
  let fastError: string | null = null;
  try {
    fastValue = mul(a as Fixed, b as Fixed);
  } catch (e) {
    fastError = String(e);
  }
  let refValue: bigint | null = null;
  let refError: string | null = null;
  try {
    refValue = mulOracle(a as Fixed, b as Fixed);
  } catch (e) {
    refError = String(e);
  }
  if (fastError !== null || refError !== null) {
    return fastError === refError ? null : `(${String(a)},${String(b)}) throws differ: ${String(fastError)} vs ${String(refError)}`;
  }
  return fastValue === refValue ? null : `(${String(a)},${String(b)}): fast ${String(fastValue)} ref ${String(refValue)}`;
}

describe("fixed.mul == bigint oracle tripwire", () => {
  it("agrees on every pair in the dense square [−600, 600]² (1,442,401 ≥ 10^6)", () => {
    let compared = 0;
    let firstMismatch = "";
    for (let x = -600; x <= 600; x += 1) {
      for (let y = -600; y <= 600; y += 1) {
        const mismatch = mulEqualsReference(BigInt(x), BigInt(y));
        compared += 1;
        if (mismatch !== null && firstMismatch.length === 0) firstMismatch = mismatch;
      }
    }
    expect(firstMismatch).toBe("");
    expect(compared).toBeGreaterThanOrEqual(1_000_000);
  }, 240_000);

  it("agrees on every pair from the full-domain boundary strata (throws by message)", () => {
    const boundary: readonly bigint[] = [
      0n, 1n, -1n, 2n, -2n, 3n, -3n, 32_767n, 32_768n, 32_769n, -32_768n,
      65_535n, 65_536n, 131_072n, -65_536n, 2n ** 20n, -(2n ** 20n), 2n ** 30n, -(2n ** 30n),
      FIXED_RAW_MAX, FIXED_RAW_MAX - 1n, FIXED_RAW_MIN, FIXED_RAW_MIN + 1n,
      (1n << 31n) + 1n, -(1n << 31n) - 1n, 1n << 40n, -(1n << 40n), (1n << 62n) - 1n,
    ];
    let compared = 0;
    let firstMismatch = "";
    for (const a of boundary) {
      for (const b of boundary) {
        const mismatch = mulEqualsReference(a, b);
        compared += 1;
        if (mismatch !== null && firstMismatch.length === 0) firstMismatch = mismatch;
      }
    }
    expect(firstMismatch).toBe("");
    expect(compared).toBe(boundary.length ** 2);
  }, 120_000);

  it("agrees on a seeded full-domain sweep (rounding-edge products included)", () => {
    let compared = 0;
    let firstMismatch = "";
    for (let k = 0n; k < 60_000n; k += 1n) {
      // Map scrambled bits into the signed raw domain ± near-multiples.
      const sx = scramble(k);
      const sy = scramble(k ^ 0xdeadbeefn);
      const a = BigInt(sx % (1n << 32n)) - (1n << 31n);
      const b = BigInt(sy % (1n << 32n)) - (1n << 31n);
      const mismatch = mulEqualsReference(a, b);
      compared += 1;
      if (mismatch !== null && firstMismatch.length === 0) firstMismatch = mismatch;
      // Half-remainder rounding edges: products whose low 16 bits hit 0x8000.
      const edgeA = a & ~0xffffn; // zero fraction → exact-shift probes
      const edgeB = (b & 0xfffen) | (k % 2n === 0n ? 0x8000n : 0x7fffn);
      if (edgeB >= FIXED_RAW_MIN && edgeB <= FIXED_RAW_MAX) {
        const edgeMismatch = mulEqualsReference(edgeA, edgeB);
        compared += 1;
        if (edgeMismatch !== null && firstMismatch.length === 0) firstMismatch = edgeMismatch;
      }
    }
    expect(firstMismatch).toBe("");
    expect(compared).toBeGreaterThanOrEqual(60_000);
  }, 180_000);
});

/* ───────── pinned pre-rewrite goldens (verbatim capture reproduction) ───────── */

const FIXED_SAMPLES: bigint[] = [];
for (const whole of [-32768, -32767, -2, -1, 0, 1, 2, 32767]) {
  for (const frac of [-65536, -32768, -3, -2, -1, 0, 1, 2, 3, 32767, 32768, 65535]) {
    const raw = BigInt(whole) * 65536n + BigInt(frac);
    if (raw >= -(1n << 31n) && raw <= (1n << 31n) - 1n) FIXED_SAMPLES.push(raw);
  }
}
FIXED_SAMPLES.push(FIXED_RAW_MAX, FIXED_RAW_MIN, 1n, -1n, 32768n, -32768n, 65535n, 2n ** 30n, -(2n ** 30n));

const WIDE: readonly bigint[] = [1n << 31n, -(1n << 31n) - 1n, 1n << 40n, -(1n << 40n), (1n << 62n) - 1n];
const WIDE_B: readonly bigint[] = [1n, 2n, 65536n, -(2n ** 31n), 2n ** 20n];

describe("fixed goldens (pre-limb-rewrite digests, byte-identity law)", () => {
  it("full 100×100 sample grid: mul and div digests and throw counts match", () => {
    expect(FIXED_SAMPLES.length).toBe(100);
    const mulOut: bigint[] = [];
    const divOut: bigint[] = [];
    let mulThrows = 0;
    let divThrows = 0;
    for (const a of FIXED_SAMPLES) {
      for (const b of FIXED_SAMPLES) {
        try {
          mulOut.push(mul(a as Fixed, b as Fixed));
        } catch {
          mulThrows += 1;
          mulOut.push(MASK);
        }
        if (b === 0n) {
          try {
            divOut.push(div(a as Fixed, b as Fixed));
          } catch {
            divThrows += 1;
            divOut.push(MASK);
          }
          continue;
        }
        try {
          divOut.push(div(a as Fixed, b as Fixed));
        } catch {
          divThrows += 1;
          divOut.push(MASK);
        }
      }
    }
    expect(u64Hex(mulOut)).toBe("07f0b1f0c52bfa44");
    expect(u64Hex(divOut)).toBe("7b987ca8f93ca6dc");
    expect(mulThrows).toBe(3309);
    expect(divThrows).toBe(1306);
  }, 120_000);

  it("out-of-domain bigint inputs (fallback path) match, including exact messages", () => {
    const wideOut: bigint[] = [];
    for (const a of WIDE) {
      for (const b of WIDE_B) {
        try {
          wideOut.push(mul(a as Fixed, b as Fixed));
        } catch {
          wideOut.push(MASK);
        }
        try {
          wideOut.push(div(a as Fixed, b as Fixed));
        } catch {
          wideOut.push(MASK);
        }
      }
    }
    expect(u64Hex(wideOut)).toBe("081d11e2a070d85d");
    // Spot-pin the message shape the fallback must preserve verbatim:
    // 2^40 × 2^20 raw → 2^44 downshifted result — genuine Q16.16 overflow.
    expect(() => mul((1n << 40n) as Fixed, (1n << 20n) as Fixed)).toThrow(/fixed\.mul:.*overflows Q16\.16/);
    expect(mul((1n << 40n) as Fixed, 2n as Fixed)).toBe(1n << 25n); // no throw — reference semantics kept
  }, 60_000);
});
