/**
 * ADR-0016 mechanic A — the PER-TENANT RELATIONSHIP LEDGER: negotiation
 * depth with memory. Economy leaf — imports ONLY ../types (type-level) +
 * economy-local, exactly the elasticity.ts / negotiate.ts law; the pipeline
 * never imports this module and this module never imports the pipeline.
 *
 * Grounded §1.3 colo card "Amps and Aisles", hosting_game.md:1637:
 * "**Negotiate** — a ticket/conversation system with a tenant, with tone
 * options and a relationship meter. **This is the level's combat.**" The
 * ADR-0015 book (economy/negotiate.ts) made the TALK tilt the cliff; this
 * ledger makes the TALK remembered. Every conversation, renewal, lapse,
 * dunning step, recovery, payment and loss accrues signed trust on the
 * TENANT's own row — the priceKey grammar `<kind>:<id>` (elasticity.ts
 * `PRICE_KEY_KINDS`; the SAME key the cliff resolves through
 * `ContractEconomy.priceKey`), never the company pool.
 *
 * THE HONEST SCOPE NOTES (recorded as the gaps they are, ADR-0016 fresh-ask
 * register):
 *  - The company-level valuation leg the card ALSO names ("tenant credit
 *    quality affects your building's valuation", §1.3; the WARCT readout,
 *    §6.9) is NOT consumed here — this lane ships the meter, the WARCT
 *    surfacing stays a deferred owner ask.
 *  - Reserve hook: the card's Enforce ladder rungs (circuit-cap, port-
 *    disable) have NO contract-keyed engine events yet — they are
 *    door-adjacent enforcement without an economy fact to fold. When such
 *    an event is born, it joins `RelationshipEventKind` here; this union
 *    deliberately does NOT invent placeholders for facts the engine cannot
 *    yet see (parse-don't-validate: the vocabulary lists what IS).
 *
 * THE TABLE-FIRST LAW (what keeps no-book hosts byte-identical): the meter
 * OPENS at the negotiation table — a booked encounter (tick step 3.5) or a
 * prior row — and cliff/dunning/payment/churn facts thereafter MAINTAIN the
 * file that exists. A tenant never talked to has no file: its renewals,
 * stages and write-offs move the COMPANY pool (reputation, 12.5) but never
 * materialize this key. For an engaged tenant the double charge IS the law,
 * not an accident: a write-off costs the pool AND the row (R9).
 *
 * THE ZERO-NEW-ROLLS LAW (negotiate.ts mirrored, verbatim posture): this
 * module casts NO dice — the kernel RNG stream token never appears in this
 * file's text, and a source-grep test pins exactly that. Trust moves only
 * through booked facts; the
 * single cliff draw is UNTOUCHED in count, it merely reads a bps number the
 * ledger produced (the consumption clamp in negotiate.ts stays ≤ 1.0).
 *
 * REPRESENTATION: signed integer bps in [trustFloorBps, trustCeilingBps]
 * (defaults ±1_000 = ±10 percentage points of retention goodwill), every
 * delta from cfg.relationships (house law: no inline rates). Exact bigint
 * math — no float, no drift, replay-stable (Law 3).
 */

import type { NegotiationTone } from "../types.ts";
import { type EconomyConfig, DEFAULT_RELATIONSHIP_CONFIG } from "./config.ts";

/** Closed vocabulary of things that move a TENANT's trust. The first five
 *  mirror the money-lifecycle facts the tick already sees; the negotiation
 *  encounter is the level's-combat fact this ledger exists for. */
export type RelationshipEventKind =
  | "negotiation-encounter"
  | "renewed"
  | "lapsed"
  | "dunning-stage"
  | "suspended"
  | "dunning-recovered"
  | "invoice-paid"
  | "churned-voluntary"
  | "written-off";

