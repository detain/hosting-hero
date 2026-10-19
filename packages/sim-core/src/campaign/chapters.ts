/** chapters.ts — the authored campaign content (Prologue + Act I + Act II + Act III + Exit).
 *
 *  This module is DATA riding law, zero new authority: five `hh-campaign@1`
 *  documents parsed through the L-CP1 wall (`parseCampaignDoc`), fourteen
 *  perspective-bearing or bespoke scenario documents (`hh-scenario@1`)
 *  authored in-module because `runScenario` accepts host-authored docs without
 *  scenarios.ts registration (the L-CP3 PerspectiveScenarioWire precedent —
 *  two seats in Act I, two seats plus THE HARDEST LESSON death level plus the
 *  wave-27 money-ledger beats in Act II — where the noc-shift seat is worn a
 *  SECOND time at b-11, the campaign's first perspective REUSE (no lint law
 *  forbids it: roster membership and cadence are per-chapter tests) — and eight
 *  Act III levels — two seats, three authored homages of
 *  §1.5 fiction, and the bespoke beats including the exit run-up; see the
 *  ACT_THREE notes for the corpse-audit roster law) — and a chapter-meta
 *  ledger (archetype / specLine / perspective /
 *  tier) that the `CampaignChapterSpec` wire deliberately does NOT
 *  carry — the §1.9 11-archetype taxonomy and its no-consecutive law are an
 *  AUTHORING discipline enforced by chapters.test.ts, not engine state.
 *
 *  Shape canon (hosting_game.md, located by TEXT 2026-10-17):
 *  - §1.9 Three-Act Shape (~:5110): Act I (T0–2) teaches the core loop; each
 *    act carries at minimum two perspective-shift levels and one scenario.
 *  - §1.9 11-archetype taxonomy (~:5067): Endure is the DEFAULT and must stay
 *    under 30% of the campaign; no two consecutive levels share a tag.
 *  - OD-19 adopted act table (docs/DECISIONS-PENDING.md, ADR-0013 ruling 10):
 *    Prologue (T0–0.5, first mastery inside 3 minutes) / Act I panic→process.
 *  - §1.9 Act III (Tiers 5–6) — "8 levels, 30–45 minutes each, portfolio and
 *    geography" (:5126): shipped as NINE minute-scale beats on the same carry
 *    machinery — the 8→9 supersession is cadence-law arithmetic, recorded in
 *    the ACT_THREE docblock, and §1.9's per-act floor of two perspective
 *    levels is FINALLY satisfiable at that length (seats at tour indices
 *    21 and 26 — gaps 5 and 5 under the standing global every-5 law).
 *  - §1.6 carry-over-thin + the three floors (~:4310): below the cash floor a
 *    SCRIPTED BRIDGE replaces the war chest — every chapter after the first
 *    opens at the bridge, so the act is playable regardless of how thin the
 *    last win left the bankroll.
 *  - §1.11 The Ratchet Audit (:5351): "a level that tests only your
 *    carried-over automation", the doc's own audit sentence — "the *ideal*
 *    play is to do nothing and watch" (:5353). Act III c-2 plays it with a
 *    ZERO-intent rail and a win line that fails the moment a hand moves.
 *
 *  Honest disclosures (probe-derived, not asserted):
 *  - NO SHIPPED registry doc dies in-campaign with a `lose:death-by-cause:any@`
 *    stop at the bridge (the only registry death witness is a FLIPPED
 *    deadbeat-quarter in runner.test.ts — a no-customers no-cash forgery, not
 *    the shipped doc), so Act I tests assert the win-through ledger. Act II
 *    answers the gap with an AUTHORED level that dies in the shape — the
 *    §1.6 shortening made playable (see ACT_TWO notes: probe trail verbatim).
 *  - §1.9's per-act "two perspective levels" floor was met by Act I, filed as
 *    direct tension by the 7-beat Act II (a second seat could not fit ≥5 after
 *    b-6's tour index 16), and was RESTORED by Act III (seats c-4/c-9 at indices
 *    21 and 26 — gaps 5 and 5 under the standing global every-5 law).
 *    WAVE-27 RESOLUTION (dated rider 2026-10-19, owner-commissioned full-12
 *    growth): Act II now carries TWO seats — b-6 and b-11 — with b-11 REUSING
 *    the §1.2 noc-shift roster row: the campaign's first perspective reuse,
 *    lawful by construction (the lint law is roster-membership + cadence, and
 *    PERSPECTIVE_EXPRESSIBILITY is keyed per perspective, never per chapter).
 *    The whole-tour seats land at indices 4, 10, 16, 21, 26, 31 — gaps
 *    {6,6,5,5,5} — for the FIRST TIME IN CAMPAIGN HISTORY every act sits at the
 *    per-act floor of two without breaking the cadence. The tension the 7-beat
 *    act filed is CLOSED by the growth its own _todo commissioned.
 *    The Prologue stays exempt BY OD-19 (first-mastery-inside-3-minutes: a seat swap
 *    before the player knows the default seat is tuition friction, not shape).
 *  - Act III's re-ride roster is CORPSE-filtered (wave-26 probe trail,
 *    ACT_THREE docblock verbatim): every shipped §1.5 storm doc the design
 *    dossier proposed either opens ABOVE the scripted bridge (the-covenant
 *    100B, review-bomb 1B, the-sev-0 500M — the never-poorer cash-floor law
 *    refuses silent rebases and grants no ACT III thin-ride exception (the
 *    machinery is Act II's alone, and its roster grew only inside Act II at
 *    the wave-27 full-12 expansion) or
 *    rides to a WIN AS A DISSOLVED COMPANY (an empty book arms §2.9's
 *    churn-floor watch from t1, the three-day spell executes the company at
 *    ~t44 cash-independently, and a doc without a death lose-line grades the
 *    corpse — the law Act II filed). Three beats therefore RE-AUTHOR the same
 *    §1.5 fiction with the §1.6 floor clause the campaign cadence will not
 *    wait for; the one true re-ride (c-3 understaffed-sunday) fires its
 *    win@40 before the floor can speak.
 *  - The cash-floor numerics are PROVISIONAL (OD-19 carries no ratified
 *    numbers): threshold/bridge below are grounded from shipped-doc openings
 *    (bridge 300_000_000 µ$ = the-price-hike's own war chest, the leanest
 *    opening a shipped Act-I siege survives on — probe-verified 2026-10-17:
 *    at 250M the hike starved by 3M at its 50M knife-edge) and re-pinned by
 *    the probe run, never hand-waved.
 *
 *  Barrel discipline: this module is deliberately NOT re-exported from
 *  campaign/index.ts — content data, not API surface (api-verify sees zero
 *  new names; consumers import the file directly).
 */

import type { ScenarioDoc, ScenarioWire } from "../scenario/index.ts";
import { parseScenarioDoc } from "../scenario/index.ts";
import type { CampaignDoc } from "./doc.ts";
import { parseCampaignDoc } from "./doc.ts";

/** L-CP2's `perspective` row parses at the scenario wall but is deliberately
 *  absent from the registry's own `ScenarioWire` (no shipped doc wears a seat).
 *  Campaign-authored perspective levels declare it via this extension — the
 *  parse wall is the authority, the type is authoring ergonomics. */
type PerspectiveScenarioWire = ScenarioWire & {
  readonly perspective: { readonly id: string };
};

/* ------------------------------------------------------------------ */
/* §1.9 authoring-layer chapter meta                                    */
/* ------------------------------------------------------------------ */

/** The eleven §1.9 level archetypes (verbatim vocabulary). */
export const CAMPAIGN_ARCHETYPES = [
  "Endure",
  "Convert",
  "Reach-State",
  "Escort",
  "Diagnose",
  "Build-to-Spec",
  "Shrink",
  "Schedule",
  "Negotiate",
  "Hold-Without-Hands",
  "Inherit",
] as const;
export type CampaignArchetype = (typeof CAMPAIGN_ARCHETYPES)[number];

/** Per-chapter authoring ledger: the wire carries scenario ids; THIS carries
 *  the shape contract the §1.9 rules are linted against. */
export interface ChapterMeta {
  readonly archetype: CampaignArchetype;
  /** hosting_game.md line the beat is grounded in (perspective seats cite
   *  their §1.2 roster line; shipped missions cite their §1.5 specLine). */
  readonly specLine: number;
  /** L-CP2 seat when the chapter is a perspective level (§1.2 roster id). */
  readonly perspectiveId?: string;
  /** §2.11 tier the beat rides. Prologue/Act I teach T0–2 by OD-19 fiat and
   *  ship no row; every Act II chapter declares 3 or 4 (§1.9 :5139's
   *  "Tiers 3–4"), and every Act III chapter declares 5 or 6 (§1.9 :5128's
   *  "Act III (Tiers 5–6)"), the lint law reading the rise from these
   *  numbers. Tier 5/6 has no bespoke engine mechanics at the level layer —
   *  the beats ride BUILT door verbs and the board itself, fiction-as-data
   *  per ADR-0018's ceiling list (ACT_THREE docblock). */
  readonly tier?: 3 | 4 | 5 | 6;
}

/* ------------------------------------------------------------------ */
/* Authored scenario docs — the two perspective levels (§1.2 seats)     */
/* ------------------------------------------------------------------ */

/** Apprentice seat (:1478, "you may only write rules"): the hands are taped
 *  at the door while the desk still answers tickets. The rail schedules BOTH
 *  the forbidden place-device rows (LIVE refusal witness — the tape bites)
 *  and the legal communicate rows (the queue still moves from below). */
