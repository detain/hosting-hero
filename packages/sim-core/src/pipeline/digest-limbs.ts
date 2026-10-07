/**
 * The digest sink — 128-bit double-FNV-1a with the two 64-bit lanes held as
 * unsigned 32-bit limb pairs, multiplied through `Math.imul` / the 16-bit
 * split proven in `../kernel/limbs.ts` (same technique as `kernel/rng.ts`
 * hashTextFast; perf audit rec #1 cut the fat-state digest ~10× by removing
 * the per-codepoint bigint mul from the hot path).
 *
 * NOT barrel-exported: internal to the pipeline, consumed by `./digest.ts`.
 * Byte-identity against the pre-port bigint sink is pinned twice over —
 * `__tests__/digest-golden.json` (whole-state battery captured BEFORE the
 * port) and `__tests__/digest-perf.test.ts` (100k-string / 100k-bigint
 * differential oracle with the old sink mirrored in the test).
 */

import { mul32High, mul32Low } from "../kernel/limbs.ts";

const MASK64 = (1n << 64n) - 1n;
const MASK32 = (1n << 32n) - 1n;
const TWO32 = 0x1_0000_0000n;
const SHIFT_40 = 40n;
const FNV_OFFSET = 0xcbf29ce484222325n;
const SALT_B = 0x9e3779b97f4a7c15n;
// FNV-1a 64-bit prime 0x100000001b3 as limbs (the only multiplier used):
const PRIME_LO = 0x0000_01b3;
const PRIME_HI = 0x0000_0100;

/** Lane seeds, limb-split once at module load (the bigint constants above
 *  stay the readable spec of what these numbers are). */
const OFFSET_LO = Number(FNV_OFFSET & MASK32);
const OFFSET_HI = Number(FNV_OFFSET >> 32n);
const B_SEED = (FNV_OFFSET ^ SALT_B) & MASK64;
const B_SEED_LO = Number(B_SEED & MASK32);
const B_SEED_HI = Number(B_SEED >> 32n);

/** x·PRIME mod 2^64, low word — exact: `mul32Low` bounds every intermediate
 *  below 2^32 (see kernel/limbs.ts), and the xHi·PRIME_HI term dies mod 2^64. */
function primeMulLo(xLo: number): number {
  return mul32Low(xLo, PRIME_LO);
}

/** x·PRIME mod 2^64, high word: high32(xLo·P_LO) + xHi·P_LO + xLo·P_HI, all
 *  mod 2^32. Each term is the true low-32 of its product (Math.imul wraps
 *  exactly at 2^32), so the sum then `>>> 0` is the exact 64-bit product's
 *  high limb. Call with the PREVIOUS lo/hi before storing the new lo. */
function primeMulHi(xLo: number, xHi: number): number {
  return (mul32High(xLo, PRIME_LO) + Math.imul(xHi, PRIME_LO) + Math.imul(xLo, PRIME_HI)) >>> 0;
}

export class Sink {
  private aHi = OFFSET_HI;
  private aLo = OFFSET_LO;
  private bHi = B_SEED_HI;
  private bLo = B_SEED_LO;

  /** Feed a value known to fit in one unsigned 32-bit word: lane a XORs it
   *  into its low limb only; `(v >> 40n) = 0` makes lane b's XOR an identity,
   *  so b is a pure prime step. Bit-identical to the pre-port bigint feed() —
   *  the codepoint hot path (all of text()) lands here. */
  private feedLt32(value: number): void {
    const ax = (this.aLo ^ value) >>> 0;
    this.aHi = primeMulHi(ax, this.aHi);
    this.aLo = primeMulLo(ax);
    this.bHi = primeMulHi(this.bLo, this.bHi);
    this.bLo = primeMulLo(this.bLo);
  }

  /** Feed arbitrary unsigned 64-bit lane operands as limb pairs — the shape
   *  the bigint path produced for negatives and ≥2^64 magnitudes. */
  private feedLimbs(uLo: number, uHi: number, wLo: number, wHi: number): void {
    const ax = (this.aLo ^ uLo) >>> 0;
    const ay = (this.aHi ^ uHi) >>> 0;
    this.aHi = primeMulHi(ax, ay);
    this.aLo = primeMulLo(ax);
    const bx = (this.bLo ^ wLo) >>> 0;
    const by = (this.bHi ^ wHi) >>> 0;
    this.bHi = primeMulHi(bx, by);
    this.bLo = primeMulLo(bx);
  }

  /** The exact twin of the pre-port `feed(value: bigint)`: same arithmetic
   *  (`& MASK64`, sign-preserving `>> 40n`, `& MASK64`), same mixing order;
   *  the guard routes one-word values through the provably identical
   *  limb shortcut. Public for the differential oracle test only. */
  feed(value: bigint): this {
    if (value >= 0n && value < TWO32) {
      this.feedLt32(Number(value));
      return this;
    }
    const u = value & MASK64;
    const w = (value >> SHIFT_40) & MASK64;
    this.feedLimbs(Number(u & MASK32), Number((u >> 32n) & MASK32), Number(w & MASK32), Number((w >> 32n) & MASK32));
    return this;
  }

  text(value: string): this {
    // Manual surrogate walk — produces the exact code-point sequence of the
    // pre-port `for (const ch of value) feed(BigInt(ch.codePointAt(0)))`
    // (lone surrogates hash as themselves), minus the iterator and the
    // single-char-string allocations.
    for (let i = 0; i < value.length; i += 1) {
      const c = value.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdbff) {
        const next = i + 1 < value.length ? value.charCodeAt(i + 1) : 0;
        if (next >= 0xdc00 && next <= 0xdfff) {
          this.feedLt32(0x10000 + ((c - 0xd800) << 10) + (next - 0xdc00));
          i += 1;
          continue;
        }
      }
      this.feedLt32(c);
    }
    this.feedLt32(0); // terminator so "ab"+"c" ≠ "a"+"bc"
    return this;
  }

  int(value: bigint | number): this {
    this.feed(35n); // "#" type tag — numbers never collide with text streams
    this.feed(typeof value === "bigint" ? value : BigInt(value));
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
    // Per-lane 8+8 emission ≡ the pre-port 16-padded bigint toString(16)
    // for every lane value in [0, 2^64) (lanes are unsigned by construction).
    const a = `${this.aHi.toString(16).padStart(8, "0")}${this.aLo.toString(16).padStart(8, "0")}`;
    const b = `${this.bHi.toString(16).padStart(8, "0")}${this.bLo.toString(16).padStart(8, "0")}`;
    return `${a}${b}`;
  }
}
