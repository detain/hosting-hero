/** Five shipped §1.5 scenarios — the library becomes playable.
 *
 *  Every document here is WIRE DATA (JSON-safe literals: money rides
 *  strings for the big µ$ values) parsed through the same wall external
 *  authors will use; SHIPPED_SCENARIOS holds the trusted records. If an
 *  engine law ever invalidates an authored number, the module THROWS at
 *  import — authored drift fails loud, it never ships quiet.
 *
 *  Spec anchors (hosting_game.md §1.5, line ≈ as of 2026-10-11):
 *  - the-long-weekend  → "The Long Weekend / "No Hands" / Skeleton Crew /
 *    Founder's Vacation" (~line 3646): keep the site up while you are
 *    away; sustained calm traffic, catastrophe = halt.
 *  - deadbeat-quarter  → "Deadbeat Quarter" (~line 3790): revenue books
 *    while cash lags; survive the quarter's float on monthly paper.
 *  - the-angry-whale   → "The Angry Whale" / "The Concentration Crisis" /
 *    "The Sole Whale" (~line 3408): the biggest customer hits the cliff —
 *    the quarter lives or dies on one renewal.
 *  - collections-week  → "Collections Week" (~line 3778): dunning + cliff
 *    churn on six hourly accounts (salvaged from the paused JSON lane,
 *    ADR-0011).
 *  - metastable        → "Metastable" (~line 4076): a surge whose duration
 *    decides whether the queue drains or locks — the retry-storm idea the
 *    seed lane wanted; shipped via traffic segments, no waves corpus needed.
 */

import type { ScenarioDoc } from "./doc.ts";
import { parseScenarioDoc } from "./doc.ts";

/** Serializable wire records (the exact shape parseScenarioDoc accepts). */
export interface ScenarioWire {
  readonly schema: "hh-scenario@1";
  readonly id: string;
  readonly name: string;
  readonly brief: string;
  readonly specRef: string;
  readonly specLine: number;
  readonly board: unknown;
  readonly contracts: readonly unknown[];
  readonly traffic: unknown;
  readonly objectives: { readonly win: readonly unknown[]; readonly lose: readonly unknown[] };
  readonly limits: unknown;
}

/* ─────────────────────────── The Long Weekend ─────────────────────────── */

