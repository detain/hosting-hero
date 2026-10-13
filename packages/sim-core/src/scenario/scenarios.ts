/** Fifteen shipped §1.5 scenarios — the library grows toward the full
 *  playable census (fourteen missions; Metastable ships twice, once per
 *  traffic profile, the corpus twin proving the waves-tableId seam).
 *  Wave three rides the predicate ladder rungs 1–3 (written-off-count,
 *  metrics-delta-over-window, family-labeled arrivals): Post-Breach
 *  Aftermath, Contract Recompete, Free Tier Flood, and the partial Sev-0.
 *
 *  Every document here is WIRE DATA (JSON-safe literals: money rides
 *  strings for the big µ$ values) parsed through the same wall external
 *  authors will use; SHIPPED_SCENARIOS holds the trusted records. If an
 *  engine law ever invalidates an authored number, the module THROWS at
 *  import — authored drift fails loud, it never ships quiet.
 *
 *  Spec anchors (hosting_game.md §1.5, line ≈ as of 2026-10-13):
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
 *  - metastable-corpus → same "Metastable" heading (§1.5): the waves-tableId
 *    seam PROOF twin. Same board/objectives, but the storm is a citation of
 *    the shipped g1 quarter (waves [1] win, [1,5] lose) instead of authored
 *    ladders — content retunes flow into the mission through planWave.
 *  - launch-day        → "Launch Day" / "Hug of Death" / "The Slashdotting"
 *    (~line 3145): a spike arrives; the bounce budget is the conversion
 *    proxy — spend it and the launch converts nothing.
 *  - ddos-season       → "DDoS Season" (~line 3978): the pressure gradient
 *    the spec asks for, as a four-step ladder; the sustained-degradation
 *    guard decides who endures.
 *  - runway-six-weeks  → "Runway: 6 Weeks" / "Insolvency Run" / "Payroll
 *    Friday" (~line 3753): profitable on paper, empty at the bank; a pure
 *    cash-TIMING puzzle — the anchor deal vs the insolvency clock.
 *  - the-price-hike    → "The Price Hike" / "Vendor Shock" / "The Relicense"
 *    (~line 3802): the vendor bill triples mid-quarter; eat it out of
 *    margin or cross the board's cash mandate on the way down.
 *  - the-quiet-month   → "The Quiet Month" / "Reverse Wave" / "The Good
 *    Problem" (~line 3463): no threats; the budget is the live antagonist
 *    and the only wrong move is the extra row of servers.
 *  - post-breach-aftermath → "Post-Breach" / "The Breach" / "The Suspicious
 *    Login" (~line 3213): the write-off column is the antagonist — rung 1.
 *  - contract-recompete → "Contract Recompete" / "The Renewal" (~line 3839):
 *    the metric must be seen MOVING, not merely high — rung 2.
 *  - free-tier-flood   → "Free Tier Flood" / "Free Tier Abuse" / "Free Tier
 *    Invaded" (~line 3574): the stream is counted BY FAMILY — rung 3.
 *  - the-sev-0         → "The Sev-0" (~line 3240): the runbook's scar as a
 *    recovery delta; the restraint sequence ships as a recorded gap.
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

/* ─────────────────────── Metastable — corpus twin ─────────────────────── */

/** The same §1.5 mission, driven through the waves-tableId seam instead
 *  of hand-typed plateaus: the quiet hum stays authored (baselineRatePerMin
 *  4, the segments twin's calm), while the STORM is a citation of the
 *  shipped g1 quarter — wave 1 (scanner drizzle) at the half-hour mark,
 *  and in the lose arm wave 5 (layer-7 mimic, the quarter's 30/min
 *  finale) stacks behind it through the content's own planWave law. The
 *  rates are the content's; if the corpus retunes, this mission retunes
 *  with it. Witness ticks are probe-derived (see corpusTwin tests). */
