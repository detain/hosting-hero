/**
 * Oversell → contention probability (audit fix 2, spec §"oversell-ratio",
 * hosting_game heading 22992: P(contention) = ratio^2.2 × homogeneity — the
 * commercialSlider value was parsed by the loader and read by nobody).
 *
 * Normalisation law (documented interpretation, fail-loud elsewhere):
 * the slider runs 1:1 … 30:1, and 1:1 is the SELL-NOTHING-EXTRA baseline —
 * so the exponent curve rides the NORMALISED excess t = (ratio − 1) / 29:
 *
 *     f(r) = ((r − 1) / 29) ^ 2.2        P = f(r) × homogeneity
 *
 * ⇒ ratio ≤ 1.0 is provably P = 0 (digest-neutral default — the engine must
 * not move when a player never touched the slider), r = 30 saturates f to 1,
 * and the ratified detents read sensibly: 5:1 ≈ 1.3%, 12:1 ≈ 11.9%,
 * 20:1 ≈ 39.4% before the homogeneity discount.
 *
 * All math is exact bigint: t in micro-units, t^2.2 = t^(11/5) computed as
 * the (rounded) 5th root of t^11 / 10^36 — floats never touch logic.
 *
 * The CONSUMER lives in generate.planWave: each arriving unit of a wave
 * planned with an active `oversell` input rolls one contention die on the
 * arrival stream BEFORE its minute draw; a hit parks the unit on the
 * envelope's PEAK minute (the oversold pool clumps when it bites — that is
 * the homogeneity term's meaning: identical tenants, correlated wake-ups),
 * a miss keeps the authored distribution. The die is rolled ONLY when
 * P > 0, so the pre-oversell stream is byte-identical.
 */

/** A micro-unit value clamped to [0, 1_000_000]. */
function clampMicro(value: bigint, name: string, ceiling = 1_000_000n): bigint {
  if (typeof value !== "bigint" || value < 0n) {
    throw new RangeError(`contention: ${name} must be a non-negative bigint (micro-units), got ${String(value)}`);
  }
  return value > ceiling ? ceiling : value;
}

/** Integer 5th root rounded to nearest (Newton descent, exact for bigint). */
export function fifthRootNearest(n: bigint): bigint {
  if (n < 0n) throw new RangeError(`contention: fifth root of ${String(n)} is undefined`);
  if (n < 2n) return n;
  let x = 1n << (BigInt(n.toString(2).length) / 5n + 1n); // overestimate
  for (;;) {
    const x4 = x * x * x * x;
    const next = (4n * x + n / x4) / 5n;
    if (next >= x) break;
    x = next;
  }
  // x is floor(root); correct to nearest.
  const up = x + 1n;
  return up ** 5n - n <= n - x ** 5n ? up : x;
}

const SCALE = 1_000_000n;
/** Slider ceiling of the ratified detent table (§oversell-ratio: 30:1). */
export const OVERSELL_RATIO_MAX_MICRO = 30_000_000n;
/** Oversell pressure as the host authors it, all bigint micro-units. */
export interface OversellPressure {
  /** Sold-capacity ÷ true-capacity, 1.0 = 1_000_000n (baseline). */
  readonly ratioMicro: bigint;
  /** Tenant homogeneity 0..1 in micro-units (1 = perfectly correlated). */
  readonly homogeneityMicro: bigint;
}

/**
 * P(contention) in micro-units (0 … 1_000_000). ratio ≤ 1 ⇒ EXACTLY 0n —
 * the pin the digest-neutrality test relies on.
 */
export function contentionProbabilityMicro(pressure: OversellPressure): bigint {
  const ratio = pressure.ratioMicro;
  if (typeof ratio !== "bigint" || ratio < 0n) {
    throw new RangeError(`contention: ratioMicro must be a non-negative bigint, got ${String(ratio)}`);
  }
  const homogeneity = clampMicro(pressure.homogeneityMicro, "homogeneityMicro");
  if (ratio <= SCALE) return 0n; // sold at or under capacity: the curve starts at zero
  const capped = ratio > OVERSELL_RATIO_MAX_MICRO ? OVERSELL_RATIO_MAX_MICRO : ratio;
  const tMicro = ((capped - SCALE) * SCALE + 14_500_000n) / 29_000_000n; // round-half-up of (r−1)/29
  // f = t^2.2 = (t^11 / 10^36)^(1/5) in micro-units.
  const fMicro = fifthRootNearest((tMicro ** 11n) / 10n ** 36n);
  const saturate = fMicro > SCALE ? SCALE : fMicro;
  return (saturate * homogeneity) / SCALE;
}
