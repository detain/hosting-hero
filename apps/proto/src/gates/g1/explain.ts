/**
 * gates/g1 · explain — the "Explain This Number" causality strings.
 *
 * The gate's thesis (§9.13 #1): the player must FEEL defense-vs-friction in
 * 90 seconds. Numbers alone don't teach; each triad readout carries a causal
 * sentence generated from the REAL counters — no prose constants that could
 * drift from the simulation. Pure function, node-testable, budget-safe
 * (built on demand, never per frame).
 */
import type { G1Triad } from "./g1Scenario.ts";

export interface G1Explanation {
  readonly neutralized: string;
  readonly falsePositives: string;
  readonly threatsLanded: string;
  readonly waste: string;
  readonly served: string;
}

/** µs → human seconds with one decimal: 2_400_000 → "2.4s". */
export function microUsToSeconds(us: bigint): string {
  const whole = Number(us / 100_000n); // tenths of a second
  return `${(whole / 10).toFixed(1)}s`;
}

export function explainTriad(triad: G1Triad, aggressionPercent: number, depth: string): G1Explanation {
  const paranoia = `${aggressionPercent}%`;
  return Object.freeze({
    neutralized:
      triad.neutralized === 0
        ? depth === "pass-through"
          ? "Defense is OFF (pass-through) — nothing is being checked, so nothing is stopped."
          : `Nothing stopped yet at ${paranoia} aggression — the malicious wave has not hit the WAF, or the roll went the other way.`
        : `WAF verdicts blocked ${triad.neutralized} malicious arrivals before origin. Block probability = aggression × detection ratio; every point of the slider buys capture here.`,
    falsePositives:
      triad.falsePositives === 0
        ? "No legitimate customers bounced yet. Paranoia is still free — that changes as you climb the slider."
        : `${triad.falsePositives} legitimate customers were blocked at ${paranoia} aggression. Challenge verdicts cannot tell a paying visitor from a bot — this is the friction tax.`,
    threatsLanded:
      triad.threatsLanded === 0
        ? "No breach reached the origin. Every one here is revenue and SLA credit — the reason to run defense at all."
        : `${triad.threatsLanded} malicious arrivals reached the origin despite the WAF. Lower aggression (or a missed detection roll) leaks here — damage, not cost.`,
    waste:
      triad.falsePositives === 0
        ? "Challenge-lane compute spend: zero. Turn paranoia up and this meter starts burning µ$ while customers bounce."
        : `Challenge-lane compute burned on customers who never did anything: ${microUsToSeconds(triad.fpWasteUs)} of WAF time (${triad.falsePositives} × 20s challenge fee). This is what ${paranoia} paranoia costs.`,
    served: `${triad.benignServed} customers got their page. This number SHRINKS as you push the slider right — the triangle's third side.`,
  });
}
