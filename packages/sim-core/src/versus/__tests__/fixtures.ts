/**
 * Shared versus-lane fixtures: the REAL threat registry (packages/content/
 * threats/registry-core.json, read-only input) parsed into census +
 * counter maps, plus scripted decks that exercise every branch of the
 * deck→WaveTable converter. No floats, no randomness, no locale.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Fixed, PolicyAction, PolicyCard, Predicate, RunSeed } from "../../types.ts";
import { asMetricId, asMoney, asRunSeed, asRuleId } from "../../types.ts";
import { FIXED_ZERO, fromInt, fromRatio } from "../../kernel/fixed.ts";
import { MICROS_PER_MIN } from "../../kernel/time.ts";
import { buildCounterMap, buildRegistryCensus, parseThreatDeck, type ThreatCensusEntry, type ThreatDeck } from "../deck.ts";
import type { DefenderCommit, VersusMatchConfig } from "../match.ts";
import type { PressureParams } from "../../waves/pressure.ts";

export const REGISTRY_RAW: unknown = JSON.parse(
  readFileSync(join(process.cwd(), "..", "content", "threats", "registry-core.json"), "utf8"),
) as unknown;

export const CENSUS: ReadonlyMap<string, ThreatCensusEntry> = buildRegistryCensus(REGISTRY_RAW);
export const COUNTERS: ReadonlyMap<string, readonly string[]> = buildCounterMap(REGISTRY_RAW);

export function parseDeck(raw: unknown): ThreatDeck {
  return parseThreatDeck(raw, { census: CENSUS });
}

/* ─────────────────────────── scripted decks ─────────────────────────── */

/** Six threats, six single roles, four denominations, one hot role. */
export const RAW_DECK_MAIN = Object.freeze({
  id: "deck-main",
  budgetBps: 10_000,
  entries: Object.freeze([
    Object.freeze({ threatId: "scanner-drizzle", weightBps: 4000, affix: "distributed" }),
    Object.freeze({ threatId: "wp-login-brute-squad", weightBps: 2500 }),
    Object.freeze({ threatId: "slowloris-sipper", weightBps: 1500, affix: "low-slow" }),
    Object.freeze({ threatId: "xmlrpc-pingback-amplifier", weightBps: 1000 }),
    Object.freeze({ threatId: "grudge-booter", weightBps: 600 }),
    Object.freeze({ threatId: "mod-update-day", weightBps: 400 }),
  ]),
});

/** Lean three-role deck (skewed so only one role is hot). */
export const RAW_DECK_LEAN = Object.freeze({
  id: "deck-lean",
  budgetBps: 10_000,
  entries: Object.freeze([
    Object.freeze({ threatId: "scanner-drizzle", weightBps: 5000 }),
    Object.freeze({ threatId: "wp-login-brute-squad", weightBps: 3000 }),
    Object.freeze({ threatId: "slowloris-sipper", weightBps: 2000 }),
  ]),
});

/** Ten-threat deck sitting exactly on the pool cap (four denominations). */
export const RAW_DECK_WIDE = Object.freeze({
  id: "deck-wide",
  budgetBps: 10_000,
  entries: Object.freeze([
    Object.freeze({ threatId: "scanner-drizzle", weightBps: 3000 }),
    Object.freeze({ threatId: "wp-login-brute-squad", weightBps: 2000 }),
    Object.freeze({ threatId: "slowloris-sipper", weightBps: 1200 }),
    Object.freeze({ threatId: "layer7-mimic", weightBps: 1000 }),
    Object.freeze({ threatId: "noisy-query-table-scan", weightBps: 800 }),
    Object.freeze({ threatId: "xmlrpc-pingback-amplifier", weightBps: 600 }),
    Object.freeze({ threatId: "grudge-booter", weightBps: 500 }),
    Object.freeze({ threatId: "udp-amplification-barrage", weightBps: 400 }),
    Object.freeze({ threatId: "mod-update-day", weightBps: 300 }),
    Object.freeze({ threatId: "vulnerable-plugin-compromise", weightBps: 200 }),
  ]),
});