const APPRENTICE_DESK_SHIFT_WIRE = {
  schema: "hh-scenario@1",
  id: "apprentice-desk-shift",
  name: "The Apprentice's Desk Shift",
  brief:
    "You are the apprentice: the runbook says you may only write rules, and the door believes it. Every build thought dies at the tape — so answer the frightened queue with your hands where the seat allows them, and let the senior's board stand.",
  specRef: "§1.5 The Apprentice's Desk (campaign-authored perspective level)",
  specLine: 1478,
  perspective: { id: "apprentice" },
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "apprentice-desk",
    // 1/min against 100 slots × 2µ$-sec service — the green-site premise:
    // rho is effectively zero, the bounces-below gate is an ASSERTION.
    segments: [{ fromMinute: 0, ratePerMin: 1 }],
  },
  intents: [
    // The build thought the seat forbids — one row, the tape is the witness.
    { atTick: 6, verb: "place-device", args: { nodeId: "web-1", deviceKind: "web", template: null } },
    // The legal queue work — one reply per four ticks, the one-hand door
    // never jams (occupancy is two ticks; the gap is the cadence lesson).
    { atTick: 5, verb: "communicate", args: { target: null, note: "desk-a-1" } },
    { atTick: 9, verb: "communicate", args: { target: null, note: "desk-a-2" } },
    { atTick: 13, verb: "communicate", args: { target: null, note: "desk-a-3" } },
    { atTick: 17, verb: "communicate", args: { target: null, note: "desk-a-4" } },
    { atTick: 21, verb: "communicate", args: { target: null, note: "desk-a-5" } },
    { atTick: 25, verb: "communicate", args: { target: null, note: "desk-a-6" } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 25 },
      { kind: "intents-executed-above", verb: "communicate", count: 4 },
      { kind: "intents-executed-below", count: 7 },
      { kind: "intents-refused-above", verb: "place-device", count: 0 },
      { kind: "bounces-below", count: 1 },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: { maxSimMinutes: 45, handCapacity: 1 },
} satisfies PerspectiveScenarioWire;

/** Support-Queue seat (:1212, "Diagnose-only, the board hidden"): the desk
 *  answers and nothing else — build AND price thoughts both die at the tape.
 *  The queue IS the whole game from here. */
const SUPPORT_DESK_VIGIL_WIRE = {
  schema: "hh-scenario@1",
  id: "support-desk-vigil",
  name: "The Support Desk Vigil",
  brief:
    "From the support desk the board is a rumour and the price list is somebody else's religion. All you own is the queue — so work it to silence, and let every build-and-price temptation break on the seat's tape where the campaign can see it.",
  specRef: "§1.5 The Support Desk Vigil (campaign-authored perspective level)",
  specLine: 1212,
  perspective: { id: "support-queue" },
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "support-vigil",
    // Same green-site arithmetic as the apprentice desk.
    segments: [{ fromMinute: 0, ratePerMin: 1 }],
  },
  intents: [
    // The two temptations the seat forbids — one row each, LIVE refusal
    // witnesses spaced clear of the reply rail's hand occupancy.
    { atTick: 6, verb: "place-device", args: { nodeId: "web-1", deviceKind: "web", template: null } },
    {
      atTick: 12,
      verb: "adjust-price",
      args: { targetKind: "plan", targetId: "basic", newPriceMicroUsd: "5000000", effectiveAtBusinessMinute: null },
    },
    // The vigil itself: six replies on the four-tick cadence.
    { atTick: 5, verb: "communicate", args: { target: null, note: "vigil-q-1" } },
    { atTick: 9, verb: "communicate", args: { target: null, note: "vigil-q-2" } },
    { atTick: 13, verb: "communicate", args: { target: null, note: "vigil-q-3" } },
    { atTick: 17, verb: "communicate", args: { target: null, note: "vigil-q-4" } },
    { atTick: 21, verb: "communicate", args: { target: null, note: "vigil-q-5" } },
    { atTick: 25, verb: "communicate", args: { target: null, note: "vigil-q-6" } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 30 },
      { kind: "intents-executed-above", verb: "communicate", count: 4 },
      { kind: "intents-executed-below", count: 7 },
      { kind: "intents-refused-above", verb: "place-device", count: 0 },
      { kind: "intents-refused-above", verb: "adjust-price", count: 0 },
      { kind: "bounces-below", count: 1 },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: { maxSimMinutes: 60, handCapacity: 1 },
} satisfies PerspectiveScenarioWire;

/** The money lesson that must be PLAYED, not read: one $0 pilot contract keeps
 *  the churn floor silent (an active customer is an active customer — §1.6's
 *  shortest book), while the payroll rail out-burns the bridge. Cash lands on
 *  EXACTLY zero at t30 (300M / 10M steps, no revenue to pollute the lattice),
 *  the rail keeps firing into a refusal ledger (t31–t88, refuse-not-overdraft
 *  law), and the float-insolvency watch — zero free cash plus refused
 *  settlements sustained three days — dissolves the company at t73, seventeen
 *  ticks short of its own win clock. This is the §1.6 sentence made playable:
 *  "Losing a level doesn't reset it; it *shortens* it." — the ledger here
 *  shortens to nothing, and §9.9's obituary carries the REAL cause:
 *  float-insolvency, not a rigged dice. Probe trail (chapters.test.ts):
 *  empty book churn-dies at t44 CASH-INDEPENDENTLY (a bridge raise cannot
 *  save it — falsifier fails), mrc-on-the-lattice docs (10M/1M) survive past
 *  t90, and the ONLY lawful death is the zero-income book: raise the campaign
 *  bridge to 600M or 900M and this same doc wins at t90. The death is
 *  shape-driven: it rides the gap between the act's scripted bridge and the
 *  authored burn, exactly the arithmetic §1.6 says failure is made of. */
const HARDEST_LESSON_WIRE = {
  schema: "hh-scenario@1",
  id: "the-hardest-lesson",
  name: "The Hardest Lesson",
  brief:
    "The pilot account signs at zero, the books stay honest, and the payroll rail never blinks: eighty-eight minutes of burn against one bridge-sized bankroll. Revenue is not a promise; it is a clause. Reach the ninetieth minute — the ledger will tell you what you signed.",
  specRef: "§1.5 The Hardest Lesson (campaign-authored succession level)",
  specLine: 35154,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "hl-01", mrcMicroUsd: 0, billingCycle: "monthly", termEndMin: 6_000, termMonths: 1, autoRenew: true },
  ],
  traffic: {
    tableId: "hardest-lesson",
    segments: [{ fromMinute: 0, ratePerMin: 1 }],
  },
  objectives: {
    win: [{ kind: "survive-minutes", minutes: 90 }],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: {
    maxSimMinutes: 150,
    initialFreeMicroUsd: 300_000_000,
    opex: Array.from({ length: 88 }, (_unused, i) => ({
      atMinute: i + 1,
      amountMicroUsd: 10_000_000,
      memo: `hl-burn-${String(i + 1).padStart(2, "0")}`,
    })),
    handCapacity: 1,
  },
} satisfies ScenarioWire;

/** NOC Shift seat (:1267, "A pure reactive level: no building allowed, only
 *  triage."): the board stays untouched — place AND connect die at the seat's
 *  tape — while the purest variant's phone is TAXED: attention rides rung 6,
 *  the pool mints at capacity one, and a second escalation inside the same
 *  tick refuses `attention-debt` through the loan law (:1269 "three hands",
 *  :1271 "dashboards and a phone"). Six replies land on the four-tick
 *  cadence; one twin refuses. The refusal census is the witness. */
const NOC_ONCALL_DESK_WIRE = {
  schema: "hh-scenario@1",
  id: "noc-oncall-desk",
  name: "The On-Call Desk",
  brief:
    "Six things break in twenty minutes and the building stays dark: no boards get built from a NOC chair. Work the queue, route what you must — and learn what a phone costs when the attention pool is already spoken for.",
  specRef: "§1.5 The On-Call Desk (campaign-authored perspective level)",
  specLine: 1267,
  perspective: { id: "noc-shift" },
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "noc-oncall-desk",
    // Same green-site arithmetic as the other desk levels: rho ~ 0, the
    // bounces gate is an ASSERTION, the lesson is entirely at the door.
    segments: [{ fromMinute: 0, ratePerMin: 1 }],
  },
  intents: [
    // The taxed phone: two escalations in one tick, capacity one — the second
    // refuses through the rung-6 loan law (the purest variant's real cost).
    { atTick: 5, verb: "communicate", args: { target: null, note: "noc-escalate-a" } },
    { atTick: 5, verb: "communicate", args: { target: null, note: "noc-escalate-b" } },
    // The two build thoughts the chair forbids — LIVE tape witnesses.
    { atTick: 11, verb: "place-device", args: { nodeId: "web-1", deviceKind: "web", template: null } },
    { atTick: 15, verb: "connect-ports", args: { relation: "data", from: "web-1", to: "web-2", slot: null } },
    // The desk itself: five more replies on the four-tick cadence.
    { atTick: 9, verb: "communicate", args: { target: null, note: "noc-q-2" } },
    { atTick: 13, verb: "communicate", args: { target: null, note: "noc-q-3" } },
    { atTick: 17, verb: "communicate", args: { target: null, note: "noc-q-4" } },
    { atTick: 21, verb: "communicate", args: { target: null, note: "noc-q-5" } },
    { atTick: 25, verb: "communicate", args: { target: null, note: "noc-q-6" } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 30 },
      { kind: "intents-executed-above", verb: "communicate", count: 5 },
      { kind: "intents-executed-below", count: 7 },
      { kind: "intents-refused-above", verb: "communicate", count: 0 },
      { kind: "intents-refused-above", verb: "place-device", count: 0 },
      { kind: "intents-refused-above", verb: "connect-ports", count: 0 },
      { kind: "bounces-below", count: 1 },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: {
    maxSimMinutes: 60,
    handCapacity: 1,
    // Rung 6 armed from the doc (the seat overrides cost verbatim): pool
    // capacity one, the phone taxed at one attention per call.
    attention: { capacity: 1, cost: { communicate: 1 } },
  },
} satisfies PerspectiveScenarioWire;

/* ------------------------------------------------------------------ */
/* ------------------------------------------------------------------ */
/* Act II wave-27 authored docs — the prevention-shift seat, the cert cliff */
/* ------------------------------------------------------------------ */

