/**
 * CONTRACTS-ARE-CABLES (§7.2 R37) — stub grade, legality only.
 *
 * A contract clause materializes as a ROUTING CONSTRAINT: traffic covered by
 * the contract may only traverse links whose tags satisfy the clause. The
 * game punchline this enables — "the cheapest failover path may be
 * contractually illegal" — is decided HERE, before any cost math exists.
 *
 * A link is LEGAL for a contract iff `link.tags ⊇ contract.requiredTags`
 * (every required tag present; extra tags harmless). Path legality is
 * per-hop conjunction: one illegal hop poisons the whole path — the same
 * shape as types.ts `RoutingLock` matching (color/hop-kind gates), which
 * lives in the routing layer; this file only answers the tag question so
 * policy/economy agents can filter candidate paths by legality.
 *
 * Deliberately NOT here: price per byte, jurisdiction law, SLA penalties —
 * those are economy/contracts agents' fields; the check only needs tag
 * SETS, so nothing outside topology leaks in.
 */

import type { EntityId } from "../types.ts";
import type { LinkRecord } from "./link.ts";

/** The slice of a contract this layer reads. Kept structural: the real
 *  Contract in types.ts carries more; anything with requiredTags fits. */
export interface RoutingContract {
  readonly id: EntityId;
  /** Tags EVERY hop of covered traffic must carry. Empty = unconstrained. */
  readonly requiredTags: readonly string[];
}

export interface LegalityVerdict {
  readonly contract: EntityId;
  readonly link: EdgeRef;
  readonly legal: boolean;
  /** Required-but-missing tags, sorted — the refusal reason lines. */
  readonly missingTags: readonly string[];
}

/** A link addressed by its data-edge id (LinkRecord.id). */
export type EdgeRef = EntityId;

/** Pure per-link legality. Sorted missing-tags keeps verdicts stable. */
export function linkIsLegalFor(contract: RoutingContract, link: LinkRecord): LegalityVerdict {
  const have = new Set(link.tags);
  const missing = contract.requiredTags.filter((tag) => !have.has(tag)).sort();
  return {
    contract: contract.id,
    link: link.id,
    legal: missing.length === 0,
    missingTags: missing,
  };
}

/** Path legality = conjunction over hops. Empty path is vacuously legal
 *  (nothing routed, nothing violated). First-failure semantics NOT used —
 *  callers draw every broken hop red, so ALL verdicts come back, in the
 *  caller's path order (deterministic because the input order is). */
export function pathLegality(
  contract: RoutingContract,
  path: readonly LinkRecord[],
): { readonly legal: boolean; readonly verdicts: readonly LegalityVerdict[] } {
  const verdicts = path.map((link) => linkIsLegalFor(contract, link));
  return { legal: verdicts.every((v) => v.legal), verdicts };
}

/** Pick the hops a contract forbids — the HUD's "⛔ crosses contract
 *  boundary" markers. Order follows the input path. */
export function illegalHops(
  contract: RoutingContract,
  path: readonly LinkRecord[],
): readonly LegalityVerdict[] {
  return pathLegality(contract, path).verdicts.filter((v) => !v.legal);
}