const LONG_WEEKEND_WIRE = {
  schema: "hh-scenario@1",
  id: "the-long-weekend",
  name: "The Long Weekend",
  brief:
    "You are on vacation: no hands, no heroics. Four calm shared-web accounts hum along at 40 visits a minute while payroll drips. Keep the doors open for four hours of simulated weekend — and keep every customer.",
  specRef: '§1.5 The Long Weekend / "No Hands" / Skeleton Crew / Founder\'s Vacation',
  specLine: 3646,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 400, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "lw-01", mrcMicroUsd: 288_000_000, billingCycle: "hourly", termEndMin: 24_300, termMonths: 12, autoRenew: true },
    { id: "lw-02", mrcMicroUsd: 288_000_000, billingCycle: "hourly", termEndMin: 24_300, termMonths: 12, autoRenew: true },
    { id: "lw-03", mrcMicroUsd: 312_000_000, billingCycle: "hourly", termEndMin: 24_300, termMonths: 12, autoRenew: true },
    { id: "lw-04", mrcMicroUsd: 312_000_000, billingCycle: "hourly", termEndMin: 24_300, termMonths: 12, autoRenew: true },
  ],
  traffic: {
    tableId: "weekend-calm",
    segments: [{ fromMinute: 0, ratePerMin: 40 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "churn-below", count: 1 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: {
    maxSimMinutes: 240,
    initialFreeMicroUsd: 3_000_000,
    opex: Array.from({ length: 60 }, (_unused, i) => ({
      atMinute: (i + 1) * 4,
      amountMicroUsd: 620_000,
      memo: `weekend-payroll-${String(i + 1).padStart(2, "0")}`,
    })),
    dunningEngineOwned: true,
    guardrails: [{ type: "freeCashDepleted", sustainedMin: 3 }],
  },
} satisfies ScenarioWire;

/* ─────────────────────────── Deadbeat Quarter ─────────────────────────── */

const DEADBEAT_QUARTER_WIRE = {
  schema: "hh-scenario@1",
  id: "deadbeat-quarter",
  name: "Deadbeat Quarter",
  brief:
    "The MRR poster looks great; the bank does not. Five monthly accounts bill on paper while weekly payroll is paid in real money. End the quarter still holding cash — revenue is not cash, and the ledger keeps score.",
  specRef: "§1.5 Deadbeat Quarter / Endure / Interlude",
  specLine: 3790,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 200, serviceTimeUs: 3_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "dq-01", mrcMicroUsd: 1_200_000, billingCycle: "monthly", termEndMin: 30_600, termMonths: 12, autoRenew: true },
    { id: "dq-02", mrcMicroUsd: 1_200_000, billingCycle: "monthly", termEndMin: 30_600, termMonths: 12, autoRenew: true },
    { id: "dq-03", mrcMicroUsd: 1_500_000, billingCycle: "monthly", termEndMin: 30_600, termMonths: 12, autoRenew: true },
    { id: "dq-04", mrcMicroUsd: 1_500_000, billingCycle: "monthly", termEndMin: 30_600, termMonths: 12, autoRenew: true },
    { id: "dq-05", mrcMicroUsd: 1_800_000, billingCycle: "monthly", termEndMin: 30_600, termMonths: 12, autoRenew: true },
  ],
  traffic: {
    tableId: "quarter-plateau",
    segments: [{ fromMinute: 0, ratePerMin: 30 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 300 },
      { kind: "invoices-settled", count: 4 },
      { kind: "cash-above", microUsd: 500_000 },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: {
    maxSimMinutes: 300,
    initialFreeMicroUsd: 18_000_000,
    opex: Array.from({ length: 10 }, (_unused, i) => ({
      atMinute: 30 + i * 30,
      amountMicroUsd: 2_200_000,
      memo: `dq-payroll-${String(i + 1).padStart(2, "0")}`,
    })),
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* ─────────────────────────── The Angry Whale ──────────────────────────── */

const ANGRY_WHALE_WIRE = {
  schema: "hh-scenario@1",
  id: "the-angry-whale",
  name: "The Angry Whale",
  brief:
    "One customer is two-thirds of the company and their term ends mid-quarter. Say yes and you keep the lights; say no and the concentration crisis arrives on schedule. Everything else is rounding error.",
  specRef: "§1.5 The Angry Whale / The Concentration Crisis / The Sole Whale",
  specLine: 3408,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 400, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "whale-01", mrcMicroUsd: 400_000_000, billingCycle: "hourly", termEndMin: 11_400, termMonths: 3, autoRenew: true },
    { id: "aw-02", mrcMicroUsd: 240_000_000, billingCycle: "hourly", termEndMin: 20_000, termMonths: 12, autoRenew: true },
    { id: "aw-03", mrcMicroUsd: 240_000_000, billingCycle: "hourly", termEndMin: 20_000, termMonths: 12, autoRenew: true },
    { id: "aw-04", mrcMicroUsd: 240_000_000, billingCycle: "hourly", termEndMin: 20_000, termMonths: 12, autoRenew: true },
  ],
  traffic: {
    tableId: "whale-plateau",
    segments: [{ fromMinute: 0, ratePerMin: 40 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 200 },
      { kind: "churn-below", count: 1 },
      { kind: "cash-above", microUsd: 60_000_000 },
    ],
    lose: [
      { kind: "churn-above", count: 0 },
      { kind: "death-by-cause", cause: "any" },
    ],
  },
  limits: {
    maxSimMinutes: 200,
    initialFreeMicroUsd: 40_000_000,
    opex: Array.from({ length: 20 }, (_unused, i) => ({
      atMinute: (i + 1) * 10,
      amountMicroUsd: 900_000,
      memo: `whale-payroll-${String(i + 1).padStart(2, "0")}`,
    })),
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* ─────────────────────────── Collections Week ─────────────────────────── */

/** Salvaged from the paused JSON-scenario lane (ADR-0011). The seed authored
 *  "win = survive + first invoice settled by ~tick 214, lose = churn-collapse
 *  after the tick-252 cliffs"; the committed engine bills hourly contracts
 *  from t≈1 and its dunning ladder writes the failing book off by ~t312
 *  regardless of cliffs, so the mission is re-tuned honestly: the WIN is
 *  "collections work — invoices land and the company outlasts the clock";
 *  the cliff drama (auto-renew anchors vs dice-lapsed small accounts) rides
 *  the notice trace. 240-min horizon, not 520: the death the seed wanted is
 *  reachable in the probe (contracts emptied → collapse at t44), the cliffs-
 *  walk-out version is not deterministic on this engine. */
const COLLECTIONS_WEEK_WIRE = {
  schema: "hh-scenario@1",
  id: "collections-week",
  name: "Collections Week",
  brief:
    "Six hosted accounts on hourly paper: invoices settle from the first hour while payroll drips, two anchors sign their cliff renewal, and the dice-book small accounts drift out one by one. Keep the ledger breathing for four simulated hours — and never let churn take the company.",
  specRef: "§1.5 Collections Week",
  specLine: 3778,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 400, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    // The two anchors: autoRenew at the cliff (sim t150) is deterministic in
    // this engine — the renewal always lands. The rest roll retention dice.
    { id: "cw-01", mrcMicroUsd: 250_000_000, billingCycle: "hourly", termEndMin: 15_400, termMonths: 12, autoRenew: true, customer: "MegaHost Ltd" },
    { id: "cw-02", mrcMicroUsd: 120_000_000, billingCycle: "hourly", termEndMin: 15_400, termMonths: 12, autoRenew: true, customer: "DataCrawl Inc" },
    { id: "cw-03", mrcMicroUsd: 60_000_000, billingCycle: "hourly", termEndMin: 15_400, termMonths: 12, autoRenew: false, customer: "BlogSphere" },
    { id: "cw-04", mrcMicroUsd: 45_000_000, billingCycle: "hourly", termEndMin: 15_400, termMonths: 12, autoRenew: false, customer: "PixelBarn" },
    { id: "cw-05", mrcMicroUsd: 30_000_000, billingCycle: "hourly", termEndMin: 15_400, termMonths: 12, autoRenew: false, customer: "QRCode-Q" },
    { id: "cw-06", mrcMicroUsd: 10_000_000, billingCycle: "hourly", termEndMin: 15_400, termMonths: 12, autoRenew: false, customer: "NightOwl Pages" },
  ],
  traffic: {
    tableId: "collections-diurnal",
    segments: [{ fromMinute: 0, ratePerMin: 8 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "invoices-settled", count: 1 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [{ kind: "death-by-cause", cause: "churn-collapse" }],
  },
  limits: {
    maxSimMinutes: 240,
    initialFreeMicroUsd: 5_000_000_000,
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* ───────────────────────────── Metastable ─────────────────────────────── */

/** The §1.5 retry-storm mission (ADR-0011 salvage). The seed demanded
 *  "8 slots / 20 s / ρ .83 with a 4× spike at minutes 30–36"; the committed
 *  engine admits ≤1 unit per slot PER MINUTE, so 8 slots cap throughput at
 *  8/min no matter how short serviceTimeUs is, and an offered load of 6.64/min
 *  pins occupancy near 100% in calm minutes too — the literal shape cannot
 *  separate calm from storm. Recalibrated honestly: baseline ρ .50 (4/min on
 *  8 slots), a ×4 surge (16/min) for three minutes saturates the node past
 *  the degraded wall (ρ ≥ .9), and the 10-minute sustained guard decides.
 *  Short surge → the backlog drains inside the wall and the night passes
 *  (proven on every seed); the one-field flip lets the surge run three
 *  minutes longer → backlog + retries lock capacity solid past the wall
 *  (proven on every seed). An intermediate arm IS seed-divergent — the
 *  metastable band the spec describes is engine truth, pinned by test. */
const METASTABLE_WIRE = {
  schema: "hh-scenario@1",
  id: "metastable",
  name: "Metastable",
  brief:
    "An eight-slot edge node hums at half load until a three-minute surge quadruples arrivals past capacity. Short enough, the queue drains before the ten-minute degraded wall closes; long enough, backlog and retries lock it solid — some seeds drain, some cascade.",
  specRef: "§1.5 Metastable",
  specLine: 4076,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 8, serviceTimeUs: 20_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "metastable-storm",
    segments: [
      { fromMinute: 0, ratePerMin: 4 },
      { fromMinute: 30, ratePerMin: 16 },
      { fromMinute: 33, ratePerMin: 4 },
    ],
  },
  objectives: {
    win: [{ kind: "survive-minutes", minutes: 240 }],
    lose: [],
  },
  limits: {
    maxSimMinutes: 240,
    guardrails: [{ type: "cascadeCollapse", degradedPctGt: 50, sustainedMin: 10 }],
  },
} satisfies ScenarioWire;

/** id → the WIRE record it was authored as (JSON round-trip targets for
 *  hosts and the library tests — data, never parsed state). */
export const SHIPPED_SCENARIO_WIRES: Readonly<Record<string, ScenarioWire>> = Object.freeze({
  [LONG_WEEKEND_WIRE.id]: LONG_WEEKEND_WIRE,
  [DEADBEAT_QUARTER_WIRE.id]: DEADBEAT_QUARTER_WIRE,
  [ANGRY_WHALE_WIRE.id]: ANGRY_WHALE_WIRE,
  [COLLECTIONS_WEEK_WIRE.id]: COLLECTIONS_WEEK_WIRE,
  [METASTABLE_WIRE.id]: METASTABLE_WIRE,
});

/* ─────────────────────────── trusted records ─────────────────────────── */

/** The five shipped documents, parsed at module load — authored drift
 *  dies HERE, loudly, before any test or host can consume it. */
export const theLongWeekendDoc: ScenarioDoc = parseScenarioDoc(LONG_WEEKEND_WIRE);
export const deadbeatQuarterDoc: ScenarioDoc = parseScenarioDoc(DEADBEAT_QUARTER_WIRE);
export const theAngryWhaleDoc: ScenarioDoc = parseScenarioDoc(ANGRY_WHALE_WIRE);
export const collectionsWeekDoc: ScenarioDoc = parseScenarioDoc(COLLECTIONS_WEEK_WIRE);
export const metastableDoc: ScenarioDoc = parseScenarioDoc(METASTABLE_WIRE);

/** Ids in narrative order (the library index). */
export const SHIPPED_SCENARIO_IDS: readonly string[] = Object.freeze([
  theLongWeekendDoc.id,
  deadbeatQuarterDoc.id,
  theAngryWhaleDoc.id,
  collectionsWeekDoc.id,
  metastableDoc.id,
]);

/** id → trusted doc. */
export const SHIPPED_SCENARIOS: Readonly<Record<string, ScenarioDoc>> = Object.freeze({
  [theLongWeekendDoc.id]: theLongWeekendDoc,
  [deadbeatQuarterDoc.id]: deadbeatQuarterDoc,
  [theAngryWhaleDoc.id]: theAngryWhaleDoc,
  [collectionsWeekDoc.id]: collectionsWeekDoc,
  [metastableDoc.id]: metastableDoc,
});

/** Look one shipped doc up by id — fail-loud on a miss (typos are bugs). */
export function shippedScenario(id: string): ScenarioDoc {
  const doc = SHIPPED_SCENARIOS[id];
  if (doc === undefined) {
    throw new Error(
      `scenario[BAD_ID] at 'shippedScenario': "${id}" is not shipped — legal: ${SHIPPED_SCENARIO_IDS.join(", ")}`,
    );
  }
  return doc;
}