/** NOC Shift seat worn a SECOND time — the campaign first perspective REUSE
 *  (wave-27; legality disclosed in the ACT_TWO notes: roster membership +
 *  cadence are per-chapter tests and PERSPECTIVE_EXPRESSIBILITY is keyed per
 *  perspective). :1274 sentence again — "A pure reactive level: no building
 *  allowed, only triage." — but the fiction moved: THE PHONE RINGS AGAIN, AND
 *  THIS TIME THE DESK IS THE PREVENTION. The rail is deliberately b-6 twin
 *  (the taxed t5 escalation pair refuses attention-debt through the rung-6 loan
 *  law; place AND connect die at the seat tape; five replies hold the four-
 *  tick cadence) because the beat is the SAME desk after the lessons — the
 *  census is b-6 mirror and the green-site arithmetic (1/min on 100 slots)
 *  makes the zero-economy bridge verbatim the whole bankroll. specLine 1274
 *  (b-6 1267 predates the heading drift — the meta-to-doc equality law is
 *  per chapter, and this doc cites the TEXT-true heading line). */
const NOC_PREVENTION_SHIFT_WIRE = {
  schema: "hh-scenario@1",
  id: "noc-prevention-shift",
  name: "The Prevention Shift",
  brief:
    "The phone rings again, and this time the desk is the prevention: the same taxed NOC chair, the same taped build hands, a queue that remembers last quarter page. Escalate what you must, and let prevention be the boring win it was always supposed to be.",
  specRef: "§1.5 The Prevention Shift (campaign-authored perspective level — the §1.2 noc-shift seat worn a second time)",
  specLine: 1274,
  perspective: { id: "noc-shift" },
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "noc-prevention-shift",
    // Green-site arithmetic, b-6 verbatim: the lesson is at the door.
    segments: [{ fromMinute: 0, ratePerMin: 1 }],
  },
  intents: [
    // The taxed phone, twin-row — escalation culture priced by rung 6.
    { atTick: 5, verb: "communicate", args: { target: null, note: "prevent-escalate-a" } },
    { atTick: 5, verb: "communicate", args: { target: null, note: "prevent-escalate-b" } },
    // The two build thoughts the prevention desk still forbids.
    { atTick: 11, verb: "place-device", args: { nodeId: "web-1", deviceKind: "web", template: null } },
    { atTick: 15, verb: "connect-ports", args: { relation: "data", from: "web-1", to: "web-2", slot: null } },
    // The prevention itself: five more replies on the four-tick cadence.
    { atTick: 9, verb: "communicate", args: { target: null, note: "prevent-q-2" } },
    { atTick: 13, verb: "communicate", args: { target: null, note: "prevent-q-3" } },
    { atTick: 17, verb: "communicate", args: { target: null, note: "prevent-q-4" } },
    { atTick: 21, verb: "communicate", args: { target: null, note: "prevent-q-5" } },
    { atTick: 25, verb: "communicate", args: { target: null, note: "prevent-q-6" } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 30 },
      { kind: "intents-executed-above", verb: "communicate", count: 5 },
      { kind: "intents-executed-below", count: 8 },
      { kind: "intents-refused-above", verb: "communicate", count: 0 },
      { kind: "intents-refused-above", verb: "place-device", count: 0 },
      { kind: "intents-refused-above", verb: "connect-ports", count: 0 },
      { kind: "bounces-below", count: 1 },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: {
    maxSimMinutes: 60,
    handCapacity: 1,
    // The seat overrides attention cost verbatim from rung 6: capacity one,
    // the phone taxed at one attention per call.
    attention: { capacity: 1, cost: { communicate: 1 } },
  },
} satisfies PerspectiveScenarioWire;

/** b-12: §1.5 "The Certificate Expired / Cert Apocalypse" (:3275 — "At T+0
 *  your wildcard cert expires and every visitor sees a scary browser warning";
 *  "a non-attack can be worse than an attack"). AUTHORED because the campaign
 *  clock must land ON the cliff, not after it: the play is a SCHEDULE race —
 *  four certificates coming off a reissue calendar against a ticking term-end
 *  — and the meta files it Schedule, not the heading Reach-State label (the
 *  heading names the goal state; the archetype names the PLAY; the c-7
 *  Negotiate-vs-Reach-State discretion at :4019 is the precedent, disclosed).
 *  The traffic scar is the Sev-0 arc arithmetic re-skinned (8/min browser-
 *  warning bleed, the t60 crater to 2, the t150 reissue window back to 14 on
 *  400 slots — rho ~ 0, the bounces gates are ASSERTIONS). The four 5M monthly
 *  accounts cliff at biz-minute 24_000 = ceil(24_000*7/720) = sim t234 —
 *  INSIDE the 240 win clock (the parse wall law: a cliff past the cap is a
 *  refusal, "the renewal drama can never play"), and autoRenew:false hands
 *  every account to the retention dice. The five campaign seeds take the dice
 *  honestly: the cliff lapses a shifting 1-to-3 of the four certificates, so
 *  the grade is churn-below:4 vs churn-above:3 — survival needs ONE renewed
 *  certificate; only the total calendar failure loses (never observed on the
 *  five probed seeds). Opens UNSET — ON the
 *  scripted bridge verbatim (equality satisfies the never-poorer law; no
 *  thin-ride exception needed, unlike its three re-ride siblings above). */
const THE_CERT_CLIFF_WIRE = {
  schema: "hh-scenario@1",
  id: "the-cert-cliff",
  name: "The Certificate Cliff",
  brief:
    "The wildcard expired and every visitor now sees the scary warning: four certificates must come off the reissue calendar before the board read, while the traffic scar bleeds, craters, and demands the reopen. Schedule the race and close the act on prevention measured in churn.",
  specRef: "§1.5 The Certificate Expired (campaign-authored Act II level — the scheduled reissue race)",
  specLine: 3275,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 400, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    // Four certs on four schedules — every one a retention dice at the cliff.
    { id: "cc-01", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: false },
    { id: "cc-02", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: false },
    { id: "cc-03", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: false },
    { id: "cc-04", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: false },
  ],
  traffic: {
    tableId: "cert-cliff-scar",
    segments: [
      { fromMinute: 0, ratePerMin: 8 },
      { fromMinute: 60, ratePerMin: 2 },
      { fromMinute: 150, ratePerMin: 14 },
    ],
  },
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 240 },
      { kind: "churn-below", count: 4 },
      { kind: "bounces-below", count: 1 },
      { kind: "no-death-cause", cause: "any" },
    ],
    lose: [
      { kind: "death-by-cause", cause: "any" },
      { kind: "churn-above", count: 3 },
      { kind: "bounces-above", count: 32 },
    ],
  },
  limits: { maxSimMinutes: 360, dunningEngineOwned: true },
} satisfies ScenarioWire;

/* Act III authored docs — homages, seats, bespoke beats (wave-26)      */
/* ------------------------------------------------------------------ */

/** c-1 homage: the §1.5 "Metastable" fiction (surge-then-wall on an eight-slot
 *  edge, :4096) re-authored with the ONE clause the campaign cadence cannot
 *  wait for — a live book. The shipped registry doc runs contracts:[]; under
 *  the scripted bridge its empty arms §2.9's churn-floor from t1, the
 *  three-day spell dissolves the company at ~t44, and with no death lose-line
 *  the doc rides to a WIN AS A CORPSE (probe 2026-10-18:
 *  observation.deaths ["churn-collapse"] at win@240) — the grading law Act II
 *  filed. Two quiet monthly accounts keep the floor silent; the board, the
 *  traffic ladder, the guard and the win clock are the registry's verbatim.
 *  The Convert archetype: the beat converts a surge into a survived hour. */
