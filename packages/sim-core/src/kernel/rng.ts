/**
 * Counter-based deterministic RNG streams (MASTER_REPORT §4.1 R-16, §7.0 P0).
 *
 * Law: NO global randomness ever. A draw is a pure function of
 * `(runSeed, domain, simMinute, entityId, counter)`:
 *  - the key is compressed with splitmix64-style 64-bit mixing;
 *  - `counter` advances only within its own stream, so consuming one domain
 *    can NEVER perturb another (the isolation property the game's replay,
 *    MP re-hosting and per-seat fairness all rest on);
 *  - `fork(domain)` extends the domain path (`parent/child`) and restarts the
 *    child at counter 0, consuming nothing from the parent.
 *
 * Director adjustments enter as logged draws in a "director" domain (§4.1
 * R-31). `range(n)` is rejection-sampled — uniform, no modulo bias, no
 * floats. Strings hash by code point (FNV-1a), never by locale collation
 * (§3.4 runtime-neutral discipline).
 *
 * FAST PATH (2026-10-06, from the headless-tools perf profile): every 64-bit
 * multiply here runs on two 32-bit limbs via `Math.imul` / the 16-bit split
 * in `./limbs.ts` instead of bigint — the exact technique already proven in
 * tools/headless `canonical.ts::fnv1a64Hex` against its bigint oracle.
 * Outputs are BIT-IDENTICAL to the oracle in `./rng-reference.ts`:
 *  - `__tests__/rng-oracle.test.ts` differential-compares ≥10^6 seeded draws
 *    across all key axes (seed, domain incl. astral code points, minute,
 *    entity, counter — plus streams whose base sits near 2^64 so the limb
 *    accumulator provably wraps);
 *  - `__tests__/rng-golden.test.ts` pins the pre-rewrite digests forever.
 * WHY `Math.imul` passes the no-float canary (CONVENTIONS §4): ES2015
 * defines it as spec-exact C-style int32 multiply (low 32 bits of the exact
 * integer product — no IEEE-754 rounding involved), and every bitwise
 * operator applies defined ToUint32/ToInt32 wraps; the only plain `*`/`+`
 * intermediates are provably < 2^32 by the 16-bit limb split, where doubles
 * represent integers exactly. Same integer semantics in every conforming
 * engine, zero bigint allocation pressure on the draw path.
 */

import type { EntityId, RngKey, RngStream, RunSeed, SimMinute } from "../types";
import { mul32High, mul32Low } from "./limbs.ts";

/* 64-bit constants as unsigned (high, low) 32-bit limb pairs. */
const GOLDEN_HI = 0x9e3779b9; // splitmix64 increment 0x9e3779b97f4a7c15
const GOLDEN_LO = 0x7f4a7c15;
const PRIME_A_HI = 0xbf58476d; // 0xbf58476d1ce4e5b9
const PRIME_A_LO = 0x1ce4e5b9;
const PRIME_B_HI = 0x94d049bb; // 0x94d049bb133111eb
const PRIME_B_LO = 0x133111eb;
const FNV_OFFSET_HI = 0xcbf29ce4; // FNV-1a/64 offset basis 0xcbf29ce484222325
const FNV_OFFSET_LO = 0x84222325;
const FNV_PRIME_HI = 0x100; // 0x100000001b3 → hi limb 256,
const FNV_PRIME_LO = 0x1b3; // lo limb 435 (the canonical.ts split)
const DOMAIN_SALT_HI = 0x444f4d41; // "DOMAIN\x16V" = 0x444f4d41494e5456
const DOMAIN_SALT_LO = 0x494e5456;
const MINUTE_SALT_HI = 0x4d494e55; // "MINUTE01" = 0x4d494e5554453031
const MINUTE_SALT_LO = 0x54453031;
const ENTITY_NULL_HI = 0x4e554c4c; // "NULLENTi" = 0x4e554c4c454e5469
const ENTITY_NULL_LO = 0x454e5469;

const MASK64 = (1n << 64n) - 1n;
const MASK32_BIGINT = 0xffffffffn;

/** A 64-bit value carried as two unsigned 32-bit limbs (see limbs.ts for
 *  the integer-semantics proof; object form only ever appears on the
 *  stream-OPEN path — the per-draw hot path stays allocation-free). */
interface Limbs {
  readonly hi: number;
  readonly lo: number;
}

