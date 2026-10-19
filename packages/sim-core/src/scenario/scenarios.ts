/** Twenty shipped §1.5 scenarios — the library grows toward the full
 *  playable census (nineteen missions; Metastable ships twice, once per
 *  traffic profile, the corpus twin proving the waves-tableId seam).
 *  Wave three rides the predicate ladder rungs 1–3 (written-off-count,
 *  metrics-delta-over-window, family-labeled arrivals): Post-Breach
 *  Aftermath, Contract Recompete, Free Tier Flood, and the partial Sev-0.
 *  Wave four consumes the LAST two rungs (covenant wire inputs, the
 *  reputation observation): The Covenant and Review Bomb.
 *  Wave five climbs the CHANNELS ladder (input channels, not just output
 *  vocab): the door rail (Understaffed Sunday) and the economy host-signals
 *  (Chargeback Wave, The Slow Week After).
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
 *  - the-covenant      → "Covenant" (~line 3772): the bank as antagonist
 *    with no attacker on screen; growth vs solvency at the month roll —
 *    rung 4 (covenant terms ride the wire).
 *  - review-bomb       → "Review Bomb" / "The Viral Competitor Smear" /
 *    "Media Attention" (~line 3870): the rating is the lives counter and
 *    the dunning ladder is the mob — rung 5 (reputation rides the
 *    observation).
 *  - understaffed-sunday → "The Understaffed Sunday" (~line 3657): no
 *    crisis, a quarter of the hands — the door rail proves cadence vs
 *    capacity (channels ladder: door intents).
 *  - chargeback-wave   → "The Chargeback Wave" / "Processor Freeze" /
 *    "Rolling Reserve" (~line 3721): stage 1 only — disputes post real
 *    fees and a real rating hit (channels ladder: signal chargebacks).
 *  - the-slow-week-after → "The Slow Week After" (~line 4025): the level
 *    after the outage; the blameless write-up is the gameplay (channels
 *    ladder: signal major incidents + post-mortem adjudication).
 *  - someone-elses-outage → "Someone Else's Outage" (~line 4047): the
 *    region that died is not yours; a green board and a pure queue hour —
 *    grace itself is the win condition (wave-five: door channel, second
 *    story, mirror of Sunday).
 *  - the-rfo           → "The RFO" (~line 4034): the doc's STYLE is the
 *    move — blameless sets the floor that halves the next hit, blame pays
 *    zero and the second outage lands full (wave-five: post-mortem style
 *    flip + honestPostmortems channel, mirror of the Slow Week's
 *    ambiguity flip).
 *  - the-threshold-day → "The Threshold Day" (~line 4086): nothing
 *    changed; the board grew into a limit and the corrupts channel keeps
 *    the bounce meter silent while the queue rots (wave-five: corrupts
 *    arm + corruption-count predicates — the telegraph finally readable).
 *  - the-founder-bus-factor → "The Founder Bus Factor" / "The Two Weeks'
 *    Notice" (~line 3880): the least fungible resource is attention —
 *    rung 6 (limits.attention) mints the taxed rail through the door's
 *    L2 law (@eff5694): capacity 2 flows the handover queue, capacity 1
 *    kills every second thought at EXACT ticks (calendar mirror @9ca31c3).
 *  - the-change-freeze → "The Change Freeze" / "Read-Only Friday"
 *    (~line 3625): the hazard tape is a validator — rung 8 (limits.freeze)
 *    answers the door's two host seams (canPlaceDevice / canAdjustPrice)
 *    with a refusal inside the band; knobs, steering and words stay legal.
 *  - free-tier-flood-corpus → same "Free Tier Flood" heading (~line 3574):
 *    the abuse-ceiling twin cited from the shipped mail-hosting quarter
 *    (waves [1,4] under the ceiling; [1,2,4] crosses) — the tableId seam
 *    again (@5df5586), no new rung.
 *  - the-ransom-customer → "The Ransom Customer" / "Ransom DDoS" /
 *    "Extortion" (~line 3984): the payoff is an opex row, the storm is a
 *    mail-quarter citation (waves [1,4]); response-conditional traffic is
 *    a blocking primitive, so the WIN corridor is the ledger geometry —
 *    paid stays under the ceiling, the unpaid flip crosses it.
 *  - the-copycat       → "The Copycat" / "The Price War" (~line 3429):
 *    the price itself is the move — rung 7 (the contract row's optional
 *    priceKey) registers the whale against the L1 elasticity book so the
 *    door's adjust-price intent moves the MONTHLY churn floor (450→416
 *    bps outside the dead band) while the cliff stays cut-proof at the
 *    retention clamp; the 5% flip is the zero-roll control (@5781335).
 *  - free-tier-flood-mix → same "Free Tier Flood" heading (~line 3574):
 *    the MIX twin — rung 10 (limits.familyMix) finally tells the spec's
 *    ninety-percent truth: the segments keep their organic cover labels
 *    while the arrival die rolls every mint's identity from the authored
 *    familyWeights table, and the census counts the ROLL.
 *  - the-not-invented-yet → "The Era Track" (~line 4578, L-EM): the §0.4
 *    grid sentence "Whole branches of the tech tree are greyed out with
 *    'not invented yet'" as ENGINE FACT — the era is run CONFIG (eraYear +
 *    eraBundle), never doc data, so this wire's eraless byte-stand pins
 *    with all thirty siblings; the flip test arms 1998 and the door
 *    refuses the cPanel-era placements PRE-PAYMENT while the safe kind
 *    still executes.
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
  /** Channels ladder (optional — absent keeps the pre-channel byte shape). */
  readonly intents?: readonly unknown[];
  readonly signals?: unknown;
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
  specLine: 3662,
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
  specLine: 3806,
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
  specLine: 3424,
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
  specLine: 3794,
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
  specLine: 4096,
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
  specLine: 4096,
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
  specLine: 3161,
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
  specLine: 3994,
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
  specLine: 3769,
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
  specLine: 3818,
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
  specLine: 3479,
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
  specLine: 3229,
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
  specLine: 3855,
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
  specLine: 3590,
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
  specLine: 3256,
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

/** The Covenant — spec §1.5 "Covenant" (~line 3772): "Your lender requires
 *  EBITDA above X. Archetype: Negotiate. Length: Interlude. Certain
 *  otherwise-correct investments will trip the covenant. Growth vs
 *  solvency, explicitly, with the bank as the antagonist and no attacker
 *  on screen."
 *
 *  RUNG 4: this is the first wire the parser can even CARRY covenant terms
 *  (limits.covenants), so the bank finally has a voice on the ladder. The
 *  calendar does the rest: the money clock crosses the FIRST business-month
 *  roll at exactly tick 420 (43,200 biz-min ÷ 102.857 biz-min/tick), the
 *  roll is where covenant review runs, and the clock of 480 lets the story
 *  end one breath after judgment. A 6-month minimum-runway covenant
 *  (runwayMonthsBps ≥ 60,000 bps of months) is MET by the lean book
 *  (burn ≈ 11B µ$ vs cash ≈ 89B ⇒ runway ≈ 8.1 months at review) and
 *  BREACHED by the growth buildout (burn ≈ 80B ⇒ runway ≈ 0.25 months).
 *
 *  NON-EXPRESSIBLE, recorded honestly:
 *  - EBITDA itself. The engine's sanctioned covenant readouts are only
 *    runwayMonthsBps and errorBudgetHealthBps (docs in economy/runway.ts
 *    — "so a host-authored covenant can reference them without inventing
 *    a producer"); runway is the solvency proxy for the lender's clause.
 *  - The Negotiate archetype: there is no decision door in v0, so the
 *    wire plays the OUTCOME of the negotiation (the terms), not the
 *    minigame. Same ruling that scoped the price-hike lever.
 *  - The bank's remedy after breach (calling the loan) — the covenant
 *    latch records the breach; the grace-window death machinery needs
 *    ~140+ more sim-minutes than this interlude has.
 *
 *  Book choice is load-bearing: ANNUAL contracts, because an hourly book
 *  on this clock is annihilated by the dunning ladder before t420
 *  (payment dice → fatal runs → 0 customers → churn-collapse dissolution,
 *  and dissolution is TERMINAL — the review never runs). The annual cliff
 *  (termEndMin 30,000 biz ≈ sim 292) sits inside the clock per the term
 *  wall, and auto-renew holds the book. dunningEngineOwned:false — the
 *  bank cares about the balance sheet, not collection mechanics.
 *
 *  Win (probe-pinned, seed 904, offsets 0–4): the lean book survives 480
 *  with ZERO breach rows — cash never approaches depletion, the roll
 *  passes clean at all five offsets, byte-identical stop line win@480.
 *  ONE-FLIP lose: add the single growth-buildout opex row (70B µ$ at
 *  minute 100) — at the t420 review the burn denominator has exploded and
 *  the breach row lands at EXACTLY tick 420, all five offsets:
 *  lose:covenant-breached-count-above:0@420. */