const METASTABLE_WINDOW_WIRE = {
  schema: "hh-scenario@1",
  id: "the-metastable-window",
  name: "The Metastable Window",
  brief:
    "Act III opens where Act II's prevention ended: a surge that would cascade if the book went quiet. The eight-slot edge hums, a three-minute storm breaks over it, and the degraded wall waits for one unlucky backlog. Survive the quarter-hour after the ladder.",
  specRef: "§1.5 Metastable (campaign-authored Act III homage — the §1.6 floor clause added)",
  specLine: 4096,
  board: {
    nodes: [{ id: "web-1", kind: "shared-web", slots: 8, serviceTimeUs: 20_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "sw-01", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: true },
    { id: "sw-02", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: true },
  ],
  traffic: {
    tableId: "storm-window-ladder",
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

/** c-2 the Ratchet Audit played (§1.11 :5351, "a level that tests only your
 *  carried-over automation"; :3675 names the Long Weekend "the model for the
 *  recurring Ratchet Audit"): the doc's OWN audit sentence is the design
 *  brief — "the *ideal* play is to do nothing and watch" (:5353). So the rail
 *  is EMPTY BY LAW, and the win line makes idleness a gate:
 *  intents-executed-below {count:1} fails the moment one hand moves. The
 *  three-node board hums at rho≈0 on a monthly book; Endure the quarter.
 *  (Act III's first Endure census row; the archetype chain c-1→c-2 converts→
 *  endures, no consecutive share.) */
const QUARTER_THAT_RAN_ITSELF_WIRE = {
  schema: "hh-scenario@1",
  id: "the-quarter-that-ran-itself",
  name: "The Quarter That Ran Itself",
  brief:
    "The automation you carried here is the whole level: a green three-node board, a monthly book that signs itself, and traffic that never asks for you. The ratchet audit is no test of hands — the ideal play is to do nothing and watch, and the ledger grades exactly that.",
  specRef: "§1.5 The Ratchet Audit (campaign-authored Act III level — §1.11 :5351)",
  specLine: 5355,
  board: {
    nodes: [
      { id: "qr-web", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 },
      { id: "qr-db", kind: "shared-web", slots: 100, serviceTimeUs: 4_000_000 },
      { id: "qr-edge", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 },
    ],
    edges: [],
  },
  contracts: [
    { id: "qr-01", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 9_000, termMonths: 1, autoRenew: true },
    { id: "qr-02", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 9_000, termMonths: 1, autoRenew: true },
  ],
  traffic: {
    tableId: "ratchet-hum",
    segments: [{ fromMinute: 0, ratePerMin: 1 }],
  },
  intents: [],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 60 },
      { kind: "bounces-below", count: 1 },
      { kind: "intents-executed-below", count: 1 },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: { maxSimMinutes: 90 },
} satisfies ScenarioWire;

/** c-4 seat: the Datacenter Tech (§1.2 :1215 "Place/Connect only, no Observe
 *  (you're *told* what to do and it's wrong)"; detail heading :1328 "Remote
 *  Hands"), on the Tier-5 geography fiction (:961 "Two Datacenters, One
 *  Company"). The seat's full-power canExecute ban roster (15 verbs — L-PERS
 *  @817c82c) IS the fiction: someone else's portfolio decisions execute
 *  around you, and the only lawful hands are the ones that move metal. The
 *  12-node two-hall board is pure topology DATA — tier 5/6 never had bespoke
 *  engine mechanics at the level layer; Act III labels the fiction-as-data
 *  (ADR-0018 ceiling list). The rail places and cables in both halls and
 *  reaches ONCE for the phone the seat does not carry: the LIVE
 *  perspective-forbids refusal is the floor-tech's whole career in one row.
 *  hide ["company::"] + no policy book ride the seat row untouched — the win
 *  line still gates on the refused census: seeing-is-not-being is a PROJECTION
 *  law, and the support vigil proved (Act I, win@30) that hidden company
 *  facts never blind the objective fold. */
const FLOOR_AND_AISLE_WIRE = {
  schema: "hh-scenario@1",
  id: "the-floor-and-aisle",
  name: "The Floor and the Aisle",
  brief:
    "Two datacenters, one company, and you are the hands in the aisle. Place and cable what the portfolio decided in halls you will never price or phone: build the row that wins the beat, and let one swallowed reach for the desk phone stand as the year's performance review.",
  specRef: "§1.5 The Floor and the Aisle (campaign-authored perspective level)",
  specLine: 1215,
  perspective: { id: "datacenter-tech" },
  board: {
    nodes: [
      { id: "dc-a1", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-a2", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-a3", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-a4", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-a5", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-a6", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-b1", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-b2", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-b3", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-b4", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-b5", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
      { id: "dc-b6", kind: "shared-web", slots: 40, serviceTimeUs: 2_000_000 },
    ],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "floor-and-aisle",
    // Green-site arithmetic again: 1/min against 480 slots — the lesson is
    // entirely at the door, the bounces gate is an ASSERTION.
    segments: [{ fromMinute: 0, ratePerMin: 1 }],
  },
  intents: [
    // The lawful hands: rack new metal in hall A and cable it into the row;
    // the same in hall B. place-device CREATES the node (the door's
    // node-exists law keeps it honest — the floor-tech racks what the
    // portfolio ordered, it does not re-rack what already stands).
    { atTick: 5, verb: "place-device", args: { nodeId: "rack-a7", deviceKind: "web", template: null } },
    { atTick: 9, verb: "connect-ports", args: { relation: "data", from: "rack-a7", to: "dc-a2", slot: null } },
    { atTick: 17, verb: "place-device", args: { nodeId: "rack-b7", deviceKind: "web", template: null } },
    { atTick: 21, verb: "connect-ports", args: { relation: "data", from: "rack-b7", to: "dc-b2", slot: null } },
    // The reach the seat does not carry — LIVE perspective-forbids witness.
    { atTick: 13, verb: "communicate", args: { target: null, note: "floor-to-desk" } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 40 },
      { kind: "intents-executed-above", verb: "place-device", count: 1 },
      { kind: "intents-executed-above", verb: "connect-ports", count: 1 },
      { kind: "intents-refused-above", verb: "communicate", count: 0 },
      { kind: "intents-executed-below", count: 6 },
      { kind: "bounces-below", count: 1 },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: { maxSimMinutes: 60 },
} satisfies PerspectiveScenarioWire;

/** c-5 the portfolio beat played with the BUILT tier verbs (§1.9 :5128 "Act
 *  III (Tiers 5–6) — portfolio and geography"): scale-node reserves capacity
 *  the market may not need (the growth), reclaim-node voids bookings at the
 *  tombstone (the shrink). The Shrink archetype — the doc's beat line is the
 *  ledger contracting under the door's own LWW law. One monthly account keeps
 *  the churn floor silent to t90; the rail is four rows, two verbs, executed
 *  censuses as win gates. Geography law from the door code, not a new
 *  mechanic: scale/reclaim were BUILT at the spine (@c8b92a2/@8037a4f) long
 *  before any level named them — Act III rides them as data, ceiling honored
 *  (ADR-0018 1a). */
const GROWTH_THAT_SHRANK_WIRE = {
  schema: "hh-scenario@1",
  id: "the-growth-that-shrank-itself",
  name: "The Growth That Shrank Itself",
  brief:
    "Portfolio work at the scale desk: book two capacity pads, then reclaim them before the forecast you never read becomes a graveyard. Growth is a booking, shrink is a tombstone, and the beat rides the door's own arithmetic between them.",
  specRef: "§1.5 The Growth That Shrank Itself (campaign-authored Act III level — §1.9 :5128 portfolio)",
  specLine: 5128,
  board: {
    nodes: [
      { id: "gr-1", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 },
      { id: "gr-2", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 },
      { id: "gr-3", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 },
      { id: "gr-4", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 },
    ],
    edges: [],
  },
  contracts: [
    { id: "gr-01", mrcMicroUsd: 1_000_000, billingCycle: "monthly", termEndMin: 9_000, termMonths: 1, autoRenew: true },
  ],
  traffic: {
    tableId: "growth-shrink",
    segments: [{ fromMinute: 0, ratePerMin: 2 }],
  },
  intents: [
    { atTick: 6, verb: "scale-node", args: { targetNodeId: "gr-1", reservedSlots: 2, effectiveAtBusinessMinute: null } },
    { atTick: 14, verb: "reclaim-node", args: { targetNodeId: "gr-1", effectiveAtBusinessMinute: null } },
    { atTick: 20, verb: "scale-node", args: { targetNodeId: "gr-2", reservedSlots: 2, effectiveAtBusinessMinute: null } },
    { atTick: 28, verb: "reclaim-node", args: { targetNodeId: "gr-2", effectiveAtBusinessMinute: null } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 60 },
      { kind: "intents-executed-above", verb: "scale-node", count: 1 },
      { kind: "intents-executed-above", verb: "reclaim-node", count: 1 },
      { kind: "intents-executed-below", count: 6 },
      { kind: "bounces-below", count: 1 },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: { maxSimMinutes: 90 },
} satisfies ScenarioWire;

/** c-6 homage: the §1.5 "DDoS Season" gradient fiction (:3994, the four-step
 *  hourly climb on a ten-slot edge) re-authored with the floor clause — same
 *  board, same ladder, same cascadeCollapse wall, same win clock; the shipped
 *  doc's empty book corpse-fails the campaign cadence exactly as the
 *  metastable twin does (probe: deaths ["churn-collapse"] at win@240).
 *  Act III's second Endure (c-5 Shrink ≠ c-6 Endure ≠ c-7 Negotiate), the
 *  long gradient against a book that never needed defending. */
const LONG_GRADIENT_WIRE = {
  schema: "hh-scenario@1",
  id: "the-long-gradient",
  name: "The Long Gradient",
  brief:
    "No single wave, just the season: an attack baseline that climbs every hour for four hours past a ten-slot edge. The gradient that stays polite ends the clock with the node out of the degraded wall; the bounces ledger is the season's whole weather report. Endure the curve.",
  specRef: "§1.5 DDoS Season (campaign-authored Act III homage — the §1.6 floor clause added)",
  specLine: 3994,
  board: {
    nodes: [{ id: "edge-1", kind: "shared-web", slots: 10, serviceTimeUs: 20_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "lg-01", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: true },
    { id: "lg-02", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: true },
  ],
  traffic: {
    tableId: "long-gradient",
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

/** c-7 the run-up (§1.5 "Sell the Company" :4014; the doc's own split
 *  recommendation :4019 names this level "the run-up"). The EXIT ending's
 *  grammar is supplied here: the win line carries sell-accepted-above, and
 *  runner.ts's verdict-observed stopReason rides that predicate into the
 *  terminal record — the rung AC-E's endCampaign selects `exit` on
 *  (^win:sell-accepted-above:, @61a1c3b). Anchor law (installed base, NOT a
 *  catalog — a doc-carried catalog is FORBIDDEN by the parse wall itself
 *  ("limits must not carry sellMarketRates"), and the wave-27 host-config
 *  catalog leg landing on top can only READ one, never mint chapter
 *  authority; the only price
 *  authority a doc may reach is its own keyed book, sell.ts's anchor):
 *  plan:long-sale anchors at ls-01's 50M MRC, sku:long-sale-b at ls-02's 30M.
 *  Offers at 60% of anchor sit past the acceptance-clamp's deep-cheap ceiling
 *  (9,500 bps of 10,000 — acceptance is near-certain but NEVER certain,
 *  ADR-0016 #11), so the win line is count:0 (≥1 accepted) and every rail
 *  row is a fresh fingerprint: the t30/t45 re-offers bump shippedAtTick at
 *  the door and RE-ROLL the dice — four rolls per run is the insurance
 *  arithmetic. The per-seed census is probe-pinned in chapters.test.ts.
 *  Negotiate, not the doc's Reach-State label at :4015 — the beat negotiates
 *  with the market itself (design authority: I-AC3 dossier, owner-approved). */
const LONG_SALE_WIRE = {
  schema: "hh-scenario@1",
  id: "the-long-sale",
  name: "The Long Sale",
  brief:
    "The run-up is not a board fight — it is a price negotiation with the market. Two keyed accounts anchor the book; four offers at sixty cents on the anchor ask the dice what the ledger already knows. Land one acceptance inside the hour and the exit opens.",
  specRef: "§1.5 Sell the Company — the run-up (campaign-authored Act III level)",
  specLine: 4019,
  board: {
    nodes: [{ id: "ls-1", kind: "shared-web", slots: 100, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "ls-01", mrcMicroUsd: 50_000_000, billingCycle: "monthly", termEndMin: 9_000, termMonths: 1, autoRenew: true, priceKey: "plan:long-sale" },
    { id: "ls-02", mrcMicroUsd: 30_000_000, billingCycle: "monthly", termEndMin: 9_000, termMonths: 1, autoRenew: true, priceKey: "sku:long-sale-b" },
  ],
  traffic: {
    tableId: "long-sale",
    segments: [{ fromMinute: 0, ratePerMin: 1 }],
  },
  intents: [
    { atTick: 10, verb: "sell-offer", args: { targetKind: "plan", targetId: "long-sale", offerPriceMicroUsd: "30000000", termMonths: 12, effectiveAtBusinessMinute: null } },
    { atTick: 14, verb: "sell-offer", args: { targetKind: "sku", targetId: "long-sale-b", offerPriceMicroUsd: "18000000", termMonths: 12, effectiveAtBusinessMinute: null } },
    { atTick: 30, verb: "sell-offer", args: { targetKind: "plan", targetId: "long-sale", offerPriceMicroUsd: "30000000", termMonths: 12, effectiveAtBusinessMinute: null } },
    { atTick: 45, verb: "sell-offer", args: { targetKind: "sku", targetId: "long-sale-b", offerPriceMicroUsd: "18000000", termMonths: 12, effectiveAtBusinessMinute: null } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 60 },
      { kind: "sell-accepted-above", count: 0 },
    ],
    lose: [{ kind: "death-by-cause", cause: "any" }],
  },
  limits: { maxSimMinutes: 90 },
} satisfies ScenarioWire;

/** c-8 homage: the §1.5 "Free Tier Flood" fiction (:3590, the dice-free
 *  family census) re-authored with the floor clause — same 60-slot edge, the
 *  same organic→malicious ladder, the same family win/lose ceilings the
 *  registry pins as seed-invariant (organic 1,680 / malicious 3,120 mints at
 *  integer rates: zero dice, zero corpse risk from the traffic leg). The
 *  Diagnose archetype: the beat reads the institution's own flood curve.
 *  The shipped doc's contracts:[] arms the churn-floor the same way the
 *  storm twins do (probe: deaths ["churn-collapse"]); two monthly accounts
 *  keep the book alive the only way Act III accepts. */
const INSTITUTION_WATCH_WIRE = {
  schema: "hh-scenario@1",
  id: "the-institution-watch",
  name: "The Institution Watch",
  brief:
    "Two hours of genuine blogs, then the miners arrive: the free tier turns the edge queue into a census of intentions. Keep the abuse ceiling down without strangling the organic stream that made the tier worth running — the families are the read.",
  specRef: "§1.5 Free Tier Flood (campaign-authored Act III homage — the §1.6 floor clause added)",
  specLine: 3590,
  board: {
    nodes: [{ id: "edge-1", kind: "shared-web", slots: 60, serviceTimeUs: 2_000_000 }],
    edges: [],
  },
  contracts: [
    { id: "iw-01", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: true },
    { id: "iw-02", mrcMicroUsd: 5_000_000, billingCycle: "monthly", termEndMin: 24_000, termMonths: 1, autoRenew: true },
  ],
  traffic: {
    tableId: "institution-watch-mix",
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

/** c-9 seat: Red Team Friday (§1.2 :1217 "the same six verbs with the goal
 *  node inverted"; detail heading :1254). The seat row is ZERO-mechanics by
 *  design (L-PERS roster: hide[], refuse[], lookupPolicyCards true — the
 *  perspective exists in the OBJECTIVE, and :1213's law line reads "re-author
 *  objectives, not mechanics"): every verb legal, the board tiny, the traffic
 *  mean. The win line INVERTS the campaign's founding gesture — where the
 *  prologue teaches to hold the queue, this beat WINS BY BREAKING IT:
 *  bounces-above {count:24} on a two-slot target under eight visits a minute
 *  (≈2/min steady bounce + retry amplification) is an attacker's scorecard.
 *  win@25 lands before the empty-book churn-floor can speak (t44), so the
 *  contracts row stays honestly empty and the lose line stays honestly
 *  absent — the inversion reaches its clock. The one communicate row is the
 *  taunt: executed, counted, legal — zero-ban armed witness. */
const RED_TEAM_FRIDAY_WIRE = {
  schema: "hh-scenario@1",
  id: "red-team-friday",
  name: "Red Team Friday",
  brief:
    "Same hands, same door, inverted objective: you are Friday's attacker with the runbook on your side. Two slots against eight visitors a minute, and a ledger grading bounces as the honest scorecard. Break the target by twenty-five and the red team wins.",
  specRef: "§1.5 Red Team Friday (campaign-authored perspective level — §1.2 :1217)",
  specLine: 1217,
  perspective: { id: "red-team-friday" },
  board: {
    nodes: [{ id: "target-1", kind: "shared-web", slots: 2, serviceTimeUs: 20_000_000 }],
    edges: [],
  },
  contracts: [],
  traffic: {
    tableId: "red-team-queue",
    segments: [{ fromMinute: 0, ratePerMin: 8 }],
  },
  intents: [
    { atTick: 5, verb: "communicate", args: { target: null, note: "red-team-found-this" } },
  ],
  objectives: {
    win: [
      { kind: "survive-minutes", minutes: 25 },
      { kind: "bounces-above", count: 24 },
      { kind: "intents-executed-above", verb: "communicate", count: 0 },
    ],
    lose: [],
  },
  limits: { maxSimMinutes: 60 },
} satisfies PerspectiveScenarioWire;

/** The docs this module OWNS (authored, not registered in scenarios.ts).
 *  Hosts resolve chapter docs via `docOf = (id) => CHAPTER_AUTHORED_DOCS[id]
 *  ?? shippedScenario(id)` — the L-CP1 authority seam, unchanged. */
export const CHAPTER_AUTHORED_DOCS: Readonly<Record<string, ScenarioDoc>> = Object.freeze({
  "apprentice-desk-shift": parseScenarioDoc(APPRENTICE_DESK_SHIFT_WIRE),
  "support-desk-vigil": parseScenarioDoc(SUPPORT_DESK_VIGIL_WIRE),
  "the-hardest-lesson": parseScenarioDoc(HARDEST_LESSON_WIRE),
  "noc-oncall-desk": parseScenarioDoc(NOC_ONCALL_DESK_WIRE),
  "noc-prevention-shift": parseScenarioDoc(NOC_PREVENTION_SHIFT_WIRE),
  "the-cert-cliff": parseScenarioDoc(THE_CERT_CLIFF_WIRE),
  "the-metastable-window": parseScenarioDoc(METASTABLE_WINDOW_WIRE),
  "the-quarter-that-ran-itself": parseScenarioDoc(QUARTER_THAT_RAN_ITSELF_WIRE),
  "the-floor-and-aisle": parseScenarioDoc(FLOOR_AND_AISLE_WIRE),
  "the-growth-that-shrank-itself": parseScenarioDoc(GROWTH_THAT_SHRANK_WIRE),
  "the-long-gradient": parseScenarioDoc(LONG_GRADIENT_WIRE),
  "the-long-sale": parseScenarioDoc(LONG_SALE_WIRE),
  "the-institution-watch": parseScenarioDoc(INSTITUTION_WATCH_WIRE),
  "red-team-friday": parseScenarioDoc(RED_TEAM_FRIDAY_WIRE),
});

/* ------------------------------------------------------------------ */
/* The carry posture — §1.6 scripted bridge                             */
/* ------------------------------------------------------------------ */

/** PROVISIONAL (OD-19 carries no ratified numerics): below one trillion
 *  dollars of free cash the founder is "below the floor" — which, for the
 *  shipped corpus, is every chapter after the first. That is the POINT of the
 *  scripted bridge: each chapter opens at the floor's minimum viable budget
 *  (300_000_000 µ$ = the-price-hike's authored opening — PROBE-GROUNDED: at
 *  250M the hike died `lose:cash-below:50000000@400`, ending 46.7M; every
 *  other Act-I doc opens at or below 300M and wins richer or level) instead
 *  of whatever the last win's dice left behind. Re-pin only with a fresh
 *  probe; the lint test re-derives every chapter opening from these numbers. */
const CASH_FLOOR = Object.freeze({
  thresholdMicroUsd: 1_000_000_000_000_000n,
  bridgeMicroUsd: 300_000_000n,
});

const CARRY_RULE = Object.freeze({
  cashFloor: CASH_FLOOR,
  staffCap: 3,
  castCap: 12,
  scarCapRide: true,
});

/* ------------------------------------------------------------------ */
/* PROLOGUE — OD-19: first mastery inside three minutes (T0–0.5)        */
/* ------------------------------------------------------------------ */

/** The three cheapest shipped docs, each a pure-tuition beat: the triage
 *  twin wins at t12 (the mastery moment), the borrowed-thunder queue teaches
 *  the reply cadence, the handover queue teaches the attention rail. */
const PROLOGUE_WIRE = {
  schema: "hh-campaign@1",
  id: "prologue-first-light",
  name: "First Light — The Prologue",
  chapters: [
    { chapterId: "p-1-triage-desk", scenarioId: "understaffed-sunday-triage" },
    { chapterId: "p-2-borrowed-thunder", scenarioId: "someone-elses-outage" },
    { chapterId: "p-3-handover-queue", scenarioId: "the-founder-bus-factor" },
  ],
  carry: CARRY_RULE,
} as const;

/** Prologue beat ledger (§1.9 archetype + hosting_game.md anchor per chapter). */
export const PROLOGUE_META: Readonly<Record<string, ChapterMeta>> = Object.freeze({
  "p-1-triage-desk": { archetype: "Hold-Without-Hands", specLine: 3673 },
  "p-2-borrowed-thunder": { archetype: "Reach-State", specLine: 4067 },
  "p-3-handover-queue": { archetype: "Schedule", specLine: 3896 },
});

/** The parsed Prologue. parse-at-module-init = fail-loud: any authoring drift
 *  breaks every consumer's import, never half-parses at runtime. */
export const CAMPAIGN_PROLOGUE: CampaignDoc = parseCampaignDoc(PROLOGUE_WIRE);

/* ------------------------------------------------------------------ */
/* ACT I — panic → process (T1–3)                                       */
/* ------------------------------------------------------------------ */

/** Eight chapters on the §1.11 spine: build-the-room panic opens, the two
 *  perspective shifts (a-2 apprentice, a-8 support desk — the §1.9 per-act
 *  floor of two) bracket the money arc, and the desk closes the act.
 *  Rising Tier rhythm: launch (T0–1 board) → seat shift → whale money →
 *  dead debt → price talk → the quiet month (the process beat itself —
 *  OD-19's panic→carrier) → the post-mortem → the vigil's own desk.
 *  PROBE-VERIFIED ROSTER (2026-10-17): the-threshold-day (win@160, dice-free
 *  census on its own 10_000_000 opening) joins the Act II knife-edge shelf —
 *  under the bridge its arithmetic no longer describes the authored quarter.
 *  chargeback-wave joins the SAME shelf for a harder reason: its signals
 *  rows hit an UNGUARDED runner RangeError (economy/buckets: chargeback
 *  "-20000000 µ$ on 'free' would go negative" — composeSignalRows posts
 *  outside the L4 catch-and-void) once the re-based 300M opening reshuffles
 *  the dunning dice; the doc is only proven on its own 200M war chest. A
 *  campaign chapter may never crash the chain, so that row is
 *  content-forbidden until the runner guard lands (REPORTED to the
 *  orchestrator, not patched here — scenario/** is outside this lane's
 *  authority). THE GUARD LANDED @075a840 — composeSignalRows is now
 *  funding-honest under thin openings, and the row is REHABILITATED as Act II
 *  b-7 with a live chargebackFeeRefusals witness at the bridge (probe
 *  2026-10-18: win@200, cashEnd 993,070 µ$ from the 300M bridge, 1 refused
 *  fee, zero crash). The RFO (post-mortem credit is a reputation path,
 *  cash-agnostic) and the desk vigil take the closing two beats.
 *  The vigil's FIRST authored arm died in-chain at t44: the -above
 *  predicates are STRICTLY-greater (the refused-above:1 rows could never
 *  true with exactly 1 refusal), so the win never formed at t30 and the
 *  empty-book churn-floor law executed the chapter inside the three-day
 *  grace. Re-authored to refused-above:0 counts — win@30, probe-confirmed
 *  win-through all eight (the exact truth lines ride chapters.test.ts). */
const ACT_ONE_WIRE = {
  schema: "hh-campaign@1",
  id: "act-one-panic-to-process",
  name: "Act One — Panic Into Process",
  chapters: [
    { chapterId: "a-1-launch-day", scenarioId: "launch-day" },
    { chapterId: "a-2-apprentice-desk", scenarioId: "apprentice-desk-shift" },
    { chapterId: "a-3-angry-whale", scenarioId: "the-angry-whale" },
    { chapterId: "a-4-deadbeat-quarter", scenarioId: "deadbeat-quarter" },
    { chapterId: "a-5-price-hike", scenarioId: "the-price-hike" },
    { chapterId: "a-6-quiet-month", scenarioId: "the-quiet-month" },
    { chapterId: "a-7-rfo", scenarioId: "the-rfo" },
    { chapterId: "a-8-support-vigil", scenarioId: "support-desk-vigil" },
  ],
  carry: CARRY_RULE,
} as const;

/** Act I beat ledger. */
export const ACT_ONE_META: Readonly<Record<string, ChapterMeta>> = Object.freeze({
  "a-1-launch-day": { archetype: "Build-to-Spec", specLine: 3161 },
  "a-2-apprentice-desk": { archetype: "Escort", specLine: 1478, perspectiveId: "apprentice" },
  "a-3-angry-whale": { archetype: "Convert", specLine: 3424 },
  "a-4-deadbeat-quarter": { archetype: "Inherit", specLine: 3806 },
  "a-5-price-hike": { archetype: "Negotiate", specLine: 3818 },
  "a-6-quiet-month": { archetype: "Endure", specLine: 3479 },
  "a-7-rfo": { archetype: "Diagnose", specLine: 4054 },
  "a-8-support-vigil": { archetype: "Hold-Without-Hands", specLine: 1212, perspectiveId: "support-queue" },
});

/** The parsed Act One. */
export const CAMPAIGN_ACT_ONE: CampaignDoc = parseCampaignDoc(ACT_ONE_WIRE);

/* ------------------------------------------------------------------ */
/* ACT II — process → prevention (Tiers 3–4, §1.9 :5139)                 */
/* ------------------------------------------------------------------ */

/**
 * Twelve chapters on the §2.11 Working-Capital tier (:1187 "Deferred revenue,
 *  annual prepay, DSO, dunning, bad debt" — the money lessons Act I only
 * gestured at), riding the T3 plateau into the T4 succession ash: the
 * money-works re-ride opens on its own authored fiction (300M = the bridge
 * verbatim), the quiet beats test the book, and b-4 THE HARDEST LESSON is the
 * act's thesis — the FIRST authored campaign level that DIES IN THE SHAPE.
 * The company dissolves float-insolvent under the lawful carry opening, the
 * §9.9 obituary writes itself (`lose:death-by-cause:any@73`), chain.ts
 * succession fires FOR REAL (failure_restart edge + failureOnlyUnlock
 * manifest), and the successor's first chapter b-5 opens on the manifested
 * ledger — an Inherit beat whose "fogged board you didn't build" (§1.9 :5095)
 * Ending on the prevention thesis completed: the child weathers the chargeback
 * wave the parent never saw coming (b-7), wears the taxed NOC desk a SECOND
 * time as prevention rather than triage (b-11), and closes the act racing a
 * certificate cliff its own reissue calendar must beat (b-12).
 *
 * PROPORTIONALITY (§1.9 :5139 act law; wave-27 full-12 growth — the owner-
 * commissioned expansion that closes the tension this paragraph filed): the
 * act is TWELVE levels at full design and now SHIPS twelve — the death
 * headline, its succession consequence, the tier plateau, the rehab witness,
 * plus the three money-ledger re-rides the §1.6 floor clause prices as NAMED
 * thin-rides (b-8 collections at 5B authored, b-9 breach at 1B, b-10 Sev-0 at
 * 500M) and the prevention-shift seat closing the act thesis on the phone it
 * learned to price. §1.9 per-act floor of TWO perspective levels is RESOLVED
 * (dated rider 2026-10-19): the 7-beat act could not hold a second seat ≥5
 * after b-6 tour index 16 and filed the tension; the 12-beat act fits b-11 at
 * tour index 21 — the whole 32-beat tour seats land at 4, 10, 16, 21, 26, 31,
 * gaps {6,6,5,5,5}, every act at the floor of two for the FIRST TIME IN
 * CAMPAIGN HISTORY without breaking the global every-5 cadence.
 * b-11 REUSES the §1.2 noc-shift roster row — the campaign first perspective
 * reuse — and it is lawful by construction: the lint tests are roster-
 * membership + cadence per chapter, and PERSPECTIVE_EXPRESSIBILITY is keyed
 * by perspective, never by chapter. The fiction earns it: prevention is the
 * SAME desk after the lessons, not a new desk (the 27-beat tour never reused
 * a seat; the 32-beat tour reuse is disclosed here and in the b-11 meta row).
 * _todo: §1.9 per-act seat floor (2) vs every-5 global cadence — RESOLVED at
 * the full-12 expansion (ADR-0019 program 3 note; owner taste row).
 *
 * PROBE TRAIL (2026-10-18, the death-shape law — candidates run thin-opened
 * at the 300M bridge, never forced):
 * - the-covenant / review-bomb: NO `death-by-cause` lose predicate — they
 *   CANNOT stop a chapter on death; brief candidates REFUTED at the wire.
 * - the-ransom-customer: traffic is corpus-backed (g1-mail-hosting slice) —
 *   CORPUS_UNRESOLVED under the chain authority (no config.corpus seam in
 *   runCampaign; metastable precedent). Excluded on reachability, not taste.
 * - the-change-freeze / the-threshold-day: win@240/win@160 BUT the trace
 *   carries `deaths:["churn-collapse"]` — an empty book churn-dies at t44
 *   (3-day floor, CASH-INDEPENDENT) and these docs have no death lose-line,
 *   so they would win as UNDEAD companies. Act II refuses to grade a corpse:
 *   both stay on the shelf, with the stronger reason now on record.
 * - the-hardest-lesson (authored): empty book dies cash-independently (t44 —
 *   falsifier fails); mrc on the burn lattice survives past the clock
 *   (10M → win@90, 1M → win@90); the $0-pilot + 10M/tick rail lands the bank
 *   on EXACTLY zero at t30, feeds the refuse-not-overdraft witness t31+,
 *   arms the float watch, dissolves at t73 — and the SAME doc wins at t90
 *   when the campaign bridge rises to 600M (zero only at t60, refuse-window
 *   too short: dissolve would land t104) or 900M (rail out of money before
 *   the bank is: cashEnd 20M, never zero). Death is shape-driven; the
 *   falsifier is arithmetic, not theatre.
 * - the-long-weekend: win@240 at the bridge (cashEnd 407,433,490 µ$,
 *   deaths [] — four hourly contracts hold the churn floor silent); the
 *   §1.5 "No Hands" heading (:3662) names the archetype it rides.
 * - chargeback-wave: win@200 at the bridge, cashEnd 993,070 µ$ — from 100B
 *   authored down to 300M scripted, the disputes REFUSE their fee honestly
 *   (chargebackFeeRefusals length 1) instead of crashing the chain. The
 *   b-7 exception to the never-poorer law below is this witness.
 * - runway-six-weeks: win@600 at the bridge (cashEnd 161,630,000 µ$,
 *   deaths []) — its razor survives the rebase, and §1.9's Inherit
 *   definition ("a fogged board you didn't build") lands on the successor
 *   exactly once: b-5 is the child's first chapter.
 * - the-slow-week-after: win@100 (cashEnd 352,164,000 µ$, deaths []).
 * - contract-recompete: win@240, cashEnd 1,190,568,000 µ$, deaths [] — its
 *   authored opening IS the bridge (300M): the only shipped doc that opens
 *   Act II on its own written words.
 *
 * Succession mechanics ride chain.ts law unmodified (this lane owns zero
 * engine surface): the manifest needs 3 distinct unlocked nodes, which no
 * chapter batch ever writes — the dying company's unlock testimony is seeded
 * by the HOST ledger (settleRun writes, the chain.test founderGraph pattern)
 * and chapters.test.ts witnesses the edge, the one-spend bootstrap, the
 * re-spend refusal, the cash slice of NULL (failure makes you POORER, not
 * paid — the bridge, not the war chest, opens b-5), and the museum
 * obituary/marker rows. The bridge value itself CARRIES UNCHANGED from Act I
 * (300M) — probe-grounded: every Act II chapter wins or dies honestly under
 * it, so the act inherits the number rather than re-tuning it.
 */
const ACT_TWO_WIRE = {
  schema: "hh-campaign@1",
  id: "act-two-process-to-prevention",
  name: "Act Two — Process Into Prevention",
  chapters: [
    { chapterId: "b-1-money-works", scenarioId: "contract-recompete" },
    { chapterId: "b-2-slow-week", scenarioId: "the-slow-week-after" },
    { chapterId: "b-3-skeleton-weekend", scenarioId: "the-long-weekend" },
    { chapterId: "b-4-hardest-lesson", scenarioId: "the-hardest-lesson" },
    { chapterId: "b-5-fogged-board", scenarioId: "runway-six-weeks" },
    { chapterId: "b-6-oncall-desk", scenarioId: "noc-oncall-desk" },
    { chapterId: "b-7-chargeback-shift", scenarioId: "chargeback-wave" },
    { chapterId: "b-8-collections-week", scenarioId: "collections-week" },
    { chapterId: "b-9-post-breach", scenarioId: "post-breach-aftermath" },
    { chapterId: "b-10-sev-0", scenarioId: "the-sev-0" },
    { chapterId: "b-11-prevention-shift", scenarioId: "noc-prevention-shift" },
    { chapterId: "b-12-cert-cliff", scenarioId: "the-cert-cliff" },
  ],
  carry: CARRY_RULE,
} as const;

/**
 * The never-poorer law (cash-floor lint) carries an AUTHORED exception list:
 * a chapter may open below its authored war chest ONLY when the thin opening
 * is probe-witnessed funding-honest. The list is DATA so the lint stays a law
 * with a named, testable seam, never a silently deleted check. FOUR
 * exceptions, all Act II, all probe-witnessed at the 300M scripted bridge:
 * the rehabilitation beat itself (b-7) and the wave-27 money-ledger re-rides
 * (b-8/b-9/b-10) — the three §1.5 siege docs whose authored war chests the
 * act thesis walks THROUGH at bridge scale, each landing its win line with
 * the dunning ladder telling the truth on every probed seed.
 */
export const ACT_TWO_THIN_RIDE_EXCEPTIONS: Readonly<Record<string, string>> = Object.freeze({
  "chargeback-wave":
    "authored 100_000_000_000 µ$ opens on the 300M scripted bridge: the composeSignalRows funding-honest guard (@075a840) turns the thin rebase into a LIVE chargebackFeeRefusals witness (probe win@200, 1 refusal, zero crash) — the Act II prevention thesis, priced.",
  "collections-week":
    "authored 5_000_000_000 µ$ opens on the 300M scripted bridge: hourly paper settles from the first hour and the two autoRenew anchors re-sign at their cliff — win@240 probe-witnessed on all five campaign seeds; churn takes accounts, never the company (the cause-specific churn-collapse die-arm never fires in-chain).",
  "post-breach-aftermath":
    "authored 1_000_000_000 µ$ opens on the 300M scripted bridge: the six shaken accounts write off at their dice and the board read at t320 lands inside the written-off-below:7 ceiling on all five probed seeds — the breach survives on collections discipline, not on the parent 1B cushion.",
  "the-sev-0":
    "authored 500_000_000 µ$ opens on the 300M scripted bridge: the scar arc (10 to 2 to 14 per minute on 24 slots) is dice-free at the bridge — the recovery delta, the bounce budget, and cashEnd land IDENTICAL on all five seeds.",
});

/** Act II beat ledger. specLines ride each doc's OWN citation (§1.5 heading
 *  line for re-rides; the authored levels cite their §9.9/§1.2 anchors). */
export const ACT_TWO_META: Readonly<Record<string, ChapterMeta>> = Object.freeze({
  "b-1-money-works": { archetype: "Convert", specLine: 3855, tier: 3 },
  "b-2-slow-week": { archetype: "Endure", specLine: 4045, tier: 3 },
  "b-3-skeleton-weekend": { archetype: "Hold-Without-Hands", specLine: 3662, tier: 3 },
  "b-4-hardest-lesson": { archetype: "Reach-State", specLine: 35154, tier: 3 },
  "b-5-fogged-board": { archetype: "Inherit", specLine: 3769, tier: 4 },
  "b-6-oncall-desk": { archetype: "Hold-Without-Hands", specLine: 1267, tier: 4, perspectiveId: "noc-shift" },
  "b-7-chargeback-shift": { archetype: "Diagnose", specLine: 3737, tier: 4 },
  // wave-27 full-12 beats. b-8/b-9/b-10 re-ride shipped registry docs and
  // cite THEIR OWN specLines (the meta-to-doc equality law); each opens above
  // the bridge and rides a NAMED thin-ride exception (see the exception rows
  // below). b-11 wears the noc-shift seat a SECOND time — the campaign first
  // perspective reuse, lawful by construction (PROPORTIONALITY rider) and
  // narratively earned: prevention is the same desk after the lessons; the
  // 27-beat tour never reused a seat. b-12 files Schedule against its
  // heading Reach-State label — the c-7 precedent, disclosed in its docblock.
  "b-8-collections-week": { archetype: "Endure", specLine: 3794, tier: 4 },
  "b-9-post-breach": { archetype: "Diagnose", specLine: 3229, tier: 4 },
  "b-10-sev-0": { archetype: "Reach-State", specLine: 3256, tier: 4 },
  "b-11-prevention-shift": { archetype: "Hold-Without-Hands", specLine: 1274, tier: 4, perspectiveId: "noc-shift" },
  "b-12-cert-cliff": { archetype: "Schedule", specLine: 3275, tier: 4 },
});

/** The parsed Act Two. */
export const CAMPAIGN_ACT_TWO: CampaignDoc = parseCampaignDoc(ACT_TWO_WIRE);

/* ------------------------------------------------------------------ */
/* ACT III — prevention → boredom (Tiers 5–6, §1.9 :5128)               */
/* ------------------------------------------------------------------ */

/**
 * Nine chapters on the §1.9 Act-III line (:5128 "portfolio and geography"),
 * the prevention act exhaling into the machinery it built: the ratchet audit
 * played with a ZERO-intent rail (c-2 — §1.11's own audit sentence made
 * law: "the *ideal* play is to do nothing and watch" :5353), the floor-tech's
 * 12-node two-datacenter aisle where the seat's ban roster IS the Tier-5
 * fiction (c-4 — :961 "Two Datacenters, One Company", :1328 "Remote Hands"),
 * the portfolio beat riding the BUILT scale/reclaim spine as pure data (c-5),
 * and the run-up that feeds the exit ending's grammar (c-7 — §1.5 :4019's
 * "the run-up", the sell-accepted-above win carrier the terminal stopReason
 * rides into endCampaign's `exit` selection, AC-E @61a1c3b). The act closes
 * on the goal inverted: Red Team Friday (c-9), §1.2 :1217's "same six verbs
 * with the goal node inverted" — perspective-as-objective, zero mechanics.
 *
 * THE 8→9 SUPERSESSION (arithmetic, not taste): §1.9 :5128 names EIGHT
 * levels; this ships NINE, and the campaign's own cadence law forces the
 * extra beat. The global every-5 seat law has ridden chapters.test.ts since
 * Act I (a-8 at tour index 10, b-6 at 16 — the 7-beat Act II physically
 * could not host its second seat inside the act, and filed the tension).
 * Act III restores §1.9's per-act floor of TWO perspective levels: an
 * 8-beat act places the second seat at index ≤25, a gap of 4 behind a
 * first seat at ≥21 (or pushes the first to 20, a gap of 4 behind b-6);
 * only a NINTH beat lets the pair land at 21 and 26 — gaps 5 and 5, the
 * FIRST act satisfying the floor under the standing law. The lint test
 * re-derives every position; the supersession is the tour's shape, pinned.
 *
 * DESIGN AUTHORITY: I-AC3 dossier (owner-approved, wave-26 "go with
 * recommendations"). Roster substitutions vs the dossier's letters, all
 * probe-forced (the corpse audit, header disclosure above):
 * - c-1/c-6/c-8 are authored HOMAGES of the metastable (:4096) / ddos-season
 *   (:3994) / free-tier-flood (:3590) fiction — the registry docs' empty
 *   books churn-die cash-independently at ~t44 and none carries a death
 *   lose-line, so under the campaign clock they win as CORPSES (probe
 *   2026-10-18: observation.deaths ["churn-collapse"] at win@240/240/60).
 *   Each homage keeps board/traffic/guard/clock VERBATIM and adds the two
 *   monthly accounts the §1.6 floor needs; the meta↔doc specLine equality
 *   law holds (the homage cites its fiction's own line).
 * - c-3 is the act's only TRUE registry re-ride: understaffed-sunday
 *   (:3673) fires win@40 BEFORE the churn-floor's t44 verdict — probe-clean
 *   at the bridge, deaths [] (the dossier's the-covenant/review-bomb
 *   candidates open at 100B/1B, violating the never-poorer law; the-sev-0's
 *   500M does too — Act III grants no thin-ride exception of its own; the
 *   machinery stays Act II's alone (its roster grew to FOUR named rows at the
 *   wave-27 full-12 expansion, zero Act-III rows), and the lint pin
 *   "excepted ⇒ ACT_TWO" is the falsifier that keeps it so).
 * - the-tier-ceiling law: tiers 5/6 never had bespoke level mechanics in the
 *   engine (ADR-0018 ceiling list) — the built door verbs (scale/reclaim/
 *   sell/shield) are the mechanics, and the geography is BOARD DATA. Act III
 *   labels the fiction as data; nothing is invented, nothing is forced.
 * - archetype census: Convert/Endure/Reach-State/Build-to-Spec/Shrink/
 *   Endure/Negotiate/Diagnose/Reach-State — the b-7 Diagnose→c-1 Convert
 *   boundary holds, all adjacencies distinct, the two Endures non-adjacent.
 *   The whole-tour Endure census becomes 4 of 27 (14.8%, under §1.9's 30%
 *   cap) — the disclosed re-pin from 2.
 *
 * PROBE TRAIL (2026-10-18 — literals are what the shipped chain actually did,
 * never what the design wished; full witnesses ride chapters.test.ts):
 * - solo tour on a PLAIN founder (no testimony — the act never dies):
 *   c-1 win@240 (base doc, $0 open → 8,199,000 µ$), c-2 win@60 (intents
 *   EXECUTED 0 — the ratchet gate is live), c-3 win@40, c-4 win@40 (place×2 +
 *   connect×2 EXECUTED, communicate REFUSED perspective-forbids), c-6 win@240,
 *   c-5 win@60 (scale-node + reclaim-node EXECUTED — the BUILT tier verbs
 *   carrying a Tier-5 beat), c-7 win:sell-accepted-above:0@60, c-8 win@240,
 *   c-9 win@25 (bounces 95 — the inversion scores its own damage). 0 edges.
 * - the FIRST c-4 draft died at t44: place-device onto an EXISTING board node
 *   refuses `node-exists` — the verb CREATES. Re-authored to rack the new
 *   ids rack-a7/rack-b7 beside the halls; the beat is now the floor-tech's
 *   true work (you add to the portfolio; you never price or phone it).
 * - the contract CLIFF law (doc.ts: cliff ≤ maxSimMinutes, "the renewal drama
 *   can never play" is a refusal, not a footnote) re-cliffed every floor
 *   account: 24_000 biz-min for the 240 clocks, 9_000 for the 90s.
 * - five campaign seeds: all nine stopReasons identical on every offset;
 *   c-7 acceptance census at the bridge [4,4,4,3,4] (the one offset-3 refusal
 *   is the 9,500-bps ceiling honestly disagreeing — the count:0 win line
 *   carries it regardless). A SEVEN-beat run-up prefix (same chapter ids ⇒
 *   same per-chapter seeds) ends `exit` on the terminal carrier; the full
 *   nine-beat tour ends `quiet-handoff` — surviving is not selling.
 * - homages at the bridge: win@240 with deaths [] and 308,199,000 µ$ landing
 *   (300M + two 5M invoices, dunning-quiet) — the registry twins corpse at
 *   the same clock (deaths ["churn-collapse"]), the §1.6 floor clause heals.
 * - digests: solo 7f0853575030d719 (×100 Set.size 1, twin byte-equal);
 *   four-arc tail 739d411cd5329eb1. WAVE-27 note: growing Act II to twelve
 *   beats (b6187c4) MOVED the four-arc tail (was bd36d3be169cf130) and the
 *   three-arc digest (was 18ef1b5675d0ea27, now 5f79eb776a0bafaf); the two
 *   earlier arc digests 28df3ca4e6c90977 / 86595ae9b21853b3 RE-PROVEN UNMOVED.
 */
const ACT_THREE_WIRE = {
  schema: "hh-campaign@1",
  id: "act-three-prevention-to-boredom",
  name: "Act Three — Prevention Into Boredom",
  chapters: [
    { chapterId: "c-1-storm-window", scenarioId: "the-metastable-window" },
    { chapterId: "c-2-quarter-that-ran-itself", scenarioId: "the-quarter-that-ran-itself" },
    { chapterId: "c-3-understaffed-sunday", scenarioId: "understaffed-sunday" },
    { chapterId: "c-4-floor-and-aisle", scenarioId: "the-floor-and-aisle" },
    { chapterId: "c-5-growth-that-shrank", scenarioId: "the-growth-that-shrank-itself" },
    { chapterId: "c-6-long-gradient", scenarioId: "the-long-gradient" },
    { chapterId: "c-7-long-sale", scenarioId: "the-long-sale" },
    { chapterId: "c-8-institution-watch", scenarioId: "the-institution-watch" },
    { chapterId: "c-9-red-team-friday", scenarioId: "red-team-friday" },
  ],
  carry: CARRY_RULE,
} as const;

/** Act III beat ledger. Homages/re-rides cite their fiction's own §1.5 line
 *  (the meta↔doc equality law pins authored docs to their wire; the c-3
 *  re-ride equals the registry doc's citation), seats cite their §1.2 roster
 *  lines, bespoke beats cite their law sentences. */
export const ACT_THREE_META: Readonly<Record<string, ChapterMeta>> = Object.freeze({
  "c-1-storm-window": { archetype: "Convert", specLine: 4096, tier: 5 },
  "c-2-quarter-that-ran-itself": { archetype: "Endure", specLine: 5355, tier: 5 },
  "c-3-understaffed-sunday": { archetype: "Reach-State", specLine: 3673, tier: 5 },
  "c-4-floor-and-aisle": { archetype: "Build-to-Spec", specLine: 1215, tier: 5, perspectiveId: "datacenter-tech" },
  "c-5-growth-that-shrank": { archetype: "Shrink", specLine: 5128, tier: 5 },
  "c-6-long-gradient": { archetype: "Endure", specLine: 3994, tier: 6 },
  "c-7-long-sale": { archetype: "Negotiate", specLine: 4019, tier: 6 },
  "c-8-institution-watch": { archetype: "Diagnose", specLine: 3590, tier: 6 },
  "c-9-red-team-friday": { archetype: "Reach-State", specLine: 1217, tier: 6, perspectiveId: "red-team-friday" },
});

/** The parsed Act Three. */
export const CAMPAIGN_ACT_THREE: CampaignDoc = parseCampaignDoc(ACT_THREE_WIRE);

/* ------------------------------------------------------------------ */
/* EXIT ARC — money at the end rides the chain (§E, L-V3)                */
/* ------------------------------------------------------------------ */

/**
 * THE CAMPAIGN_EXIT ARC — c-7's catalog-armed sibling, the §E commission:
 * the tour PLAYS ON the paid heir (§1.6 prestige — "the exit is the moment").
 * Two beats, zero new scenario docs, zero new seats (v0):
 *  - x-1 "the-armed-close": the-long-sale RE-RIDDEN with a DECLARED exit
 *    (strategic-acquisition) and the HOST catalog armed through
 *    CampaignRunOptions.sellMarketRates. c-7's own row stays UNDECLARED and
 *    its witnesses byte-stand — the declaration and the catalog live ONLY on
 *    this campaign row + the host options, never on the scenario doc. The
 *    chapterId differs from c-7's, so seedForChapter rolls a DIFFERENT dice
 *    stream than the Act III run-up: x-1's census is its own, self-derived.
 *  - x-2 "the-heir-opens": the paid heir's first quarter is the Ratchet Audit
 *    (the-quarter-that-ran-itself, §1.11 :5355) — under new ownership the
 *    machine genuinely runs itself. Zero cash predicate, zero intents, a
 *    deterministic win@60: THE exitFunded law witness. The heir must open on
 *    its SLICE (a sale-scale number far under the 1e15 floor), not the 300M
 *    bridge, and still grade green.
 *
 *  BRIEF DEVIATION, DISCLOSED (disk wins): the brief's x-2 candidate was
 *  the-quiet-month — UNPLAYABLE exit-funded: its lose line `cash-below:
 *  150_000_000` fires AT TICK 0 on any sale-scale slice (the drill slice is
 *  12M; even the full-catalog ceiling stays under the mandate). The ratchet
 *  audit doc replaces it with a STRONGER fiction fit and a dice-free close.
 *
 *  Probe-derived witnesses ride chapters.test.ts §9 (x-1 census ×5 with the
 *  catalog armed, exit-edge manifest shape, slice literals, x-2
 *  cashStartMicroUsd === the spent slice — the exitFunded law in content).
 */
const EXIT_WIRE = {
  schema: "hh-campaign@1",
  id: "exit-the-heir-opens",
  name: "The Exit — The Heir Opens",
  chapters: [
    { chapterId: "x-1-armed-close", scenarioId: "the-long-sale", exitKind: "strategic-acquisition" },
    { chapterId: "x-2-heir-opens", scenarioId: "the-quarter-that-ran-itself" },
  ],
  carry: CARRY_RULE,
} as const;

/** Exit beat ledger. x-1 cites the-long-sale's own §1.5 wire line (the
 *  meta↔doc equality law; the brief's :4025 run-up sentence is the TEXT anchor
 *  already pinned in the Act III notes — the ledger mirrors the DOC), x-2 the
 *  ratchet audit's §1.11 :5355. Negotiate follows c-9's Reach-State and Inherit
 *  follows Negotiate — no-consecutive-safe; neither is Endure, so the exact
 *  five-Endure census pin rides the 34-beat tour unchanged (5/34 = 14.7%). */
export const CAMPAIGN_EXIT_META: Readonly<Record<string, ChapterMeta>> = Object.freeze({
  "x-1-armed-close": { archetype: "Negotiate", specLine: 4019, tier: 6 },
  "x-2-heir-opens": { archetype: "Inherit", specLine: 5355, tier: 6 },
});

/** The parsed Exit arc. */
export const CAMPAIGN_EXIT: CampaignDoc = parseCampaignDoc(EXIT_WIRE);

/* ------------------------------------------------------------------ */
/* Combined authoring ledger (lint-law target for chapters.test.ts)     */
/* ------------------------------------------------------------------ */

/** Every chapter id → its §1.9 meta, all five arcs, insertion-ordered by act. */
export const CAMPAIGN_CHAPTER_META: Readonly<Record<string, ChapterMeta>> = Object.freeze({
  ...PROLOGUE_META,
  ...ACT_ONE_META,
  ...ACT_TWO_META,
  ...ACT_THREE_META,
  ...CAMPAIGN_EXIT_META,
});

/** The five campaign docs in play order (Prologue before Act I before Act
 *  II before Act III before the Exit arc — OD-19's act table, ADR-0019
 *  program 3 extended by the wave-26 full-tour rung, and the wave-28 §E
 *  commission: the Exit arc rides the ROSTER because an exit is a BEGINNING
 *  (§1.6 plays on the heir), not because it closes the tour. It has no seat
 *  (v0 — the {4,10,16,21,26,31} cadence pins byte-stand at 34 beats). */
export const CAMPAIGN_ROSTER = Object.freeze(
  [CAMPAIGN_PROLOGUE, CAMPAIGN_ACT_ONE, CAMPAIGN_ACT_TWO, CAMPAIGN_ACT_THREE, CAMPAIGN_EXIT] as const,
);