/** One fact about one tenant row. `tone`/`shippedAtTick` are REQUIRED for
 *  `negotiation-encounter` (the accrual direction comes from the tone; the
 *  tick-stamp is the amendment cursor signal) and meaningless for every
 *  other kind — absent, never null, so a forged encounter with no tone
 *  fails loud instead of silently reading rapport. */
export interface RelationshipEvent {
  readonly kind: RelationshipEventKind;
  /** The tenant row — the priceKey grammar `<kind>:<id>` (elasticity.ts),
   *  the SAME key `activeNegotiation` resolves at the cliff. */
  readonly priceKey: string;
  readonly tone?: NegotiationTone;
  readonly shippedAtTick?: bigint;
}

/** One tenant's standing meter.
 *  - `trustBps` is the authoritative signed reading, clamped into
 *    [cfg.relationships.trustFloorBps, trustCeilingBps] at EVERY accrual.
 *  - `encounters` counts booked negotiation conversations (the level's
 *    combat, per-tenant); `lifetimeEvents` counts everything booked.
 *  - `lastEncounterAtTick` is the history cursor the brief's design clause
 *    puts INSIDE the entry ("the shippedAtTick-change IS the amendment
 *    signal"): a term whose door `shippedAtTick` does not strictly exceed
 *    the cursor has already been talked once — no re-accrual. −1n opens the
 *    row (door stamps are ≥ 0, so the first booking always lands). */
export interface RelationshipEntry {
  readonly trustBps: bigint;
  readonly encounters: number;
  readonly lifetimeEvents: number;
  readonly lastEncounterAtTick: bigint;
}

/** The per-tenant trust book, keyed by priceKey. The map is rebuilt in
 *  code-unit-ascending key order on every write (the EconomyState house
 *  law: iteration order declared, never insertion-accidental — digests see
 *  Map order). Absent-while-idle on `EconomyState.relationships`: the key
 *  materializes at the FIRST booked fact, so pre-A money runs serialize
 *  byte-identically. */
export interface RelationshipLedger {
  readonly trustByKey: ReadonlyMap<string, RelationshipEntry>;
}

function relationshipsOf(cfg: EconomyConfig) {
  return cfg.relationships ?? DEFAULT_RELATIONSHIP_CONFIG;
}

function guardKey(key: string, where: string): void {
  const colon = key.indexOf(":");
  if (colon <= 0 || colon === key.length - 1) {
    throw new RangeError(
      `economy/relationship: ${where} priceKey '${key}' must be '<kind>:<id>' with both segments non-empty`,
    );
  }
}

/** Signed config-cited delta per event (Law 1: exhaustive switch — an
 *  unmapped kind cannot exist). Direction law is the CARD's prose made
 *  arithmetic: rapport/firm talk earns goodwill, legal COSTS it ("each with
 *  a legal and reputational cost", §1.3 Enforce ladder — the configured
 *  magnitude is applied NEGATIVE); renewals and recoveries repair, lapses,
 *  dunning steps, suspensions and losses burn; the money-deaths (write-off,
 *  voluntary churn) burn HEAVY. Suspended rides the dunning-stage magnitude
 *  and invoice-paid rides the dunning-recovered magnitude — the spec's own
 *  slash groupings (dunning-stage/suspended −damage; dunning-recovered/
 *  invoice-paid-after-stage +repair), never invented numbers. */
export function relationshipDeltaBps(event: RelationshipEvent, cfg: EconomyConfig): bigint {
  const r = relationshipsOf(cfg);
  switch (event.kind) {
    case "negotiation-encounter": {
      const tone = event.tone;
      if (tone === undefined) {
        throw new RangeError(
          `economy/relationship: negotiation-encounter on '${event.priceKey}' carries no tone — authoring poison`,
        );
      }
      if (tone === "legal") return -r.toneLegalBps;
      return tone === "rapport" ? r.toneRapportBps : r.toneFirmBps;
    }
    case "renewed":
      return r.renewedBps;
    case "lapsed":
      return -r.lapsedBps;
    case "dunning-stage":
      return -r.dunningStageBps;
    case "suspended":
      return -r.dunningStageBps;
    case "dunning-recovered":
      return r.dunningRecoveredBps;
    case "invoice-paid":
      return r.dunningRecoveredBps;
    case "churned-voluntary":
      return -r.voluntaryChurnBps;
    case "written-off":
      return -r.writtenOffBps;
  }
}