const COVENANT_WIRE = {
  schema: "hh-scenario@1",
  id: "the-covenant",
  name: "The Covenant",
  brief:
    "The lender's covenant rides the wire: minimum six months of runway at the monthly review. Lean ops sail through the roll; one growth-buildout invoice turns the same board into a default — the bank is the antagonist, and no attacker is on screen.",
  specRef: "§1.5 Covenant",
  specLine: 3788,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "cv-01", mrcMicroUsd: 720_000_000, billingCycle: "annual", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Ledger Anchor Corp" },
    { id: "cv-02", mrcMicroUsd: 576_000_000, billingCycle: "annual", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Steady State Systems" },
    { id: "cv-03", mrcMicroUsd: 432_000_000, billingCycle: "annual", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Quiet Ledger Ltd" },
    { id: "cv-04", mrcMicroUsd: 360_000_000, billingCycle: "annual", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Boring & Reliable" },
  ],
  traffic: {
    tableId: "bank-quiet",
    segments: [{ fromMinute: 0, ratePerMin: 4 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 480 },
      { kind: "covenant-breached-count-below", count: 1 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [{ kind: "covenant-breached-count-above", count: 0 }],
  },
  limits: {
    maxSimMinutes: 480,
    initialFreeMicroUsd: 100_000_000_000,
    opex: [
      { atMinute: 40, amountMicroUsd: 1_000_000_000, memo: "ops-01" },
      { atMinute: 80, amountMicroUsd: 1_000_000_000, memo: "ops-02" },
      { atMinute: 120, amountMicroUsd: 1_000_000_000, memo: "ops-03" },
      { atMinute: 160, amountMicroUsd: 1_000_000_000, memo: "ops-04" },
      { atMinute: 200, amountMicroUsd: 1_000_000_000, memo: "ops-05" },
      { atMinute: 240, amountMicroUsd: 1_000_000_000, memo: "ops-06" },
      { atMinute: 280, amountMicroUsd: 1_000_000_000, memo: "ops-07" },
      { atMinute: 320, amountMicroUsd: 1_000_000_000, memo: "ops-08" },
      { atMinute: 360, amountMicroUsd: 1_000_000_000, memo: "ops-09" },
      { atMinute: 400, amountMicroUsd: 1_000_000_000, memo: "ops-10" },
      { atMinute: 440, amountMicroUsd: 1_000_000_000, memo: "ops-11" },
      { atMinute: 480, amountMicroUsd: 1_000_000_000, memo: "ops-12" },
    ],
    dunningEngineOwned: false,
    covenants: [
      { id: "min-runway-6m", metricId: "runwayMonthsBps", floorBps: 60_000, direction: "min" },
    ],
  },
} satisfies ScenarioWire;

/** Review Bomb — spec §1.5 "Review Bomb / The Viral Competitor Smear /
 *  Media Attention" (~line 3870): "One bad outage plus an astroturf
 *  campaign tanks your public rating... Reputation damage happens
 *  regardless of actual uptime."
 *
 *  RUNG 5: the rating is finally a LIVE predicate — reputation-below /
 *  reputation-above read EconomyState.reputation.overallBps through the
 *  observation, and this mission makes the rating the lives counter. The
 *  antagonist is the dunning ladder: each written-off account is a −600
 *  bps review with no star filter, each voluntary churn −200, and only
 *  dunning recoveries (+150) push back. The board itself is a red
 *  herring BY DESIGN — 100 slots serve the quiet street flawlessly while
 *  the ledger bleeds stars: "damage regardless of actual uptime" made
 *  mechanical.
 *
 *  NON-EXPRESSIBLE, recorded honestly: the astroturf CAMPAIGN (no
 *  fake-review input exists), the journalist modifier (every incident
 *  counts double — no scenario-side damage multiplier), the buy-fake-
 *  reviews choice and the transparency response both ride channels
 *  foldMoneyLaneTick does not forward — majorIncidents, postMortems and
 *  chargebacks reach the rating only through host wiring (economy/reputation
 *  signals exist; the scenario money lane feeds it outage seconds, price
 *  overrides and refused settlements ONLY). So the smear lands as the
 *  arrival of delinquent accounts: the flip IS the campaign, as one
 *  authoring change.
 *
 *  Win (probe-pinned, seed 904, offsets 0–4): the six-account book
 *  weathered by the dunning ladder ends the 320-minute scenario with the
 *  rating standing at 6,550–7,750 bps — recoveries out-earn the write-
 *  offs — and it never touches the 1,500-bps floor on the way: five
 *  offsets, win@320 byte-stable. ONE-FLIP lose: the astroturf wave
 *  arrives as twelve more delinquent hourly accounts (one change: the
 *  book doubles to eighteen). Write-offs stack to 15–17, the rating
 *  crater crosses 1,500 bps at t[310,300,292,299,292] probe-pinned per
 *  offset: lose:reputation-below:1500@tick. */
const REVIEW_BOMB_WIRE = {
  schema: "hh-scenario@1",
  id: "review-bomb",
  name: "Review Bomb",
  brief:
    "A smear wave of delinquent accounts lands on the ledger and the public rating becomes the lives counter — every write-off is a one-star review. The board serves the quiet street flawlessly the whole time: the damage is real regardless of uptime.",
  specRef: "§1.5 Review Bomb",
  specLine: 3886,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "rb-01", mrcMicroUsd: 60_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Blasted by the Bomb" },
    { id: "rb-02", mrcMicroUsd: 48_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Star Rating Casualty" },
    { id: "rb-03", mrcMicroUsd: 36_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Thread Ninja Tourist" },
    { id: "rb-04", mrcMicroUsd: 30_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Viral Tweet Referral" },
    { id: "rb-05", mrcMicroUsd: 24_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Screenshot Traffic" },
    { id: "rb-06", mrcMicroUsd: 18_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Sympathy Signup" },
  ],
  traffic: {
    tableId: "bomb-quiet",
    segments: [{ fromMinute: 0, ratePerMin: 6 }],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 320 },
      { kind: "reputation-above", bps: 1500 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [{ kind: "reputation-below", bps: 1500 }],
  },
  limits: {
    maxSimMinutes: 320,
    initialFreeMicroUsd: 1_000_000_000,
    opex: [
      { atMinute: 30, amountMicroUsd: 12_000_000, memo: "ops-01" },
      { atMinute: 60, amountMicroUsd: 12_000_000, memo: "ops-02" },
      { atMinute: 90, amountMicroUsd: 12_000_000, memo: "ops-03" },
      { atMinute: 120, amountMicroUsd: 12_000_000, memo: "ops-04" },
      { atMinute: 150, amountMicroUsd: 12_000_000, memo: "ops-05" },
      { atMinute: 180, amountMicroUsd: 12_000_000, memo: "ops-06" },
      { atMinute: 210, amountMicroUsd: 12_000_000, memo: "ops-07" },
      { atMinute: 240, amountMicroUsd: 12_000_000, memo: "ops-08" },
      { atMinute: 270, amountMicroUsd: 12_000_000, memo: "ops-09" },
      { atMinute: 300, amountMicroUsd: 12_000_000, memo: "ops-10" },
    ],
    dunningEngineOwned: false,
  },
} satisfies ScenarioWire;

/* ────────────────── Channels ladder — three pilot missions ──────────────────
 *
 *  Each pilot proves ONE input channel family live end-to-end (spec §1.5
 *  text → wire rows → engine effect → predicate verdict). Where a channel
 *  falls short of the full spec stage, the docblock names it — the ladder
 *  header records the non-expressibles, the missions stay honest blurbs.
 */

/* ─────────────────── The Understaffed Sunday ─────────────────── */

/* Win arm: one communicate every two ticks (occupancy 2, capacity 1 ⇒ the
   half-open release law frees the token exactly when the next row lands —
   the perfect-cadence proof). Lose flip: SAME rows one tick denser — the
   backlog story becomes refusals, and accumulation is scored as the door
   saying no. Probed witnesses pin the exact refusal minute per seed.
   Non-expressible in v0: "the size of the backlog you hand to Monday" is
   not a first-class object (no ticket entity exists) — the refused-count
   is its honest proxy, and the 40-minute span rides survive-minutes. */
const UNDERSTAFFED_SUNDAY_WIRE = {
  schema: "hh-scenario@1",
  id: "understaffed-sunday",
  name: "The Understaffed Sunday",
  brief:
    "No crisis — an ordinary Sunday with a quarter of the hands. Nothing dramatic happens; the routine simply outruns the roster. Keep the tickets talked-to for forty minutes without ever letting the queue of NO's pile up.",
  specRef: "§1.5 The Understaffed Sunday",
  specLine: 3673,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "sunday-quiet",
    segments: [{ fromMinute: 0, ratePerMin: 4 }],
  },
  intents: Array.from({ length: 18 }, (_unused, i) => ({
    atTick: 5 + i * 2,
    verb: "communicate",
    args: { target: null, note: `sunday-ticket-${String(i + 1).padStart(2, "0")}` },
  })),
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 40 },
      { kind: "intents-executed-above", count: 16 },
      { kind: "intents-refused-below", count: 1 },
    ],
    lose: [{ kind: "intents-refused-above", count: 6 }],
  },
  limits: {
    maxSimMinutes: 60,
    handCapacity: 1,
  },
} satisfies ScenarioWire;

/* ───────────────────── The Chargeback Wave ───────────────────── */

/* Stage 1 of the spec's three real stages: disputes post cfg-owned fees
   ($20 per the engine ledger — the wire names WHICH contract, never the
   amount) and the §2.10 rating eats −400 bps per chargeback. The hourly
   book keeps humming (review-bomb's proven dice band), so the rating is
   disputes + dunning noise — witnesses probe the exact seed band.
   Non-expressible in v0 (recorded in the ladder header): stage 2 the
   monitoring-program months ($25–100 per-dispute fines have no channel),
   stage 3 the rolling reserve (settlement holds — the money lane has no
   hold-and-release primitive), stage 4 the >1% ratio termination (no
   processor-relationship entity, no fourth death cause), and the "grow
   profitable yet miss payroll" cash-flow texture needs the reserve. */
const CHARGEBACK_WAVE_WIRE = {
  schema: "hh-scenario@1",
  id: "chargeback-wave",
  name: "The Chargeback Wave",
  brief:
    "A carder ring paid with stolen cards and the processor is collecting. Nothing is broken, the servers are green, revenue books — and every dispute still takes its fee and its stars. Weather four disputes and keep the storefront rating alive.",
  specRef: "§1.5 The Chargeback Wave / Processor Freeze / Rolling Reserve",
  specLine: 3737,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "cw-01", mrcMicroUsd: 60_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Carded Cart Ltd" },
    { id: "cw-02", mrcMicroUsd: 48_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Stolen-Card Sweep SA" },
    { id: "cw-03", mrcMicroUsd: 36_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "Friendly Fraud LLC" },
    { id: "cw-04", mrcMicroUsd: 24_000_000, billingCycle: "hourly", termEndMin: 30_000, termMonths: 12, autoRenew: true, customer: "BIN Attack Boutique" },
  ],
  traffic: {
    tableId: "wave-quiet",
    segments: [{ fromMinute: 0, ratePerMin: 6 }],
  },
  signals: {
    chargebacks: [
      { atMinute: 20, contractId: "cw-01" },
      { atMinute: 60, contractId: "cw-02" },
      { atMinute: 100, contractId: "cw-03" },
      { atMinute: 140, contractId: "cw-04" },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 200 },
      { kind: "chargebacks-above", count: 3 },
      { kind: "reputation-above", bps: 2500 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [{ kind: "reputation-below", bps: 1500 }],
  },
  limits: {
    maxSimMinutes: 320,
    initialFreeMicroUsd: 100_000_000_000,
    /* The hourly book pays on the engine's own dice (review-bomb's proven
       mob): its noise band sits at +1100..+3350 bps ABOVE the raw dispute
       math. The four authored disputes can never reach the 1500 lose line
       through that band — the lose witness is the DEEPENED wave (the flip
       adds 20 more rows; 24 × −400 out-burns even the luckiest recovery
       streak). That IS the spec's texture: the fight is arithmetic, not
       uptime. */
    opex: [
      { atMinute: 40, amountMicroUsd: 8_000_000, memo: "ops-01" },
      { atMinute: 80, amountMicroUsd: 8_000_000, memo: "ops-02" },
      { atMinute: 120, amountMicroUsd: 8_000_000, memo: "ops-03" },
      { atMinute: 160, amountMicroUsd: 8_000_000, memo: "ops-04" },
    ],
    dunningEngineOwned: false,
  },
} satisfies ScenarioWire;

/* ─────────────────── The Slow Week After ─────────────────── */

/* The transparency half of the review-bomb family's shadow: the outage is
   OVER — the level is made entirely of consequences. Declared majors fold
   the §2.10 damage (−500 bps each, halved after the honest-host floor
   stands); the blameless write-up adjudicates through the real post-mortem
   machinery (+250 credit, permanent floor). The lose flip files the SAME
   card one field wrong: two changes in flight exceed the attribution
   ceiling, the card lands ambiguous, no floor ever stands, and the second
   bad month costs full price.
   Non-expressible in v0: team morale (two engineers wanting to quit has no
   entity), customer calls and review responses (no CRM verb beyond the
   door's generic communicate), SLA credits owed to customers by choice
   (the engine's credits ride error-budget breaches only), and the RFO
   document minigame (its own §1.5 headline). */
const SLOW_WEEK_AFTER_WIRE = {
  schema: "hh-scenario@1",
  id: "the-slow-week-after",
  name: "The Slow Week After",
  brief:
    "The outage is over and nothing is broken — everything is fragile. The mechanics are all consequences: the post-mortem you file (or fudge), and the rating the next bad month tests against the floor your honesty built.",
  specRef: "§1.5 The Slow Week After",
  specLine: 4045,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  /* One paying customer keeps the book above the extinction floor (§6.10:
     an EMPTY customer book arms churn-collapse from minute one and quietly
     dissolves the company mid-window — probe-discovered, and OD-25(a) v0
     makes dissolution silent, not terminal, so a naive mission would "win"
     over a corpse). Monthly billing keeps every invoice beyond the business
     roll (~tick 420) and the term cliff lands at m117 — past the m100 win
     line — so the dunning dice never roll and the rating math stays exact. */
  contracts: [
    { id: "sw-01", mrcMicroUsd: 60_000_000, billingCycle: "monthly", termEndMin: 12_000, termMonths: 12, autoRenew: true, customer: "Long-Tail Labs" },
  ],
  traffic: {
    tableId: "fragile-quiet",
    segments: [{ fromMinute: 0, ratePerMin: 2 }],
  },
  signals: {
    majorIncidents: [
      { atMinute: 20, count: 1 },
      { atMinute: 60, count: 1 },
    ],
    postmortems: [
      { atMinute: 40, incidentMinute: 20, style: "blameless", changesInFlight: 0 },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 100 },
      { kind: "postmortem-credits-above", bps: 250 },
      { kind: "reputation-above", bps: 4400 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [{ kind: "reputation-below", bps: 4400 }],
  },
  limits: {
    maxSimMinutes: 120,
    /* The float is not theatre either: a money lane born at ZERO free cash
       arms the float-death watch from minute one (probe-discovered engine
       fact — the birth-debt the OD-25(a) floor counts). One dollar of
       cushion plus one monthly customer keeps the week honestly quiet:
       the rating is the only living number. */
    initialFreeMicroUsd: 1_000_000,
  },
} satisfies ScenarioWire;

/* ──────────────────── Someone Else's Outage ────────────────────────── */

/** §1.5 "Someone Else's Outage" (:4067) — the C1 door channel's second
 *  story, told from the OTHER side of the rail. A major region elsewhere
 *  dies and the internet notices your status page anyway: every ticket is
 *  about a failure you did not have. The engine says it plainly — the
 *  board stays GREEN for the whole hour (`bounces-below:1` is not taste,
 *  it is the premise) while the entire game is the communicate cadence.
 *  DIFFERENT vs "Understaffed Sunday" (C1 pilot, :3673): Sunday is a
 *  drowning sprint — one operator, a 40-minute rain of tickets, the win
 *  is surviving refusals. Here the site is innocent, the queue is the
 *  weather, and the WIN line itself requires grace (executed ≥ 13 AND
 *  refused < 1) — the mission fails if you lose your temper even once.
 *  Hand-capacity-1 arithmetic, seed-free: the 2-minute rest after each
 *  reply always lands, so the win arm mints zero refusals across all
 *  five seed offsets, and one spacing sin — packing burst B to one-tick
 *  intervals the way a real inbox does at 09:00 — jams the single hand
 *  and the door refuses its first frightened customer at t26, ending
 *  the show there, exact ×5 (grace is a cliff, not a slope).
 *  NON-EXPRESSIBLE (recorded, Collections-Week ruling): the sales spike
 *  the graceful queue converts (no CRM/conversion primitive on the
 *  wire), the ticket backlog as an entity (rows ARE the queue — Sunday
 *  precedent), and "not your fault" as anything beyond the green-site
 *  witness the bounces line already gives. */
const SOMEONE_ELSES_OUTAGE_WIRE = {
  schema: "hh-scenario@1",
  id: "someone-elses-outage",
  name: "Someone Else's Outage",
  brief:
    "A cloud region far away caught fire and your status page caught the blame. Nothing is broken here — the hour is pure queue: reply, reply, reply, and never let the one-hand door refuse a frightened customer.",
  specRef: "§1.5 Someone Else's Outage",
  specLine: 4067,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "borrowed-thunder",
    segments: [{ fromMinute: 0, ratePerMin: 3 }],
  },
  intents: [
    // Burst A — the morning wave, one reply per two ticks, door never jams.
    { atTick: 5, verb: "communicate", args: { target: null, note: "r-a-1" } },
    { atTick: 7, verb: "communicate", args: { target: null, note: "r-a-2" } },
    { atTick: 9, verb: "communicate", args: { target: null, note: "r-a-3" } },
    { atTick: 11, verb: "communicate", args: { target: null, note: "r-a-4" } },
    { atTick: 13, verb: "communicate", args: { target: null, note: "r-a-5" } },
    // Burst B — the noon surge. One-tick spacing here is the flip.
    { atTick: 25, verb: "communicate", args: { target: null, note: "r-b-1" } },
    { atTick: 27, verb: "communicate", args: { target: null, note: "r-b-2" } },
    { atTick: 29, verb: "communicate", args: { target: null, note: "r-b-3" } },
    { atTick: 31, verb: "communicate", args: { target: null, note: "r-b-4" } },
    { atTick: 33, verb: "communicate", args: { target: null, note: "r-b-5" } },
    // Burst C — the evening tail of "is it my site too?" tickets.
    { atTick: 45, verb: "communicate", args: { target: null, note: "r-c-1" } },
    { atTick: 47, verb: "communicate", args: { target: null, note: "r-c-2" } },
    { atTick: 49, verb: "communicate", args: { target: null, note: "r-c-3" } },
    { atTick: 51, verb: "communicate", args: { target: null, note: "r-c-4" } },
    { atTick: 53, verb: "communicate", args: { target: null, note: "r-c-5" } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 60 },
      { kind: "intents-executed-above", count: 13 },
      { kind: "intents-refused-below", count: 1 },
      { kind: "bounces-below", count: 1 },
    ],
    lose: [{ kind: "intents-refused-above", count: 0 }],
  },
  limits: { maxSimMinutes: 90, handCapacity: 1 },
} satisfies ScenarioWire;

/* ──────────────────────────── The RFO ──────────────────────────────── */

/** §1.5 "The RFO" (:4054) — the signals channel's blame-culture story,
 *  deliberately the MIRROR of "The Slow Week After" (:4045). That pilot
 *  proved adjudication: the same filing flips on changesInFlight (one
 *  clean change credits, two blur into ambiguity and forfeit). This one
 *  flips on STYLE, and the wire has a word for it: `style: "blame"` is
 *  logged, read, and pays ZERO (postmortem.ts skips uncredited rows for
 *  reputation entirely) — a public finger-pointing doc is a document the
 *  ledger respects and the customers do not. Both post-mortem channels
 *  run side by side for the first time: the adjudicated filing at m40
 *  (+250 credit via the filed-reputation splice) AND an `honestPostmortems`
 *  transparency claim at m70 on a cause no doc adjudicated — it sets the
 *  honest-host floor but books no credit, so `postmortem-credits-above:200`
 *  stays a true witness of the FILING, not of the speech.
 *  REPUTATION ARITHMETIC (economy/reputation.ts, probe-confirmed): 5000
 *  initial → m20 major −500 → 4500 → m40 blameless +250 → 4750 → m60
 *  second major −500, and here the floor earns its keep: honesty floor
 *  4500 HALVES the hit to −250 → 4500. That 4500 is the knife's edge —
 *  `reputation-above:4500` holds only because the culture was blameless.
 *  The blame flip pays no credit, so the floor never sets, m60 lands full
 *  −500 on 4500 → 4000 and the show ends at t60, exact ×5, seed-free
 *  (money lane is a meter; the clip is a loss-line witness).
 *  NON-EXPRESSIBLE (recorded, Collections-Week ruling): the RFO doc
 *  minigame itself (writing IS filing — the style slot is the whole game
 *  the engine can see), evidence-retention gating, the contractual
 *  obligation clock (no per-contract deliverable rail), and per-customer
 *  trust — reputation is one company scalar (B3 law). */
const THE_RFO_WIRE = {
  schema: "hh-scenario@1",
  id: "the-rfo",
  name: "The RFO",
  brief:
    "Enterprise paper demands a Reason-For-Outage after the region dies. Write it blameless and the house floor halves the next hit; print a finger-pointing doc for the logs and the second outage lands at full weight on a brand nobody trusts.",
  specRef: "§1.5 The RFO",
  specLine: 4054,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "rfo-01", mrcMicroUsd: 60_000_000, billingCycle: "monthly", termEndMin: 12_000, termMonths: 12, autoRenew: true, customer: "Audit Rights Inc" },
  ],
  traffic: {
    tableId: "rfo-plateau",
    segments: [{ fromMinute: 0, ratePerMin: 2 }],
  },
  signals: {
    // Two majors: the outage the RFO answers, and the second one the
    // culture decides the price of.
    majorIncidents: [
      { atMinute: 20, count: 1 },
      { atMinute: 60, count: 1 },
    ],
    honestPostmortems: [{ atMinute: 70, cause: "rfo-second-week-transparency-claim" }],
    postmortems: [
      {
        atMinute: 40,
        incidentMinute: 20,
        style: "blameless",
        changesInFlight: 0,
      },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 100 },
      { kind: "postmortem-credits-above", bps: 200 },
      { kind: "reputation-above", bps: 4500 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [
      { kind: "reputation-below", bps: 4500 },
      { kind: "death-by-cause", cause: "any" },
    ],
  },
  limits: { maxSimMinutes: 120, initialFreeMicroUsd: 10_000_000 },
} satisfies ScenarioWire;

/* ───────────────────────── Threshold Day ───────────────────────────── */

/** §1.5 "The Threshold Day" (:4106) — the corrupts channel (16c6add)
 *  gets its conversion, and the channel is LITERALLY the spec's thesis:
 *  "nothing changed" — no attack, no deploy, no failure — the board just
 *  grew into a limit. On a bounce-mode board a queue jam screams through
 *  the bounces meter; on the corrupts board it makes NO NOISE AT ALL
 *  (defaults.ts pins patienceProbabilityFor('corrupts') to FIXED_ZERO —
 *  a patient-limit breach never bounces), so the dashboard stays green
 *  while units silently rot past their patience and get served corrupt.
 *  The wire arms the channel honestly: `limits.corrupts` names the
 *  traffic table, a patience window, and probabilityBps 10000 = certainty
 *  = the corruptionVerdictFor dice-free arithmetic path. The board is
 *  built at EXACTLY five customers a minute — the engine's tick law is
 *  one completion per slot per minute, so 5 slots IS the capacity line
 *  — and phase one runs at four: the queue never stands, the graph looks
 *  fine. The whole level is step two: the SIXTH arrival per minute, one
 *  row the dashboard barely shows. Backlog grows a unit a minute, the
 *  ten-minute patience window drains quietly, and from the breach
 *  forward every served unit is corrupt while `bounces` stays flat ZERO
 *  — the green-dashboard lie as an objective.
 *  WITNESSES (probe-pinned, deterministic across all five seed offsets —
 *  integer rates + certainty dial + zero retries = pure queueing math):
 *  the win arm ends at the clock with EXACTLY 105 corruptions under the
 *  150 ceiling, and the flip (6/min becomes 7/min) crosses it at
 *  `lose:corruption-above:149@153` on every offset. One row of the
 *  traffic graph doubles the census; nothing else on the wire changes.
 *  The telegraph was the slope, and this vocab finally reads it.
 *  NON-EXPRESSIBLE (recorded): the money consequence of corrupt serving.
 *  The economy mints SLA credits ONLY from spends/locked-risk inputs
 *  (economy/tick.ts:1266/1287) and internal/tickFold.ts — not this lane —
 *  forwards no corruption→outage adapter, so a credit spiral would need
 *  an engine fold change. The corruption COUNT is the observable truth. */
const THE_THRESHOLD_DAY_WIRE = {
  schema: "hh-scenario@1",
  id: "the-threshold-day",
  name: "The Threshold Day",
  brief:
    "No attack, no deploy, no drama — just the graph you stopped watching. The board serves exactly five a minute; the sixth arrival is the threshold. On a corrupts board the queue rots in silence while the bounce meter insists nothing is happening.",
  specRef: "§1.5 The Threshold Day",
  specLine: 4106,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 5, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "threshold-growth",
    segments: [
      { fromMinute: 0, ratePerMin: 4 },
      { fromMinute: 100, ratePerMin: 6 },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 160 },
      { kind: "bounces-below", count: 1 },
      { kind: "corruption-below", count: 150 },
    ],
    lose: [
      { kind: "corruption-above", count: 149 },
      { kind: "bounces-above", count: 0 },
    ],
  },
  limits: {
    maxSimMinutes: 200,
    corrupts: { tables: ["threshold-growth"], patienceMin: 10, probabilityBps: 10_000 },
  },
} satisfies ScenarioWire;

/* ─────────────────── The Founder Bus Factor (rung 6) ─────────────────── */

/** §1.5 "The Founder Bus Factor / Two Weeks' Notice" (:3896), playable core:
 *  the least fungible resource. Ladder rung 6 (`limits.attention`) is the
 *  engine truth here — the departing engineer's handover queue runs as
 *  dense `communicate` + `configure-node` rows, BOTH taxed 1 (the door's
 *  attentionCost vocabulary, L2 lane @eff5694: a taxed verb pays its normal
 *  hand FIRST, then occupies a free attention token), while handCapacity 8
 *  keeps the normal rail from EVER binding — the taxed rail is the level.
 *  The runner mints the pool through triage-window entries at business
 *  minute 0 (the resignation note IS the triage window; runner
 *  mintAttentionPool law), and the calendar mirror (fastForward.ts:1033
 *  @9ca31c3, dead-ledger loan-service pin) rolls month over the pool —
 *  this clock never reaches the first roll (~t420, the covenant calendar
 *  law @957ffcf), so no annual book is needed on this wire.
 *  At capacity 2 the (communicate, configure) PAIRS share the two tokens:
 *  communicate holds 2 ticks, configure 1, and the door's half-open law
 *  (busyUntil <= tick releases) frees the pair exactly when the next pair
 *  lands — all 20 rows execute, win@40 with zero refusals, pure arithmetic
 *  (the understaffed-sunday :3673 @110f516 capacity precedent). Drop the
 *  flip to capacity 1 and the queue jams deterministically: every configure
 *  row arriving mid-handover refuses `attention-debt`, and the 4th refusal
 *  lands at EXACTLY t12 on all five probed offsets —
 *  `lose:intents-refused-above:3@12` ×5, seed-free. Whatever the founder
 *  meant to hand over in the second half of every minute dies with them.
 *  Zero dice: rate-0 segments mint no envelopes (runner envelopesAtMinute
 *  early return), the door path is seed-free, witnesses pin exact ticks.
 *  FOLD (docblock law): the spec's fourteen in-game days fold to the
 *  handover SESSION its queue fits — the same compression long-weekend
 *  (:3662) names for its four-day weekend; the un-chosen days are the
 *  refusals. NON-EXPRESSIBLE (recorded): the DAY-BY-DAY allocation choice
 *  (documenting vs training vs fixing vs relationships needs an
 *  allocation ledger that does not exist), and the permanent loss of
 *  un-chosen knowledge (no tribal-knowledge resource in the state). */
const FOUNDER_BUS_FACTOR_WIRE = {
  schema: "hh-scenario@1",
  id: "the-founder-bus-factor",
  name: "The Founder Bus Factor",
  brief:
    "Two weeks' notice, one senior engineer, and a handover queue that does not fit in their head. Every briefing and every knob-walk burns a real attention token: with two hands on the clock the queue flows; with one, every second thought dies with them.",
  specRef: "§1.5 The Founder Bus Factor / Two Weeks' Notice",
  specLine: 3896,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "bus-factor-quiet",
    segments: [{ fromMinute: 0, ratePerMin: 0 }],
  },
  intents: [
    { atTick: 5, verb: "communicate", args: { target: null, note: "handover-runbook-index" } },
    { atTick: 6, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: "inspect", shedOrder: null } },
    { atTick: 7, verb: "communicate", args: { target: null, note: "handover-secret-locations" } },
    { atTick: 8, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: null, shedOrder: "qos-weighted" } },
    { atTick: 9, verb: "communicate", args: { target: null, note: "handover-oncall-tribal-log" } },
    { atTick: 10, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: "challenge", shedOrder: null } },
    { atTick: 11, verb: "communicate", args: { target: null, note: "handover-whale-relationships" } },
    { atTick: 12, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: null, shedOrder: "lowest-value-first" } },
    { atTick: 13, verb: "communicate", args: { target: null, note: "handover-vendor-favors" } },
    { atTick: 14, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: "sample-1-in-20", shedOrder: null } },
    { atTick: 15, verb: "communicate", args: { target: null, note: "handover-deploy-spells" } },
    { atTick: 16, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: null, shedOrder: "first-in-first-out" } },
    { atTick: 17, verb: "communicate", args: { target: null, note: "handover-incident-scar-map" } },
    { atTick: 18, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: "pass-through", shedOrder: null } },
    { atTick: 19, verb: "communicate", args: { target: null, note: "handover-key-person-phone" } },
    { atTick: 20, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: null, shedOrder: "last-in-first-out" } },
    { atTick: 21, verb: "communicate", args: { target: null, note: "handover-quiet-hacks" } },
    { atTick: 22, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: "inspect", shedOrder: null } },
    { atTick: 23, verb: "communicate", args: { target: null, note: "handover-final-walkthrough" } },
    { atTick: 24, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: null, shedOrder: "qos-weighted" } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 40 },
      { kind: "intents-executed-above", count: 19 },
    ],
    lose: [{ kind: "intents-refused-above", count: 3 }],
  },
  limits: {
    maxSimMinutes: 60,
    handCapacity: 8,
    attention: { capacity: 2, cost: { communicate: 1, "configure-node": 1 } },
  },
} satisfies ScenarioWire;

