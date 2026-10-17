/**
 * gates/g7 · the deck — six authored PolicyCards for "two boards, one pool".
 *
 * Every card is REAL interpreter input: built against the closed §2.2 grammar
 * (policy/grammar.ts) and validated at module load — an ungrammatical card
 * throws at import (fail-loud, Law 4), so no panel can ever mount a lie.
 *
 * The book is the gate's thesis in data form:
 *  - three EXECUTE carriers scoped to the edge node (raise-inspection-depth,
 *    page, shed-class) — they storm the two-hand rail together, exactly the
 *    race the engine's Gate-7 suite pins headless;
 *  - one EXECUTE carrier the door has NOT bought: `failover` (§1.10's
 *    bought-verb wall — "ticker-yes, board-no" made literal);
 *  - one INFORM card and one CONSULT card — §7.14's delegation bands,
 *    advisory rows that fire in the tape and mint ZERO intents.
 *
 * Commits ride the door's `lookupPolicyCard` seam: the host hashes each card
 * with the replay module's canonicalDigest and hands the door the hash; the
 * door looks the card up, appends it to GameState.ruleBook and folds the
 * whole-book ruleBookHash (M3). The hash is a lookup key, not a claim — the
 * engine pins the semantic trail (packages/sim-core/src/__tests__/gate-g7.test.ts).
 */
import { asEntityId, asMoney, asRuleId } from "@hh/sim-core/types";
import type { EntityId, PolicyActionId, PolicyCard, RuleId } from "@hh/sim-core/types";
import { FIXED_ONE } from "@hh/sim-core/kernel";
import { canonicalDigest } from "@hh/sim-core/replay";
import { validatePolicyCard } from "@hh/sim-core/policy";

/* ── the micro-board's fixed identities (the runner mints exactly these) ── */

export const G7_EDGE = asEntityId("node/edge");
export const G7_ORIGIN = asEntityId("node/origin");
/** The one spare slot the player may place on the Iron Board. */
export const G7_DB = asEntityId("node/db");
/** The pre-wired data cable: edge → origin. A rule `drain` carrier would pull
 *  it; the player may pull it too — same verb, same hands (the law). */
export const G7_CABLE = asEntityId("edge:data:node/edge->node/origin");

/* ── triggers: rho crosses the 62.5 % wall (count unit = raw Q16.16 Fixed) ── */

const BUSY = Object.freeze({
  metric: "utilizationRho",
  comparator: ">" as const,
  threshold: Object.freeze({ kind: "value" as const, amount: 40_960n, unit: "count" as const }),
});
/** The underwriter waits for worse: 75 %. */
const SWAMPED = Object.freeze({
  metric: "utilizationRho",
  comparator: ">" as const,
  threshold: Object.freeze({ kind: "value" as const, amount: 49_152n, unit: "count" as const }),
});

function card(
  id: string,
  scopeRef: EntityId,
  actionId: PolicyActionId,
  value: bigint | null,
  band: PolicyCard["band"],
  when: readonly [typeof BUSY | typeof SWAMPED],
): PolicyCard {
  return Object.freeze({
    id: asRuleId(id),
    scope: Object.freeze({ kind: "object" as const, ref: scopeRef }),
    when: Object.freeze(when) as PolicyCard["when"],
    then: Object.freeze([
      Object.freeze({ id: actionId, runbookName: null, value }),
    ]) as PolicyCard["then"],
    band,
    upkeepMicroUsd: asMoney(0n),
  });
}

/** THE six-card book. Order is the stamping order at every crossing tick —
 *  depth first, ticket second, shed loses the two-hand race (engine-pinned). */
export const G7_CARDS: readonly PolicyCard[] = Object.freeze([
  card("watch-the-door", G7_EDGE, "raise-inspection-depth", 2n * FIXED_ONE, "execute", [BUSY]),
  card("page-the-founder", G7_EDGE, "page", null, "execute", [BUSY]),
  card("shed-the-small", G7_EDGE, "shed-class", null, "execute", [BUSY]),
  card("escape-hatch", G7_ORIGIN, "failover", null, "execute", [BUSY]),
  card("the-underwriter", G7_ORIGIN, "scale-out", 2n * FIXED_ONE, "inform", [SWAMPED]),
  card("ask-the-senior", G7_EDGE, "open-ticket", null, "consult", [BUSY]),
] as const);
for (const c of G7_CARDS) validatePolicyCard(c); // grammar-clean or the import dies

/** Panel display copy per card (host labels — the sim never sees these). */
export const G7_CARD_BLURB: Readonly<Record<string, string>> = Object.freeze({
  "watch-the-door": "edge busy → raise inspection depth (the door's configure-node twin)",
  "page-the-founder": "edge busy → page the founder (the Book's one free phone call)",
  "shed-the-small": "edge busy → shed the small class (directive — step 5 enforces)",
  "escape-hatch": "origin busy → failover. NOT bought: the ticker says yes, the board says no",
  "the-underwriter": "origin swamped → scale out — INFORM only: logged, zero intents (§7.14)",
  "ask-the-senior": "edge busy → open a ticket — CONSULT only: waits for a human (§7.14)",
});

/** The bought-verb wall as CONTENT (ADR-0018): failover rides no door map. */
export const G7_WALL_CARD_ID: RuleId = asRuleId("escape-hatch");

/* ── the host's hash book (lookupPolicyCard seam) ─────────────────────────── */

function cardSummary(c: PolicyCard): string {
  const when = c.when.map((p) => `${p.metric}${p.comparator}${p.threshold.kind === "value" ? p.threshold.amount : "—"}`).join("&");
  const then = c.then.map((a) => `${a.id}:${a.value === null ? "—" : a.value.toString()}`).join("&");
  return `g7-card|${c.id}|${c.scope.kind}:${c.scope.ref ?? ""}|${c.band}|${when}|${then}`;
}

/** 16-hex host fingerprint (replay canonical family — deterministic, not
 *  cryptographic, the same law as the door's own ruleBookHash fold). */
export const g7CardHash = (id: RuleId): string => {
  const found = G7_CARDS.find((c) => c.id === id);
  if (found === undefined) throw new Error(`g7Deck: no card "${id}" to hash`);
  return canonicalDigest(cardSummary(found));
};

const BY_HASH: ReadonlyMap<string, PolicyCard> = new Map(
  G7_CARDS.map((c) => [g7CardHash(c.id), c] as const),
);
if (BY_HASH.size !== G7_CARDS.length) {
  throw new Error("g7Deck: card hashes collided — the deck is not a set");
}

/** THE door config seam: hash → card (unknown hash → null → the ordinary
 *  unknown-card-hash refusal; the door keeps the last word). */
export function g7LookupPolicyCard(cardHash: string): PolicyCard | null {
  return BY_HASH.get(cardHash) ?? null;
}
