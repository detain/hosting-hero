/**
 * PLANTED CANARY VIOLATIONS — consumed by test/canary.test.ts ONLY.
 * Every rule in src/canary.ts must catch its line below; editing this file
 * carelessly breaks a deliberate red test. Never import it from production.
 */

// forbidden:Math.random — must be flagged despite living in live code
export function thief(): number {
  return Math.random();
}

// forbidden:Date.now + forbidden:new Date
export function wallLeak(): bigint {
  const now = Date.now();
  const later = new Date(now + 1).getTime();
  return BigInt(later);
}

// forbidden:performance.now
export function chrono(): number {
  return performance.now();
}

// forbidden:Intl
export function localeLeak(value: number): string {
  return new Intl.NumberFormat("de-DE").format(value);
}

// forbidden:float-literal in a logic path (the knee, WRONG way)
export function rhoKnee(rho: number): number {
  return rho > 0.7 ? rho / (1 - rho) : 0;
}

// String literals and comments must NOT be flagged: "Math.random()",
// `Date.now()`, see hosting_game.md §7.13 (floats like 0.25 stay invisible).
export const benign = "Intl.DateTimeFormat";
export const alsoBenign = `performance.now inside a template ${1 + 1}`;