/* ───────────────────── The Change Freeze (rung 8) ─────────────────────── */

/** §1.5 "The Change Freeze / Frozen Change / Read-Only Friday" (:3641).
 *  Ladder rung 8 (`limits.freeze`) wires the spec's hazard tape through the
 *  door's two EXISTING host-validator seams — `canPlaceDevice` and
 *  `canAdjustPrice` (intent-door.ts:170/175) — answered by the runner's
 *  tape-band validator while the inclusive [fromMinute, toMinute] window
 *  holds (tick-clock reading: the door runs pre-step, so its context.tick
 *  is the rail's atTick). Deploys and price moves refuse under the tape;
 *  the spec's "runtime knobs only" list is honored by construction —
 *  configure-node (flags/TTLs/inspection), shed-load (traffic steering)
 *  and communicate (announcements) carry NO validator seam and stay legal
 *  inside the band. The win arm proves the ladder is climbable WITHOUT
 *  flying by hand: every under-tape row executes, the pre-freeze deploy
 *  lands, the post-thaw deploy lands, zero refusals.
 *  HONEST v1 (recorded twice, per spec's own words): place never routed
 *  throughput on this board anyway — the arrival step reads envelopes, not
 *  topology — so the freeze is exactly what the spec calls it, a
 *  SCORING-CONSTRAINT BAND ("clicking under it plays a refusal"), not a
 *  capacity mechanic. The connect-ports verb has NO host seam on the door
 *  in v1: dragging a cable under the tape stays legal (gap recorded for
 *  the door lane). The "break the freeze ONCE" variant needs a one-veto
 *  counter the observation does not carry.
 *  Zero dice: integer segment rates mint without arrival rolls (the
 *  free-tier-flood :3590 determinism law); the flip moves the probe row's
 *  atTick INSIDE the band (t20 → t75) and loses
 *  `lose:intents-refused-above:0@75` at that exact tick on all five probed
 *  offsets — the tape refuses on the beat, every seed, like the spec's
 *  hazard tape plays its refusal sound. */