/** splitmix64 finalizer on limbs — full 64-bit result (open path).
 *  Limb shifts recombine the oracle's `z ^ (z >>> s)` exactly:
 *  `(z >>> s)hi = zHi >>> s` and `(z >>> s)lo = (zLo >>> s) | (zHi << (32−s))`
 *  for 0 < s < 32; the final `>>> 31` uses the same identity. */
function mix64Pair(zHi: number, zLo: number): Limbs {
  const tHi = (zHi ^ (zHi >>> 30)) >>> 0;
  const tLo = (zLo ^ ((zLo >>> 30) | (zHi << 2))) >>> 0;
  // p = t · PRIME_A (mod 2^64): low half is the 32×32 product itself,
  // high half collects its carry plus both cross terms (only their low
  // 32 bits survive the mod, so Math.imul is exact there).
  const pLo = mul32Low(tLo, PRIME_A_LO);
  const pHi = (Math.imul(tHi, PRIME_A_LO) + Math.imul(tLo, PRIME_A_HI) + mul32High(tLo, PRIME_A_LO)) >>> 0;
  const uHi = (pHi ^ (pHi >>> 27)) >>> 0;
  const uLo = (pLo ^ ((pLo >>> 27) | (pHi << 5))) >>> 0;
  const qLo = mul32Low(uLo, PRIME_B_LO);
  const qHi = (Math.imul(uHi, PRIME_B_LO) + Math.imul(uLo, PRIME_B_HI) + mul32High(uLo, PRIME_B_LO)) >>> 0;
  return {
    hi: (qHi ^ (qHi >>> 31)) >>> 0,
    lo: ((qLo ^ ((qLo >>> 31) | (qHi << 1))) >>> 0),
  };
}

/** The hot twin of `mix64Pair`: `nextU32` consumes ONLY `mixed >> 32`, so
 *  the final low limb (which no higher bit depends on — XOR never crosses
 *  the 32-bit boundary upward) is never computed. */
function mix64High(zHi: number, zLo: number): number {
  const tHi = (zHi ^ (zHi >>> 30)) >>> 0;
  const tLo = (zLo ^ ((zLo >>> 30) | (zHi << 2))) >>> 0;
  const pLo = mul32Low(tLo, PRIME_A_LO);
  const pHi = (Math.imul(tHi, PRIME_A_LO) + Math.imul(tLo, PRIME_A_HI) + mul32High(tLo, PRIME_A_LO)) >>> 0;
  const uHi = (pHi ^ (pHi >>> 27)) >>> 0;
  const uLo = (pLo ^ ((pLo >>> 27) | (pHi << 5))) >>> 0;
  const qHi = (Math.imul(uHi, PRIME_B_LO) + Math.imul(uLo, PRIME_B_HI) + mul32High(uLo, PRIME_B_LO)) >>> 0;
  return (qHi ^ (qHi >>> 31)) >>> 0;
}

/** FNV-1a 64-bit over Unicode code points (astral chars hash as ONE 21-bit
 *  code point, touching the low limb only), prime split 256·2^32 + 435 —
 *  the carry form already oracle-proven in canonical.ts::fnv1a64Hex. */
function hashTextFast(text: string): Limbs {
  let hi = FNV_OFFSET_HI;
  let lo = FNV_OFFSET_LO;
  for (const codePoint of text) {
    lo = (lo ^ (codePoint.codePointAt(0) as number)) >>> 0;
    const carry = (((lo >>> 16) * FNV_PRIME_LO + (((lo & 0xffff) * FNV_PRIME_LO) >>> 16)) >>> 16) >>> 0;
    const newLo = Math.imul(lo, FNV_PRIME_LO);
    hi = (Math.imul(hi, FNV_PRIME_LO) + Math.imul(lo, FNV_PRIME_HI) + carry) >>> 0;
    lo = newLo >>> 0;
  }
  return { hi: hi >>> 0, lo: lo >>> 0 };
}

/** Boundary narrowing (Law 2): the seed crosses in as a bigint contract
 *  value; reduce it to trusted limbs ONCE per stream open. Masking first
 *  reproduces the oracle's two's-complement `& MASK64` for negative seeds. */
function seedToLimbs(seed: bigint): Limbs {
  const v = seed & MASK64;
  return { hi: Number((v >> 32n) & MASK32_BIGINT), lo: Number(v & MASK32_BIGINT) };
}

/** simMinute is a non-negative safe integer (≤ 2^53−1, validated): division
 *  and remainder by the power of two 2^32 are exact integer operations. */
