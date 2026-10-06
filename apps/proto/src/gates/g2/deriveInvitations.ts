/**
 * PURCHASE-TIME CONTRACT (gate G2, §2.24 "capability and risk are the same
 * purchase"; WS-7 P2 at the point of purchase).
 *
 * A THIN, PURE composition over the public `@hh/sim-core/waves` ledger API —
 * no new semantics, no mutation, no RNG. Given a component template and the
 * current ledger snapshot it answers, before the player commits:
 *
 *   "building this would add EXACTLY these threats to my live surface."
 *
 * The sim-core mirror of this query (hypothetical-build → spawnable delta over
 * the full universe) is golden-pinned in packages/sim-core/src/__tests__/
 * gate-g2.test.ts; both answers agree by construction because both reduce to
 * `isThreatSpawnable`.
 */
import type { LedgerSnapshot, ThreatInvitations } from "@hh/sim-core/waves";
import { isThreatSpawnable } from "@hh/sim-core/waves";

export interface InvitationPreview {
  readonly componentTemplateId: string;
  /** Every threat this template invites, sorted (§2.24 unlocks list). */
  readonly invites: readonly string[];
  /** Invites ALREADY on the surface via another build — not new risk. */
  readonly alreadySpawnable: readonly string[];
  /** Invites that would JOIN the deck the moment you build — the real cost. */
  readonly newlySpawnable: readonly string[];
  /** Surface cost of the purchase = newlySpawnable.length (tile badge). */
  readonly surfaceCost: number;
}

/** Threat ids a component template invites (scan of the inverted map). */
export function invitedThreatIds(
  componentTemplateId: string,
  invitations: ThreatInvitations,
): readonly string[] {
  if (componentTemplateId.length === 0) {
    throw new Error("deriveInvitations: componentTemplateId must be non-empty");
  }
  const invites: string[] = [];
  for (const [threatId, inviters] of invitations) {
    if (inviters.includes(componentTemplateId)) invites.push(threatId);
  }
  return invites.sort();
}

/**
 * THE purchase-time query: what would building `componentTemplateId` invite
 * that isn't already at risk? Pure over (template, snapshot, invitations).
 */
export function deriveThreatInvitations(
  componentTemplateId: string,
  snapshot: LedgerSnapshot,
  invitations: ThreatInvitations,
): InvitationPreview {
  const invites = invitedThreatIds(componentTemplateId, invitations);
  const newlySpawnable: string[] = [];
  const alreadySpawnable: string[] = [];
  for (const threatId of invites) {
    const bucket = isThreatSpawnable(threatId, snapshot, invitations) ? alreadySpawnable : newlySpawnable;
    bucket.push(threatId);
  }
  return {
    componentTemplateId,
    invites,
    alreadySpawnable,
    newlySpawnable,
    surfaceCost: newlySpawnable.length,
  };
}

/** The live spawnable pool (threat ids any current build keeps invited). */
export function spawnablePool(snapshot: LedgerSnapshot, invitations: ThreatInvitations): readonly string[] {
  const pool: string[] = [];
  for (const threatId of invitations.keys()) {
    if (isThreatSpawnable(threatId, snapshot, invitations)) pool.push(threatId);
  }
  return pool.sort();
}

/** Which of the player's EXISTING builds keep this threat on the surface
 *  (the "why is this here?" link-out; empty ⇒ authored-ungated). */
export function activeInvitersOf(threatId: string, snapshot: LedgerSnapshot, invitations: ThreatInvitations): readonly string[] {
  const inviters = invitations.get(threatId);
  if (inviters === undefined) return [];
  return inviters.filter((buildableId) => snapshot.existingBuildables.has(buildableId)).sort();
}