const CHANGE_FREEZE_WIRE = {
  schema: "hh-scenario@1",
  id: "the-change-freeze",
  name: "The Change Freeze",
  brief:
    "The board mandated N quiet days and the tape is diagonal across the deploy button. Something breaks mid-freeze — fix it with knobs you already own: flags, steering, words. The deploy you refuse is the level; the deploy you sneak is the audit finding.",
  specRef: "§1.5 The Change Freeze / Read-Only Friday",
  specLine: 3641,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "freeze-weather",
    segments: [
      { fromMinute: 0, ratePerMin: 2 },
      { fromMinute: 60, ratePerMin: 14 },
      { fromMinute: 120, ratePerMin: 2 },
    ],
  },
  intents: [
    { atTick: 20, verb: "place-device", args: { nodeId: "web-2", deviceKind: "shared-web", template: null } },
    { atTick: 70, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: "challenge", shedOrder: null } },
    { atTick: 80, verb: "shed-load", args: { nodeId: "web-1", qosClassId: null } },
    { atTick: 90, verb: "communicate", args: { target: null, note: "freeze-incident-sticky-note" } },
    { atTick: 150, verb: "place-device", args: { nodeId: "web-3", deviceKind: "shared-web", template: null } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "intents-refused-below", count: 1 },
    ],
    lose: [{ kind: "intents-refused-above", count: 0 }],
  },
  limits: {
    maxSimMinutes: 240,
    freeze: { fromMinute: 60, toMinute: 120 },
  },
} satisfies ScenarioWire;