function minuteToLimbs(minute: number): Limbs {
  return { hi: Math.floor(minute / 4_294_967_296), lo: minute % 4_294_967_296 };
}

/** Fold all key parts into one base value — limb twin of
 *  `deriveBaseReference`, step for step (see rng-reference.ts). */
function deriveBase(key: RngKey): Limbs {
  const seed = seedToLimbs(key.runSeed as bigint);
  const seedPart = mix64Pair(seed.hi, seed.lo);
  const domain = hashTextFast(key.domain);
  const domainPart = mix64Pair((domain.hi ^ DOMAIN_SALT_HI) >>> 0, (domain.lo ^ DOMAIN_SALT_LO) >>> 0);
  const minute = minuteToLimbs(key.simMinute);
  const minutePart = mix64Pair((minute.hi ^ MINUTE_SALT_HI) >>> 0, (minute.lo ^ MINUTE_SALT_LO) >>> 0);
  const entityHash = key.entityId === null ? null : hashTextFast(key.entityId);
  const entityPart =
    entityHash === null
      ? { hi: ENTITY_NULL_HI, lo: ENTITY_NULL_LO }
      : mix64Pair(entityHash.hi, entityHash.lo);
  let h = mix64Pair((seedPart.hi ^ domainPart.hi) >>> 0, (seedPart.lo ^ domainPart.lo) >>> 0);
  h = mix64Pair((h.hi ^ minutePart.hi) >>> 0, (h.lo ^ minutePart.lo) >>> 0);
  h = mix64Pair((h.hi ^ entityPart.hi) >>> 0, (h.lo ^ entityPart.lo) >>> 0);
  return h;
}

function validateKey(key: RngKey): void {
  if (key.domain.length === 0) {
    throw new Error("rng.openStream: domain must be a non-empty stable literal");
  }
  if (!Number.isSafeInteger(key.simMinute) || key.simMinute < 0) {
    throw new Error(`rng.openStream: simMinute must be a non-negative safe integer, got ${key.simMinute}`);
  }
}

class CounterStream implements RngStream {
  /** acc = base + counter·GOLDEN (mod 2^64), maintained incrementally: each
   *  draw adds the golden ratio once, so `acc` equals the oracle's
   *  `(base + counter * GOLDEN_RATIO64) & MASK64` for every counter ≥ 0 —
   *  modular addition is associative and wraps identically at 2^64. */
  private accHi: number;
  private accLo: number;

  constructor(
    readonly key: RngKey,
    base: Limbs,
  ) {
    this.accHi = base.hi;
    this.accLo = base.lo;
  }

  nextU32(): number {
    const sum = this.accLo + GOLDEN_LO; // < 2^33: exact in double
    const carry = sum > 0xffffffff ? 1 : 0;
    this.accLo = sum >>> 0;
    this.accHi = (this.accHi + GOLDEN_HI + carry) >>> 0;
    return mix64High(this.accHi, this.accLo);
  }

  range(n: number): number {
    if (!Number.isSafeInteger(n) || n < 1) {
      throw new Error(`rng.range: n must be an integer ≥ 1, got ${n}`);
    }
    if (n > 0x7fffffff) {
      throw new Error(`rng.range: n must be ≤ 2^31−1, got ${n}`);
    }
    // Rejection sampling on the unbiased prefix: values ≥ limit are redrawn,
    // so every output in [0, n) is exactly equally likely (no float, no bias).
    const limit = 0x1_0000_0000 - (0x1_0000_0000 % n);
    for (;;) {
      const candidate = this.nextU32();
      if (candidate < limit) return candidate % n;
    }
  }

  fork(domain: string): RngStream {
    if (domain.length === 0) {
      throw new Error(`rng.fork: empty fork domain (parent ${this.key.domain})`);
    }
    return openStream({ ...this.key, domain: `${this.key.domain}/${domain}` });
  }
}

/** Open (always fresh, counter = 0) the stream identified by `key`. Same key
 *  ⇒ same sequence, in any runtime, at any point of the replay. */
export function openStream(key: RngKey): RngStream {
  validateKey(key);
  return new CounterStream(key, deriveBase(key));
}

/** Convenience: open the (runSeed, domain, simMinute[, entityId]) stream. */
export function streamFor(
  runSeed: RunSeed,
  domain: string,
  simMinute: SimMinute,
  entityId: EntityId | null = null,
): RngStream {
  return openStream({ runSeed, domain, simMinute, entityId });
}