/** Multi-role threats only — anchors collide (same player holds ρ0 and ρ1). */
export const RAW_DECK_MULTIROLE = Object.freeze({
  id: "deck-multirole",
  budgetBps: 10_000,
  entries: Object.freeze([
    Object.freeze({ threatId: "vulnerable-plugin-compromise", weightBps: 4000 }),
    Object.freeze({ threatId: "ticket-avalanche-hydra", weightBps: 3000 }),
    Object.freeze({ threatId: "grudge-booter", weightBps: 2000 }),
    Object.freeze({ threatId: "scanner-drizzle", weightBps: 1000 }),
  ]),
});

/** Bandwidth double with a mimic twist — tests two-entry waves. */
export const RAW_DECK_BANDWIDTH = Object.freeze({
  id: "deck-bandwidth",
  budgetBps: 10_000,
  entries: Object.freeze([
    Object.freeze({ threatId: "grudge-booter", weightBps: 3400 }),
    Object.freeze({ threatId: "udp-amplification-barrage", weightBps: 3300 }),
    Object.freeze({ threatId: "layer7-mimic", weightBps: 1500 }),
    Object.freeze({ threatId: "xmlrpc-pingback-amplifier", weightBps: 1000 }),
    Object.freeze({ threatId: "mod-update-day", weightBps: 500 }),
    Object.freeze({ threatId: "scanner-drizzle", weightBps: 300 }),
  ]),
});

/* Illegal decks (conversion-level reds) */
export const RAW_DECK_FIVE_CONCURRENCY = Object.freeze({
  id: "deck-five-conc",
  budgetBps: 10_000,
  entries: Object.freeze([
    Object.freeze({ threatId: "wp-login-brute-squad", weightBps: 2000 }),
    Object.freeze({ threatId: "slowloris-sipper", weightBps: 2000 }),
    Object.freeze({ threatId: "layer7-mimic", weightBps: 2000 }),
    Object.freeze({ threatId: "noisy-query-table-scan", weightBps: 2000 }),
    Object.freeze({ threatId: "hoarder-noisy-neighbor", weightBps: 1000 }),
    Object.freeze({ threatId: "grudge-booter", weightBps: 500 }),
    Object.freeze({ threatId: "mod-update-day", weightBps: 500 }),
  ]),
});

export const RAW_DECK_TWO_ROLES = Object.freeze({
  id: "deck-two-roles",
  budgetBps: 10_000,
  entries: Object.freeze([
    Object.freeze({ threatId: "scanner-drizzle", weightBps: 6000 }),
    Object.freeze({ threatId: "wp-login-brute-squad", weightBps: 4000 }),
  ]),
});

export const RAW_DECK_FLAT_ROLES = Object.freeze({
  id: "deck-flat-roles",
  budgetBps: 10_002,
  entries: Object.freeze([
    Object.freeze({ threatId: "scanner-drizzle", weightBps: 3334 }),
    Object.freeze({ threatId: "wp-login-brute-squad", weightBps: 3333 }),
    Object.freeze({ threatId: "slowloris-sipper", weightBps: 3335 }),
  ]),
});

/* ─────────────────────────── match fixtures ─────────────────────────── */

export const VERSUS_SEED: RunSeed = asRunSeed(4242n);
export function versusSeed(value: bigint): RunSeed {
  return asRunSeed(value);
}

/** Doctrine: one execute-band card on the arrival gauge (smoke-test shape
 *  verbatim — the tuple overloads need the annotated predicate helper). */