/* ───────────── Free Tier Flood — corpus twin (no new rung) ───────────── */

/** §1.5 "Free Tier Flood" (:3590) again, through the waves-tableId seam
 *  (@5df5586) instead of hand-typed plateaus: the organic trickle stays
 *  authored (the baseline envelope — the free tier's genuine signups),
 *  while the FLOOD is a citation of the shipped g1 mail-hosting quarter —
 *  wave 1 (scanner drizzle, all malicious) and wave 4 (layer-7 mimic +
 *  ticket hydra, mimic-dominant) stack at the content's own rates through
 *  the same planWave law the campaign plays. The wire cites the mail
 *  slice because its first four waves are the quarter's most
 *  malicious-dominant composition (registry-core families: scanner-drizzle,
 *  vulnerable-plugin-compromise, wp-login-brute-squad, layer7-mimic all
 *  malicious; the wave-5 crest is systemic-dominant and its storm dice are
 *  deliberately outside this band — the metastable-corpus :4096 twin keeps
 *  the finale for its own cascade witness).
 *  Same abuse-ceiling reading as the segments twin (:3590), narrowed to the
 *  malicious census pair per this lane's vocab: the citation must flood
 *  attacks ABOVE a floor that proves the storm actually spawned, while the
 *  whole cited band stays BELOW the abuse ceiling the free-tier controls
 *  were tuned to (the organic baseline at 8/min × 240 = 1,920 genuine
 *  mints rides along underneath, deterministic by the integer-rate law). The corpus
 *  rates are the content's — they roll the waveStream dice — so the
 *  census is seed-robust by CEILING MARGIN, not by exact arithmetic: the
 *  win arm measures 145–149 malicious mints on all five probed offsets
 *  (floor 120 and ceiling 176 both hold with 25+/27+ margins). Flip: cite
 *  wave 2 (the brute squad's own storm band) into the queue — waves [1,4]
 *  → [1,2,4] — and the abuse crosses the ceiling at t[39,39,38,35,35]
 *  across the offsets, the dice-visible banded witness the
 *  metastable-corpus twin's protocol (@5df5586) was built for. NON-EXPRESSIBLE rides with the segments
 *  twin (KYC walls, payment rails — the defense board slice). */
