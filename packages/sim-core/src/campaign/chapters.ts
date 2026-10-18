/** chapters.ts — the authored campaign content (Prologue + Act I + Act II).
 *
 *  This module is DATA riding law, zero new authority: three `hh-campaign@1`
 *  documents parsed through the L-CP1 wall (`parseCampaignDoc`), four
 *  perspective-bearing or bespoke scenario documents (`hh-scenario@1`)
 *  authored in-module because `runScenario` accepts host-authored docs without
 *  scenarios.ts registration (the L-CP3 PerspectiveScenarioWire precedent —
 *  two §1.2 seats in Act I, one seat plus THE HARDEST LESSON death level in
 *  Act II), and a chapter-meta ledger (archetype / specLine / perspective /
 *  tier) that the `CampaignChapterSpec` wire deliberately does NOT
 *  carry — the §1.9 11-archetype taxonomy and its no-consecutive law are an
 *  AUTHORING discipline enforced by chapters.test.ts, not engine state.
 *
 *  Shape canon (hosting_game.md, located by TEXT 2026-10-17):
 *  - §1.9 Three-Act Shape (~:5108): Act I (T0–2) teaches the core loop; each
 *    act carries at minimum two perspective-shift levels and one scenario.
 *  - §1.9 11-archetype taxonomy (~:5067): Endure is the DEFAULT and must stay
 *    under 30% of the campaign; no two consecutive levels share a tag.
 *  - OD-19 adopted act table (docs/DECISIONS-PENDING.md, ADR-0013 ruling 10):
 *    Prologue (T0–0.5, first mastery inside 3 minutes) / Act I panic→process.
 *  - §1.6 carry-over-thin + the three floors (~:4310): below the cash floor a
 *    SCRIPTED BRIDGE replaces the war chest — every chapter after the first
 *    opens at the bridge, so the act is playable regardless of how thin the
 *    last win left the bankroll.
 *
 *  Honest disclosures (probe-derived, not asserted):
 *  - NO SHIPPED registry doc dies in-campaign with a `lose:death-by-cause:any@`
 *    stop at the bridge (the only registry death witness is a FLIPPED
 *    deadbeat-quarter in runner.test.ts — a no-customers no-cash forgery, not
 *    the shipped doc), so Act I tests assert the win-through ledger. Act II
 *    answers the gap with an AUTHORED level that dies in the shape — the
 *    §1.6 shortening made playable (see ACT_TWO notes: probe trail verbatim).
 *  - §1.9's per-act "two perspective levels" floor is met by Act I; the
 *    Prologue is exempt BY OD-19 (first-mastery-inside-3-minutes: a seat swap
 *    before the player knows the default seat is tuition friction, not shape).
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
   *  ship no row; every Act II chapter declares 3 or 4 (§1.9 :5117's
   *  "Tiers 3–4"), and the lint law reads the rise from these numbers. */
  readonly tier?: 3 | 4;
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
  specLine: 35140,
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

/** The docs this module OWNS (authored, not registered in scenarios.ts).
 *  Hosts resolve chapter docs via `docOf = (id) => CHAPTER_AUTHORED_DOCS[id]
 *  ?? shippedScenario(id)` — the L-CP1 authority seam, unchanged. */
export const CHAPTER_AUTHORED_DOCS: Readonly<Record<string, ScenarioDoc>> = Object.freeze({
  "apprentice-desk-shift": parseScenarioDoc(APPRENTICE_DESK_SHIFT_WIRE),
  "support-desk-vigil": parseScenarioDoc(SUPPORT_DESK_VIGIL_WIRE),
  "the-hardest-lesson": parseScenarioDoc(HARDEST_LESSON_WIRE),
  "noc-oncall-desk": parseScenarioDoc(NOC_ONCALL_DESK_WIRE),
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
  "p-2-borrowed-thunder": { archetype: "Reach-State", specLine: 4063 },
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
  "a-7-rfo": { archetype: "Diagnose", specLine: 4050 },
  "a-8-support-vigil": { archetype: "Hold-Without-Hands", specLine: 1212, perspectiveId: "support-queue" },
});

/** The parsed Act One. */
export const CAMPAIGN_ACT_ONE: CampaignDoc = parseCampaignDoc(ACT_ONE_WIRE);

/* ------------------------------------------------------------------ */
/* ACT II — process → prevention (Tiers 3–4, §1.9 :5117)                 */
/* ------------------------------------------------------------------ */

