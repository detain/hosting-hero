/**
 * 32-bit-limb integer primitives shared by the kernel's perf-critical fast
 * paths (`rng.ts` splitmix64/FNV, `fixed.ts` Q16.16 mul). A 64-bit value is
 * carried as two numbers `hi, lo`, each an unsigned 32-bit pattern.
 *
 * WHY THIS PASSES THE NO-FLOAT LAW (CONVENTIONS §4 / forbidden-API canary):
 *  - `Math.imul` is ES2015-specified as C-style int32 multiplication with
 *    wrap-around to 32 bits — the low 32 bits of the EXACT integer product.
 *    It is spec-exact integer semantics, not IEEE-754 rounding.
 *  - `>>>`, `>>`, `<<`, `^`, `|`, `&` apply ToUint32/ToInt32 (a defined
 *    modulo-2^32 wrap for integers) before operating; every result is an
 *    int32/uint32 pattern. Integer-semantics by spec, identical on every
 *    conforming engine (V8/JSC/SpiderMonkey, browser and Node alike).
 *  - Plain `*` and `+` appear ONLY where both operands are ≤ 16-bit halves
 *    or bounded limb products, so every intermediate is provably < 2^32 —
 *    far inside the 2^53 range where doubles represent integers exactly.
 *    No division, no irrational intermediates, no float literals anywhere.
 *  Hence no rounding can ever differ across engines: the limb path and a
 *  bigint path of the same formula produce bit-identical 64-bit results.
 *  (Precedent and oracle-test convention: tools/headless canonical.
 *  ts::fnv1a64Hex, proven against its bigint twin by digest.test.ts.)
 */

/** Unsigned 32×32 → low 32 bits of the 64-bit product.
 *  Assumes `a`, `b` are uint32 values (0 ≤ x < 2^32) held as numbers.
 *  16-bit split: every intermediate below is < 2^32, hence exact in double. */
export function mul32Low(a: number, b: number): number {
  const a0 = a & 0xffff;
  const a1 = a >>> 16;
  const b0 = b & 0xffff;
  const b1 = b >>> 16;
  const w0 = a0 * b0; // ≤ (2^16−1)² < 2^32
  const t = a1 * b0 + (w0 >>> 16); // ≤ (2^16−1)² + (2^16−1) < 2^32
  const w1 = a0 * b1 + (t & 0xffff); // same bound
  return ((w1 << 16) | (w0 & 0xffff)) >>> 0;
}

/** Unsigned 32×32 → high 32 bits of the 64-bit product. Same assumptions
 *  and same exactness bound as `mul32Low`. */
export function mul32High(a: number, b: number): number {
  const a0 = a & 0xffff;
  const a1 = a >>> 16;
  const b0 = b & 0xffff;
  const b1 = b >>> 16;
  const w0 = a0 * b0;
  const t = a1 * b0 + (w0 >>> 16);
  const w1 = a0 * b1 + (t & 0xffff);
  // a1·b1 + t≫16 + w1≫16 ≤ (2^16−1)² + (2^16−1) + (2^16−1) < 2^32
  return (a1 * b1 + (t >>> 16) + (w1 >>> 16)) >>> 0;
}