const FREE_TIER_FLOOD_CORPUS_WIRE = {
  schema: "hh-scenario@1",
  id: "free-tier-flood-corpus",
  name: "Free Tier Flood (Corpus Twin)",
  brief:
    "The free tier opens to a trickle of genuine blogs; the flood is not typed in — it is whatever the quarter's own waves do to a mail box. Keep the abuse census under the ceiling the controls were tuned to without strangling the signups that made the tier worth running.",
  specRef: "§1.5 Free Tier Flood / Free Tier Abuse / Free Tier Invaded",
  specLine: 3590,
  board: {
    nodes: [{ id: "edge-1", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "g1-mail-hosting-first-quarter",
    waves: [1, 4],
    waveStartMinute: 2,
    baselineRatePerMin: 8,
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "family-arrivals-above", family: "malicious", count: 120 },
      { kind: "family-arrivals-below", family: "malicious", count: 176 },
    ],
    lose: [{ kind: "family-arrivals-above", family: "malicious", count: 175 }],
  },
  limits: { maxSimMinutes: 240 },
} satisfies ScenarioWire;

/* ───────────── The Ransom Customer (corpus + opex choice) ─────────────── */

/** §1.5 "The Ransom Customer / Ransom DDoS / Extortion" (:4000).
 *  The wire-level choice is the opex ledger: one row at m60 titled
 *  "ransom-paid" for 40 Mµ$ — the exact shape of a payoff the unattended
 *  lane already honors (a burn the company VOLUNTEERS). The storm is a
 *  citation of the shipped g1 mail quarter (waves 1+4 — the scanner
 *  drizzle and the layer-7 ticket hydra; the wave-5 systemic crest stays
 *  outside this band, same reading as the free-tier-flood-corpus twin
 *  @5df5586). HONEST v1, stated plainly: RESPONSE-CONDITIONAL traffic is
 *  a BLOCKING primitive the engine does not have — paying the ransom does
 *  NOT truncate the storm. What this mission scores is survival
 *  economics: the paid arm's bounce census is IDENTICAL to the unpaid
 *  arm's at every probed tick (the test pins it as the correlation-not-
 *  causation control witness), so the ransom is only ever a ledger
 *  decision. The objectives mirror the spec's own inversion: WIN holds
 *  the paid choice inside the book's corridor — cash stays ABOVE the
 *  60 Mµ$ floor and BELOW the 167 Mµ$ ceiling the whole clock — while
 *  the LOSE flip DROPS the ransom row and the withheld 40 Mµ$ lets the
 *  hourly anchor's climb cross the ceiling at the pinned per-offset tick
 *  [180,185,184,182,180] on seeds 904–908. Refusing to pay is the
 *  engine-legible "failure" here because the ceiling row is authored as
 *  the losing line: the game that scores a fattened cash box as a win
 *  cannot tell this story, so the wire names the box itself as the
 *  losing ledger. NON-EXPRESSIBLE rides (recorded, spec :4000 body):
 *  "paying marks you as a payer", the next-pool-worse escalation, and
 *  law-enforcement advice arcs — none have a state channel in v0
 *  (no payer-mark exists to carry them). Dice law: churn rolls only at
 *  business-month rolls (first at t420 with a 240-minute clock — never);
 *  the money lane's cash jitter across offsets comes from the clean-week
 *  refund dice alone, which is why the crossing ticks are pinned
 *  per-offset in the [180,185] band the probe measured. */
const RANSOM_CUSTOMER_WIRE = {
  schema: "hh-scenario@1",
  id: "the-ransom-customer",
  name: "The Ransom Customer",
  brief:
    "A mail box gets a note with a bitcoin address. The storm does not care whether you pay — the engine has no response-conditional traffic. The ledger remembers the 40 grand: pay and the quarter stays inside the corridor; hold and the money you kept becomes the number that loses.",
  specRef: "§1.5 The Ransom Customer / Ransom DDoS / Extortion",
  specLine: 4000,
  board: {
    nodes: [{ id: "mail-1", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "rc-01", mrcMicroUsd: 500_000_000, billingCycle: "hourly", termEndMin: 6_000, termMonths: 12, autoRenew: true },
  ],
  traffic: {
    tableId: "g1-mail-hosting-first-quarter",
    waves: [1, 4],
    waveStartMinute: 2,
    baselineRatePerMin: 8,
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "cash-above", microUsd: 60_000_000 },
      { kind: "bounces-below", count: 150 },
    ],
    lose: [
      { kind: "cash-above", microUsd: 167_000_000 },
      { kind: "death-by-cause", cause: "any" },
    ],
  },
  limits: {
    maxSimMinutes: 240,
    initialFreeMicroUsd: 100_000_000,
    opex: [{ atMinute: 60, amountMicroUsd: 40_000_000, memo: "ransom-paid" }],
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* The Copycat (§1.5 :3445) — the rung-7 price-war half. THE WIRE WIDENS:
 *  the whale row carries `priceKey: "plan:copycat-shield"`, registering it
 *  against the L1 elasticity book (@5781335), and the rung-8 door rail
 *  speaks the adjust-price verb (@0032a21): at t30 the player cuts the
 *  shield plan to 85% of MRC. A 15% deviation sits OUTSIDE the ±10% dead
 *  band, so the churn factor is 9_250 bps (§6.4 elasticity, coefficient
 *  150%) and the whale's monthly logo-churn floor drops 450 → 416 bps —
 *  the discount genuinely buys odds on the MONTHLY fuse. The cliff never
 *  moves: the retention factor clamps at exactly 1.0 under any cut
 *  (§5.11 — "no discount ever bought certainty"), so the t1680 renewal
 *  (autoRenew, unconditional) is calendar, not dice. THE FLIP IS THE
 *  CONTROL: a timid 5% cut stays inside the dead band, every factor is
 *  exactly 10_000, applyFactorBps takes its identity early-exit, and ZERO
 *  odds change — the same whale then churns on the RAW 450 bps floor.
 *  Witness (seeds 904–908, engine-verified, contract slug cc-klya under
 *  the id-dice law — the slug moves BOTH the churn and the payment dice,
 *  and twelve candidates died of dunning write-offs before this one ran
 *  clean): the 15% arm wins at 2880 on offsets 0-2 (whale dice ≥ 450 all
 *  seven months); the 5% flip loses `churn-above:0` at
 *  [420,840,1260,1680,2520] — offsets 0-2 cross the strict band (dice in
 *  [416,450): the discount is exactly what saved them) while offsets 3-4
 *  (seeds 907-908) roll under 416 too: the discount never reaches that
 *  far, both arms churn, recorded honestly. HONEST PARTIAL (§1.5 asks the
 *  price war to decide every seat): a 60,000,000-slug brute force over
 *  the shipped 34 bps band found NO seed-set where all five crossings
 *  stay inside the band (per-seed hit rate ≈ 0.34% per month — the
 *  geometry of a narrow dead-band edge), so the win arm is pinned on the
 *  suite-standard three offsets and the flip table names the two loose
 *  seeds by tick. The billing half is deterministic either way: the cut
 *  shrinks every monthly invoice by 15% or 5% through
 *  effectiveBaseMicroUsd (tick.ts:911) — margin destroyed is visible in
 *  cashEnd (135.2 Bµ$ win arms vs 51–141 Bµ$ flip stops), the spec's
 *  "respond with price (destroy margin)" leg. */
const COPYCAT_WIRE = {
  schema: "hh-scenario@1",
  id: "the-copycat",
  name: "The Copycat",
  brief:
    "A rival undercuts you. A 15% cut lands outside the dead band — the monthly churn dice hear it. The cliff ignores price by law: no discount ever bought certainty. The timid 5% flip rolls no dice at all, and the whale churns on the raw floor.",
  specRef: "§1.5 The Copycat / The Price War",
  specLine: 3445,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "cc-klya", mrcMicroUsd: 36_000_000_000, billingCycle: "monthly", termEndMin: 172_800, termMonths: 12, autoRenew: true, priceKey: "plan:copycat-shield" },
  ],
  traffic: {
    tableId: "g1-shared-web-first-quarter",
    segments: [{ fromMinute: 0, ratePerMin: 0 }],
  },
  intents: [
    { atTick: 30, verb: "adjust-price", args: { targetKind: "plan", targetId: "copycat-shield", newPriceMicroUsd: 30_600_000_000, effectiveAtBusinessMinute: null } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 2880 },
      { kind: "churn-below", count: 1 },
      { kind: "cash-above", microUsd: 10_000_000_000 },
      { kind: "intents-executed-above", count: 0 },
    ],
    lose: [
      { kind: "churn-above", count: 0 },
      { kind: "death-by-cause", cause: "any" },
    ],
  },
  limits: {
    maxSimMinutes: 2880,
    initialFreeMicroUsd: 20_000_000_000,
    dunningEngineOwned: true,
  },
} satisfies ScenarioWire;

