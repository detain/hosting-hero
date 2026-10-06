/**
 * CLEAN canary fixture — scanDirectory() on this file's dir reports zero
 * violations except the deliberate Node-only ADVISORY below.
 */

const MASK64 = 0xffffffffffffffffn;

/** All-integer math: bigints and safe ints only; `.5`-style literals absent. */
export function fixedFold(seed: bigint, rounds: number): bigint {
  let acc = seed & MASK64;
  for (let i = 0; i < rounds; i += 1) {
    const raw = BigInt(i * 7919) % 2_147_483_647n;
    acc = (acc * 1099511628211n + raw) & MASK64;
  }
  return acc;
}

// Advisory-only surface: Node import specifier (must NOT be a violation).
export const platformName: string = process.platform;