const METASTABLE_CORPUS_WIRE = {
  schema: "hh-scenario@1",
  id: "metastable-corpus",
  name: "Metastable (Corpus Twin)",
  brief:
    "The eight-slot edge node hums at half load, then cites the shipped quarter: a scanner drizzle at the half-hour mark is weatherable; stack the finale behind it and backlog plus retries lock capacity past the degraded wall — the storm rides the content's schedule.",
  specRef: "§1.5 Metastable",
  specLine: 4076,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 8, serviceTimeUs: 20_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "g1-shared-web-first-quarter",
    waves: [1],
    waveStartMinute: 30,
    baselineRatePerMin: 4,
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

/* ──────────────────────────── Launch Day ──────────────────────────────── */

/** §1.5 "Launch Day / Hug of Death / The Slashdotting". The spec's win is
 *  "convert ≥X% of the spike" — the v0 observation carries no conversion
 *  counter, so the funnel law rides its honest proxy: an ABSOLUTE bounce
 *  budget. At the spike's observed volume, ≤40 terminal bounces across the
 *  four-hour clock is ≈98.5% served — spend the budget and the launch
 *  converts nothing, which is exactly the trap the spec names. NON-EXPRESSIBLE
 *  (recorded, not faked): the rate-limit-to-death rule, defenses blocking
 *  legit visitors, and cold-cache start-up costs all need the defense-layer
 *  board slice the scenario runner does not mount in v0. Seed 904 is probe-
 *  chosen — the spec offers none. */
const LAUNCH_DAY_WIRE = {
  schema: "hh-scenario@1",
  id: "launch-day",
  name: "Launch Day",
  brief:
    "A link goes live at the half-hour mark and forty visits a minute arrive for capacity that admits eight. Weather the spike without spending your bounce budget — the hug of death only kills you if the queue does.",
  specRef: "§1.5 Launch Day / Hug of Death / The Slashdotting",
  specLine: 3145,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 8, serviceTimeUs: 20_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "launch-spike",
    segments: [
      { fromMinute: 0, ratePerMin: 4 },
      { fromMinute: 30, ratePerMin: 40 },
      { fromMinute: 32, ratePerMin: 4 },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "bounces-below", count: 40 },
    ],
    lose: [{ kind: "bounces-above", count: 40 }],
  },
  limits: { maxSimMinutes: 240 },
} satisfies ScenarioWire;

/* ──────────────────────────── DDoS Season ─────────────────────────────── */

/** §1.5 "DDoS Season" — the spec asks for a PRESSURE GRADIENT, not discrete
 *  waves: a baseline that climbs every hour for four hours. The v0 reading
 *  is a four-step monotone segment ladder (3→5→7→8 visits/min on a ten-slot
 *  edge), which keeps the node hot but under the degraded wall as long as
 *  the season holds its curve; the sustained-degradation guard is the season
 *  ending early. NON-EXPRESSIBLE: the magenta-haze atmosphere is pure
 *  presentation (no observation field). The flip doubles the closing step —
 *  the gradient that stops being polite pins every node past ρ .9 and the
 *  ten-minute wall closes at the same tick on every seed. */