/* ─────────── The Understaffed Sunday — triage twin (rung 9, wave eight) ── */

/** §1.5 "The Understaffed Sunday" (:3673) re-read through the rung-9 lens.
 *  The original counts the NO's (`intents-refused-above`); this twin asks
 *  WHICH verb ate them. One hand, three runbook knob-walks (configure-node)
 *  that Monday's shift depends on, and two incoming calls (communicate):
 *  handCapacity 1 makes a collision certain, so the story is triage, not
 *  throughput. The discriminator is a one-tick flip — arm B ANSWERS THE
 *  SECOND CALL ON TIME (t6 → t7) and the collision moves to the first
 *  knob-walk at t8, where the lose line kills the run. The REFUSED TOTAL
 *  is 1 in both arms — the pre-rung-9 census reads the same single "no"
 *  either way and any total-based refused line answers identically on
 *  both; only the per-verb census separates "a call got dropped" (arm A,
 *  refused {communicate:1}) from "Monday's runbook got dropped" (arm B,
 *  refused {configure-node:1}). Arm B's executed total reads 2 only
 *  because its death cuts the rail short at @8 — the full five-row rail
 *  would execute 4 in both arms.
 *  Zero dice: rate-0 traffic mints no envelopes (founder :3896 @110f516
 *  precedent), the door path is seed-free, witnesses pin exact ticks ×5.
 *  NON-EXPRESSIBLE (recorded): the spec's ticket-entity backlog — same note
 *  as the original Sunday at :1123; the refused-count stays its honest
 *  proxy, rung 9 only adds WHICH verb the proxy counted. */
const UNDERSTAFFED_SUNDAY_TRIAGE_WIRE = {
  schema: "hh-scenario@1",
  id: "understaffed-sunday-triage",
  name: "The Understaffed Sunday (Triage Twin)",
  brief:
    "Same Sunday, one hand, and a collision that MUST happen: two calls and three knob-walks. Something gets dropped — the mission is making sure it is a call, not Monday's runbook. Total refusals look identical either way; only the per-verb census knows which promise died.",
  specRef: "§1.5 The Understaffed Sunday",
  specLine: 3673,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "triage-sunday",
    segments: [{ fromMinute: 0, ratePerMin: 0 }],
  },
  intents: [
    { atTick: 5, verb: "communicate", args: { target: null, note: "sunday-call-queue-open" } },
    { atTick: 6, verb: "communicate", args: { target: null, note: "sunday-call-overflow-01" } },
    { atTick: 8, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: "inspect", shedOrder: null } },
    { atTick: 10, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: null, shedOrder: "qos-weighted" } },
    { atTick: 12, verb: "configure-node", args: { nodeId: "web-1", inspectionDepth: "sample-1-in-20", shedOrder: null } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 12 },
      // The rung-9 line: the RUNBOOK is what must survive the Sunday.
      { kind: "intents-executed-above", verb: "configure-node", count: 2 },
      // Throughput floor (control-shape line, self-documenting): the plain
      // total census still has a job — it says the rail moved — but it is
      // NOT what tells the arms apart. The refused totals match at 1.
      { kind: "intents-executed-above", count: 3 },
    ],
    lose: [
      // Dropping a CALL is survivable noise; dropping a KNOB-WALK is the
      // loss. The total refused census reads 1 in BOTH arms — this line is
      // only legible with the verb dimension.
      { kind: "intents-refused-above", verb: "configure-node", count: 0 },
    ],
  },
  limits: {
    maxSimMinutes: 60,
    handCapacity: 1,
  },
} satisfies ScenarioWire;

/** §1.5 "Free Tier Flood / Free Tier Abuse / Free Tier Invaded" — the MIX
 *  TWIN, rung 10 (the familyMix dial). The label twin above proved the
 *  census could count the stream BY LABEL, and recorded loudly that the
 *  spec's ninety-percent mix was fiction: one envelope per minute means a
 *  segment names ONE family, so the flood REPLACED the organic label
 *  instead of diluting it. This twin finally tells the spec's truth: the
 *  segments stay label-less organic — two days of plausible signups, the
 *  cover story the dashboard believed — while `limits.familyMix` rolls
 *  every minted visitor's identity at the arrival dice: ninety percent
 *  miners and relays (customerAsThreat → abuser), five percent careless
 *  staff (human → human-error), five percent datacenter weather (systemic).
 *  The runner counts the ROLL, not the label (runner.ts
 *  observeMintedFamilies) — the ninety percent is no longer fiction.
 *  ENGINE TRUTH (the dial's honest v0 scope, doc.ts familyMix row): all
 *  five families the table can name are adversarial — the dial chooses
 *  which FLAVOR dominates; it can never mint benign traffic. And the
 *  flavors are mechanistically identical through the pipeline (same bounce,
 *  patience and suspicion law), so what discriminates this mission is
 *  census arithmetic over the composition — the rung-3 precedent's own kind
 *  of story, now actually about the mix.
 *  ARITHMETIC (clock 240; integer rates, so mint COUNTS never roll the
 *  dice: 8/min × m1–59 + 20/min × m60–119 + 26/min × m120–240 = 4,818
 *  mints): the shipped mix puts customerAsThreat ≈ Binomial(4818, 0.9),
 *  mean 4,336, sd ≈ 20.8 — a mile above the detection floor 4,000 and a
 *  mile below the control ceiling 4,700 on every probed offset; the human
 *  minority (mean ≈ 241, sd ≈ 15) stays visible above 120. FLIP — one
 *  field, the dial itself — to {customerAsThreat: 1, all others 0}: the
 *  flood is TOTAL. Every mint rolls abuser, so the abuse census EQUALS
 *  cumulative arrivals — dice forced, seed-invariant: 4,688 at t235, 4,714
 *  at t236 — the ceiling line crosses at EXACTLY t236 on all five probed
 *  offsets. CONTROL — delete the dial: the stream reverts to honest organic
 *  labels, the abuse census counts zero forever, the detection floor never
 *  closes the win (timeout@240). The mix attribution is load-bearing:
 *  without rung 10 this mission's story is literally untellable on the wire. */
