/** chapters.ts — L-CP3: the FIRST authored campaign content (Prologue + Act I).
 *
 *  This module is DATA riding law, zero new authority: two `hh-campaign@1`
 *  documents parsed through the L-CP1 wall (`parseCampaignDoc`), two
 *  perspective-bearing scenario documents (`hh-scenario@1`, L-CP2 §1.2 seats)
 *  authored in-module because `runScenario` accepts host-authored docs without
 *  scenarios.ts registration, and a chapter-meta ledger (archetype / specLine /
 *  perspective) that the `CampaignChapterSpec` wire deliberately does NOT
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
 *  - NO shipped doc dies in-campaign shape with a `lose:death-by-cause:any@`
 *    stop (the only death witness is a FLIPPED deadbeat-quarter in
 *    runner.test.ts — a no-customers no-cash forgery, not the shipped doc),
 *    so the succession lane is NOT exercised by this content; the tests assert
 *    the win-through ledger instead.
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
}

/* ------------------------------------------------------------------ */
/* Authored scenario docs — the two perspective levels (§1.2 seats)     */
/* ------------------------------------------------------------------ */

/** Apprentice seat (:1474, "you may only write rules"): the hands are taped
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
  specLine: 1474,
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

/** Support-Queue seat (:1208, "Diagnose-only, the board hidden"): the desk
 *  answers and nothing else — build AND price thoughts both die at the tape.
 *  The queue IS the whole game from here. */
const SUPPORT_DESK_VIGIL_WIRE = {
  schema: "hh-scenario@1",
  id: "support-desk-vigil",
  name: "The Support Desk Vigil",
  brief:
    "From the support desk the board is a rumour and the price list is somebody else's religion. All you own is the queue — so work it to silence, and let every build-and-price temptation break on the seat's tape where the campaign can see it.",
  specRef: "§1.5 The Support Desk Vigil (campaign-authored perspective level)",
  specLine: 1208,
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

/** The two docs this module OWNS (authored, not registered in scenarios.ts).
 *  Hosts resolve chapter docs via `docOf = (id) => CHAPTER_AUTHORED_DOCS[id]
 *  ?? shippedScenario(id)` — the L-CP1 authority seam, unchanged. */
export const CHAPTER_AUTHORED_DOCS: Readonly<Record<string, ScenarioDoc>> = Object.freeze({
  "apprentice-desk-shift": parseScenarioDoc(APPRENTICE_DESK_SHIFT_WIRE),
  "support-desk-vigil": parseScenarioDoc(SUPPORT_DESK_VIGIL_WIRE),
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
  "p-1-triage-desk": { archetype: "Hold-Without-Hands", specLine: 3657 },
  "p-2-borrowed-thunder": { archetype: "Reach-State", specLine: 4047 },
  "p-3-handover-queue": { archetype: "Schedule", specLine: 3880 },
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
 *  authority). The RFO (post-mortem credit is a reputation path,
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
  "a-1-launch-day": { archetype: "Build-to-Spec", specLine: 3145 },
  "a-2-apprentice-desk": { archetype: "Escort", specLine: 1474, perspectiveId: "apprentice" },
  "a-3-angry-whale": { archetype: "Convert", specLine: 3408 },
  "a-4-deadbeat-quarter": { archetype: "Inherit", specLine: 3790 },
  "a-5-price-hike": { archetype: "Negotiate", specLine: 3802 },
  "a-6-quiet-month": { archetype: "Endure", specLine: 3463 },
  "a-7-rfo": { archetype: "Diagnose", specLine: 4034 },
  "a-8-support-vigil": { archetype: "Hold-Without-Hands", specLine: 1208, perspectiveId: "support-queue" },
});

/** The parsed Act One. */
export const CAMPAIGN_ACT_ONE: CampaignDoc = parseCampaignDoc(ACT_ONE_WIRE);

/* ------------------------------------------------------------------ */
/* Combined authoring ledger (lint-law target for chapters.test.ts)     */
/* ------------------------------------------------------------------ */

/** Every chapter id → its §1.9 meta, both acts, insertion-ordered by act. */
export const CAMPAIGN_CHAPTER_META: Readonly<Record<string, ChapterMeta>> = Object.freeze({
  ...PROLOGUE_META,
  ...ACT_ONE_META,
});

/** The two campaign docs in play order (Prologue before Act I — OD-19). */
export const CAMPAIGN_ROSTER = Object.freeze([CAMPAIGN_PROLOGUE, CAMPAIGN_ACT_ONE] as const);
