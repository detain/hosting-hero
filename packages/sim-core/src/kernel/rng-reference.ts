/**
 * THE BIGINT ORACLE for `kernel/rng.ts` — the original splitmix64/FNV-1a
 * implementation, kept verbatim (only renamed) as the reference semantics.
 *
 * Law: the fast 32-bit-limb path in rng.ts must stay BIT-IDENTICAL to this
 * file for every key. Proven continuously by
 * `__tests__/rng-oracle.test.ts` (≥10^6 seeded draws across all stream-key
 * axes) and pinned by `__tests__/rng-golden.test.ts` (pre-rewrite digests).
 *
 * This module is TEST-ONLY infrastructure: it is not re-exported from the
 * package barrels and no production path may import it — it exists so a
 * future kernel change has an authoritative, allocation-naive definition of
 * "the right answer" (same convention as canonical.ts::fnv1a64HexBigInt in
 * tools/headless).
 */

import type { RngKey, RngStream } from "../types";

const MASK64 = (1n << 64n) - 1n;
const GOLDEN_RATIO64 = 0x9e3779b97f4a7c15n;
const SPLITMIX_PRIME_A = 0xbf58476d1ce4e5b9n;
const SPLITMIX_PRIME_B = 0x94d049bb133111ebn;

const FNV_OFFSET64 = 0xcbf29ce484222325n;
const FNV_PRIME64 = 0x100000001b3n;

/** splitmix64 finalizer (the `z` avalanche from Steele et al.'s paper, as
 *  used by java.util.SplittableRandom): pure, exact, 64-bit. */
export function mix64Reference(input: bigint): bigint {
  let z = input & MASK64;
  z = ((z ^ (z >> 30n)) * SPLITMIX_PRIME_A) & MASK64;
  z = ((z ^ (z >> 27n)) * SPLITMIX_PRIME_B) & MASK64;
  return (z ^ (z >> 31n)) & MASK64;
}

/** FNV-1a 64-bit over Unicode code points — locale-free, stable forever. */
export function hashTextReference(text: string): bigint {
  let hash = FNV_OFFSET64;
  for (const codePoint of text) {
    hash ^= BigInt(codePoint.codePointAt(0) as number);
    hash = (hash * FNV_PRIME64) & MASK64;
  }
  return hash;
}

/** Fold all key parts into one base value; each part passes through its own
 *  mix so neighbouring keys decorrelate. */
export function deriveBaseReference(key: RngKey): bigint {
  const seedPart = mix64Reference(key.runSeed as bigint);
  const domainPart = mix64Reference(hashTextReference(key.domain) ^ 0x444f4d41494e5456n); // "DOMAIN\x16V"
  const minute = BigInt(key.simMinute);
  const minutePart = mix64Reference(minute ^ 0x4d494e5554453031n); // "MINUTE01"
  const entityPart = key.entityId === null ? 0x4e554c4c454e5469n : mix64Reference(hashTextReference(key.entityId));
  let h = seedPart;
  h = mix64Reference(h ^ domainPart);
  h = mix64Reference(h ^ minutePart);
  h = mix64Reference(h ^ entityPart);
  return h;
}

function validateKeyReference(key: RngKey): void {
  if (key.domain.length === 0) {
    throw new Error("rng.openStream: domain must be a non-empty stable literal");
  }
  if (!Number.isSafeInteger(key.simMinute) || key.simMinute < 0) {
    throw new Error(`rng.openStream: simMinute must be a non-negative safe integer, got ${key.simMinute}`);
  }
}

class CounterStreamReference implements RngStream {
  private counter: bigint = 0n;

  constructor(
    readonly key: RngKey,
    private readonly base: bigint,
  ) {}

  nextU32(): number {
    this.counter += 1n;
    const mixed = mix64Reference((this.base + this.counter * GOLDEN_RATIO64) & MASK64);
    return Number((mixed >> 32n) & 0xffffffffn);
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
    return openStreamReference({ ...this.key, domain: `${this.key.domain}/${domain}` });
  }
}

/** Oracle twin of `rng.openStream` — same contract, bigint arithmetic. */
export function openStreamReference(key: RngKey): RngStream {
  validateKeyReference(key);
  return new CounterStreamReference(key, deriveBaseReference(key));
}