/**
 * Seven chapters on the §2.11 Working-Capital tier (:1183 "Deferred revenue,
 * annual prepay, DSO, dunning, bad debt" — the money lessons Act I only
 * gestured at), riding the T3 plateau into the T4 succession ash: the
 * money-works re-ride opens on its own authored fiction (300M = the bridge
 * verbatim), the quiet beats test the book, and b-4 THE HARDEST LESSON is the
 * act's thesis — the FIRST authored campaign level that DIES IN THE SHAPE.
 * The company dissolves float-insolvent under the lawful carry opening, the
 * §9.9 obituary writes itself (`lose:death-by-cause:any@73`), chain.ts
 * succession fires FOR REAL (failure_restart edge + failureOnlyUnlock
 * manifest), and the successor's first chapter b-5 opens on the manifested
 * ledger — an Inherit beat whose "fogged board you didn't build" (§1.9 :5093)
 * is now literally true. Ending on b-7's prevention shift: the child weathers
 * the chargeback wave the parent never saw coming.
 *
 * PROPORTIONALITY (recorded honestly, §1.9 :5117): the act is TWELVE levels
 * at full design; this ships SEVEN — the death-in-shape headline, its
 * succession consequence, the tier plateau, and the rehab witness, in the
 * leanest set that makes the arc. §1.9's per-act floor of TWO perspective
 * levels is in DIRECT TENSION with the global ~every-5 cadence the L-CP3 lint
 * law has carried since Act I (a-8's seat at tour index 10 forces any second
 * Act-II seat past index 15, and two seats ≥5 apart cannot fit in a 7-beat
 * act): Act II ships ONE seat (b-6, tour index 16, gap 6) and files the
 * tension rather than break the cadence law. `_todo: §1.9 per-act seat floor
 * (2) vs every-5 global cadence — resolve at full-12 expansion (ADR-0019
 * program 3 note; owner taste row).`
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
  ],
  carry: CARRY_RULE,
} as const;

/**
 * The never-poorer law (cash-floor lint) carries an AUTHORED exception list:
 * a chapter may open below its authored war chest ONLY when the thin opening
 * is probe-witnessed funding-honest — today exactly one doc, the rehabilitation
 * beat itself. The exception is a DATA row so the lint stays a law with a
 * named, testable seam, never a silently deleted check.
 */
export const ACT_TWO_THIN_RIDE_EXCEPTIONS: Readonly<Record<string, string>> = Object.freeze({
  "chargeback-wave":
    "authored 100_000_000_000 µ$ opens on the 300M scripted bridge: the composeSignalRows funding-honest guard (@075a840) turns the thin rebase into a LIVE chargebackFeeRefusals witness (probe win@200, 1 refusal, zero crash) — the Act II prevention thesis, priced.",
});

/** Act II beat ledger. specLines ride each doc's OWN citation (§1.5 heading
 *  line for re-rides; the authored levels cite their §9.9/§1.2 anchors). */
export const ACT_TWO_META: Readonly<Record<string, ChapterMeta>> = Object.freeze({
  "b-1-money-works": { archetype: "Convert", specLine: 3855, tier: 3 },
  "b-2-slow-week": { archetype: "Endure", specLine: 4041, tier: 3 },
  "b-3-skeleton-weekend": { archetype: "Hold-Without-Hands", specLine: 3662, tier: 3 },
  "b-4-hardest-lesson": { archetype: "Reach-State", specLine: 35140, tier: 3 },
  "b-5-fogged-board": { archetype: "Inherit", specLine: 3769, tier: 4 },
  "b-6-oncall-desk": { archetype: "Hold-Without-Hands", specLine: 1267, tier: 4, perspectiveId: "noc-shift" },
  "b-7-chargeback-shift": { archetype: "Diagnose", specLine: 3737, tier: 4 },
});

/** The parsed Act Two. */
export const CAMPAIGN_ACT_TWO: CampaignDoc = parseCampaignDoc(ACT_TWO_WIRE);

/* ------------------------------------------------------------------ */
/* Combined authoring ledger (lint-law target for chapters.test.ts)     */
/* ------------------------------------------------------------------ */

/** Every chapter id → its §1.9 meta, all three arcs, insertion-ordered by act. */
export const CAMPAIGN_CHAPTER_META: Readonly<Record<string, ChapterMeta>> = Object.freeze({
  ...PROLOGUE_META,
  ...ACT_ONE_META,
  ...ACT_TWO_META,
});

/** The three campaign docs in play order (Prologue before Act I before Act
 *  II — OD-19's act table, ADR-0019 program 3 extending it). */
export const CAMPAIGN_ROSTER = Object.freeze(
  [CAMPAIGN_PROLOGUE, CAMPAIGN_ACT_ONE, CAMPAIGN_ACT_TWO] as const,
);