function clampTrust(value: bigint, cfg: EconomyConfig): bigint {
  const r = relationshipsOf(cfg);
  if (value < r.trustFloorBps) return r.trustFloorBps;
  if (value > r.trustCeilingBps) return r.trustCeilingBps;
  return value;
}

const OPEN_CURSOR = -1n;

/** The whole ledger fold — one pure pass over this fold's facts.
 *
 *  THE IDENTITY LAW (reputation.ts verbatim): an EMPTY event list returns
 *  the input ledger BY IDENTITY, null included — a fold that books nothing
 *  never materializes `{}` and never re-sorts, which is exactly what keeps
 *  every existing host's `EconomyState` serialization byte-identical while
 *  the meter is idle. A null ledger with bookings materializes the row set
 *  fresh. Events deduped ENTIRELY by the cursor return the input ledger by
 *  identity too (a standing book re-forwarded week after week talks once,
 *  not weekly).
 *
 *  Encounter dedup is the cursor law (see `RelationshipEntry`); every other
 *  kind books PER OCCURRENCE — a tenant dunned three times is burned three
 *  times (the notices are the facts; the fact fold is the meter). */
export function applyRelationshipEncounters(
  ledger: RelationshipLedger | null,
  events: readonly RelationshipEvent[],
  cfg: EconomyConfig,
): RelationshipLedger | null {
  if (events.length === 0) return ledger;
  let rows: Map<string, RelationshipEntry> | null = null;
  for (const event of events) {
    guardKey(event.priceKey, event.kind);
    const previous = rows?.get(event.priceKey) ?? ledger?.trustByKey.get(event.priceKey);
    if (event.kind === "negotiation-encounter") {
      const shipped = event.shippedAtTick;
      if (shipped === undefined) {
        throw new RangeError(
          `economy/relationship: negotiation-encounter on '${event.priceKey}' carries no shippedAtTick — authoring poison`,
        );
      }
      if (shipped <= (previous?.lastEncounterAtTick ?? OPEN_CURSOR)) continue; // already talked
    }
    const delta = relationshipDeltaBps(event, cfg);
    rows ??= new Map(ledger?.trustByKey);
    rows.set(event.priceKey, {
      trustBps: clampTrust((previous?.trustBps ?? 0n) + delta, cfg),
      encounters: (previous?.encounters ?? 0) + (event.kind === "negotiation-encounter" ? 1 : 0),
      lifetimeEvents: (previous?.lifetimeEvents ?? 0) + 1,
      lastEncounterAtTick:
        event.kind === "negotiation-encounter"
          ? (event.shippedAtTick as bigint)
          : (previous?.lastEncounterAtTick ?? OPEN_CURSOR),
    });
  }
  if (rows === null) return ledger; // every event deduped — nothing moved
  const sorted = [...rows.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return { trustByKey: new Map(sorted) };
}

/** The cliff's read (negotiate.ts composition input): the tenant's signed
 *  trust in bps, 0n for every absence (null ledger, un-keyed contract,
 *  no row yet) — 0n is ALSO the byte-identity leg: no ledger ever booked ⇒
 *  every retention factor is exactly the pre-A value. Defensive re-clamp on
 *  read: a hand-built prior cannot smuggle trust outside the band. */
export function relationshipTrustBps(
  ledger: RelationshipLedger | null | undefined,
  priceKey: string | undefined,
  cfg: EconomyConfig,
): bigint {
  if (ledger === null || ledger === undefined || priceKey === undefined) return 0n;
  const entry = ledger.trustByKey.get(priceKey);
  if (entry === undefined) return 0n;
  return clampTrust(entry.trustBps, cfg);
}