const FREE_TIER_FLOOD_MIX_WIRE = {
  schema: "hh-scenario@1",
  id: "free-tier-flood-mix",
  name: "Free Tier Flood (Mix Twin)",
  brief:
    "The flood again — but the truth is a mix, not a label. Signups keep their organic name on the dashboard while ninety percent roll as miners and relays. Count the stream BY IDENTITY: abuse visible above the detection floor, under the ceiling the tier controls were tuned to.",
  specRef: "§1.5 Free Tier Flood / Free Tier Abuse / Free Tier Invaded",
  specLine: 3590,
  board: {
    nodes: [{ id: "edge-1", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "freetier-mix-twin",
    segments: [
      { fromMinute: 0, ratePerMin: 8 },
      { fromMinute: 60, ratePerMin: 20 },
      { fromMinute: 120, ratePerMin: 26 },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      // Detection floor: ninety percent abuse must be VISIBLE by name.
      { kind: "family-arrivals-above", family: "customerAsThreat", count: 4000 },
      // The composition minority reads too — the dial's 5% staff sloppiness
      // is countable, not just the 90% headline.
      { kind: "family-arrivals-above", family: "human", count: 120 },
    ],
    lose: [
      // Control ceiling: total flood — the tier controls choke at 4,700.
      { kind: "family-arrivals-above", family: "customerAsThreat", count: 4700 },
    ],
  },
  limits: {
    maxSimMinutes: 240,
    familyMix: {
      weights: {
        customerAsThreat: 900_000,
        entropic: 0,
        human: 50_000,
        malicious: 0,
        systemic: 50_000,
      },
    },
  },
} satisfies ScenarioWire;

/* ───────────── The Not-Invented-Yet — era pilot (§0.4/§1.6, L-EM) ───────────── */

/** §1.6 "The Era Track" (:4578) + §0.4's grid sentence (:656), through the
 *  L-EM era door stage (scenario/eraAvailability.ts — ADR-0019 program 4):
 *  the FIRST engine implementation of "not invented yet". The era arms from
 *  run CONFIG (eraYear + eraBundle), never from the wire, so this doc is
 *  eraless like its thirty siblings and rides their byte-stand law.
 *  ERALESS / 2026: all three place-device intents execute (the dated
 *  shared-web line lives; the safe "generic" kind belongs to no dated line —
 *  the never-invents law: the gate denies only what the line NAMES). The
 *  1998 flip: the two cPanel-era placements refuse at the door PRE-PAYMENT
 *  (hands never touched — L-CE posture) while web-3 still places; the lose
 *  line `intents-refused-above:place-device:0` fires at the first refusal
 *  — per-verb rung-9 dimension, ZERO new predicate vocab. The board node
 *  web-1 kind "shared-web" rides untouched on purpose: the board is the
 *  host's gift; the door is the player's hand, and only the hand greys. */
const NOT_INVENTED_YET_WIRE = {
  schema: "hh-scenario@1",
  id: "the-not-invented-yet",
  name: "The Not-Invented-Yet",
  brief:
    "The calendar says 1998 and the tech tree agrees: the door refuses both shared-web placements without taking a single hand — 'not invented yet' as engine fact — while the plain generic box still slides in. Arm 2026: the identical script executes three for three.",
  specRef: "§1.6 The Era Track",
  specLine: 4578,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "era-weather",
    segments: [
      { fromMinute: 0, ratePerMin: 2 },
      { fromMinute: 60, ratePerMin: 14 },
      { fromMinute: 120, ratePerMin: 2 },
    ],
  },
  intents: [
    { atTick: 20, verb: "place-device", args: { nodeId: "web-2", deviceKind: "shared-web", template: null } },
    { atTick: 30, verb: "place-device", args: { nodeId: "web-3", deviceKind: "generic", template: null } },
    { atTick: 150, verb: "place-device", args: { nodeId: "web-4", deviceKind: "shared-web", template: null } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      // All three placements EXECUTE eraless (and in 2026): strict > 2.
      { kind: "intents-executed-above", verb: "place-device", count: 2 },
    ],
    lose: [
      // The 1998 flip: the FIRST era refusal is the witness (strict > 0).
      { kind: "intents-refused-above", verb: "place-device", count: 0 },
    ],
  },
  limits: { maxSimMinutes: 240 },
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
  [COVENANT_WIRE.id]: COVENANT_WIRE,
  [REVIEW_BOMB_WIRE.id]: REVIEW_BOMB_WIRE,
  [UNDERSTAFFED_SUNDAY_WIRE.id]: UNDERSTAFFED_SUNDAY_WIRE,
  [CHARGEBACK_WAVE_WIRE.id]: CHARGEBACK_WAVE_WIRE,
  [SLOW_WEEK_AFTER_WIRE.id]: SLOW_WEEK_AFTER_WIRE,
  [SOMEONE_ELSES_OUTAGE_WIRE.id]: SOMEONE_ELSES_OUTAGE_WIRE,
  [THE_RFO_WIRE.id]: THE_RFO_WIRE,
  [THE_THRESHOLD_DAY_WIRE.id]: THE_THRESHOLD_DAY_WIRE,
  [FOUNDER_BUS_FACTOR_WIRE.id]: FOUNDER_BUS_FACTOR_WIRE,
  [CHANGE_FREEZE_WIRE.id]: CHANGE_FREEZE_WIRE,
  [FREE_TIER_FLOOD_CORPUS_WIRE.id]: FREE_TIER_FLOOD_CORPUS_WIRE,
  [RANSOM_CUSTOMER_WIRE.id]: RANSOM_CUSTOMER_WIRE,
  [COPYCAT_WIRE.id]: COPYCAT_WIRE,
  [UNDERSTAFFED_SUNDAY_TRIAGE_WIRE.id]: UNDERSTAFFED_SUNDAY_TRIAGE_WIRE,
  [FREE_TIER_FLOOD_MIX_WIRE.id]: FREE_TIER_FLOOD_MIX_WIRE,
  [NOT_INVENTED_YET_WIRE.id]: NOT_INVENTED_YET_WIRE,
});

/* ─────────────────────────── trusted records ─────────────────────────── */

/** The shipped documents, parsed at module load — authored drift
 *  dies HERE, loudly, before any test or host can consume it. The first
 *  five carry named exports (hosts import them directly); every later
 *  mission is reachable through SHIPPED_SCENARIOS /
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
const theCovenantDoc: ScenarioDoc = parseScenarioDoc(COVENANT_WIRE);
const reviewBombDoc: ScenarioDoc = parseScenarioDoc(REVIEW_BOMB_WIRE);
const understaffedSundayDoc: ScenarioDoc = parseScenarioDoc(UNDERSTAFFED_SUNDAY_WIRE);
const chargebackWaveDoc: ScenarioDoc = parseScenarioDoc(CHARGEBACK_WAVE_WIRE);
const slowWeekAfterDoc: ScenarioDoc = parseScenarioDoc(SLOW_WEEK_AFTER_WIRE);
const someoneElsesOutageDoc: ScenarioDoc = parseScenarioDoc(SOMEONE_ELSES_OUTAGE_WIRE);
const theRfoDoc: ScenarioDoc = parseScenarioDoc(THE_RFO_WIRE);
const theThresholdDayDoc: ScenarioDoc = parseScenarioDoc(THE_THRESHOLD_DAY_WIRE);
const founderBusFactorDoc: ScenarioDoc = parseScenarioDoc(FOUNDER_BUS_FACTOR_WIRE);
const changeFreezeDoc: ScenarioDoc = parseScenarioDoc(CHANGE_FREEZE_WIRE);
const freeTierFloodCorpusDoc: ScenarioDoc = parseScenarioDoc(FREE_TIER_FLOOD_CORPUS_WIRE);
const theRansomCustomerDoc: ScenarioDoc = parseScenarioDoc(RANSOM_CUSTOMER_WIRE);
const theCopycatDoc: ScenarioDoc = parseScenarioDoc(COPYCAT_WIRE);
const understaffedSundayTriageDoc: ScenarioDoc = parseScenarioDoc(UNDERSTAFFED_SUNDAY_TRIAGE_WIRE);
const freeTierFloodMixDoc: ScenarioDoc = parseScenarioDoc(FREE_TIER_FLOOD_MIX_WIRE);
const notInventedYetDoc: ScenarioDoc = parseScenarioDoc(NOT_INVENTED_YET_WIRE);

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
  theCovenantDoc.id,
  reviewBombDoc.id,
  understaffedSundayDoc.id,
  chargebackWaveDoc.id,
  slowWeekAfterDoc.id,
  someoneElsesOutageDoc.id,
  theRfoDoc.id,
  theThresholdDayDoc.id,
  founderBusFactorDoc.id,
  changeFreezeDoc.id,
  freeTierFloodCorpusDoc.id,
  theRansomCustomerDoc.id,
  theCopycatDoc.id,
  understaffedSundayTriageDoc.id,
  freeTierFloodMixDoc.id,
  notInventedYetDoc.id,
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
  [theCovenantDoc.id]: theCovenantDoc,
  [reviewBombDoc.id]: reviewBombDoc,
  [understaffedSundayDoc.id]: understaffedSundayDoc,
  [chargebackWaveDoc.id]: chargebackWaveDoc,
  [slowWeekAfterDoc.id]: slowWeekAfterDoc,
  [someoneElsesOutageDoc.id]: someoneElsesOutageDoc,
  [theRfoDoc.id]: theRfoDoc,
  [theThresholdDayDoc.id]: theThresholdDayDoc,
  [founderBusFactorDoc.id]: founderBusFactorDoc,
  [changeFreezeDoc.id]: changeFreezeDoc,
  [freeTierFloodCorpusDoc.id]: freeTierFloodCorpusDoc,
  [theRansomCustomerDoc.id]: theRansomCustomerDoc,
  [theCopycatDoc.id]: theCopycatDoc,
  [understaffedSundayTriageDoc.id]: understaffedSundayTriageDoc,
  [freeTierFloodMixDoc.id]: freeTierFloodMixDoc,
  [notInventedYetDoc.id]: notInventedYetDoc,
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