function gaugePredicate(metric: string, comparator: Predicate["comparator"], amount: Fixed): Predicate {
  return { metric: asMetricId(metric), comparator, threshold: Object.freeze({ kind: "value" as const, amount, unit: "count" as const }) };
}
const GAUGE_ACTION: PolicyAction = Object.freeze({ id: "scale-out", runbookName: null, value: fromInt(2) });
export const GAUGE_CARD: PolicyCard = Object.freeze({
  id: asRuleId("r-versus-gauge"),
  scope: Object.freeze({ kind: "object" as const, ref: "edge" }),
  when: Object.freeze([gaugePredicate("incoming", ">", fromInt(20))]),
  for: Object.freeze({ durationUs: 1n * MICROS_PER_MIN }),
  then: Object.freeze([GAUGE_ACTION]),
  band: "execute" as const,
  upkeepMicroUsd: asMoney(10n),
} satisfies PolicyCard);

export const VERSUS_PRESSURE: PressureParams = Object.freeze({
  baseMicro: 8_000_000n,
  growthNum: 223n,
  growthDen: 200n,
  sawtoothMicro: Object.freeze([1_000_000n]),
});

export const VERSUS_DEFENDER: DefenderCommit = Object.freeze({
  engineVersion: "versus-test-1",
  sheetsHash: "hh-versus-test-sheets",
  ruleBook: Object.freeze([GAUGE_CARD]),
  nodes: Object.freeze([
    Object.freeze({ id: "edge", slots: 3, serviceTimeUs: 30_000_000n, inspectionDepth: "pass-through" as const, dependencyId: null }),
    Object.freeze({ id: "origin", slots: 2, serviceTimeUs: 60_000_000n, inspectionDepth: "inspect" as const, dependencyId: "edge" }),
  ]),
  routing: Object.freeze({
    expressPath: Object.freeze(["edge", "origin"]),
    deepPath: Object.freeze(["edge", "origin"]),
  }),
  buildables: Object.freeze(["waf", "cache"]),
  handCapacity: 2,
  reserveIntents: Object.freeze([
    Object.freeze({ tick: 5, intent: Object.freeze({ verb: "place-device" as const, nodeId: "edge", deviceKind: "waf", template: null }) }),
    Object.freeze({ tick: 7, intent: Object.freeze({ verb: "policy-card-commit" as const, cardHash: "r-versus-gauge" }) }),
    Object.freeze({ tick: 9, intent: Object.freeze({ verb: "place-device" as const, nodeId: "edge", deviceKind: "flux-capacitor", template: null }) }),
  ]),
  detectionRatio: fromRatio(9n, 10n),
  falsePositiveRatio: fromRatio(10n, 100n),
  doctrineGauge: Object.freeze({ nodeId: "edge", metric: "incoming" }),
});

export interface MatchFixtureOverrides {
  readonly seed?: RunSeed;
  readonly deck?: ThreatDeck;
  readonly matchTicks?: number;
  readonly defender?: DefenderCommit;
  readonly customerBaseline?: { readonly tableId: string; readonly unitsPerMinute: number } | null;
}

export function matchConfig(overrides: MatchFixtureOverrides = {}): VersusMatchConfig {
  const deck = overrides.deck ?? parseDeck(RAW_DECK_MAIN);
  const customerBaseline = overrides.customerBaseline === null ? undefined
    : overrides.customerBaseline ?? Object.freeze({ tableId: "versus-crowd", unitsPerMinute: 4 });
  return Object.freeze({
    seed: overrides.seed ?? VERSUS_SEED,
    deck,
    census: CENSUS,
    tableId: "versus-main",
    typeBundleId: "shared-web",
    defender: overrides.defender ?? VERSUS_DEFENDER,
    pressure: VERSUS_PRESSURE,
    unitsPerPressurePoint: 2,
    matchTicks: overrides.matchTicks ?? 110,
    ...(customerBaseline === undefined ? {} : { customerBaseline }),
  });
}

/** Fixed helpers shared across the lane tests (kept here so test files
 *  never re-mint pipeline constants). */
export const ZERO_FIXED = FIXED_ZERO;
export const ONE_FIXED = fromInt(1);