const DDOS_SEASON_WIRE = {
  schema: "hh-scenario@1",
  id: "ddos-season",
  name: "DDoS Season",
  brief:
    "No single wave, just a gradient: the attack baseline climbs every hour for four hours. Endure the season with the node out of the degraded wall — the level that never lets the map edges go quiet.",
  specRef: "§1.5 DDoS Season",
  specLine: 3978,
  board: {
    nodes: [{ id: "edge-1", kind: "shared-web", slots: 10, serviceTimeUs: 20_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "ddos-gradient",
    segments: [
      { fromMinute: 0, ratePerMin: 3 },
      { fromMinute: 60, ratePerMin: 5 },
      { fromMinute: 120, ratePerMin: 7 },
      { fromMinute: 180, ratePerMin: 8 },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "bounces-below", count: 40 },
    ],
    lose: [],
  },
  limits: {
    maxSimMinutes: 240,
    guardrails: [{ type: "cascadeCollapse", degradedPctGt: 50, sustainedMin: 10 }],
  },
} satisfies ScenarioWire;

/* ────────────────────────── Runway: 6 Weeks ───────────────────────────── */

/** §1.5 "Runway: 6 Weeks / Insolvency Run / Payroll Friday" — profitable on
 *  paper, empty at the bank. Shipped as the engine's own cash-TIMING razor:
 *  payroll burns the 200 Mµ$ ledger to EXACTLY zero at t300 (proven path
 *  pin), the float clock then gives the company 43 minutes, and the anchor
 *  deal activates at t315 — settle lands with 28 minutes to spare. The two
 *  anchor accounts are a population buffer: the biz-month roll churn dice can
 *  take one account and the floor still holds (the mission is about cash,
 *  not retention luck). Engine monthly paper settles at ≈87% of mrc
 *  (observed 130.981 Mµ$ on a 150 Mµ$ account). NON-EXPRESSIBLE: the spec's
 *  six-option escape menu (discount/prepay/payroll-loan…) needs the player-
 *  decision door the scenario runner does not mount in v0 — the puzzle ships
 *  as the timing knife-edge instead. Flip: both deals slip their start by
 *  3,600 biz-minutes, the settle lands after the insolvency gate, and
 *  float-insolvency fires at t343 on every seed. Seed 904 probe-chosen. */
const RUNWAY_SIX_WEEKS_WIRE = {
  schema: "hh-scenario@1",
  id: "runway-six-weeks",
  name: "Runway: 6 Weeks",
  brief:
    "The books are profitable and the bank account is empty — the annual prepay is already spent. Payroll drains the ledger to zero at hour five; the anchor deal activates at 5:15. Cash timing is the whole mission.",
  specRef: "§1.5 Runway: 6 Weeks / Insolvency Run / Payroll Friday",
  specLine: 3753,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "rw-01", mrcMicroUsd: 150_000_000, billingCycle: "monthly", termStartMin: 32_400, termEndMin: 61_714, termMonths: 12, autoRenew: true, customer: "Anchor Deal LLC" },
    { id: "rw-02", mrcMicroUsd: 150_000_000, billingCycle: "monthly", termStartMin: 32_400, termEndMin: 61_714, termMonths: 12, autoRenew: true, customer: "Anchor Deal II" },
  ],
  traffic: {
    tableId: "runway-plateau",
    segments: [{ fromMinute: 0, ratePerMin: 8 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 600 },
      { kind: "cash-above", microUsd: 1_000_000 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [{ kind: "death-by-cause", cause: "float-insolvency" }],
  },
  limits: {
    maxSimMinutes: 600,
    initialFreeMicroUsd: 200_000_000,
    opex: Array.from({ length: 40 }, (_unused, i) => ({
      atMinute: (i + 1) * 15,
      amountMicroUsd: 10_000_000,
      memo: `rw-payroll-${String(i + 1).padStart(2, "0")}`,
    })),
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* ─────────────────────────── The Price Hike ───────────────────────────── */

/** §1.5 "The Price Hike / Vendor Shock / The Relicense" — the control-panel
 *  vendor's bill triples at the quarter turn with 60 days' notice. The spec's
 *  option tree (pass through / eat / migrate / fork / negotiate) needs the
 *  decision door — NON-EXPRESSIBLE in v0, recorded honestly. What IS
 *  expressible is the margin-eating outcome the "eat it" branch buys: base
 *  upkeep runs the first half, tripled vendor burns run the second, and the
 *  board's 50 Mµ$ cash mandate is the antagonist. Two 90 Mµ$ monthly accounts
 *  cover the hike with slack when the trajectory is honored; the flip makes
 *  the vendor jump 300% instead of 100% and the mandate line is crossed at
 *  the same tick on every seed. Seed 904 probe-chosen — the spec offers none. */
const PRICE_HIKE_WIRE = {
  schema: "hh-scenario@1",
  id: "the-price-hike",
  name: "The Price Hike",
  brief:
    "The control-panel vendor's bill triples at the quarter turn with sixty days' notice. No migration door, no negotiation minigame yet — eat the hike out of margin and keep the company above the mandate floor for eight hours.",
  specRef: "§1.5 The Price Hike / Vendor Shock / The Relicense",
  specLine: 3802,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 200, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "ph-01", mrcMicroUsd: 90_000_000, billingCycle: "monthly", termEndMin: 49_000, termMonths: 12, autoRenew: true, customer: "Ledger North" },
    { id: "ph-02", mrcMicroUsd: 90_000_000, billingCycle: "monthly", termEndMin: 49_000, termMonths: 12, autoRenew: true, customer: "Ledger South" },
  ],
  traffic: {
    tableId: "hike-plateau",
    segments: [{ fromMinute: 0, ratePerMin: 8 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 480 },
      { kind: "cash-above", microUsd: 50_000_000 },
      { kind: "invoices-settled", count: 1 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [{ kind: "cash-below", microUsd: 50_000_000 }],
  },
  limits: {
    maxSimMinutes: 480,
    initialFreeMicroUsd: 300_000_000,
    opex: [
      ...Array.from({ length: 24 }, (_unused, i) => ({
        atMinute: (i + 1) * 10,
        amountMicroUsd: 5_000_000,
        memo: `base-${String(i + 1).padStart(3, "0")}`,
      })),
      ...Array.from({ length: 24 }, (_unused, i) => ({
        atMinute: 250 + i * 10,
        amountMicroUsd: 15_000_000,
        memo: `hike-${String(25 + i).padStart(3, "0")}`,
      })),
    ],
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* ─────────────────────────── The Quiet Month ──────────────────────────── */

/** §1.5 "The Quiet Month / Reverse Wave / The Good Problem" — no attacker,
 *  no alarms: two quiet monthly accounts, a trickle of traffic, and upkeep as
 *  the only live antagonist. The spec's Efficiency Frontier UI, board cash
 *  mandate speech, and timed opportunity events are NON-EXPRESSIBLE in v0
 *  (no presentation fields, no decision door); what survives is the level's
 *  SOUL as predicates: a 150 Mµ$ mandate floor, a zero-bounce funnel law
 *  (the 8-slot edge at 2 visits/min could cram — discipline is not spending
 *  the capacity), and one cheap scheduled line-item whose memo IS the
 *  temptation. Flip: the extra row of servers costs what an extra row of
 *  servers actually costs (3 Mµ$ → 120 Mµ$) and the mandate is crossed at
 *  the purchase tick on every seed. Seed 904 probe-chosen. */
const QUIET_MONTH_WIRE = {
  schema: "hh-scenario@1",
  id: "the-quiet-month",
  name: "The Quiet Month",
  brief:
    "Nothing is attacking you. Two quiet monthly accounts pay, traffic trickles, and the only enemy in the building is the upkeep line — spend nothing extra and the mandate floor never blinks.",
  specRef: "§1.5 The Quiet Month / Reverse Wave / The Good Problem",
  specLine: 3463,
  board: {
    nodes: [{ id: "edge-1", kind: "shared-web", slots: 8, serviceTimeUs: 20_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "qm-01", mrcMicroUsd: 10_000_000, billingCycle: "monthly", termEndMin: 49_000, termMonths: 12, autoRenew: true, customer: "Elder CMS Host" },
    { id: "qm-02", mrcMicroUsd: 10_000_000, billingCycle: "monthly", termEndMin: 49_000, termMonths: 12, autoRenew: true, customer: "Newsroom Reseller" },
  ],
  traffic: {
    tableId: "quiet-plateau",
    segments: [{ fromMinute: 0, ratePerMin: 2 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 480 },
      { kind: "cash-above", microUsd: 150_000_000 },
      { kind: "bounces-below", count: 1 },
      { kind: "invoices-settled", count: 1 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [{ kind: "cash-below", microUsd: 150_000_000 }],
  },
  limits: {
    maxSimMinutes: 480,
    initialFreeMicroUsd: 250_000_000,
    opex: Array.from({ length: 20 }, (_unused, i) =>
      (i + 1) * 24 === 120
        ? { atMinute: 120, amountMicroUsd: 3_000_000, memo: "the-extra-row-of-servers" }
        : {
            atMinute: (i + 1) * 24,
            amountMicroUsd: 3_000_000,
            memo: `upkeep-${String(i + 1).padStart(2, "0")}`,
          },
    ),
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* ─────────────────────── Post-Breach Aftermath ────────────────────────── */

/** §1.5 "Post-Breach / The Breach / The Suspicious Login" — rung 1 of the
 *  vocab ladder (written-off-count). The spec frames the breach as
 *  symptoms-only forensics the player merely survives while trust drains;
 *  the CEO variant's drama is the churn cascade AFTER disclosure. What the
 *  engine can say: a book whose payments start failing after the news, the
 *  dunning ladder walking the unrecoverable accounts off the books
 *  (`written-off` notices, first terminations ≈ day-20-past-due ≈ the
 *  t310s on hourly paper), and a written-off CEILING as the objective the
 *  old vocab could not state. NON-EXPRESSIBLE (recorded, not faked): the
 *  forensics timeline, the disclosure choice, and the blame dial — no
 *  decision door on the scenario wire (same ruling as Runway/Price Hike).
 *  ENGINE TRUTH (probe-pinned): the natural six-account book writes off
 *  EXACTLY one invoice per shaken account — six terminations converging by
 *  t320 on every probed seed — and the sustained churn window then churn-
 *  collapses the company at t331–378. The board meeting (the clock) is at
 *  t320: the mission is judged while the write-off column is still the
 *  story, not after the funeral the column guarantees. NON-EXPRESSIBLE:
 *  the disclosure decision tree and the blame dial stay fiction (no
 *  decision door on the wire — the Runway/Price-Hike ruling). Flip: the
 *  disclosure reaches the REST of the base — six more delinquent accounts
 *  start billing on the same dice (12-book cascade). Written-offs reach
 *  8–12 and cross the ceiling of six at t[301,313,311,307,297] probe-pinned
 *  per offset — the cascade the ceiling exists to catch. */
const POST_BREACH_WIRE = {
  schema: "hh-scenario@1",
  id: "post-breach-aftermath",
  name: "Post-Breach Aftermath",
  brief:
    "The breach is public and wallets remember. Six hourly accounts keep billing while their payment dice go bad, the dunning ladder starts terminating what it cannot save, and the board demands the write-off column stay under seven at the meeting in five-and-a-half hours.",
  specRef: "§1.5 Post-Breach / The Breach / The Suspicious Login",
  specLine: 3213,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "pb-01", mrcMicroUsd: 60_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Shaken Startup" },
    { id: "pb-02", mrcMicroUsd: 48_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Forum Refugees LLC" },
    { id: "pb-03", mrcMicroUsd: 36_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Podcast Barn" },
    { id: "pb-04", mrcMicroUsd: 30_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Indie Game Ring" },
    { id: "pb-05", mrcMicroUsd: 24_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Newsletter Nest" },
    { id: "pb-06", mrcMicroUsd: 18_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Hobby Shop Online" },
  ],
  traffic: {
    tableId: "aftermath-plateau",
    segments: [{ fromMinute: 0, ratePerMin: 6 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 320 },
      { kind: "invoices-settled", count: 1 },
      { kind: "written-off-below", count: 7 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [
      { kind: "written-off-above", count: 6 },
      { kind: "death-by-cause", cause: "any" },
    ],
  },
  limits: {
    maxSimMinutes: 320,
    initialFreeMicroUsd: 1_000_000_000,
    opex: Array.from({ length: 10 }, (_unused, i) => ({
      atMinute: (i + 1) * 30,
      amountMicroUsd: 12_000_000,
      memo: `aftermath-${String(i + 1).padStart(2, "0")}`,
    })),
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* ──────────────────────── Contract Recompete ──────────────────────────── */

/** §1.5 "Contract Recompete / The Renewal" — rung 2 of the vocab ladder
 *  (metrics-delta-over-window). The spec's demand is the one thing static
 *  thresholds could never say: the metric must MOVE visibly before the
 *  renewal decision. v0 reading: a four-step service ladder (6→8→10→14
 *  visits/min on a sixteen-slot edge) where each hour must beat the hour
 *  before by a quarter of served traffic — the `served:60:+25` row holds
 *  only once TWO full windows exist (elapsed ≥ 2W) and compares the
 *  trailing hour against the one before it: 840/600 = +40% at the t240
 *  board read — while the bounce budget keeps the improvement HONEST
 *  (growth you cannot serve is just a queue). The whale's cliff lands at
 *  t234 inside the clock and auto-renews deterministically (the
 *  collections precedent); the walk-out itself is retention dice (§6.12
 *  matrix), not scripted. NON-EXPRESSIBLE: the negotiation minigame,
 *  competitor bids, and the RFP theatre — no decision door in v0.
 *  Flip: the closing step doubles 14→28 past
 *  capacity — the recompete you "won" by promising traffic you eat. */
const CONTRACT_RECOMPETE_WIRE = {
  schema: "hh-scenario@1",
  id: "contract-recompete",
  name: "Contract Recompete",
  brief:
    "Your biggest tenant is testing the market and the clause is explicit: show measurable service improvement hour over hour or lose the account. Climb the ladder, prove the delta, and do not buy the trend line with a bounce storm.",
  specRef: "§1.5 Contract Recompete / The Renewal",
  specLine: 3839,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 16, serviceTimeUs: 3_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "cr-01", mrcMicroUsd: 900_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 12, autoRenew: true, customer: "Marketplace Prime" },
    { id: "cr-02", mrcMicroUsd: 60_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 12, autoRenew: true, customer: "Ledger Annex" },
    { id: "cr-03", mrcMicroUsd: 60_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 12, autoRenew: true, customer: "Signals Bureau" },
  ],
  traffic: {
    tableId: "recompete-ladder",
    segments: [
      { fromMinute: 0, ratePerMin: 6 },
      { fromMinute: 60, ratePerMin: 8 },
      { fromMinute: 120, ratePerMin: 10 },
      { fromMinute: 180, ratePerMin: 14 },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 25 },
      { kind: "bounces-below", count: 25 },
    ],
    lose: [
      { kind: "bounces-above", count: 25 },
      { kind: "death-by-cause", cause: "any" },
    ],
  },
  limits: {
    maxSimMinutes: 240,
    initialFreeMicroUsd: 300_000_000,
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* ────────────────────────── Free Tier Flood ───────────────────────────── */

/** §1.5 "Free Tier Flood / Free Tier Abuse / Free Tier Invaded" — rung 3
 *  of the vocab ladder (family-labeled arrivals). The spec's arc is a MIX
 *  problem: thousands of low-value signups, and within two days ninety
 *  percent turn out to be miners and relays. Segments now carry the
 *  envelope's dominantFamily label, so the objective can count the abuse
 *  stream by NAME: the organic window (calm, then the launch trickle)
 *  must keep producing genuine signups ABOVE its floor, while malicious
 *  mints during the flood window stay BELOW the abuse ceiling the free-
 *  tier controls were tuned to. Whole-number rates make the mint census
 *  exactly deterministic (the arrival dice only rolls on fractional
 *  rates), so the flipped flood crosses its ceiling at the same tick on
 *  every seed — the cleanest discriminating witness in the library.
 *  NON-EXPRESSIBLE: the one-envelope-per-minute segments law means the
 *  flood phase replaces the organic label rather than diluting it — the
 *  ninety-percent mix is fiction; the wire counts the label that dominates
 *  the minute. Payment-KYC walls and crypto-payout bans need the defense
 *  board slice, not the traffic dial. Flip: the flood step 26→40/min —
 *  the malicious census hits 3,200 mints at EXACTLY t200 on all five
 *  probed offsets (integer rates never roll the dice): the library's
 *  first seed-invariant losing witness. */
const FREE_TIER_FLOOD_WIRE = {
  schema: "hh-scenario@1",
  id: "free-tier-flood",
  name: "Free Tier Flood",
  brief:
    "The free tier launches to a trickle of genuine blogs, then the flood: two hours in, the stream turns into miners and relays. Keep the abuse ceiling under control WITHOUT strangling the genuine signups that made the tier worth running.",
  specRef: "§1.5 Free Tier Flood / Free Tier Abuse / Free Tier Invaded",
  specLine: 3574,
  board: {
    nodes: [{ id: "edge-1", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "freetier-mix",
    segments: [
      { fromMinute: 0, ratePerMin: 8, family: "organic" },
      { fromMinute: 60, ratePerMin: 20, family: "organic" },
      { fromMinute: 120, ratePerMin: 26, family: "malicious" },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "family-arrivals-above", family: "organic", count: 1200 },
      { kind: "family-arrivals-below", family: "malicious", count: 3201 },
    ],
    lose: [{ kind: "family-arrivals-above", family: "malicious", count: 3200 }],
  },
  limits: { maxSimMinutes: 240 },
} satisfies ScenarioWire;

/* ───────────────────────────── The Sev-0 ──────────────────────────────── */

/** §1.5 "The Sev-0" — rung 2's recovery reading (partial by mandate). The
 *  spec's level is a RUNBOOK: preserve → isolate → document → notify →
 *  remediate, scored for RESTRAINT. The v0 wire has no decision door and no
 *  evidence-preservation mechanic (NON-EXPRESSIBLE, recorded loudly — the
 *  same ruling as every option-tree mission this wave). What IS expressible
 *  is the incident's scar on the service curve: arrivals collapse at the
 *  disclosure hour (t60: 10→2/min), crawl through the isolation window,
 *  then the remediated reopen lands at t150 — deliberately INSIDE the
 *  trailing window so the t240 board read compares a half-recovered hour
 *  (840 served) against a quarter-recovered one (480): +75% on a +30%
 *  clause, the recovery MADE VISIBLE (metric-delta) with the bounce
 *  ledger still inside the incident budget. Flip: the reopen floods in at
 *  60/min onto twenty-four slots — the un-isolated relapse, crossing the
 *  bounce ceiling at t[162,163,162,163,160] probe-pinned per offset,
 *  the recovery bounced before it can ever be measured. */
const SEV0_WIRE = {
  schema: "hh-scenario@1",
  id: "the-sev-0",
  name: "The Sev-0",
  brief:
    "Regulated data, midnight page, the whole sequence lit: preserve, isolate, notify, remediate. v0 plays the scar, not the runbook — arrivals crater at the disclosure and the mission ends when the served curve visibly recovers without eating the bounce budget.",
  specRef: "§1.5 The Sev-0",
  specLine: 3240,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 24, serviceTimeUs: 3_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "sv-01", mrcMicroUsd: 120_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 12, autoRenew: true, customer: "Compliance-Critical SaaS" },
    { id: "sv-02", mrcMicroUsd: 120_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 12, autoRenew: true, customer: "Records Vault Ltd" },
  ],
  traffic: {
    tableId: "sev0-arc",
    segments: [
      { fromMinute: 0, ratePerMin: 10 },
      { fromMinute: 60, ratePerMin: 2 },
      { fromMinute: 150, ratePerMin: 14 },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "metric-delta-over-window", metric: "served", windowMinutes: 60, minDeltaPct: 30 },
      { kind: "bounces-below", count: 31 },
      { kind: "invoices-settled", count: 1 },
    ],
    lose: [
      { kind: "bounces-above", count: 30 },
      { kind: "death-by-cause", cause: "any" },
    ],
  },
  limits: {
    maxSimMinutes: 240,
    initialFreeMicroUsd: 500_000_000,
    dunningEngineOwned: true,
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
  [METASTABLE_CORPUS_WIRE.id]: METASTABLE_CORPUS_WIRE,
  [LAUNCH_DAY_WIRE.id]: LAUNCH_DAY_WIRE,
  [DDOS_SEASON_WIRE.id]: DDOS_SEASON_WIRE,
  [RUNWAY_SIX_WEEKS_WIRE.id]: RUNWAY_SIX_WEEKS_WIRE,
  [PRICE_HIKE_WIRE.id]: PRICE_HIKE_WIRE,
  [QUIET_MONTH_WIRE.id]: QUIET_MONTH_WIRE,
  [POST_BREACH_WIRE.id]: POST_BREACH_WIRE,
  [CONTRACT_RECOMPETE_WIRE.id]: CONTRACT_RECOMPETE_WIRE,
  [FREE_TIER_FLOOD_WIRE.id]: FREE_TIER_FLOOD_WIRE,
  [SEV0_WIRE.id]: SEV0_WIRE,
});

/* ─────────────────────────── trusted records ─────────────────────────── */

/** The shipped documents, parsed at module load — authored drift
 *  dies HERE, loudly, before any test or host can consume it. The first
 *  five carry named exports (hosts import them directly); the wave-two
 *  five and the wave-three four are reachable through SHIPPED_SCENARIOS /
 *  shippedScenario(id) only — no new export names by design (docs/
 *  api-verify is name-based). */
export const theLongWeekendDoc: ScenarioDoc = parseScenarioDoc(LONG_WEEKEND_WIRE);
export const deadbeatQuarterDoc: ScenarioDoc = parseScenarioDoc(DEADBEAT_QUARTER_WIRE);
export const theAngryWhaleDoc: ScenarioDoc = parseScenarioDoc(ANGRY_WHALE_WIRE);
export const collectionsWeekDoc: ScenarioDoc = parseScenarioDoc(COLLECTIONS_WEEK_WIRE);
export const metastableDoc: ScenarioDoc = parseScenarioDoc(METASTABLE_WIRE);
const metastableCorpusDoc: ScenarioDoc = parseScenarioDoc(METASTABLE_CORPUS_WIRE);
const launchDayDoc: ScenarioDoc = parseScenarioDoc(LAUNCH_DAY_WIRE);
const ddosSeasonDoc: ScenarioDoc = parseScenarioDoc(DDOS_SEASON_WIRE);
const runwaySixWeeksDoc: ScenarioDoc = parseScenarioDoc(RUNWAY_SIX_WEEKS_WIRE);
const priceHikeDoc: ScenarioDoc = parseScenarioDoc(PRICE_HIKE_WIRE);
const quietMonthDoc: ScenarioDoc = parseScenarioDoc(QUIET_MONTH_WIRE);
const postBreachAftermathDoc: ScenarioDoc = parseScenarioDoc(POST_BREACH_WIRE);
const contractRecompeteDoc: ScenarioDoc = parseScenarioDoc(CONTRACT_RECOMPETE_WIRE);
const freeTierFloodDoc: ScenarioDoc = parseScenarioDoc(FREE_TIER_FLOOD_WIRE);
const sev0Doc: ScenarioDoc = parseScenarioDoc(SEV0_WIRE);

/** Ids in narrative order (the library index). */
export const SHIPPED_SCENARIO_IDS: readonly string[] = Object.freeze([
  theLongWeekendDoc.id,
  deadbeatQuarterDoc.id,
  theAngryWhaleDoc.id,
  collectionsWeekDoc.id,
  metastableDoc.id,
  metastableCorpusDoc.id,
  launchDayDoc.id,
  ddosSeasonDoc.id,
  runwaySixWeeksDoc.id,
  priceHikeDoc.id,
  quietMonthDoc.id,
  postBreachAftermathDoc.id,
  contractRecompeteDoc.id,
  freeTierFloodDoc.id,
  sev0Doc.id,
]);

/** id → trusted doc. */
export const SHIPPED_SCENARIOS: Readonly<Record<string, ScenarioDoc>> = Object.freeze({
  [theLongWeekendDoc.id]: theLongWeekendDoc,
  [deadbeatQuarterDoc.id]: deadbeatQuarterDoc,
  [theAngryWhaleDoc.id]: theAngryWhaleDoc,
  [collectionsWeekDoc.id]: collectionsWeekDoc,
  [metastableDoc.id]: metastableDoc,
  [metastableCorpusDoc.id]: metastableCorpusDoc,
  [launchDayDoc.id]: launchDayDoc,
  [ddosSeasonDoc.id]: ddosSeasonDoc,
  [runwaySixWeeksDoc.id]: runwaySixWeeksDoc,
  [priceHikeDoc.id]: priceHikeDoc,
  [quietMonthDoc.id]: quietMonthDoc,
  [postBreachAftermathDoc.id]: postBreachAftermathDoc,
  [contractRecompeteDoc.id]: contractRecompeteDoc,
  [freeTierFloodDoc.id]: freeTierFloodDoc,
  [sev0Doc.id]: sev0Doc,
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
