/**
 * gates/g4 · termsCard — the commit-before-consequence contract (§9.13 #4):
 * releasing a cable opens a TERMS CARD before the intent exists. A
 * connection is a dependency: it costs hands, money, milliseconds, SLA
 * headroom, and — the part the demo must never hide — ATTACK SURFACE.
 *
 * Pure builder: same input ⇒ same card, byte for byte. The g2 threat
 * invitation diff lives in gates/g2 (sibling lane, not importable from
 * here); the attack-surface rows below are the documented THIN reimpl for
 * the relation class — deterministic table reads, no engine coupling.
 * Timeout monotonicity follows the link.ts law verbatim:
 *   timeout(A→B) ≤ latency(A→B) + timeout(B→C) + latency(B→C).
 */
import type { BoardRelation } from "@hh/sim-core/types";
import type { LatencyDelta } from "./latencyDelta.ts";

export interface TermsBuild {
  readonly relation: BoardRelation;
  readonly edgeId: string;
  readonly fromLabel: string;
  readonly toLabel: string;
  /** Live ladder result from the drag (source of the latency row). */
  readonly latency: LatencyDelta;
  readonly ratedMbps: number;
  readonly monthlyCostMicroUsd: bigint;
  /** Downstream contract on the served path: the budget this cable must
   *  fit under. null = no declared timeout (row degrades honestly). */
  readonly downstreamTimeoutUs: bigint | null;
  /** Current outer timeout the new hop squeezes. null = unknown. */
  readonly upstreamTimeoutUs: bigint | null;
}

export interface TermRow {
  readonly label: string;
  readonly value: string;
  readonly explain: string;
}

export type SlaVerdict = "fits" | "squeezes" | "violates" | "unknown";

export interface AttackSurfaceDelta {
  readonly family: string;
  readonly note: string;
}

export interface TermsCard {
  readonly edgeId: string;
  readonly headline: string;
  readonly rows: readonly TermRow[];
  readonly sla: { readonly verdict: SlaVerdict; readonly requiredUpstreamUs: bigint | null; readonly note: string };
  readonly attackSurface: readonly AttackSurfaceDelta[];
  /** What the door will spend on commit (display mirror of the real law). */
  readonly commit: { readonly hands: number; readonly busyTicks: number };
}

/** §7.2 vocabulary — thin per-relation surface deltas (see header). */
const ATTACK_SURFACE: Readonly<Record<BoardRelation, readonly AttackSurfaceDelta[]>> = Object.freeze({
  data: Object.freeze([
    Object.freeze({ family: "network", note: "a routed path is now reachable from the consumer's blast radius" }),
    Object.freeze({ family: "software", note: "the provider's exposed service joins this device's attack profile" }),
  ]),
  power: Object.freeze([
    Object.freeze({ family: "physical", note: "a shared feed: the supplier's circuit is now a single point of failure — power kills red; a shared rack only degrades amber" }),
  ]),
  control: Object.freeze([
    Object.freeze({ family: "actuation", note: "a control path is a remote-hands grant — compromise executes, not just reads" }),
  ]),
  trust: Object.freeze([
    Object.freeze({ family: "auth", note: "a trust edge widens who can authenticate AS this device" }),
  ]),
});

const HEADLINES: Readonly<Record<BoardRelation, string>> = Object.freeze({
  data: "Depend on",
  power: "Feed",
  control: "Command",
  trust: "Vouch for",
});

function slaVerdict(upstreamUs: bigint | null, requiredUs: bigint | null): SlaVerdict {
  if (upstreamUs === null || requiredUs === null) return "unknown";
  if (upstreamUs < requiredUs) return "violates";
  // margin law: under 25 % headroom reads as "squeezes" (§7.2 budget dial)
  return upstreamUs * 4n < requiredUs * 5n ? "squeezes" : "fits";
}

/** Build the card. The candidate hop's queue-adjusted µs (from the live
 *  ladder) plus the downstream timeout is the FULL squeeze math. */
export function buildTermsCard(input: TermsBuild): TermsCard {
  const requiredUpstreamUs =
    input.downstreamTimeoutUs === null
      ? null
      : input.latency.deltaUs + input.downstreamTimeoutUs + 1n;
  const verdict = slaVerdict(input.upstreamTimeoutUs, requiredUpstreamUs);
  const msText =
    input.latency.deltaUs === 0n
      ? "+0 ms"
      : `${input.latency.deltaUs > 0n ? "+" : "−"}${Math.abs(input.latency.deltaMs).toFixed(3)} ms`;

  const rows: TermRow[] = [
    Object.freeze({
      label: "Bandwidth",
      value: `${input.ratedMbps} Mbps rated`,
      explain: "the patch panel's rated speed; the door never renegotiates upward",
    }),
    Object.freeze({
      label: "Monthly cost",
      value: `$${(Number(input.monthlyCostMicroUsd) / 1_000_000).toFixed(2)}/mo`,
      explain: "cross-rack links bill; same-rack is free — this is why placement IS pricing",
    }),
    Object.freeze({
      label: "Latency",
      value: msText,
      explain: input.latency.saturatedLabels.length > 0
        ? `queue-adjusted (hockey stick); ${input.latency.saturatedLabels.join(", ")} at capacity — price is floored at the saturation cap`
        : "queue-adjusted (service ÷ (1−ρ)), computed live during your drag",
    }),
  ];

  const slaNote =
    verdict === "violates"
      ? `upstream timeout ${String(input.upstreamTimeoutUs)}µs < required ${String(requiredUpstreamUs)}µs — a guaranteed timeout violation marker lands on this cable`
      : verdict === "squeezes"
        ? "fits with under 25 % headroom — the budget dial will feel this first"
        : verdict === "fits"
          ? "fits with headroom"
          : "one side declares no timeout — nothing to squeeze, yet";

  return Object.freeze({
    edgeId: input.edgeId,
    headline: `${HEADLINES[input.relation]} ${input.toLabel} from ${input.fromLabel}`,
    rows: Object.freeze([...rows, Object.freeze({ label: "SLA math", value: verdict, explain: slaNote })]),
    sla: Object.freeze({ verdict, requiredUpstreamUs, note: slaNote }),
    attackSurface: Object.freeze(ATTACK_SURFACE[input.relation]),
    commit: Object.freeze({ hands: 1, busyTicks: 3 }),
  });
}
